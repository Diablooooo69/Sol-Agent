import { pgTable, text, serial, integer, boolean, timestamp, jsonb, numeric, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().unique(),
  username: text("username"),
  avatarUrl: text("avatar_url"),
  lastLogin: timestamp("last_login"),
});

export const userRelations = relations(users, ({ many }) => ({
  tradingSessions: many(tradingSessions),
  tradingBots: many(tradingBots),
  aiAgents: many(aiAgents),
}));

export const tradingBots = pgTable("trading_bots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  riskLevel: text("risk_level").notNull(), // "low", "medium", "high"
  startingCapital: numeric("starting_capital").notNull(),
  autoRebalance: boolean("auto_rebalance").default(false),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tradingBotRelations = relations(tradingBots, ({ one, many }) => ({
  user: one(users, {
    fields: [tradingBots.userId],
    references: [users.id],
  }),
  sessions: many(tradingSessions),
}));

export const tradingSessions = pgTable("trading_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  botId: integer("bot_id"),
  startingCapital: numeric("starting_capital").notNull(),
  currentValue: numeric("current_value").notNull(),
  profitLoss: numeric("profit_loss").notNull(),
  tradeCount: integer("trade_count").default(0),
  winCount: integer("win_count").default(0),
  lossCount: integer("loss_count").default(0),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  isActive: boolean("is_active").default(true),
  riskLevel: text("risk_level").default("medium"),
});

export const tradingSessionRelations = relations(tradingSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [tradingSessions.userId],
    references: [users.id],
  }),
  bot: one(tradingBots, {
    fields: [tradingSessions.botId],
    references: [tradingBots.id],
  }),
  trades: many(trades),
}));

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'buy' or 'sell'
  tokenSymbol: text("token_symbol").notNull(),
  tokenName: text("token_name").notNull(),
  contractAddress: text("contract_address"),
  price: numeric("price").notNull(),
  amount: numeric("amount").notNull(),
  value: numeric("value").notNull(),
  profitLoss: numeric("profit_loss"),
  profitLossPercentage: numeric("profit_loss_percentage"),
  isWin: boolean("is_win"),
  txHash: text("tx_hash"),
  executedAt: timestamp("executed_at").defaultNow(),
});

export const tradeRelations = relations(trades, ({ one }) => ({
  session: one(tradingSessions, {
    fields: [trades.sessionId],
    references: [tradingSessions.id],
  }),
  user: one(users, {
    fields: [trades.userId],
    references: [users.id],
  }),
}));

export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sessionId: integer("session_id").notNull(),
  amount: numeric("amount").notNull(),
  fee: numeric("fee").notNull(),
  status: text("status").notNull(), // 'pending', 'completed', 'failed'
  walletAddress: text("wallet_address").notNull(),
  txHash: text("tx_hash"),
  feeConfirmTxHash: text("fee_confirm_tx_hash"),
  requestedAt: timestamp("requested_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const withdrawalRelations = relations(withdrawals, ({ one }) => ({
  user: one(users, {
    fields: [withdrawals.userId],
    references: [users.id],
  }),
  session: one(tradingSessions, {
    fields: [withdrawals.sessionId],
    references: [tradingSessions.id],
  }),
}));

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

export const aiAgentRelations = relations(aiAgents, ({ one }) => ({
  user: one(users, {
    fields: [aiAgents.userId],
    references: [users.id],
  }),
}));

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

export const insertTradingSessionSchema = createInsertSchema(tradingSessions).pick({
  userId: true,
  botId: true,
  startingCapital: true,
  currentValue: true,
  profitLoss: true,
  riskLevel: true,
  isActive: true,
});

export const insertTradeSchema = createInsertSchema(trades).pick({
  sessionId: true,
  userId: true,
  type: true,
  tokenSymbol: true,
  tokenName: true,
  contractAddress: true,
  price: true,
  amount: true,
  value: true,
  profitLoss: true,
  profitLossPercentage: true,
  isWin: true,
  txHash: true,
});

export const insertWithdrawalSchema = createInsertSchema(withdrawals).pick({
  userId: true,
  sessionId: true,
  amount: true,
  fee: true,
  status: true,
  walletAddress: true,
  txHash: true,
  feeConfirmTxHash: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTradingBot = z.infer<typeof insertTradingBotSchema>;
export type TradingBot = typeof tradingBots.$inferSelect;

export type InsertAIAgent = z.infer<typeof insertAIAgentSchema>;
export type AIAgent = typeof aiAgents.$inferSelect;

export type InsertTradingSession = z.infer<typeof insertTradingSessionSchema>;
export type TradingSession = typeof tradingSessions.$inferSelect;

export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof trades.$inferSelect;

export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type Withdrawal = typeof withdrawals.$inferSelect;
