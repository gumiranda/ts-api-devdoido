import { Controller } from '../../../../bin/protocols/controller';
import { HttpRequest, HttpResponse } from '../../../../bin/protocols/http';
import { badRequest } from '../../../../bin/helpers/http-helper';
import { MissingParamError } from '../../../../bin/errors';

export class LoginController implements Controller {
  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    if (!httpRequest.body.email) {
      return new Promise((resolve) =>
        resolve(badRequest(new MissingParamError('email'))),
      );
    }
    if (!httpRequest.body.password) {
      return new Promise((resolve) =>
        resolve(badRequest(new MissingParamError('password'))),
      );
    }
    if (!httpRequest.body.passwordConfirmation) {
      return new Promise((resolve) =>
        resolve(badRequest(new MissingParamError('passwordConfirmation'))),
      );
    }
  }
}
