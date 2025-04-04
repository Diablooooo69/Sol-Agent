import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAIAgentSchema, insertTradingBotSchema, insertUserSchema } from "@shared/schema";
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

  app.patch("/api/trading-bots/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = z.object({
        riskLevel: z.string().optional(),
        startingCapital: z.number().optional(),
        autoRebalance: z.boolean().optional(),
        isActive: z.boolean().optional(),
      });
      
      const updateData = updateSchema.parse(req.body);
      const updatedBot = await storage.updateTradingBot(id, updateData);
      
      if (!updatedBot) {
        return res.status(404).json({ message: "Trading bot not found" });
      }
      
      res.json(updatedBot);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
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

  app.patch("/api/ai-agents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        workflow: z.any().optional(),
        isDeployed: z.boolean().optional(),
      });
      
      const updateData = updateSchema.parse(req.body);
      const updatedAgent = await storage.updateAIAgent(id, updateData);
      
      if (!updatedAgent) {
        return res.status(404).json({ message: "AI agent not found" });
      }
      
      res.json(updatedAgent);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Trading Simulator Data (for frontend use)
  app.get("/api/trading-simulator/:botId", (req, res) => {
    // This endpoint would normally fetch real trading data,
    // but for this app we'll simulate it on the frontend
    res.json({
      message: "Use frontend simulation for trading data",
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
