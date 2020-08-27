import { Router } from 'express';
import { makeSignUpController } from '../../../bin/patterns/factories/signup-factory';
import { adaptRoute } from '../../../bin/configuration/adapters/express-route-adapter';
import { makeLoginController } from '../../../bin/patterns/factories/login-factory';
const router = Router();
router.post('/signup', adaptRoute(makeSignUpController()));
router.post('/login', adaptRoute(makeLoginController()));
export default router;
