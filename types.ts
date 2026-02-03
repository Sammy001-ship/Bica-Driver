
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
  SIGN_UP = 'SIGN_UP',
  LOGIN = 'LOGIN',
  ROLE_SELECTION = 'ROLE_SELECTION',
  MAIN_REQUEST = 'MAIN_REQUEST',
  DRIVER_DASHBOARD = 'DRIVER_DASHBOARD',
  PROFILE = 'PROFILE',
  FINDING_DRIVER = 'FINDING_DRIVER'
}
