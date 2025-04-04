import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().unique(),
  username: text("username"),
  avatarUrl: text("avatar_url"),
  lastLogin: timestamp("last_login"),
});

export const tradingBots = pgTable("trading_bots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  riskLevel: text("risk_level").notNull(), // "low", "medium", "high"
  startingCapital: integer("starting_capital").notNull(),
  autoRebalance: boolean("auto_rebalance").default(false),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiAgents = pgTable("ai_agents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  workflow: jsonb("workflow").notNull(), // Stores the node-based workflow
  isDeployed: boolean("is_deployed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  walletAddress: true,
  username: true,
  avatarUrl: true,
});

export const insertTradingBotSchema = createInsertSchema(tradingBots).pick({
  userId: true,
  name: true,
  riskLevel: true,
  startingCapital: true,
  autoRebalance: true,
  isActive: true,
});

export const insertAIAgentSchema = createInsertSchema(aiAgents).pick({
  userId: true,
  name: true,
  description: true,
  workflow: true,
  isDeployed: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTradingBot = z.infer<typeof insertTradingBotSchema>;
export type TradingBot = typeof tradingBots.$inferSelect;

export type InsertAIAgent = z.infer<typeof insertAIAgentSchema>;
export type AIAgent = typeof aiAgents.$inferSelect;
