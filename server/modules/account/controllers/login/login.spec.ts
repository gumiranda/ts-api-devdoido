import ValidationContract from '../../../../bin/helpers/validation';
import { AddAccount, AddAccountModel } from '../../usecases/add-account';
import { AccountModel } from '../../models/account';
import { HttpRequest } from '../../../../bin/protocols/http';
import {
  badRequest,
  serverError,
  ok,
} from '../../../../bin/helpers/http-helper';
import {
  MissingParamError,
  InvalidParamError,
  ServerError,
} from '../../../../bin/errors';
import { LoginController } from './login';

interface SutTypes {
  sut: LoginController;
  validatorStub: ValidationContract;
}

const makeSut = (): SutTypes => {
  const validatorStub = makeValidator();
  const sut = new LoginController(validatorStub);
  return { sut, validatorStub };
};
const makeValidator = (): ValidationContract => {
  class ValidatorStub extends ValidationContract {
    _errors: Array<any>;

    isNotArrayOrEmpty(value: any, message: any): boolean {
      return true;
    }
    isTrue(value: any, message: any): boolean {
      return true;
    }
    isRequired(value: any, message: any): boolean {
      return true;
    }
    errors(): any[] {
      return this._errors;
    }
    isValid(): boolean {
      return true;
    }
    isEmail(email: string, message: string): boolean {
      return true;
    }
  }
  return new ValidatorStub();
};
describe('Login Controller', () => {
  test('Should return 400 if no email is provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: { password: 'any_password', passwordConfirmation: 'any_password' },
    };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(badRequest(new MissingParamError('email')));
  });
  test('Should return 400 if no password is provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: { email: 'email@email.com', passwordConfirmation: 'any_password' },
    };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(badRequest(new MissingParamError('password')));
  });
  test('Should return 400 if no passwordConfirmation is provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: { password: 'any_password', email: 'email@email.com' },
    };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(
      badRequest(new MissingParamError('passwordConfirmation')),
    );
  });
  test('Should call ValidatorContract with correct email', async () => {
    const { sut, validatorStub } = makeSut();
    const isEmailSpy = jest.spyOn(validatorStub, 'isEmail');
    const httpRequest = {
      body: {
        password: 'any_password',
        passwordConfirmation: 'any_password',
        email: 'email@email.com',
      },
    };
    await sut.handle(httpRequest);
    expect(isEmailSpy).toHaveBeenCalledWith(
      'email@email.com',
      'Email inválido',
    );
  });
  test('Should returns 400 ValidatorContract with invalid email', async () => {
    const { sut, validatorStub } = makeSut();
    jest.spyOn(validatorStub, 'isEmail').mockReturnValueOnce(false);
    const isEmailSpy = jest.spyOn(validatorStub, 'isEmail');
    const httpRequest = {
      body: {
        password: 'any_password',
        passwordConfirmation: 'any_password',
        email: 'email@email.com',
      },
    };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(badRequest(new InvalidParamError('email')));
  });
});
