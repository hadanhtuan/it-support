import { Collection, ITSupport, UserRole, TicketCategory } from '@/lib/core/models';
import { FirestoreClientHelper } from '@/lib/firebase/client/firestore-client.helper';

export interface IITSupportService {
  getITSupportConfiguration(): Promise<ITSupportConfiguration>;
  updateITSupportSpecializations(itSupportId: string, specializations: string[]): Promise<void>;
  findITSupportBySpecialization(specialization: string, limit?: number): Promise<ITSupport[]>;
  findAvailableITSupport(category?: TicketCategory, limit?: number): Promise<ITSupport[]>;
  updateITSupportAvailability(itSupportId: string, isAvailable: boolean): Promise<void>;
  getITSupportStats(itSupportId: string): Promise<ITSupportStats>;
  getAssignedTickets(itSupportId: string): Promise<any[]>;
  logWorkTime(ticketId: string, itSupportId: string, timeSpent: number, notes: string): Promise<void>;
}

export interface ITSupportConfiguration {
  specializations: ITSupportSpecialization[];
  categories: { value: TicketCategory; label: string }[];
}

export interface ITSupportSpecialization {
  id: string;
  name: string;
  code: string;
  disabled: boolean;
  description?: string;
}

export interface ITSupportStats {
  totalTicketsAssigned: number;
  totalTicketsResolved: number;
  averageResolutionTime: number; // in minutes
  currentlyAssigned: number;
  rating: number;
  reviewCount: number;
}

