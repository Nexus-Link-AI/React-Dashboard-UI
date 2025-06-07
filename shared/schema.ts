import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const nodeTypes = [
  "compute",
  "rpc", 
  "sentry",
  "oracle",
  "data",
  "full",
  "consumer",
  "validator"
] as const;

export type NodeType = typeof nodeTypes[number];

export const nodes = pgTable("nodes", {
  id: serial("id").primaryKey(),
  nodeId: text("node_id").notNull().unique(),
  type: text("type").notNull(),
  status: text("status").notNull().default("active"),
  lastSeen: timestamp("last_seen").defaultNow(),
  metadata: jsonb("metadata"),
});

export const trainingJobs = pgTable("training_jobs", {
  id: serial("id").primaryKey(),
  jobId: text("job_id").notNull().unique(),
  name: text("name").notNull(),
  status: text("status").notNull().default("pending"),
  currentPhase: text("current_phase").notNull().default("initialization"),
  currentStep: integer("current_step").notNull().default(1),
  progress: integer("progress").notNull().default(0),
  startTime: timestamp("start_time").defaultNow(),
  estimatedCompletion: timestamp("estimated_completion"),
  metadata: jsonb("metadata"),
});

export const temporalCommitments = pgTable("temporal_commitments", {
  id: serial("id").primaryKey(),
  nodeId: text("node_id").notNull(),
  jobId: text("job_id"),
  commitmentDuration: integer("commitment_duration").notNull(),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").notNull().default("active"),
  computationalPower: integer("computational_power").notNull(),
});

export const networkMetrics = pgTable("network_metrics", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow(),
  totalNodes: integer("total_nodes").notNull(),
  activeJobs: integer("active_jobs").notNull(),
  totalCommitments: integer("total_commitments").notNull(),
  activeCommitments: integer("active_commitments").notNull(),
  networkPower: integer("network_power").notNull(),
  metrics: jsonb("metrics"),
});

// Insert schemas
export const insertNodeSchema = createInsertSchema(nodes).omit({
  id: true,
  lastSeen: true,
});

export const insertTrainingJobSchema = createInsertSchema(trainingJobs).omit({
  id: true,
  startTime: true,
});

export const insertTemporalCommitmentSchema = createInsertSchema(temporalCommitments).omit({
  id: true,
  startTime: true,
});

export const insertNetworkMetricsSchema = createInsertSchema(networkMetrics).omit({
  id: true,
  timestamp: true,
});

// Types
export type Node = typeof nodes.$inferSelect;
export type InsertNode = z.infer<typeof insertNodeSchema>;
export type TrainingJob = typeof trainingJobs.$inferSelect;
export type InsertTrainingJob = z.infer<typeof insertTrainingJobSchema>;
export type TemporalCommitment = typeof temporalCommitments.$inferSelect;
export type InsertTemporalCommitment = z.infer<typeof insertTemporalCommitmentSchema>;
export type NetworkMetrics = typeof networkMetrics.$inferSelect;
export type InsertNetworkMetrics = z.infer<typeof insertNetworkMetricsSchema>;
