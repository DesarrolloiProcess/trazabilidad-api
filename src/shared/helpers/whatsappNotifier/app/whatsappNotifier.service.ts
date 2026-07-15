import type { IWhatsappNotifierRepository } from '#src/shared/helpers/whatsappNotifier/domain/whatsappNotifier.js';

export class WhatsappNotifierService {
  constructor(private readonly repository: IWhatsappNotifierRepository) {}

  async notifyOnTheWay(phone: string, trackingNumber: string): Promise<void> {
    const message = `Tu pedido ${trackingNumber} va en camino. Pronto será entregado.`;
    await this.send(phone, message);
  }

  async notifyDeliveryConfirmed(phone: string, trackingNumber: string): Promise<void> {
    const message = `Tu pedido ${trackingNumber} fue entregado exitosamente. ¡Gracias por tu compra!`;
    await this.send(phone, message);
  }

  /**
   * Best-effort: una notificación de WhatsApp fallida (proveedor caído, sin API key, etc.)
   * nunca debe tumbar la operación de negocio que la disparó (avanzar estado, confirmar entrega).
   */
  private async send(phone: string, message: string): Promise<void> {
    try {
      await this.repository.sendMessage(phone, message);
    } catch (error) {
      console.error(`[WhatsappNotifier] No se pudo enviar la notificación a ${phone}:`, error);
    }
  }
}
