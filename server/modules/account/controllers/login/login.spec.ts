import ValidationContract from '../../../../bin/helpers/validation';
import { AddAccount, AddAccountModel } from '../../usecases/add-account';
import { AccountModel } from '../../models/account';
import { HttpRequest } from '../../../../bin/protocols/http';
import {
  badRequest,
  serverError,
  ok,
  unauthorized,
} from '../../../../bin/helpers/http-helper';
import {
  MissingParamError,
  InvalidParamError,
  ServerError,
} from '../../../../bin/errors';
import { LoginController } from './login';
import { Authentication } from '../../../../bin/usecases/auth/authentication';

interface SutTypes {
  sut: LoginController;
  validatorStub: ValidationContract;
  authenticationStub: Authentication;
}

const makeSut = (): SutTypes => {
  const validatorStub = makeValidator();
  const authenticationStub = makeAuthentication();
  const sut = new LoginController(validatorStub, authenticationStub);
  return { sut, validatorStub, authenticationStub };
};
const makeAuthentication = (): Authentication => {
  class AuthenticationStub implements Authentication {
    async auth(email: string, password: string): Promise<string> {
      return new Promise((resolve) => resolve('any_token'));
    }
  }
  return new AuthenticationStub();
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
const makeFakeRequest = (): HttpRequest => ({
  body: {
    password: 'any_password',
    passwordConfirmation: 'any_password',
    email: 'email@email.com',
  },
});
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
    await sut.handle(makeFakeRequest());
    expect(isEmailSpy).toHaveBeenCalledWith(
      'email@email.com',
      'Email inválido',
    );
  });
  test('Should returns 400 ValidatorContract with invalid email', async () => {
    const { sut, validatorStub } = makeSut();
    jest.spyOn(validatorStub, 'isEmail').mockReturnValueOnce(false);
    const httpResponse = await sut.handle(makeFakeRequest());
    expect(httpResponse).toEqual(badRequest(new InvalidParamError('email')));
  });
  test('Should returns 500 ValidatorContract throws', async () => {
    const { sut, validatorStub } = makeSut();
    jest.spyOn(validatorStub, 'isEmail').mockImplementationOnce(() => {
      throw new Error();
    });
    const httpResponse = await sut.handle(makeFakeRequest());
    expect(httpResponse).toEqual(serverError(new Error()));
  });
  test('Should returns 500 Authentication throws', async () => {
    const { sut, authenticationStub } = makeSut();
    jest
      .spyOn(authenticationStub, 'auth')
      .mockReturnValueOnce(
        new Promise((resolve, reject) => reject(new Error())),
      );
    const httpResponse = await sut.handle(makeFakeRequest());
    expect(httpResponse).toEqual(serverError(new Error()));
  });
  test('Should returns 401 if invalid credentials are provided', async () => {
    const { sut, authenticationStub } = makeSut();
    jest
      .spyOn(authenticationStub, 'auth')
      .mockReturnValueOnce(new Promise((resolve) => resolve(null)));
    const httpResponse = await sut.handle(makeFakeRequest());
    expect(httpResponse).toEqual(unauthorized());
  });
  test('Should call Authentication with correct values', async () => {
    const { sut, authenticationStub } = makeSut();
    const authSpy = jest.spyOn(authenticationStub, 'auth');
    await sut.handle(makeFakeRequest());
    expect(authSpy).toHaveBeenCalledWith('email@email.com', 'any_password');
  });
});
