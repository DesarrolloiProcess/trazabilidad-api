import type { IWhatsappNotifierRepository } from '#src/shared/helpers/whatsappNotifier/domain/whatsappNotifier.js';
import { enviroment } from '#src/shared/helpers/enviroment/infrastructure/dependencies.js';
import { ExternalServiceError } from '#src/shared/Errors/externalServiceError.js';

export class WhatsappNotifierImpl implements IWhatsappNotifierRepository {
  async sendMessage(phone: string, message: string): Promise<void> {
    const response = await fetch(`${enviroment.WHATSAPP.API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${enviroment.WHATSAPP.API_TOKEN}`,
      },
      body: JSON.stringify({
        from: enviroment.WHATSAPP.SENDER_ID,
        to: phone,
        message,
      }),
    });

    if (!response.ok) {
      throw new ExternalServiceError('WhatsApp', `Fallo al enviar mensaje (status ${response.status})`);
    }
  }
}
