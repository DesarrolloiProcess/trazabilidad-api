import 'reflect-metadata';
import { createApp } from '#src/interface/api/app.js';
import { enviroment } from '#src/shared/helpers/enviroment/infrastructure/dependencies.js';

createApp({ port: enviroment.APP.PORT_API_WEB });
