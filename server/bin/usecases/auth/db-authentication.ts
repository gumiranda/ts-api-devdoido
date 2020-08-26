import { Authentication } from '../../../modules/account/usecases/auth/authentication';
import { LoadAccountByEmailRepository } from '../../protocols/repositories/load-account-by-email-repository';

export class DbAuthentication implements Authentication {
  private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository;
  constructor(loadAccountByEmailRepository: LoadAccountByEmailRepository) {
    this.loadAccountByEmailRepository = loadAccountByEmailRepository;
  }
  async auth(email: string, password: string): Promise<string> {
    await this.loadAccountByEmailRepository.load(email);
    return null;
  }
}
