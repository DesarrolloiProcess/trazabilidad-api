import { eq, count } from 'drizzle-orm';
import { drizzleOrm } from '#src/shared/lib/drizzle/connection.js';
import { users } from '#src/shared/lib/drizzle/models/user.schema.js';
import { User } from '#src/modules/user/domain/user.entity.js';
import type { IUserQuery, IUserRepository } from '#src/modules/user/domain/user.repository.js';
import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';
import type { Role } from '#src/shared/constant/roles.constant.js';

type UserRow = typeof users.$inferSelect;

function toEntity(row: UserRow): User {
  return new User({
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    name: row.name,
    role: row.role as Role,
    distributionCenterId: row.distribution_center_id,
    otpCode: row.otp_code,
    otpExpiresAt: row.otp_expires_at,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  });
}

export class DrizzleUserImpl implements IUserRepository {
  async getMany(query: IUserQuery): Promise<{ data: User[]; total: number }> {
    const offset = (query.page - 1) * query.limit;
    const filters = query.role ? eq(users.role, query.role) : undefined;

    const [rows, [{ total }]] = await Promise.all([
      drizzleOrm().select().from(users).where(filters).limit(query.limit).offset(offset),
      drizzleOrm().select({ total: count() }).from(users).where(filters),
    ]);

    return { data: rows.map(toEntity), total };
  }

  async getById(id: string): Promise<User | null> {
    const [row] = await drizzleOrm().select().from(users).where(eq(users.id, id)).limit(1);
    return row ? toEntity(row) : null;
  }

  async getByEmail(email: string): Promise<User | null> {
    const [row] = await drizzleOrm().select().from(users).where(eq(users.email, email)).limit(1);
    return row ? toEntity(row) : null;
  }

  async create(entity: User, config?: { tx?: ITransaction }): Promise<User> {
    const executor = config?.tx ?? drizzleOrm();

    await executor.insert(users).values({
      id: entity.id,
      email: entity.email,
      password_hash: entity.passwordHash,
      name: entity.name,
      role: entity.role,
      distribution_center_id: entity.distributionCenterId,
      otp_code: entity.otpCode,
      otp_expires_at: entity.otpExpiresAt,
      active: entity.active,
      created_by: entity.createdBy,
      updated_by: entity.updatedBy,
    });

    return entity;
  }

  async update(entity: User, config?: { tx?: ITransaction }): Promise<User> {
    const executor = config?.tx ?? drizzleOrm();

    await executor
      .update(users)
      .set({
        name: entity.name,
        role: entity.role,
        distribution_center_id: entity.distributionCenterId,
        password_hash: entity.passwordHash,
        otp_code: entity.otpCode,
        otp_expires_at: entity.otpExpiresAt,
        active: entity.active,
        updated_by: entity.updatedBy,
      })
      .where(eq(users.id, entity.id));

    return entity;
  }

  async delete(id: string, config?: { tx?: ITransaction }): Promise<void> {
    const executor = config?.tx ?? drizzleOrm();
    await executor.delete(users).where(eq(users.id, id));
  }
}
