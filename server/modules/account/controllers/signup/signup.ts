import { Controller } from '../../../../bin/protocols/controller';
import { AddAccount } from '../../usecases/add-account';
import { HttpResponse, HttpRequest } from '../../../../bin/protocols/http';
import {
  badRequest,
  serverError,
  ok,
} from '../../../../bin/helpers/http-helper';
import { Validation } from '../../../../bin/helpers/validators/validation';
export class SignUpController implements Controller {
  private readonly addAccount: AddAccount;
  private readonly validation: Validation;

  constructor(addAccount: AddAccount, validation: Validation) {
    this.validation = validation;
    this.addAccount = addAccount;
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const errors = this.validation.validate(httpRequest.body);
      if (errors?.length > 0) {
        return badRequest(errors);
      }
      const { name, email, password } = httpRequest.body;
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
