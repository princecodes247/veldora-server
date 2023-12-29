import { Document, Schema, model } from 'mongoose';
import { AccessLevels } from '../access-token.type';

interface AccessTokenDocument extends Document {
  name: string;
  token: string;
  resource: string;
  accessLevel: AccessLevels;
  accessExpiresAt?: Date;
}

const AccessTokenSchema = new Schema({
  name: { type: String, required: true },
  token: { type: String, required: true },
  resource: { type: String, required: true },
  accessLevel: {
    type: String,
    enum: Object.values(AccessLevels),
    default: AccessLevels.ReadOnly,
  },
  accessExpiresAt: { type: Date },
});

const AccessTokenModel = model<AccessTokenDocument>(
  'AccessToken',
  AccessTokenSchema,
);

export { AccessTokenModel, AccessTokenSchema, AccessTokenDocument };
