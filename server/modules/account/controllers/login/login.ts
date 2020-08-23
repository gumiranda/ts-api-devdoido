import { Controller } from '../../../../bin/protocols/controller';
import { HttpRequest, HttpResponse } from '../../../../bin/protocols/http';
import { badRequest } from '../../../../bin/helpers/http-helper';
import { MissingParamError, InvalidParamError } from '../../../../bin/errors';
import ValidationContract from '../../../../bin/helpers/validation';

export class LoginController implements Controller {
  private readonly validator: ValidationContract;

  constructor(validator: ValidationContract) {
    this.validator = validator;
  }
  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { email, password, passwordConfirmation } = httpRequest.body;

    if (!email) {
      return new Promise((resolve) =>
        resolve(badRequest(new MissingParamError('email'))),
      );
    }
    if (!password) {
      return new Promise((resolve) =>
        resolve(badRequest(new MissingParamError('password'))),
      );
    }
    if (!passwordConfirmation) {
      return new Promise((resolve) =>
        resolve(badRequest(new MissingParamError('passwordConfirmation'))),
      );
    }
    const requiredFields = ['email', 'password', 'passwordConfirmation'];
    for (const field of requiredFields) {
      if (!httpRequest.body[field]) {
        return badRequest(new MissingParamError(field));
      }
    }
    if (password !== passwordConfirmation) {
      return badRequest(new InvalidParamError('passwordConfirmation'));
    }
    const isEmail = this.validator.isEmail(email, 'Email inválido');
    if (!isEmail) {
      return badRequest(new InvalidParamError('email'));
    }
  }
}
