
export enum UserRole {
  OWNER = 'OWNER',
  DRIVER = 'DRIVER',
  ADMIN = 'ADMIN',
  UNSET = 'UNSET'
}

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  rating: number;
  trips: number;
  avatar: string;
  // Role specific fields
  carType?: string;
  licenseImage?: string;
  selfieImage?: string;
  backgroundCheckAccepted?: boolean;
  approvalStatus?: ApprovalStatus;
}

export enum AppScreen {
  WELCOME = 'WELCOME',
  SIGN_UP = 'SIGN_UP',
  LOGIN = 'LOGIN',
  ROLE_SELECTION = 'ROLE_SELECTION',
  MAIN_REQUEST = 'MAIN_REQUEST',
  DRIVER_DASHBOARD = 'DRIVER_DASHBOARD',
  PROFILE = 'PROFILE',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD'
}
