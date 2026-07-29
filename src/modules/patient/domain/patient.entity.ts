export interface IPatient {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  documentNumber: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}

export class Patient {
  public readonly id: string;
  public readonly name: string;
  public readonly phone: string | null;
  public readonly email: string | null;
  public readonly documentNumber: string | null;
  public readonly active: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly createdBy: string | null;
  public readonly updatedBy: string | null;

  constructor(props: IPatient) {
    this.id = props.id;
    this.name = props.name;
    this.phone = props.phone;
    this.email = props.email;
    this.documentNumber = props.documentNumber;
    this.active = props.active;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.createdBy = props.createdBy;
    this.updatedBy = props.updatedBy;
  }

  update(data: { name?: string; phone?: string | null; email?: string | null; documentNumber?: string | null }, updatedBy: string): Patient {
    return new Patient({
      ...this,
      name: data.name ?? this.name,
      phone: data.phone !== undefined ? data.phone : this.phone,
      email: data.email !== undefined ? data.email : this.email,
      documentNumber: data.documentNumber !== undefined ? data.documentNumber : this.documentNumber,
      updatedAt: new Date(),
      updatedBy,
    });
  }

  activate(updatedBy: string): Patient {
    return new Patient({ ...this, active: true, updatedAt: new Date(), updatedBy });
  }

  deactivate(updatedBy: string): Patient {
    return new Patient({ ...this, active: false, updatedAt: new Date(), updatedBy });
  }
}
