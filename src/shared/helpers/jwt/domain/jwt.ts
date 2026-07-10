export type IJwtPayload = object;

export interface IJwtRepository {
  sign(payload: IJwtPayload): string;
  verify<T extends IJwtPayload = IJwtPayload>(token: string): T;
}
