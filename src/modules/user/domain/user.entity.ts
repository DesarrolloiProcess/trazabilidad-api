import type { Role } from '#src/shared/constant/roles.constant.js';

export interface IUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
  distributionCenterId: string | null;
  otpCode: string | null;
  otpExpiresAt: Date | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}

export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly passwordHash: string;
  public readonly name: string;
  public readonly role: Role;
  public readonly distributionCenterId: string | null;
  public readonly otpCode: string | null;
  public readonly otpExpiresAt: Date | null;
  public readonly active: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly createdBy: string | null;
  public readonly updatedBy: string | null;

  constructor(props: IUser) {
    this.id = props.id;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.name = props.name;
    this.role = props.role;
    this.distributionCenterId = props.distributionCenterId;
    this.otpCode = props.otpCode;
    this.otpExpiresAt = props.otpExpiresAt;
    this.active = props.active;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.createdBy = props.createdBy;
    this.updatedBy = props.updatedBy;
  }

  rename(
    data: { name?: string; role?: Role; distributionCenterId?: string | null },
    updatedBy: string,
  ): User {
    return new User({
      ...this,
      name: data.name ?? this.name,
      role: data.role ?? this.role,
      distributionCenterId: data.distributionCenterId !== undefined ? data.distributionCenterId : this.distributionCenterId,
      updatedAt: new Date(),
      updatedBy,
    });
  }

  changePassword(passwordHash: string, updatedBy: string): User {
    return new User({ ...this, passwordHash, updatedAt: new Date(), updatedBy });
  }

  generateOtp(otpCode: string, otpExpiresAt: Date): User {
    return new User({ ...this, otpCode, otpExpiresAt, updatedAt: new Date(), updatedBy: this.id });
  }

  clearOtp(): User {
    return new User({ ...this, otpCode: null, otpExpiresAt: null, updatedAt: new Date(), updatedBy: this.id });
  }

  activate(updatedBy: string): User {
    return new User({ ...this, active: true, updatedAt: new Date(), updatedBy });
  }

  deactivate(updatedBy: string): User {
    return new User({ ...this, active: false, updatedAt: new Date(), updatedBy });
  }

  isOtpValid(otpCode: string): boolean {
    if (!this.otpCode || !this.otpExpiresAt) return false;
    if (this.otpCode !== otpCode) return false;
    return this.otpExpiresAt.getTime() > Date.now();
  }
}
