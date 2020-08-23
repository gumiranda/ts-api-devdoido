import { Express, Router } from 'express';
import fg from 'fast-glob';
export default async (app: Express): Promise<void> => {
  const router = Router();
  app.use('/api', router);
  fg.sync('**/modules/**/routes/**router.ts').map(async (file) =>
    (await import(`../../${file}`)).default(router),
  );
};
