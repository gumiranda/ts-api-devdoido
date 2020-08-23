import { SignUpController } from './signup';
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

const makeAddAccount = (): AddAccount => {
  class AddAccountStub implements AddAccount {
    async add(account: AddAccountModel): Promise<AccountModel> {
      return new Promise((resolve) => resolve(makeFakeAccount()));
    }
  }
  return new AddAccountStub();
};
const makeFakeAccount = (): AccountModel => ({
  _id: 'valid_id',
  name: 'valid_name',
  email: 'valid_email@mail.com',
  password: 'valid_password',
});
const makeFakeRequest = (): HttpRequest => ({
  body: {
    name: 'any_name',
    email: 'any_email@mail.com',
    password: 'any_password',
    passwordConfirmation: 'any_password',
  },
});
interface SutTypes {
  sut: SignUpController;
  validatorStub: ValidationContract;
  addAccountStub: AddAccount;
}

const makeSut = (): SutTypes => {
  const validatorStub = makeValidator();
  const addAccountStub = makeAddAccount();
  const sut = new SignUpController(validatorStub, addAccountStub);
  return {
    sut,
    validatorStub,
    addAccountStub,
  };
};
describe('SignUp Controller', () => {
  test('Should return 400 if no name is provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password',
      },
    };
    const httpResponse = await await sut.handle(httpRequest);
    expect(httpResponse).toEqual(badRequest(new MissingParamError('name')));
  });

  test('Should return 400 if no email is provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password',
      },
    };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(badRequest(new MissingParamError('email')));
  });

  test('Should return 400 if no password is provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        passwordConfirmation: 'any_password',
      },
    };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(badRequest(new MissingParamError('password')));
  });

  test('Should return 400 if no password confirmation is provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
      },
    };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(
      badRequest(new MissingParamError('passwordConfirmation')),
    );
  });

  test('Should return 400 if password confirmation fails', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'invalid_password',
      },
    };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(
      new InvalidParamError('passwordConfirmation'),
    );
  });

  test('Should return 400 if an invalid email is provided', async () => {
    const { sut, validatorStub } = makeSut();
    jest.spyOn(validatorStub, 'isEmail').mockReturnValueOnce(false);
    const httpResponse = await sut.handle(makeFakeRequest());
    expect(httpResponse).toEqual(badRequest(new InvalidParamError('email')));
  });

  test('Should call Validator with correct email', async () => {
    const { sut, validatorStub } = makeSut();
    const isEmailSpy = jest.spyOn(validatorStub, 'isEmail');
    await sut.handle(makeFakeRequest());
    expect(isEmailSpy).toHaveBeenCalledWith(
      'any_email@mail.com',
      'Email inválido',
    );
  });

  test('Should return 500 if Validator throws', async () => {
    const { sut, validatorStub } = makeSut();
    jest.spyOn(validatorStub, 'isEmail').mockImplementationOnce(() => {
      throw new Error();
    });
    const httpResponse = await sut.handle(makeFakeRequest());
    expect(httpResponse).toEqual(serverError(new ServerError(null)));
  });

  test('Should return 500 if AddAccount throws', async () => {
    const { sut, addAccountStub } = makeSut();
    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(async () => {
      return new Promise((resolve, reject) => reject(new Error()));
    });
    const httpResponse = await sut.handle(makeFakeRequest());
    expect(httpResponse).toEqual(serverError(new ServerError(null)));
  });

  test('Should call AddAccount with correct values', async () => {
    const { sut, addAccountStub } = makeSut();
    const addSpy = jest.spyOn(addAccountStub, 'add');

    await sut.handle(makeFakeRequest());
    expect(addSpy).toHaveBeenCalledWith({
      name: 'any_name',
      email: 'any_email@mail.com',
      password: 'any_password',
    });
  });

  test('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut();
    const httpResponse = await sut.handle(makeFakeRequest());
    expect(httpResponse).toEqual(ok(makeFakeAccount()));
  });
});
