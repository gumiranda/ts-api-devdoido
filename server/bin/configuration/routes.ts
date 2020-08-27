import { Express } from 'express';
import accountRouter from '../../modules/account/routes/login-router';
export default async (app: Express): Promise<void> => {
  app.use('/api/account', accountRouter);
};
