export type RequestUser = {
  id: string;
  email: string;
  isEmailVerified: boolean | null;
  name: string | null;
  roles?: string| null; // we can extend later
  // permissions?: string[]; // we can extend later
};
