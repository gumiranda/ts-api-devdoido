import { AccountModel } from '../../../modules/account/models/account';

export interface LoadAccountByEmailRepository {
  loadByEmail(email: string): Promise<AccountModel>;
}
