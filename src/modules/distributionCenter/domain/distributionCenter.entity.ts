export interface IDistributionCenter {
  id: string;
  name: string;
  city: string;
  address: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}

export class DistributionCenter {
  public readonly id: string;
  public readonly name: string;
  public readonly city: string;
  public readonly address: string;
  public readonly active: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly createdBy: string | null;
  public readonly updatedBy: string | null;

  constructor(props: IDistributionCenter) {
    this.id = props.id;
    this.name = props.name;
    this.city = props.city;
    this.address = props.address;
    this.active = props.active;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.createdBy = props.createdBy;
    this.updatedBy = props.updatedBy;
  }

  rename(data: { name?: string; city?: string; address?: string }, updatedBy: string): DistributionCenter {
    return new DistributionCenter({
      ...this,
      name: data.name ?? this.name,
      city: data.city ?? this.city,
      address: data.address ?? this.address,
      updatedAt: new Date(),
      updatedBy,
    });
  }

  activate(updatedBy: string): DistributionCenter {
    return new DistributionCenter({ ...this, active: true, updatedAt: new Date(), updatedBy });
  }

  deactivate(updatedBy: string): DistributionCenter {
    return new DistributionCenter({ ...this, active: false, updatedAt: new Date(), updatedBy });
  }
}
