export interface IWhatsappNotifierRepository {
  sendMessage(phone: string, message: string): Promise<void>;
}
