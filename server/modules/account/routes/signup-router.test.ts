import request from 'supertest';
import { MongoHelper } from '../../../bin/helpers/db/mongo/mongo-helper';
import { app } from '../../../bin/configuration/app';

describe('SignUp Routes', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL);
  });

  afterAll(async () => {
    await MongoHelper.disconnect();
  });

  beforeEach(async () => {
    const accountCollection = await MongoHelper.getCollection('accounts');
    await accountCollection.deleteMany({});
  });

  test('Should return an account on success', async () => {
    await request(app)
      .post('/api/signup')
      .send({
        name: 'tedsste',
        email: 'testetessaste@gmail.com',
        password: '111123',
        passwordConfirmation: '111123',
      })
      .expect(200);
  });
});
