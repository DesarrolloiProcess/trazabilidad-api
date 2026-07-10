import { Enviroment } from '#src/shared/helpers/enviroment/infrastructure/enviroment.js';
import type { IEnviroment } from '#src/shared/helpers/enviroment/domain/enviroment.js';

export const enviroment: IEnviroment = Enviroment.fromProcessEnv();
