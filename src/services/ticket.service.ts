import { Collection, ITSupport, Ticket, TicketType } from '@/lib/core/models';
import { FirestoreClientHelper } from '@/lib/firebase/client/firestore-client.helper';
import { increment, Timestamp } from 'firebase/firestore';
import { cloneDeep } from 'lodash';

export interface ITicketService {
  createTicket: (payload: Partial<Ticket>) => Promise<string>;
  getTicketById: (id: string) => Promise<Ticket | null>;
  updateTicket: (id: string, payload: Partial<Ticket>) => Promise<void>;
  getOpenTickets: (limit?: number) => Promise<Ticket[]>;
  getAllTickets: () => Promise<Ticket[]>;
  assignTicket: (ticket: Ticket, itSupport: ITSupport) => Promise<void>;
  resolveTicket: (ticketId: string, solution: string, itSupportId: string) => Promise<void>;
  closeTicket: (ticketId: string) => Promise<void>;
}

export const ticketService = ((): ITicketService => {
  const customUserService: ITicketService = {
    createTicket: async (payload: Partial<Ticket>): Promise<string> => {
      const { creatorId } = payload;
      if (!creatorId) {
        throw new Error('Creator ID is required to create a ticket');
      }
      const [ticketId] = await Promise.all([
        FirestoreClientHelper.createDocument<Partial<Ticket>>(
          Collection.TICKETS,
          {
            ...payload,
            createdAt: Timestamp.fromDate(new Date()),
            updatedAt: Timestamp.fromDate(new Date())
          },
          payload.id
        ),
        FirestoreClientHelper.updateDocument(Collection.USERS, creatorId, {
          ticketCount: increment(1)
        })
      ]);
      return ticketId;
    },

    getTicketById: async (id: string): Promise<Ticket | null> =>
      FirestoreClientHelper.getItemById<Ticket>(Collection.TICKETS, id),

    updateTicket: async (id: string, payload: Partial<Ticket>): Promise<void> => {
      await FirestoreClientHelper.updateDocument(Collection.TICKETS, id, {
        ...payload,
        updatedAt: Timestamp.fromDate(new Date())
      });
    },

    getOpenTickets: async (limit: number = 10): Promise<Ticket[]> => {
      try {
        const result = await FirestoreClientHelper.getMany<Ticket>(Collection.TICKETS, {
          conditions: [{ field: 'status', op: 'in', value: ['OPEN', 'IN_PROGRESS'] }],
          limitCount: limit,
          orderBy: [
            { field: 'priority', op: 'desc' },
            { field: 'createdAt', op: 'desc' }
          ]
        });
        return result.documents;
      } catch (error) {
        console.error('Error fetching open tickets:', error);
        return [];
      }
    },

    assignTicket: async (ticket: Ticket, itSupport: ITSupport): Promise<void> => {
      if (ticket.assignedToId) {
        throw new Error('This ticket is already assigned to an IT support member');
      }
      await FirestoreClientHelper.updateDocument(Collection.TICKETS, ticket.id, {
        assignedToId: itSupport.id,
        assignedToName: itSupport.fullname,
        assignedToZaloId: itSupport.zaloId,
        assignedAt: Timestamp.fromDate(new Date()),
        status: 'IN_PROGRESS',
        updatedAt: Timestamp.fromDate(new Date())
      });
    },

    resolveTicket: async (ticketId: string, solution: string, itSupportId: string): Promise<void> => {
      await FirestoreClientHelper.updateDocument(Collection.TICKETS, ticketId, {
        solution,
        status: 'RESOLVED',
        resolvedAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      });
    },

    getAllTickets: async (): Promise<Ticket[]> => {
      try {
        const result = await FirestoreClientHelper.getMany<Ticket>(Collection.TICKETS, {
          conditions: [],
          orderBy: [{ field: 'createdAt', op: 'desc' }]
        });
        return result.documents;
      } catch (error) {
        console.error('Error fetching all tickets:', error);
        return [];
      }
    },

    closeTicket: async (ticketId: string): Promise<void> => {
      await FirestoreClientHelper.updateDocument(Collection.TICKETS, ticketId, {
        status: 'CLOSED',
        closedAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      });
    }
  };

  return customUserService;
})();
