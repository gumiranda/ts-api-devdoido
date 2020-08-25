import { Controller } from '../../../../bin/protocols/controller';
import ValidationContract from '../../../../bin/helpers/validators/validationContract';
import { AddAccount } from '../../usecases/add-account';
import { HttpResponse, HttpRequest } from '../../../../bin/protocols/http';
import { InvalidParamError } from '../../../../bin/errors';
import {
  badRequest,
  serverError,
  ok,
} from '../../../../bin/helpers/http-helper';
import { Validation } from '../../../../bin/helpers/validators/validation';
import { ValidationComposite } from '../../../../bin/helpers/validators/validation-composite';

export class SignUpController implements Controller {
  private readonly validator: ValidationContract;
  private readonly addAccount: AddAccount;
  private readonly validation: ValidationComposite;

  constructor(
    validator: ValidationContract,
    addAccount: AddAccount,
    validation: ValidationComposite,
  ) {
    this.validator = validator;
    this.validation = validation;
    this.addAccount = addAccount;
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const errors = this.validation.validateAll(httpRequest.body);
      if (errors?.length > 0) {
        return badRequest(errors);
      }
      const { name, email, password, passwordConfirmation } = httpRequest.body;
      if (password !== passwordConfirmation) {
        return badRequest(new InvalidParamError('passwordConfirmation'));
      }
      const isEmail = this.validator.isEmail(email, 'Email inválido');
      if (!isEmail) {
        return badRequest(new InvalidParamError('email'));
      }
      const account = await this.addAccount.add({
        name,
        email,
        password,
      });
      return ok(account);
    } catch (error) {
      return serverError(error);
    }
  }
}
