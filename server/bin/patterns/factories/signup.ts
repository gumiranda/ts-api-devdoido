import { Controller } from '../../protocols/controller';
import { BcryptAdapter } from '../../infra/criptography/bcrypt-adapter';
import ValidationContract from '../../helpers/validators/validationContract';
import { AccountMongoRepository } from '../../../modules/account/repositories/account';
import { DbAddAccount } from '../../usecases/add-account/db-add-account';
import { SignUpController } from '../../../modules/account/controllers/signup/signup';
import { LogMongoRepository } from '../../infra/log-repository/log';
import { LogControllerDecorator } from '../decorators/log';
import { ValidationComposite } from '../../helpers/validators/validation-composite';
import { RequiredFieldValidation } from '../../helpers/validators/required-field-validation';
import { Validation } from '../../helpers/validators/validation';
import { CompareFieldsValidation } from '../../helpers/validators/compare-fields-validation';
import { EmailValidation } from '../../helpers/validators/email-validation';

export const makeSignUpController = (): Controller => {
  const salt = 12;
  const bcryptAdapter = new BcryptAdapter(salt);
  const accountMongoRepository = new AccountMongoRepository();
  const dbAddAccount = new DbAddAccount(bcryptAdapter, accountMongoRepository);
  const validations: Validation[] = [];
  const requiredFields = ['email', 'name', 'password', 'passwordConfirmation'];
  for (const field of requiredFields) {
    validations.push(new RequiredFieldValidation(field));
  }
  validations.push(
    new CompareFieldsValidation('password', 'passwordConfirmation'),
  );
  validations.push(new EmailValidation('email'));
  const validationComposite = new ValidationComposite(validations);
  const signUpController = new SignUpController(
    dbAddAccount,
    validationComposite,
  );
  const logMongoRepository = new LogMongoRepository();
  return new LogControllerDecorator(signUpController, logMongoRepository);
};
