export const REGEX = {
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  PHONE_CO: /^(\+?57)?3\d{9}$/,
  CEDULA: /^\d{6,10}$/,
  TRACKING_NUMBER: /^[A-Z0-9-]{4,20}$/i,
} as const;
