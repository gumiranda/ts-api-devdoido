import { AddAccountRepository } from '../../../bin/protocols/add-account-repository';
import { MongoHelper } from '../../../bin/helpers/db/mongo/mongo-helper';
import { AccountModel } from '../../user/models/AccountModel';
import { AddAccountModel } from '../usecases/add-account';

export class AccountMongoRepository implements AddAccountRepository {
  async add(accountData: AddAccountModel): Promise<AccountModel> {
    const accountCollection = await MongoHelper.getCollection('accounts');
    const result = await accountCollection.insertOne(accountData);
    return MongoHelper.mapPassword(result.ops[0]);
  }
}
