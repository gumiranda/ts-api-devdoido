import { DbAddAccount } from './db-add-account';
import {
  Encrypter,
  AddAccountModel,
  AccountModel,
  AddAccountRepository,
} from './db-add-account-protocols';
import { LoadAccountByEmailRepository } from '../auth/db-authentication-protocols';

const makeEncrypter = (): Encrypter => {
  class EncrypterStub implements Encrypter {
    async encrypt(value: string): Promise<string> {
      return new Promise((resolve) => resolve('hashed_password'));
    }
  }
  return new EncrypterStub();
};
const makeFakeAccount = (): AccountModel => ({
  _id: 'valid_id',
  name: 'valid_name',
  email: 'valid_email',
  password: 'hashed_password',
});
const makeFakeAccountData = (): AddAccountModel => ({
  name: 'valid_name',
  email: 'valid_email',
  password: 'valid_password',
});
const makeAddAccountRepository = (): AddAccountRepository => {
  class AddAccountRepositoryStub implements AddAccountRepository {
    async add(accountData: AddAccountModel): Promise<AccountModel> {
      return new Promise((resolve) => resolve(makeFakeAccount()));
    }
  }
  return new AddAccountRepositoryStub();
};
const makeLoadAccountByEmailRepository = (): LoadAccountByEmailRepository => {
  class LoadAccountByEmailRepositoryStub
    implements LoadAccountByEmailRepository {
    async loadByEmail(email: string): Promise<AccountModel> {
      const account = {
        _id: 'any_id',
        name: 'any_name',
        email: 'any_email@email.com',
        password: 'any_password',
      };
      return new Promise((resolve) => resolve(account));
    }
  }
  return new LoadAccountByEmailRepositoryStub();
};
interface SutTypes {
  sut: DbAddAccount;
  encrypterStub: Encrypter;
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository;
  addAccountRepositoryStub: AddAccountRepository;
}

const makeSut = (): SutTypes => {
  const encrypterStub = makeEncrypter();
  const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository();
  const addAccountRepositoryStub = makeAddAccountRepository();
  const sut = new DbAddAccount(encrypterStub, addAccountRepositoryStub,loadAccountByEmailRepositoryStub);
  return {
    sut,
    encrypterStub,
    addAccountRepositoryStub,loadAccountByEmailRepositoryStub
  };
};

describe('DbAddAccount Usecase', () => {
  test('Should call Encrypter with correct password', async () => {
    const { sut, encrypterStub } = makeSut();
    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt');
    await sut.add(makeFakeAccountData());
    expect(encryptSpy).toHaveBeenCalledWith('valid_password');
  });

  test('Should throw if Encrypter throws', async () => {
    const { sut, encrypterStub } = makeSut();
    jest
      .spyOn(encrypterStub, 'encrypt')
      .mockReturnValueOnce(
        new Promise((resolve, reject) => reject(new Error())),
      );
    const promise = sut.add(makeFakeAccountData());
    await expect(promise).rejects.toThrow();
  });

  test('Should call AddAccountRepository with correct values', async () => {
    const { sut, addAccountRepositoryStub } = makeSut();
    const addSpy = jest.spyOn(addAccountRepositoryStub, 'add');
    await sut.add(makeFakeAccountData());
    expect(addSpy).toHaveBeenCalledWith({
      name: 'valid_name',
      email: 'valid_email',
      password: 'hashed_password',
    });
  });

  test('Should throw if Encrypter throws', async () => {
    const { sut, addAccountRepositoryStub } = makeSut();
    jest
      .spyOn(addAccountRepositoryStub, 'add')
      .mockReturnValueOnce(
        new Promise((resolve, reject) => reject(new Error())),
      );
    const promise = sut.add(makeFakeAccountData());
    await expect(promise).rejects.toThrow();
  });

  test('Should return an account on success', async () => {
    const { sut } = makeSut();
    const account = await sut.add(makeFakeAccountData());
    expect(account).toEqual(makeFakeAccount());
  });
});
