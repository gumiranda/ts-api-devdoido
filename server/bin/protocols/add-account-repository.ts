import { AddAccountModel } from '../../modules/account/usecases/add-account';
import { AccountModel } from '../../modules/account/models/account';

export interface AddAccountRepository {
  add(accountData: AddAccountModel): Promise<AccountModel>;
}
