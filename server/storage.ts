import { users, tradingSessions, trades, withdrawals, tradingBots, aiAgents,
  type User, type InsertUser, type TradingSession, type InsertTradingSession,
  type Trade, type InsertTrade, type Withdrawal, type InsertWithdrawal,
  type TradingBot, type InsertTradingBot, type AIAgent, type InsertAIAgent
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, isNull } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Postgres session store
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Trading session methods
  createTradingSession(session: InsertTradingSession): Promise<TradingSession>;
  getTradingSession(id: number): Promise<TradingSession | undefined>;
  getActiveTradingSessionByUserId(userId: number): Promise<TradingSession | undefined>;
  updateTradingSession(id: number, data: Partial<TradingSession>): Promise<TradingSession | undefined>;
  endTradingSession(id: number, data: { currentValue: string | number, profitLoss: string | number }): Promise<TradingSession | undefined>;
  getAllTradingSessionsByUserId(userId: number): Promise<TradingSession[]>;
  
  // Trade methods
  createTrade(trade: InsertTrade): Promise<Trade>;
  getTradesBySessionId(sessionId: number): Promise<Trade[]>;
  
  // Withdrawal methods
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  getWithdrawalsByUserId(userId: number): Promise<Withdrawal[]>;
  updateWithdrawal(id: number, data: Partial<Withdrawal>): Promise<Withdrawal | undefined>;
  
  // Trading bot methods
  createTradingBot(bot: InsertTradingBot): Promise<TradingBot>;
  getTradingBotsByUserId(userId: number): Promise<TradingBot[]>;
  
  // AI Agent methods
  createAIAgent(agent: InsertAIAgent): Promise<AIAgent>;
  getAIAgentsByUserId(userId: number): Promise<AIAgent[]>;
  
  // Session store for authentication
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Trading session methods
  async createTradingSession(session: InsertTradingSession): Promise<TradingSession> {
    const [newSession] = await db.insert(tradingSessions).values(session).returning();
    return newSession;
  }
  
  async getTradingSession(id: number): Promise<TradingSession | undefined> {
    const [session] = await db.select().from(tradingSessions).where(eq(tradingSessions.id, id));
    return session;
  }
  
  async getActiveTradingSessionByUserId(userId: number): Promise<TradingSession | undefined> {
    const [session] = await db
      .select()
      .from(tradingSessions)
      .where(and(
        eq(tradingSessions.userId, userId),
        eq(tradingSessions.isActive, true)
      ));
    return session;
  }
  
  async updateTradingSession(id: number, data: Partial<TradingSession>): Promise<TradingSession | undefined> {
    const [updatedSession] = await db
      .update(tradingSessions)
      .set(data)
      .where(eq(tradingSessions.id, id))
      .returning();
    return updatedSession;
  }
  
  async endTradingSession(id: number, data: { currentValue: string | number, profitLoss: string | number }): Promise<TradingSession | undefined> {
    const [endedSession] = await db
      .update(tradingSessions)
      .set({
        currentValue: data.currentValue.toString(),
        profitLoss: data.profitLoss.toString(),
        isActive: false,
        endedAt: new Date(),
      })
      .where(eq(tradingSessions.id, id))
      .returning();
    return endedSession;
  }
  
  async getAllTradingSessionsByUserId(userId: number): Promise<TradingSession[]> {
    return db
      .select()
      .from(tradingSessions)
      .where(eq(tradingSessions.userId, userId))
      .orderBy(desc(tradingSessions.startedAt));
  }
  
  // Trade methods
  async createTrade(trade: InsertTrade): Promise<Trade> {
    const [newTrade] = await db.insert(trades).values(trade).returning();
    return newTrade;
  }
  
  async getTradesBySessionId(sessionId: number): Promise<Trade[]> {
    return db
      .select()
      .from(trades)
      .where(eq(trades.sessionId, sessionId))
      .orderBy(desc(trades.executedAt));
  }
  
  // Withdrawal methods
  async createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const [newWithdrawal] = await db.insert(withdrawals).values(withdrawal).returning();
    return newWithdrawal;
  }
  
  async getWithdrawalsByUserId(userId: number): Promise<Withdrawal[]> {
    return db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.userId, userId))
      .orderBy(desc(withdrawals.requestedAt));
  }
  
  async updateWithdrawal(id: number, data: Partial<Withdrawal>): Promise<Withdrawal | undefined> {
    const [updatedWithdrawal] = await db
      .update(withdrawals)
      .set(data)
      .where(eq(withdrawals.id, id))
      .returning();
    return updatedWithdrawal;
  }
  
  // Trading bot methods
  async createTradingBot(bot: InsertTradingBot): Promise<TradingBot> {
    const [newBot] = await db.insert(tradingBots).values(bot).returning();
    return newBot;
  }
  
  async getTradingBotsByUserId(userId: number): Promise<TradingBot[]> {
    return db
      .select()
      .from(tradingBots)
      .where(eq(tradingBots.userId, userId))
      .orderBy(desc(tradingBots.createdAt));
  }
  
  // AI Agent methods
  async createAIAgent(agent: InsertAIAgent): Promise<AIAgent> {
    const [newAgent] = await db.insert(aiAgents).values(agent).returning();
    return newAgent;
  }
  
  async getAIAgentsByUserId(userId: number): Promise<AIAgent[]> {
    return db
      .select()
      .from(aiAgents)
      .where(eq(aiAgents.userId, userId))
      .orderBy(desc(aiAgents.createdAt));
  }
}

export const storage = new DatabaseStorage();
