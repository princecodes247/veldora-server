import bcrypt from 'bcrypt';
import mongoose, { Document, Schema } from 'mongoose';
enum UserStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}
export interface BaseUser {
  username: string;
  oldUserId: string;
  email: string;
  password: string;
  email_verified: boolean;
  last_login_at: Date;
  login_count: number;
  status: UserStatus;
  updated_at: Date;
  created_at: Date;
}

export interface IUser extends BaseUser, Document {}

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    oldUserId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // oldPassword: {

    // },
    email_verified: {
      type: Boolean,
      default: false,
    },
    last_login_at: {
      type: Date,
    },
    login_count: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: 'pending',
    },

    metadata: {
      theme: {
        type: String,
        default: 'light',
      },
    },
  },
  {
    timestamps: true,
  },
);

// Define a pre-save middleware to hash the password before saving
UserSchema.pre<IUser>('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    return next();
  } catch (error) {
    return next(error);
  }
});

const UserModel = mongoose.model<IUser>('User', UserSchema);

export default UserModel;
