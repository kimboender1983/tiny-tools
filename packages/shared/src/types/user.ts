export type UserRole = 'admin' | 'user';
export type SubscriptionPlan = 'free' | 'pro';

export interface IUserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultIndentation: 2 | 4;
  recentTools: string[];
}

export interface IUser {
  _id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: UserRole;
  plan: SubscriptionPlan;
  preferences: IUserPreferences;
  createdAt: Date;
  updatedAt: Date;
}
