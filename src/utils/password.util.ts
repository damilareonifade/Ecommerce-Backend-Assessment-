import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

@Injectable()
export class PasswordUtil {
  private readonly saltRounds = 10;

  /**
   * Hash a password using bcrypt
   * @param password Plain text password to hash
   * @returns Hashed password
   */
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compare a plain text password with a hashed password
   * @param password Plain text password to check
   * @param hashedPassword Hashed password to compare against
   * @returns Boolean indicating if the passwords match
   */
  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
