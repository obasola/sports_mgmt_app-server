export interface PersonProps {
  pid?: number;
  userName: string;
  emailAddress: string;
  passwordHash: string | null;
  firstName: string;
  lastName: string;
  activeRid: number | null;
  isActive: boolean;

  emailVerified: boolean;
  verifiedAt: Date | null;

  createdAt: Date | null;
  updatedAt: Date | null;
  lastLoginAt: Date | null;
};
