import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
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

export const validators = pgTable("validators", {
  id: serial("id").primaryKey(),
  validatorId: text("validator_id").notNull().unique(),
  nodeId: text("node_id").notNull(),
  stakeAmount: integer("stake_amount").notNull(),
  commitmentDuration: integer("commitment_duration").notNull(), // in minutes
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time").notNull(),
  uptime: integer("uptime").notNull().default(100), // percentage
  reputation: integer("reputation").notNull().default(100), // 0-100 scale
  potcScore: integer("potc_score").notNull().default(0),
  status: text("status").notNull().default("active"), // active, slashed, expired
  blocksProposed: integer("blocks_proposed").notNull().default(0),
  blocksValidated: integer("blocks_validated").notNull().default(0),
  slashingEvents: integer("slashing_events").notNull().default(0),
  lastActivity: timestamp("last_activity").defaultNow(),
});

export const consensusRounds = pgTable("consensus_rounds", {
  id: serial("id").primaryKey(),
  roundNumber: integer("round_number").notNull().unique(),
  proposerValidatorId: text("proposer_validator_id").notNull(),
  blockHash: text("block_hash").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  validatorParticipants: jsonb("validator_participants"), // array of validator IDs
  consensusReached: boolean("consensus_reached").notNull().default(false),
  votesFor: integer("votes_for").notNull().default(0),
  votesAgainst: integer("votes_against").notNull().default(0),
  roundDuration: integer("round_duration"), // in milliseconds
  potcThreshold: integer("potc_threshold").notNull(), // minimum PoTC score required
});

export const validatorVotes = pgTable("validator_votes", {
  id: serial("id").primaryKey(),
  roundId: integer("round_id").notNull(),
  validatorId: text("validator_id").notNull(),
  vote: text("vote").notNull(), // "for", "against", "abstain"
  votePower: integer("vote_power").notNull(), // based on PoTC score
  timestamp: timestamp("timestamp").defaultNow(),
  signature: text("signature"), // cryptographic signature
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

export const insertValidatorSchema = createInsertSchema(validators).omit({
  id: true,
  startTime: true,
  lastActivity: true,
});

export const insertConsensusRoundSchema = createInsertSchema(consensusRounds).omit({
  id: true,
  timestamp: true,
});

export const insertValidatorVoteSchema = createInsertSchema(validatorVotes).omit({
  id: true,
  timestamp: true,
});

// Relations
export const nodesRelations = relations(nodes, ({ many }) => ({
  temporalCommitments: many(temporalCommitments),
}));

export const trainingJobsRelations = relations(trainingJobs, ({ many }) => ({
  temporalCommitments: many(temporalCommitments),
}));

export const temporalCommitmentsRelations = relations(temporalCommitments, ({ one }) => ({
  node: one(nodes, {
    fields: [temporalCommitments.nodeId],
    references: [nodes.nodeId],
  }),
  trainingJob: one(trainingJobs, {
    fields: [temporalCommitments.jobId],
    references: [trainingJobs.jobId],
  }),
}));

export const validatorsRelations = relations(validators, ({ one, many }) => ({
  node: one(nodes, {
    fields: [validators.nodeId],
    references: [nodes.nodeId],
  }),
  proposedRounds: many(consensusRounds),
  votes: many(validatorVotes),
}));

export const consensusRoundsRelations = relations(consensusRounds, ({ one, many }) => ({
  proposer: one(validators, {
    fields: [consensusRounds.proposerValidatorId],
    references: [validators.validatorId],
  }),
  votes: many(validatorVotes),
}));

export const validatorVotesRelations = relations(validatorVotes, ({ one }) => ({
  round: one(consensusRounds, {
    fields: [validatorVotes.roundId],
    references: [consensusRounds.id],
  }),
  validator: one(validators, {
    fields: [validatorVotes.validatorId],
    references: [validators.validatorId],
  }),
}));

// Types
export type Node = typeof nodes.$inferSelect;
export type InsertNode = z.infer<typeof insertNodeSchema>;
export type TrainingJob = typeof trainingJobs.$inferSelect;
export type InsertTrainingJob = z.infer<typeof insertTrainingJobSchema>;
export type TemporalCommitment = typeof temporalCommitments.$inferSelect;
export type InsertTemporalCommitment = z.infer<typeof insertTemporalCommitmentSchema>;
export type NetworkMetrics = typeof networkMetrics.$inferSelect;
export type InsertNetworkMetrics = z.infer<typeof insertNetworkMetricsSchema>;
export type Validator = typeof validators.$inferSelect;
export type InsertValidator = z.infer<typeof insertValidatorSchema>;
export type ConsensusRound = typeof consensusRounds.$inferSelect;
export type InsertConsensusRound = z.infer<typeof insertConsensusRoundSchema>;
export type ValidatorVote = typeof validatorVotes.$inferSelect;
export type InsertValidatorVote = z.infer<typeof insertValidatorVoteSchema>;
