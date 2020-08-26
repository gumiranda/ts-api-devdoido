import { Controller } from '../../protocols/controller';
import { BcryptAdapter } from '../../infra/criptography/bcrypt-adapter/bcrypt-adapter';
import { AccountMongoRepository } from '../../../modules/account/repositories/account-mongo-repository';
import { LogMongoRepository } from '../../infra/log-repository/log-mongo-repository';
import { LogControllerDecorator } from '../decorators/log-controller-decorator';
import { ValidationComposite } from '../../helpers/validators/validation-composite';
import { RequiredFieldValidation } from '../../helpers/validators/required-field-validation';
import { Validation } from '../../helpers/validators/validation';
import { EmailValidation } from '../../helpers/validators/email-validation';
import { LoginController } from '../../../modules/account/controllers/login/login-controller';
import { DbAuthentication } from '../../usecases/auth/db-authentication';
import { JwtAdapter } from '../../infra/criptography/jwt-adapter/jwt-adapter';
import variables from '../../configuration/variables';
export const makeLoginController = (): Controller => {
  const salt = 12;
  const bcryptAdapter = new BcryptAdapter(salt);
  const jwtAdapter = new JwtAdapter(variables.Security.secretKey);
  const accountMongoRepository = new AccountMongoRepository();
  const authentication = new DbAuthentication(
    accountMongoRepository,
    bcryptAdapter,
    jwtAdapter,
  );
  const validations: Validation[] = [];
  const requiredFields = ['email', 'password'];
  for (const field of requiredFields) {
    validations.push(new RequiredFieldValidation(field));
  }
  validations.push(new EmailValidation('email'));
  const validationComposite = new ValidationComposite(validations);
  const loginController = new LoginController(
    validationComposite,
    authentication,
  );
  const logMongoRepository = new LogMongoRepository();
  return new LogControllerDecorator(loginController, logMongoRepository);
};
