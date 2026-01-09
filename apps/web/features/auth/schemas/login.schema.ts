import { z } from 'zod';

/* -------------------------------
   Validation Schema
-------------------------------- */

export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  clientType:z.string()
  
});

export type LoginFormValues = z.infer<typeof loginSchema>;
