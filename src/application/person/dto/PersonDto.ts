// src/application/person/dto/PersonDto.ts
import { z } from 'zod';

export const CreatePersonDtoSchema = z.object({
  userName: z.string().min(1, 'Username is required').max(25, 'Username cannot exceed 25 characters'),
  emailAddress: z.string().email('Invalid email format').min(1, 'Email address is required').max(75, 'Email address cannot exceed 75 characters'),
  password: z.string().min(1, 'Password is required').max(25, 'Password cannot exceed 25 characters'),
  firstName: z.string().min(1, 'First name is required').max(25, 'First name cannot exceed 25 characters'),
  lastName: z.string().min(1, 'Last name is required').max(35, 'Last name cannot exceed 35 characters'),
});

export const UpdatePersonDtoSchema = z.object({
  userName: z.string().min(1, 'Username is required').max(25, 'Username cannot exceed 25 characters').optional(),
  emailAddress: z.string().email('Invalid email format').max(75, 'Email address cannot exceed 75 characters').optional(),
  password: z.string().min(1, 'Password is required').max(25, 'Password cannot exceed 25 characters').optional(),
  firstName: z.string().min(1, 'First name is required').max(25, 'First name cannot exceed 25 characters').optional(),
  lastName: z.string().min(1, 'Last name is required').max(35, 'Last name cannot exceed 35 characters').optional(),
});

export const PersonFiltersDtoSchema = z.object({
  userName: z.string().optional(),
  emailAddress: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const PersonSearchDtoSchema = z.object({
  searchTerm: z.string().min(1, 'Search term is required'),
});

export const LoginDtoSchema = z.object({
  userName: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const PaginationDtoSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
});

export type CreatePersonDto = z.infer<typeof CreatePersonDtoSchema>;
export type UpdatePersonDto = z.infer<typeof UpdatePersonDtoSchema>;
export type PersonFiltersDto = z.infer<typeof PersonFiltersDtoSchema>;
export type PersonSearchDto = z.infer<typeof PersonSearchDtoSchema>;
export type LoginDto = z.infer<typeof LoginDtoSchema>;
export type PaginationDto = z.infer<typeof PaginationDtoSchema>;

export interface PersonResponseDto {
  pid: number;
  userName: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
  fullName: string;
  // Note: password is excluded from response for security
}

export interface LoginResponseDto {
  success: boolean;
  person: PersonResponseDto;
  message: string;
}