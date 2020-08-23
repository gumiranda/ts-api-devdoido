import { Router } from 'express';
import { makeSignUpController } from '../../../bin/patterns/factories/signup';
import { adaptRoute } from '../../../bin/configuration/adapters/express-route-adapter';

export default (router: Router): void => {
  router.post('/signup', adaptRoute(makeSignUpController()));
};
