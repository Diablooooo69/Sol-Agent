import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertAIAgentSchema, 
  insertTradingBotSchema, 
  insertUserSchema, 
  insertTradingSessionSchema,
  insertTradeSchema,
  insertWithdrawalSchema,
  TradingSession
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Users & Wallet Routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/api/users/:walletAddress", async (req, res) => {
    try {
      const user = await storage.getUserByWalletAddress(req.params.walletAddress);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Trading Sessions Routes
  app.post("/api/trading-sessions", async (req, res) => {
    try {
      const sessionData = insertTradingSessionSchema.parse(req.body);
      
      // Check if there's already an active session
      const existingSession = await storage.getActiveTradingSessionByUserId(sessionData.userId);
      if (existingSession) {
        return res.status(400).json({ 
          message: "User already has an active trading session",
          sessionId: existingSession.id
        });
      }
      
      const session = await storage.createTradingSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  app.get("/api/trading-sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getTradingSession(id);
      
      if (!session) {
        return res.status(404).json({ message: "Trading session not found" });
      }
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.get("/api/trading-sessions/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const sessions = await storage.getAllTradingSessionsByUserId(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.get("/api/trading-sessions/user/:userId/active", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const session = await storage.getActiveTradingSessionByUserId(userId);
      
      if (!session) {
        return res.status(404).json({ message: "No active trading session found" });
      }
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.patch("/api/trading-sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = z.object({
        currentValue: z.union([z.string(), z.number()]).optional(),
        profitLoss: z.union([z.string(), z.number()]).optional(),
        tradeCount: z.number().optional(),
        winCount: z.number().optional(),
        lossCount: z.number().optional(),
        isActive: z.boolean().optional(),
      });
      
      const rawUpdateData = updateSchema.parse(req.body);
      
      // Create a properly typed object for database update using type assertion
      const updateData = {
        isActive: rawUpdateData.isActive,
        tradeCount: rawUpdateData.tradeCount,
        winCount: rawUpdateData.winCount,
        lossCount: rawUpdateData.lossCount
      } as Partial<TradingSession>;
      
      // Convert numeric values to strings for database storage
      if (rawUpdateData.currentValue !== undefined) {
        const currentValueStr = typeof rawUpdateData.currentValue === 'number' 
          ? rawUpdateData.currentValue.toString() 
          : rawUpdateData.currentValue;
        updateData.currentValue = currentValueStr;
      }
      
      if (rawUpdateData.profitLoss !== undefined) {
        const profitLossStr = typeof rawUpdateData.profitLoss === 'number'
          ? rawUpdateData.profitLoss.toString()
          : rawUpdateData.profitLoss;
        updateData.profitLoss = profitLossStr;
      }
      
      const updatedSession = await storage.updateTradingSession(id, updateData);
      
      if (!updatedSession) {
        return res.status(404).json({ message: "Trading session not found" });
      }
      
      res.json(updatedSession);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/trading-sessions/:id/end", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const endDataSchema = z.object({
        currentValue: z.union([z.string(), z.number()]),
        profitLoss: z.union([z.string(), z.number()]),
      });
      
      const rawEndData = endDataSchema.parse(req.body);
      
      // Create properly typed object for database operation
      const endData = {
        currentValue: typeof rawEndData.currentValue === 'number' 
          ? rawEndData.currentValue.toString() 
          : rawEndData.currentValue,
        profitLoss: typeof rawEndData.profitLoss === 'number'
          ? rawEndData.profitLoss.toString()
          : rawEndData.profitLoss
      };
      
      const endedSession = await storage.endTradingSession(id, endData);
      
      if (!endedSession) {
        return res.status(404).json({ message: "Trading session not found" });
      }
      
      res.json(endedSession);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  // Trades Routes
  app.post("/api/trades", async (req, res) => {
    try {
      const tradeData = insertTradeSchema.parse(req.body);
      const trade = await storage.createTrade(tradeData);
      res.status(201).json(trade);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  app.get("/api/trades/session/:sessionId", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const trades = await storage.getTradesBySessionId(sessionId);
      res.json(trades);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Withdrawals Routes
  app.post("/api/withdrawals", async (req, res) => {
    try {
      const withdrawalSchema = insertWithdrawalSchema.extend({
        sessionId: z.number(),
        userId: z.number(),
        amount: z.union([z.string(), z.number()]),
        fee: z.union([z.string(), z.number()]),
        status: z.enum(["pending", "completed", "failed"]),
        walletAddress: z.string(),
      });
      
      const rawWithdrawalData = withdrawalSchema.parse(req.body);
      
      // Create a properly typed object for insertion
      const withdrawalData = {
        userId: rawWithdrawalData.userId,
        sessionId: rawWithdrawalData.sessionId,
        walletAddress: rawWithdrawalData.walletAddress,
        status: rawWithdrawalData.status,
        amount: typeof rawWithdrawalData.amount === 'number' 
          ? rawWithdrawalData.amount.toString() 
          : rawWithdrawalData.amount,
        fee: typeof rawWithdrawalData.fee === 'number' 
          ? rawWithdrawalData.fee.toString() 
          : rawWithdrawalData.fee,
        feeConfirmTxHash: rawWithdrawalData.feeConfirmTxHash,
        txHash: rawWithdrawalData.txHash
      };
      
      const withdrawal = await storage.createWithdrawal(withdrawalData);
      res.status(201).json(withdrawal);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  app.get("/api/withdrawals/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const withdrawals = await storage.getWithdrawalsByUserId(userId);
      res.json(withdrawals);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.patch("/api/withdrawals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = z.object({
        status: z.enum(["pending", "completed", "failed"]).optional(),
        txHash: z.string().optional(),
        feeConfirmTxHash: z.string().optional(),
        processedAt: z.date().optional(),
      });
      
      const updateData = updateSchema.parse(req.body);
      const updatedWithdrawal = await storage.updateWithdrawal(id, updateData);
      
      if (!updatedWithdrawal) {
        return res.status(404).json({ message: "Withdrawal not found" });
      }
      
      res.json(updatedWithdrawal);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Trading Bots Routes
  app.post("/api/trading-bots", async (req, res) => {
    try {
      const botData = insertTradingBotSchema.parse(req.body);
      const bot = await storage.createTradingBot(botData);
      res.json(bot);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/api/trading-bots/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const bots = await storage.getTradingBotsByUserId(userId);
      res.json(bots);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // AI Agents Routes
  app.post("/api/ai-agents", async (req, res) => {
    try {
      const agentData = insertAIAgentSchema.parse(req.body);
      const agent = await storage.createAIAgent(agentData);
      res.json(agent);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/api/ai-agents/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const agents = await storage.getAIAgentsByUserId(userId);
      res.json(agents);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Trading Simulator Data (for frontend use)
  app.get("/api/trading-simulator/stats/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Get active trading session
      const activeSession = await storage.getActiveTradingSessionByUserId(userId);
      
      // Get all completed sessions
      const allSessions = await storage.getAllTradingSessionsByUserId(userId);
      const completedSessions = allSessions.filter(session => !session.isActive);
      
      // Calculate overall stats
      const totalProfit = completedSessions.reduce((sum, session) => 
        sum + Number(session.profitLoss || 0), 
        activeSession ? Number(activeSession.profitLoss || 0) : 0
      );
      
      const totalTrades = completedSessions.reduce((sum, session) => {
        const sessionTradeCount = session.tradeCount !== null ? session.tradeCount : 0;
        return sum + sessionTradeCount;
      }, activeSession && activeSession.tradeCount !== null ? activeSession.tradeCount : 0);
      
      const totalWins = completedSessions.reduce((sum, session) => {
        const sessionWinCount = session.winCount !== null ? session.winCount : 0;
        return sum + sessionWinCount;
      }, activeSession && activeSession.winCount !== null ? activeSession.winCount : 0);
      
      const totalLosses = completedSessions.reduce((sum, session) => {
        const sessionLossCount = session.lossCount !== null ? session.lossCount : 0;
        return sum + sessionLossCount;
      }, activeSession && activeSession.lossCount !== null ? activeSession.lossCount : 0);
      
      const winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;
      
      res.json({
        activeSession,
        completedSessions,
        totalStats: {
          totalProfit,
          totalTrades,
          totalWins,
          totalLosses,
          winRate,
        }
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
