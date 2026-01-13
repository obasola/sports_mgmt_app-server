export type NewPersonInput = {
  userName: string;
  emailAddress: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  activeRid?: number | null;
};