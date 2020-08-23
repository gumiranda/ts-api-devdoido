import { Controller } from '../../../../bin/protocols/controller';
import ValidationContract from '../../../../bin/helpers/validation';
import { AddAccount } from '../../usecases/add-account';
import { HttpResponse, HttpRequest } from '../../../../bin/protocols/http';
import { MissingParamError, InvalidParamError } from '../../../../bin/errors';
import {
  badRequest,
  serverError,
  ok,
} from '../../../../bin/helpers/http-helper';

export class SignUpController implements Controller {
  private readonly emailValidator: ValidationContract;
  private readonly addAccount: AddAccount;

  constructor(emailValidator: ValidationContract, addAccount: AddAccount) {
    this.emailValidator = emailValidator;
    this.addAccount = addAccount;
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const requiredFields = [
        'name',
        'email',
        'password',
        'passwordConfirmation',
      ];
      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          return badRequest(new MissingParamError(field));
        }
      }
      const { name, email, password, passwordConfirmation } = httpRequest.body;
      if (password !== passwordConfirmation) {
        return badRequest(new InvalidParamError('passwordConfirmation'));
      }
      const isEmail = this.emailValidator.isEmail(email, 'Email inválido');
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
