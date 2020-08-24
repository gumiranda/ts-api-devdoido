import { Controller } from '../../../../bin/protocols/controller';
import { HttpRequest, HttpResponse } from '../../../../bin/protocols/http';
import {
  badRequest,
  serverError,
  unauthorized,
} from '../../../../bin/helpers/http-helper';
import { MissingParamError, InvalidParamError } from '../../../../bin/errors';
import ValidationContract from '../../../../bin/helpers/validation';
import { Authentication } from '../../../../bin/usecases/auth/authentication';

export class LoginController implements Controller {
  private readonly validator: ValidationContract;
  private readonly authentication: Authentication;

  constructor(validator: ValidationContract, authentication: Authentication) {
    this.validator = validator;
    this.authentication = authentication;
  }
  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { email, password, passwordConfirmation } = httpRequest.body;
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
      const accessToken = await this.authentication.auth(email, password);
      if (!accessToken) {
        return unauthorized();
      }
    } catch (error) {
      return serverError(error);
    }
  }
}
