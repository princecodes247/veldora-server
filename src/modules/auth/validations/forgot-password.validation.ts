import mongoose from 'mongoose';
import { any, object, string, TypeOf } from 'zod';

export const changePasswordSchema = object({
  body: object({
    otp: string({
      required_error: 'ID is required',
    }),
    password: string({
      required_error: 'Password is required',
    }).min(6, 'Password too short - should be 6 chars minimum'),
    passwordConfirmation: string({
      required_error: 'passwordConfirmation is required',
    }),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['passwordConfirmation'],
  }),
  // .refine((data) => mongoose.isValidObjectId(data.id), {
  //   message: 'Invalid ID',
  //   path: ['id'],
  // }),
});

export type ChangePasswordInput = Omit<
  TypeOf<typeof changePasswordSchema>,
  'body.passwordConfirmation'
>;

export const requestChangePasswordSchema = object({
  body: object({
    email: string({
      required_error: 'Email is required',
    }),
  }),
});

export type RequestChangePasswordInput = TypeOf<
  typeof requestChangePasswordSchema
>;

export const verifyChangePasswordRequestSchema = object({
  body: object({
    id: string({
      required_error: 'id is required',
    }),
  }).refine((data) => mongoose.isValidObjectId(data.id), {
    message: 'Invalid ID',
    path: ['id'],
  }),
});

export type VerifyChangePasswordRequestInput = TypeOf<
  typeof verifyChangePasswordRequestSchema
>;
