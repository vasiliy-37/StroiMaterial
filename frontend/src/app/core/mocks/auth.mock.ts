import { AuthUser } from '../services/auth.service';

export type MockAccount = {
  email: string;
  password: string;
  user: AuthUser;
};

export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    email: 'admin@buildpro.local',
    password: 'admin123',
    user: {
      id: 'mock-admin',
      email: 'admin@buildpro.local',
      phone: '+7 800 555-35-35',
      name: 'BuildPro Admin',
      role: 'ADMIN',
    },
  },
  {
    email: 'demo@buildpro.local',
    password: 'demo123',
    user: {
      id: 'mock-user',
      email: 'demo@buildpro.local',
      phone: '+7 900 123-45-67',
      name: 'Demo User',
      role: 'USER',
    },
  },
];

export const MOCK_ACCESS_TOKEN = 'mock-access-token';
