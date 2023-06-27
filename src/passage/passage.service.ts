import { Inject, Injectable, forwardRef } from '@nestjs/common';
import Passage, {
  PassageConfig,
  UserObject,
} from '@passageidentity/passage-node';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
// import { PassageModule } from './passage.module';
@Injectable()
export class PassageService {
  // @Inject(forwardRef(() => Passage))
  private passage: Passage;

  private passageConfig: PassageConfig;

  constructor(private configService: ConfigService) {
    this.passageConfig = {
      appID: this.configService.get('PASSAGE_APP_ID'),
      apiKey: this.configService.get('PASSAGE_API_KEY'),
    };
    // @Inject(forwardRef(() => CommonService))
    this.passage = new Passage(this.passageConfig);
  }

  async authenticateRequest(req: Request): Promise<string | null> {
    try {
      const userID = await this.passage.authenticateRequestWithHeader(req);
      return userID || null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async authenticate(token: string): Promise<string | null> {
    try {
      const userID = await this.passage.validAuthToken(token);
      console.log({ userID, token });
      return userID || null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async get(userID: string): Promise<UserObject | null> {
    try {
      // this.passage = new Passage(this.passageConfig);
      const output = await this.passage.user.get(userID);
      return output;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async update(
    userID: string,
    data: {
      email?: string;
      phone?: string;
      user_metadata?: {
        username: string;
      };
    },
  ): Promise<UserObject | null> {
    try {
      // this.passage = new Passage(this.passageConfig);
      const output = await this.passage.user.update(userID, data);
      return output;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
