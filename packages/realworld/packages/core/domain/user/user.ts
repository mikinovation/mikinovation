import { string, z } from "zod";

export const idSchema = string().uuid().readonly().brand("UserId");
export type UserId = z.infer<typeof idSchema>;

export const usernameSchema = string()
  .min(1)
  .max(255)
  .readonly()
  .brand("Username");
export type Username = z.infer<typeof usernameSchema>;

export const userSchema = z
  .object({
    id: idSchema,
    username: usernameSchema,
  })
  .readonly()
  .brand("User");
export type User = z.infer<typeof userSchema>;
