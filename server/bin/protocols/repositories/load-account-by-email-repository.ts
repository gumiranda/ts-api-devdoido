import { AccountModel } from '../../../modules/account/models/account';

export interface LoadAccountByEmailRepository {
  load(email: string): Promise<AccountModel>;
}
