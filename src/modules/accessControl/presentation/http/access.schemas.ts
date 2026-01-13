import { z } from "zod";

export const switchRoleSchema = z.object({
  roleName: z.string().min(1),
});

export const adminGrantRoleSchema = z.object({
  roleName: z.string().min(1),
});

export const adminRevokeRoleSchema = z.object({
  roleName: z.string().min(1),
});
