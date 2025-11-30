export type NewPersonInput = {
  userName: string;
  emailAddress: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  rid?: number | null;
};