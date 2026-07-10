import type { Database } from '#src/shared/lib/drizzle/connection.js';

export type ITransaction = Parameters<Parameters<Database['transaction']>[0]>[0];
