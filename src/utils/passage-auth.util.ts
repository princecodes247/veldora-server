import Passage, {
  PassageConfig,
  UserObject,
} from '@passageidentity/passage-node';
import { Request } from 'express';
import { PASSAGE_API_KEY, PASSAGE_APP_ID } from '../config/env.config';

class PassageAuth {
  private passage: Passage;

  constructor() {
    // Define Passage configuration parameters
    const passageConfig: PassageConfig = {
      appID: PASSAGE_APP_ID, // Use environment variables or configuration file
      apiKey: PASSAGE_API_KEY, // Use environment variables or configuration file
    };

    // Create a Passage instance with the provided configuration
    this.passage = new Passage(passageConfig);
  }

  async authenticateRequest(req: Request): Promise<string | null> {
    try {
      const userID = await this.passage.authenticateRequestWithHeader(req);
      return userID || null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async authenticate(token: string): Promise<string | null> {
    try {
      console.log({ token });
      const userID = await this.passage.validAuthToken(token);
      return userID || null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async getUser(userID: string): Promise<UserObject | null> {
    try {
      const output = await this.passage.user.get(userID);
      return output;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async updateUser(
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
      const output = await this.passage.user.update(userID, data);
      return output;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}

export default PassageAuth;
