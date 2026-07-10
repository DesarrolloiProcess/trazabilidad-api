import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { enviroment } from '#src/shared/helpers/enviroment/infrastructure/dependencies.js';
import router from '#src/interface/api/router/index.js';
import { logsError } from '#src/interface/api/middleware/logsError.middleware.js';
import { customErrorHandle } from '#src/interface/api/middleware/customErrorHandle.middleware.js';

interface CreateAppOptions {
  port: number;
}

export function createApp({ port }: CreateAppOptions): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: enviroment.CORS.ORIGIN }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use(router);

  app.use(logsError);
  app.use(customErrorHandle);

  app.listen(port, () => {
    console.log(`[trazabilidad-api] escuchando en el puerto ${port}`);
  });

  return app;
}
