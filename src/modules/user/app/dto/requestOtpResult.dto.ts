export interface RequestOtpResultDto {
  /** Se devuelve directo en la respuesta porque no hay proveedor real de SMS/correo conectado todavía. */
  otpCode: string;
  expiresAt: Date;
}
