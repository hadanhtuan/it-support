export enum UserRole {
  USER = 'USER',
  IT_SUPPORT = 'IT_SUPPORT',
  ADMIN = 'ADMIN'
}

export enum SignInMethod {
  EMAIL_LINK = 'emailLink',
  EMAIL_PASSWORD = 'password',
  FACEBOOK = 'facebook.com',
  GITHUB = 'github.com',
  GOOGLE = 'google.com',
  PHONE = 'phone',
  TWITTER = 'twitter.com'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED'
}

export interface User {
  id: string;
  uid: string;
  email: string;
  fullname: string;
  role: UserRole;
  signInMethod: SignInMethod; // e.g., EMAIL, GOOGLE, FACEBOOK, etc.
  status: UserStatus; // e.g., ACTIVE, INACTIVE, BLOCKED
  isProfileCompleted?: boolean;
  isBlocked?: boolean;
  phoneNumber?: string;
  zaloId?: string; // Zalo ID for contact and communication
  address?: string;
  provinceId?: string;
  wardId?: string;
  provinceName?: string;
  wardName?: string;
  age?: string;
  ticketCount?: number;
  rating?: number; // Average rating based on support reviews
  yoe?: string; // Years of Experience
  gender?: string;
  avatar?: File;
  avatarUrl?: string; // URL of the profile picture
  verifyToken?: string; // For email verification
  expiredAt?: string; // For email verification expiration
  updatedAt?: any;
  createdAt?: any;
}

export interface RegularUser extends User {
  role: UserRole.USER;
  // tickets?: string[]; // Array of ticket IDs created by this user
  // assignedTickets?: string[]; // Tickets assigned to this user
}

export interface ITSupport extends User {
  role: UserRole.IT_SUPPORT;
  certificates?: Certificate[];
  supportExperience?: string;
  idCardFront?: File;
  idCardBack?: File;
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  specializations?: string[]; // Areas of IT expertise (network, software, hardware, etc.)
  hourlyRate?: number;
  assignedTickets?: string[]; // Array of ticket IDs assigned to this IT support
  resolvedTickets?: string[]; // Array of ticket IDs resolved by this IT support
}

export interface Certificate {
  description: string;
  evidence: string;
}

export interface Admin extends User {
  role: UserRole.ADMIN;
}