export const itSupportService = ((): IITSupportService => {
  const customITSupportService: IITSupportService = {
    getITSupportConfiguration: async (): Promise<ITSupportConfiguration> => {
      // Default IT specializations
      const defaultSpecializations: ITSupportSpecialization[] = [
        {
          id: 'hardware',
          name: 'Hardware Support',
          code: 'HW',
          disabled: false,
          description: 'Computer hardware, printers, peripherals'
        },
        {
          id: 'software',
          name: 'Software Support',
          code: 'SW',
          disabled: false,
          description: 'Application installation, troubleshooting'
        },
        {
          id: 'network',
          name: 'Network Support',
          code: 'NET',
          disabled: false,
          description: 'Internet, WiFi, connectivity issues'
        },
        {
          id: 'account',
          name: 'Account Management',
          code: 'ACC',
          disabled: false,
          description: 'User accounts, permissions, access'
        },
        {
          id: 'email',
          name: 'Email Support',
          code: 'EMAIL',
          disabled: false,
          description: 'Email configuration, issues'
        },
        {
          id: 'security',
          name: 'Security Support',
          code: 'SEC',
          disabled: false,
          description: 'Antivirus, malware, security policies'
        }
      ];

      const categories = [
        { value: TicketCategory.HARDWARE, label: 'Hardware' },
        { value: TicketCategory.SOFTWARE, label: 'Software' },
        { value: TicketCategory.NETWORK, label: 'Network' },
        { value: TicketCategory.ACCOUNT, label: 'Account' },
        { value: TicketCategory.PRINTER, label: 'Printer' },
        { value: TicketCategory.EMAIL, label: 'Email' },
        { value: TicketCategory.OTHER, label: 'Other' }
      ];

      return {
        specializations: defaultSpecializations,
        categories
      };
    },

    updateITSupportSpecializations: async (itSupportId: string, specializations: string[]): Promise<void> => {
      await FirestoreClientHelper.updateDocument(Collection.USERS, itSupportId, {
        specializations,
        updatedAt: new Date()
      });
    },

    findITSupportBySpecialization: async (specialization: string, limit: number = 10): Promise<ITSupport[]> => {
      try {
        const result = await FirestoreClientHelper.getMany<ITSupport>(Collection.USERS, {
          conditions: [
            { field: 'role', op: '==', value: UserRole.IT_SUPPORT },
            { field: 'specializations', op: 'array-contains', value: specialization }
          ],
          orderBy: [{ field: 'rating', op: 'desc' }],
          limitCount: limit
        });
        return result.documents;
      } catch (error) {
        console.error('Error fetching IT support by specialization:', error);
        return [];
      }
    },

    findAvailableITSupport: async (category?: TicketCategory, limit: number = 10): Promise<ITSupport[]> => {
      try {
        const conditions: Array<{ field: string; op: '==' | 'array-contains'; value: any }> = [
          { field: 'role', op: '==', value: UserRole.IT_SUPPORT },
          { field: 'status', op: '==', value: 'ACTIVE' }
        ];

        // If category is provided, find IT support with relevant specializations
        if (category) {
          const specializationMap: Record<TicketCategory, string> = {
            [TicketCategory.HARDWARE]: 'hardware',
            [TicketCategory.SOFTWARE]: 'software',
            [TicketCategory.NETWORK]: 'network',
            [TicketCategory.ACCOUNT]: 'account',
            [TicketCategory.PRINTER]: 'hardware',
            [TicketCategory.EMAIL]: 'email',
            [TicketCategory.OTHER]: 'software'
          };

          if (specializationMap[category]) {
            conditions.push({
              field: 'specializations',
              op: 'array-contains',
              value: specializationMap[category]
            });
          }
        }

        const result = await FirestoreClientHelper.getMany<ITSupport>(Collection.USERS, {
          conditions,
          orderBy: [{ field: 'rating', op: 'desc' }],
          limitCount: limit
        });
        return result.documents;
      } catch (error) {
        console.error('Error fetching available IT support:', error);
        return [];
      }
    },

    updateITSupportAvailability: async (itSupportId: string, isAvailable: boolean): Promise<void> => {
      await FirestoreClientHelper.updateDocument(Collection.USERS, itSupportId, {
        isAvailable,
        updatedAt: new Date()
      });
    },

    getITSupportStats: async (itSupportId: string): Promise<ITSupportStats> => {
      try {
        // Get IT support user data
        const itSupport = await FirestoreClientHelper.getItemById<ITSupport>(Collection.USERS, itSupportId);

        // Get tickets statistics
        const assignedTickets = await FirestoreClientHelper.getMany(Collection.TICKETS, {
          conditions: [{ field: 'assignedToId', op: '==', value: itSupportId }]
        });

        const resolvedTickets = await FirestoreClientHelper.getMany(Collection.TICKETS, {
          conditions: [
            { field: 'assignedToId', op: '==', value: itSupportId },
            { field: 'status', op: '==', value: 'RESOLVED' }
          ]
        });

        const currentlyAssigned = await FirestoreClientHelper.getMany(Collection.TICKETS, {
          conditions: [
            { field: 'assignedToId', op: '==', value: itSupportId },
            { field: 'status', op: 'in', value: ['OPEN', 'IN_PROGRESS'] }
          ]
        });

        // Calculate average resolution time
        let totalResolutionTime = 0;
        resolvedTickets.documents.forEach((ticket: any) => {
          if (ticket.actualResolutionTime) {
            totalResolutionTime += ticket.actualResolutionTime;
          }
        });
        const averageResolutionTime =
          resolvedTickets.documents.length > 0 ? totalResolutionTime / resolvedTickets.documents.length : 0;

        return {
          totalTicketsAssigned: assignedTickets.documents.length,
          totalTicketsResolved: resolvedTickets.documents.length,
          averageResolutionTime,
          currentlyAssigned: currentlyAssigned.documents.length,
          rating: itSupport?.rating || 0,
          reviewCount: 0 // TODO: Calculate from reviews collection
        };
      } catch (error) {
        console.error('Error fetching IT support stats:', error);
        return {
          totalTicketsAssigned: 0,
          totalTicketsResolved: 0,
          averageResolutionTime: 0,
          currentlyAssigned: 0,
          rating: 0,
          reviewCount: 0
        };
      }
    },

    getAssignedTickets: async (itSupportId: string): Promise<any[]> => {
      try {
        const result = await FirestoreClientHelper.getMany(Collection.TICKETS, {
          conditions: [{ field: 'assignedToId', op: '==', value: itSupportId }],
          orderBy: [{ field: 'createdAt', op: 'desc' }]
        });
        return result.documents;
      } catch (error) {
        console.error('Error fetching assigned tickets:', error);
        return [];
      }
    },

    logWorkTime: async (ticketId: string, itSupportId: string, timeSpent: number, notes: string): Promise<void> => {
      try {
        // This would typically log to a work time collection
        // For now, just add a comment or update the ticket
        console.log('Logging work time:', { ticketId, itSupportId, timeSpent, notes });
      } catch (error) {
        console.error('Error logging work time:', error);
      }
    }
  };

  return customITSupportService;
})();
