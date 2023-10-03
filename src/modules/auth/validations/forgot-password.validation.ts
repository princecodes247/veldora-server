import { any, object, string, TypeOf } from "zod";

export const changePasswordSchema = object({
  body: object({
    password: string({
      required_error: "Password is required",
    }).min(6, "Password too short - should be 6 chars minimum"),
    passwordConfirmation: string({
      required_error: "passwordConfirmation is required",
    }),
    otp: string({
      required_error: "OTP is required",
    }),
    // .min(10, "Phone too short - should be 10 chars minimum"),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  }),
});

export type ChangePasswordInput = Omit<
  TypeOf<typeof changePasswordSchema>,
  "body.passwordConfirmation"
>;

export const requestChangePasswordSchema = object({
  body: object({
    email: string({
      required_error: "Email is required",
    }),
  }),
});

export type RequestChangePasswordInput = TypeOf<
  typeof requestChangePasswordSchema
>;

export const verifyChangePasswordRequestSchema = object({
  body: object({
    otp: string({
      required_error: "OTP is required",
    }),
  }),
});

export type VerifyChangePasswordRequestInput = TypeOf<
  typeof verifyChangePasswordRequestSchema
>;
