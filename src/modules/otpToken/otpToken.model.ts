// otpToken.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface OTPToken extends Document {
  token: string;
  userId: string;
  type: "emailVerification" | "phoneVerification" | "passwordReset";
  expiresAt: Date;
}

const OTPTokenSchema: Schema = new Schema({
  token: { type: String, required: true },
  userId: { type: String, required: true },
  type: {
    type: String,
    enum: ["emailVerification", "phoneVerification", "passwordReset"],
    required: true,
  },
  expiresAt: { type: Date, required: true },
});

export default mongoose.model<OTPToken>("OTPToken", OTPTokenSchema);
