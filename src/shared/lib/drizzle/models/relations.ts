import { relations } from 'drizzle-orm';
import { users } from './user.schema.js';
import { distributionCenters } from './distributionCenter.schema.js';
import { routes } from './route.schema.js';
import { deliveries } from './delivery.schema.js';
import { deliveryProducts } from './deliveryProduct.schema.js';
import { clients } from './client.schema.js';
import { patients } from './patient.schema.js';

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

export const patientsRelations = relations(patients, ({ many }) => ({
  deliveries: many(deliveries),
}));

export const deliveriesRelations = relations(deliveries, ({ one, many }) => ({
  route: one(routes, {
    fields: [deliveries.route_id],
    references: [routes.id],
  }),
  client: one(clients, {
    fields: [deliveries.client_id],
    references: [clients.id],
  }),
  patient: one(patients, {
    fields: [deliveries.patient_id],
    references: [patients.id],
  }),
  products: many(deliveryProducts),
}));

export const deliveryProductsRelations = relations(deliveryProducts, ({ one }) => ({
  delivery: one(deliveries, {
    fields: [deliveryProducts.delivery_id],
    references: [deliveries.id],
  }),
}));
