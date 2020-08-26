import { TokenGenerator } from '../../../protocols/crypto/token-generator';
import jwt from 'jsonwebtoken';
export class JwtAdapter implements TokenGenerator {
  private readonly secret: string;
  constructor(secret: string) {
    this.secret = secret;
  }
  async generate(id: string): Promise<string> {
    const accessToken = await jwt.sign({ id }, this.secret);
    return accessToken;
  }
}
