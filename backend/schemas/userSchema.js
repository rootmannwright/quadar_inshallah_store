// backend/middleware/schemas/userSchema.js
// Zod schema for user creation validation
import { z } from "zod";

export const createUserSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6)
    })
});