import { Controller } from '../../protocols/controller';
import { BcryptAdapter } from '../../infra/criptography/bcrypt-adapter/bcrypt-adapter';
import { AccountMongoRepository } from '../../../modules/account/repositories/account';
import { LogMongoRepository } from '../../infra/log-repository/log';
import { LogControllerDecorator } from '../decorators/log';
import { ValidationComposite } from '../../helpers/validators/validation-composite';
import { RequiredFieldValidation } from '../../helpers/validators/required-field-validation';
import { Validation } from '../../helpers/validators/validation';
import { CompareFieldsValidation } from '../../helpers/validators/compare-fields-validation';
import { EmailValidation } from '../../helpers/validators/email-validation';
import { LoginController } from '../../../modules/account/controllers/login/login';
import { Authentication } from '../../../modules/account/usecases/auth/authentication';
export const makeLoginController = (): Controller => {
  const salt = 12;
  const bcryptAdapter = new BcryptAdapter(salt);
  const accountMongoRepository = new AccountMongoRepository();
  //const authentication = new DbAuthentication();
  const validations: Validation[] = [];
  const requiredFields = ['email', 'password', 'passwordConfirmation'];
  for (const field of requiredFields) {
    validations.push(new RequiredFieldValidation(field));
  }
  validations.push(
    new CompareFieldsValidation('password', 'passwordConfirmation'),
  );
  validations.push(new EmailValidation('email'));
  const validationComposite = new ValidationComposite(validations);
  const loginController = new LoginController(
    validationComposite,
    null,
    //authentication,
  );
  const logMongoRepository = new LogMongoRepository();
  return new LogControllerDecorator(loginController, logMongoRepository);
};
