export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_FOR_CUSTOMER = 'WAITING_FOR_CUSTOMER',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

export enum TicketCategory {
  HARDWARE = 'HARDWARE',
  SOFTWARE = 'SOFTWARE',
  NETWORK = 'NETWORK',
  ACCOUNT = 'ACCOUNT',
  PRINTER = 'PRINTER',
  EMAIL = 'EMAIL',
  OTHER = 'OTHER'
}

export enum TicketType {
  SUPPORT_REQUEST = 'SUPPORT_REQUEST',
  INCIDENT = 'INCIDENT',
  SERVICE_REQUEST = 'SERVICE_REQUEST'
}

export interface Ticket {
  id: string;
  type: TicketType;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  title: string;
  description: string;
  creatorId: string; // ID of the user who created the ticket
  creatorName?: string;
  creatorEmail?: string;
  creatorZaloId?: string; // For communication via Zalo

  // IT Support assignment
  assignedToId?: string; // ID of IT support assigned to this ticket
  assignedToName?: string;
  assignedToZaloId?: string; // IT support's Zalo ID for communication
  assignedAt?: any;

  // Location information (for on-site support)
  location?: string;
  department?: string;
  building?: string;
  room?: string;

  // Contact information
  phoneNumber?: string;
  alternateContact?: string;

  // Ticket details
  steps?: string; // Steps to reproduce the issue
  expectedOutcome?: string;
  actualOutcome?: string;
  workaround?: string;
  solution?: string;

  // Media attachments
  imageUrls?: string[]; // Screenshots, photos of the issue
  videoUrl?: string; // Video attachment
  attachmentUrls?: string[]; // Other file attachments

  // Timestamps
  createdAt: any;
  updatedAt: any;
  resolvedAt?: any;
  closedAt?: any;

  // Additional tracking
  tags?: string[]; // Custom tags for categorization
  relatedTickets?: string[]; // Related ticket IDs
  escalationLevel?: number; // 0 = normal, 1 = escalated, etc.
  estimatedResolutionTime?: any; // Expected resolution time
  actualResolutionTime?: number; // Time taken to resolve (in minutes)

  // Feedback
  rating?: number; // User rating of support provided (1-5)
  feedback?: string; // User feedback
  reviewCount?: number;
}
