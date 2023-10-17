import crypto from 'crypto';
import OTPTokenModel, { BaseOTPToken, OTPToken } from './otpToken.model';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const OTP_EXPIRY_MINUTES = 15;

class OTPTokenService {
  async generateOTP(userId: string, type: OTPToken['type'], meta?: string) {
    const token = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000); // Convert minutes to milliseconds

    const otpToken = new OTPTokenModel({
      token,
      userId,
      type,
      expiresAt,
      meta,
    });

    await otpToken.save();
    return otpToken;
  }

  async generateUUID(userId: string, type: OTPToken['type'], meta?: string) {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000); // Convert minutes to milliseconds

    const otpToken = new OTPTokenModel({
      token,
      userId,
      type,
      expiresAt,
      meta,
    });

    await otpToken.save();
    return otpToken.toObject();
  }

  async verifyOTP({
    token,
    type,
    userId,
    deleteOnVerify = true,
  }: {
    token: string;
    type: OTPToken['type'];
    userId?: string;
    deleteOnVerify?: boolean;
  }): Promise<boolean> {
    const otpToken = await OTPTokenModel.findOne({
      userId,
      token,
      type,
      expiresAt: { $gt: new Date() }, // Check if token is not expired
    });

    if (!otpToken) {
      return false;
    }

    if (deleteOnVerify) await OTPTokenModel.deleteOne({ _id: otpToken._id });
    return true;
  }

  async getOTP(
    token: string,
    type: OTPToken['type'],
    id?: string,
  ): Promise<BaseOTPToken | null> {
    const otpToken = await OTPTokenModel.findOne({
      token,
      type,
      // ...(id && { _id: id }),
      ...(mongoose.isValidObjectId(id) && {
        _id: new mongoose.Types.ObjectId(id),
      }),
      expiresAt: { $gt: new Date() }, // Check if token is not expired
    }).lean();

    if (!otpToken) {
      return null;
    }

    return otpToken;
  }

  async getOTPByMeta(
    meta: string,
    type: OTPToken['type'],
  ): Promise<BaseOTPToken | null> {
    const otpToken = await OTPTokenModel.findOne({
      meta,
      type,
      expiresAt: { $gt: new Date() }, // Check if token is not expired
    }).lean();

    if (!otpToken) {
      return null;
    }

    return otpToken;
  }

  async getOTPByID(id: string): Promise<BaseOTPToken | null> {
    const otpToken = await OTPTokenModel.findById(id).lean();

    if (!otpToken) {
      return null;
    }

    return otpToken;
  }

  async deleteOTP(token: string, type: OTPToken['type']): Promise<void> {
    const otpToken = await OTPTokenModel.findOne({
      token,
      type,
      expiresAt: { $gt: new Date() }, // Check if token is not expired
    });

    console.log('otpToken', otpToken);

    if (!otpToken) {
      return;
    }

    await OTPTokenModel.deleteOne({ _id: otpToken._id });
  }
}

export default new OTPTokenService();
