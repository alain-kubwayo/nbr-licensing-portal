import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashEncryption {
  async hash(text: string) {
    try {
      const salt = await this.generateSalt();
      const hash = await bcrypt.hash(text, salt);
      return hash;
    } catch (error) {
      Logger.error('Error hashing text:', error);
      throw new Error((error as Error).message);
    }
  }

  async compare(text: string, hash: string) {
    try {
      const isMatch = await bcrypt.compare(text, hash);
      return isMatch;
    } catch (error) {
      Logger.error('Error comparing text with hash:', error);
      throw new Error((error as Error).message);
    }
  }

  async generateSalt() {
    const salt = await bcrypt.genSalt(10);
    return salt;
  }
}
