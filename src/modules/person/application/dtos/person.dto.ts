import { z } from 'zod';
import { Person } from '../../domain/person.entity';

// Zod schema for person creation
export const CreatePersonSchema = z.object({
  userName: z.string().min(1, 'Username is required'),
  emailAddress: z.string().email('Invalid email address format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

// Type for person creation
export type CreatePersonDto = z.infer<typeof CreatePersonSchema>;

// Zod schema for person update
export const UpdatePersonSchema = z.object({
  userName: z.string().min(1).optional(),
  emailAddress: z.string().email().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
});

// Type for person update
export type UpdatePersonDto = z.infer<typeof UpdatePersonSchema>;

// Zod schema for password update
export const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

// Type for password update
export type UpdatePasswordDto = z.infer<typeof UpdatePasswordSchema>;

// Zod schema for authentication
export const AuthenticateSchema = z.object({
  userName: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Type for authentication
export type AuthenticateDto = z.infer<typeof AuthenticateSchema>;

// Response DTO for person (excludes password)
export interface PersonResponseDto {
  pid: number;
  userName: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

// Mapper function to convert Person entity to PersonResponseDto (excluding password)
export function mapPersonToDto(person: Person): PersonResponseDto {
  return {
    pid: person.pid as number,
    userName: person.userName,
    emailAddress: person.emailAddress,
    firstName: person.firstName,
    lastName: person.lastName,
    fullName: person.fullName,
  };
}
