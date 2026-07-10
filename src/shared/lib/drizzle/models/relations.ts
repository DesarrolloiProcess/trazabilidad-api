import { relations } from 'drizzle-orm';
import { users } from '#src/shared/lib/drizzle/models/user.schema.js';
import { distributionCenters } from '#src/shared/lib/drizzle/models/distributionCenter.schema.js';
import { routes } from '#src/shared/lib/drizzle/models/route.schema.js';
import { deliveries } from '#src/shared/lib/drizzle/models/delivery.schema.js';
import { clients } from '#src/shared/lib/drizzle/models/client.schema.js';

export const usersRelations = relations(users, ({ one }) => ({
  distributionCenter: one(distributionCenters, {
    fields: [users.distribution_center_id],
    references: [distributionCenters.id],
  }),
}));

export const distributionCentersRelations = relations(distributionCenters, ({ many }) => ({
  routes: many(routes),
}));

export const routesRelations = relations(routes, ({ one, many }) => ({
  distributionCenter: one(distributionCenters, {
    fields: [routes.distribution_center_id],
    references: [distributionCenters.id],
  }),
  driver: one(users, {
    fields: [routes.driver_id],
    references: [users.id],
  }),
  deliveries: many(deliveries),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  deliveries: many(deliveries),
}));

export const deliveriesRelations = relations(deliveries, ({ one }) => ({
  route: one(routes, {
    fields: [deliveries.route_id],
    references: [routes.id],
  }),
  client: one(clients, {
    fields: [deliveries.client_id],
    references: [clients.id],
  }),
}));
