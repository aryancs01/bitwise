import { z } from "zod"

export const userRegister = z.object({
  username: z.string().min(3).max(20).refine(s => !s.includes(' '), 'No Spaces!'),
  email: z.email(),
  password: z.string().min(6),
})

export const userSignin = z.object({
  email: z.email(),
  password: z.string().min(6),
})