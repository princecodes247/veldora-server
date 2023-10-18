import AuthService from '../modules/auth/auth.service';
import { OTPTokenService } from '../modules/otpToken';
import { UserService } from '../modules/user';
import eventEmitter from './base';
import { EventEmitterEvents } from './events.interface';

export default function setupUserEvents() {
  eventEmitter.on(EventEmitterEvents.USER_CREATED, async (eventData) => {
    const { _id, email } = eventData;
    console.log('sjosjo');

    let { token } = await OTPTokenService.generateUUID(
      _id,
      'emailVerification',
    );
    console.log({ token });

    AuthService.sendEmailVerificationService(email, token);
  });
}
