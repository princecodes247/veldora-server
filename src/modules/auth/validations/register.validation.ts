import { any, object, string, TypeOf } from 'zod';

export const registerUserSchema = object({
  body: object({
    // username: string({
    //   required_error: 'Name is required',
    // }),
    // deviceToken: string({
    //   required_error: 'Device Token is required',
    // }),
    password: string({
      required_error: 'Name is required',
    }).min(6, 'Password too short - should be 6 chars minimum'),
    passwordConfirmation: string({
      required_error: 'passwordConfirmation is required',
    }),
    // phone: string({
    //   required_error: 'Phone is required',
    // }).min(10, 'Phone too short - should be 10 chars minimum').optional(),

    email: string({
      required_error: 'Email is required',
    }).email('Not a valid email'),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['passwordConfirmation'],
  }),
});

export const loginUserSchema = object({
  body: object({
    email: string({
      required_error: 'Email is required',
    }).email('Not a valid email'),
    password: string({
      required_error: 'Password is required',
    }),
  }),
});

export const requestEmailVerificationSchema = object({
  body: object({
    email: string({
      required_error: 'Email is required',
    }).email('Not a valid email'),
  }),
});

export type RegisterUserInput = Omit<
  TypeOf<typeof registerUserSchema>,
  'body.passwordConfirmation'
>;
