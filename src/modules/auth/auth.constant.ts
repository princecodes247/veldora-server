import { JWT_SECRET_KEY } from '../../config/env.config';

export const jwtConstants = {
  secret: JWT_SECRET_KEY,
};

export const COOKIE_TOKEN = 'USER_TOKEN';
