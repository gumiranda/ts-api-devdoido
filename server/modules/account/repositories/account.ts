import { AddAccountRepository } from '../../../bin/protocols/repositories/add-account-repository';
import { MongoHelper } from '../../../bin/helpers/db/mongo/mongo-helper';
import { AddAccountModel } from '../usecases/add-account/add-account';
import { LoadAccountByEmailRepository } from '../../../bin/usecases/auth/db-authentication-protocols';
import { AccountModel } from '../models/account';
export class AccountMongoRepository
  implements AddAccountRepository, LoadAccountByEmailRepository {
  async loadByEmail(email: string): Promise<AccountModel> {
    const accountCollection = await MongoHelper.getCollection('accounts');
    const result = await accountCollection.findOne({ email });
    return MongoHelper.mapPassword(result);
  }
  async add(accountData: AddAccountModel): Promise<AccountModel> {
    const accountCollection = await MongoHelper.getCollection('accounts');
    const result = await accountCollection.insertOne(accountData);
    return MongoHelper.mapPassword(result.ops[0]);
  }
}
