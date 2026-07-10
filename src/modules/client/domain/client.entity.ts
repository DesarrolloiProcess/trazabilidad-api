export interface IClient {
  id: string;
  nit: string;
  name: string;
  phone: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}

export class Client {
  public readonly id: string;
  public readonly nit: string;
  public readonly name: string;
  public readonly phone: string | null;
  public readonly active: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly createdBy: string | null;
  public readonly updatedBy: string | null;

  constructor(props: IClient) {
    this.id = props.id;
    this.nit = props.nit;
    this.name = props.name;
    this.phone = props.phone;
    this.active = props.active;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.createdBy = props.createdBy;
    this.updatedBy = props.updatedBy;
  }
}
