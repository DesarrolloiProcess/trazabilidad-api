import type { IWhatsappNotifierRepository } from '#src/shared/helpers/whatsappNotifier/domain/whatsappNotifier.js';

export class WhatsappNotifierService {
  constructor(private readonly repository: IWhatsappNotifierRepository) {}

  async notifyOnTheWay(phone: string, trackingNumber: string): Promise<void> {
    const message = `Tu pedido ${trackingNumber} va en camino. Pronto será entregado.`;
    await this.repository.sendMessage(phone, message);
  }

  async notifyDeliveryConfirmed(phone: string, trackingNumber: string): Promise<void> {
    const message = `Tu pedido ${trackingNumber} fue entregado exitosamente. ¡Gracias por tu compra!`;
    await this.repository.sendMessage(phone, message);
  }
}
