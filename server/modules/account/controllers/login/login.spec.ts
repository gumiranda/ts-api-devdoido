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
}

const makeSut = (): SutTypes => {
  const sut = new LoginController();
  return { sut };
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
});
