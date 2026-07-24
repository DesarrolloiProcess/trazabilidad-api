import { BusinessLogicError } from '#src/shared/Errors/businessLogicError.js';

export type RouteStatus = 'creada' | 'asignada' | 'entregada_transportador' | 'en_curso' | 'completada' | 'con_novedad';

const ALLOWED_TRANSITIONS: Record<RouteStatus, RouteStatus[]> = {
  creada: ['asignada'],
  asignada: ['entregada_transportador'],
  entregada_transportador: ['en_curso'],
  en_curso: ['completada', 'con_novedad'],
  completada: [],
  con_novedad: [],
};

export interface IRoute {
  id: string;
  code: string;
  distributionCenterId: string;
  driverId: string | null;
  date: Date;
  status: RouteStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}

export class Route {
  public readonly id: string;
  public readonly code: string;
  public readonly distributionCenterId: string;
  public readonly driverId: string | null;
  public readonly date: Date;
  public readonly status: RouteStatus;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly createdBy: string | null;
  public readonly updatedBy: string | null;

  constructor(props: IRoute) {
    this.id = props.id;
    this.code = props.code;
    this.distributionCenterId = props.distributionCenterId;
    this.driverId = props.driverId;
    this.date = props.date;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.createdBy = props.createdBy;
    this.updatedBy = props.updatedBy;
  }

  advanceStatus(newStatus: RouteStatus, updatedBy: string): Route {
    const allowed = ALLOWED_TRANSITIONS[this.status];

    if (!allowed.includes(newStatus)) {
      throw new BusinessLogicError(`No se puede cambiar la ruta de '${this.status}' a '${newStatus}'`);
    }

    return new Route({ ...this, status: newStatus, updatedAt: new Date(), updatedBy });
  }

  assignDriver(driverId: string, updatedBy: string): Route {
    if (this.driverId !== null) {
      throw new BusinessLogicError('La ruta ya tiene un conductor asignado');
    }

    if (!ALLOWED_TRANSITIONS[this.status].includes('asignada')) {
      throw new BusinessLogicError(`No se puede asignar un conductor a una ruta en estado '${this.status}'`);
    }

    return new Route({ ...this, driverId, status: 'asignada', updatedAt: new Date(), updatedBy });
  }
}
