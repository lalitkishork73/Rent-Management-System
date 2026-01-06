import { z } from 'zod';


/* -------------------------------
   Validation Schema
-------------------------------- */
export const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type SignupFormValues = z.infer<typeof signupSchema>;