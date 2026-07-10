import { WhatsappNotifierImpl } from '#src/shared/helpers/whatsappNotifier/infrastructure/whatsappNotifier.impl.js';
import { WhatsappNotifierService } from '#src/shared/helpers/whatsappNotifier/app/whatsappNotifier.service.js';

const whatsappNotifierImpl = new WhatsappNotifierImpl();

export const whatsappNotifierHandle = new WhatsappNotifierService(whatsappNotifierImpl);
