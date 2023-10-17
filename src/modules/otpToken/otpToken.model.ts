// otpToken.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface BaseOTPToken {
  token: string;
  userId: string;
  meta: string;
  type: 'emailVerification' | 'phoneVerification' | 'passwordReset';
  expiresAt: Date;
}

export interface OTPToken extends BaseOTPToken, Document {}

const OTPTokenSchema: Schema = new Schema({
  token: { type: String, required: true },
  meta: { type: String },
  userId: { type: String, required: true },
  type: {
    type: String,
    enum: ['emailVerification', 'phoneVerification', 'passwordReset'],
    required: true,
  },
  expiresAt: { type: Date, required: true },
});

export default mongoose.model<OTPToken>('OTPToken', OTPTokenSchema);
