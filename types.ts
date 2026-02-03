
export enum UserRole {
  OWNER = 'OWNER',
  DRIVER = 'DRIVER',
  UNSET = 'UNSET'
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  rating: number;
  trips: number;
  avatar: string;
}

export enum AppScreen {
  WELCOME = 'WELCOME',
  ROLE_SELECTION = 'ROLE_SELECTION',
  MAIN_REQUEST = 'MAIN_REQUEST',
  PROFILE = 'PROFILE',
  FINDING_DRIVER = 'FINDING_DRIVER'
}
