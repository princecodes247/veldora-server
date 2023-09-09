import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '../config/env.config';

class JWT {
  private jwtConfig: {
    secret: string;
  };
  constructor(secret: string) {
    // Define configuration parameters
    this.jwtConfig = {
      secret,
    };
  }

  sign(payload: { [key: string]: string }) {
    return jwt.sign(payload, this.jwtConfig.secret, {
      expiresIn: '24h',
    });
  }

  verify(token: string) {
    return jwt.verify(token, this.jwtConfig.secret);
  }
}

export default new JWT(JWT_SECRET_KEY);
