import { Controller } from '../../protocols/controller';
import { BcryptAdapter } from '../../infra/criptography/bcrypt-adapter';
import ValidationContract from '../../helpers/validation';
import { AccountMongoRepository } from '../../../modules/account/repositories/account';
import { DbAddAccount } from '../../usecases/add-account/db-add-account';
import { SignUpController } from '../../../modules/account/controllers/signup/signup';
import { LogMongoRepository } from '../../infra/log-repository/log';
import { LogControllerDecorator } from '../decorators/log';

export const makeSignUpController = (): Controller => {
  const salt = 12;
  const validationContractAdapter = new ValidationContract();
  const bcryptAdapter = new BcryptAdapter(salt);
  const accountMongoRepository = new AccountMongoRepository();
  const dbAddAccount = new DbAddAccount(bcryptAdapter, accountMongoRepository);
  const signUpController = new SignUpController(
    validationContractAdapter,
    dbAddAccount,
  );
  const logMongoRepository = new LogMongoRepository();
  return new LogControllerDecorator(signUpController, logMongoRepository);
};
