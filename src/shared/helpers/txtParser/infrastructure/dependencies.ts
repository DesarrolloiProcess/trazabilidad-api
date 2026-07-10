import { TxtParserImpl } from '#src/shared/helpers/txtParser/infrastructure/txtParser.impl.js';
import { TxtParserService } from '#src/shared/helpers/txtParser/app/txtParser.service.js';

const txtParserImpl = new TxtParserImpl();

export const txtParserHandle = new TxtParserService(txtParserImpl);
