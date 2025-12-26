import { z } from 'zod';
import { UserRole } from '../models';

// Base fields without refinement
const baseFields = {
  fullname: z.string().min(1, 'Fullname is required').min(2, 'Fullname must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  zaloId: z.string().optional()
};

// User registration schema
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

// User registration schema
export const userRegistrationSchema = z
  .object({
    ...baseFields,
    role: z.literal(UserRole.USER)
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

// IT Support registration schema
export const itSupportRegistrationSchema = z
  .object({
    ...baseFields,
    role: z.literal(UserRole.IT_SUPPORT)
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

// File validation helper
const fileSchema = z
  .instanceof(File, { message: 'Please upload a file' })
  .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
  .refine(
    (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
    'Only JPEG, PNG, and WebP images are allowed'
  );

// Certificate schema
const certificateSchema = z.object({
  description: z
    .string()
    .min(1, 'Certificate description is required')
    .min(5, 'Description must be at least 5 characters'),
  evidence: z.string().min(1, 'Certificate evidence is required').min(10, 'Evidence must be at least 10 characters')
});

// Base more info fields
const baseMoreInfoFields = {
  avatar: fileSchema,
  phoneNumber: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional()
};

// User more info schema
export const userMoreInfoSchema = z.object({
  ...baseMoreInfoFields,
  userType: z.literal('user')
});

// IT Support more info schema
export const itSupportMoreInfoSchema = z.object({
  ...baseMoreInfoFields,
  userType: z.literal('itSupport'),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'),
  address: z.string().min(1, 'Address is required').min(10, 'Address must be at least 10 characters'),
  age: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const num = Number.parseInt(val, 10);
      return num >= 18 && num <= 65;
    }, 'Age must be between 18 and 65'),
  supportExperience: z
    .string()
    .min(1, 'IT support experience is required')
    .min(20, 'Please provide more details about your IT support experience'),
  idCardFront: fileSchema,
  idCardBack: fileSchema,
  certificates: z.array(certificateSchema).min(1, 'At least one certificate is required'),
  specializations: z.array(z.string()).optional()
});

// Type exports
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type ITSupportRegistration = z.infer<typeof itSupportRegistrationSchema>;
export type UserMoreInfo = z.infer<typeof userMoreInfoSchema>;
export type ITSupportMoreInfo = z.infer<typeof itSupportMoreInfoSchema>;
export type LoginData = z.infer<typeof loginSchema>;
