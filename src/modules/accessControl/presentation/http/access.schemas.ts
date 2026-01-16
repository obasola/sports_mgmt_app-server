import { z } from "zod";

export const switchRoleSchema = z.object({
  roleName: z.string().trim().min(1).max(50),
});

export const adminGrantRoleSchema = z.object({
  personId: z.coerce.number().int().positive(),
  roleName: z.string().trim().min(1).max(50),
});

export const adminRevokeRoleSchema = z.object({
  personId: z.coerce.number().int().positive(),
  roleName: z.string().trim().min(1).max(50),
});
//*

export const assumeRoleSchema = z.object({
  toRid: z.number().int().positive(),
});
