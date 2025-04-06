import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import NodeCanvas from '@/components/ai-agent/NodeCanvas';
import NodeTemplates, { NodeTemplate } from '@/components/ai-agent/NodeTemplates';
import { BrutalistCard } from '@/components/ui/brutalist-card';
import { BrutalistButton } from '@/components/ui/brutalist-button';
import { BrutalistInput } from '@/components/ui/brutalist-input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWallet } from '@/lib/walletAdapter';
import { useToast } from '@/hooks/use-toast';

interface Node {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  data: Record<string, any>;
  inputs: string[];
  outputs: string[];
  bidirectional?: string[]; // For ports that can work as both input and output
  script?: string;
  category?: string;
  description?: string;
  gitRepo?: {
    url: string;
    branch: string;
    lastCommit?: string;
    lastUpdated?: Date;
  };
  dependencies?: string[];
  debugMode?: boolean;
}

interface Connection {
  id: string;
  sourceNodeId: string;
  sourceOutput: string;
  targetNodeId: string;
  targetInput: string;
}

interface SavedAgent {
  id: string;
  name: string;
  description: string;
  status: 'deployed' | 'draft';
  nodes: Node[];
  connections: Connection[];
  createdAt: Date;
  lastUpdated: Date;
}

const AIAgentBuilder: React.FC = () => {
  const { wallet } = useWallet();
  const { toast } = useToast();

  // Current workflow state
  const [workflowName, setWorkflowName] = useState('Market Analyzer Agent');
  const [workflowDescription, setWorkflowDescription] = useState('Detects market trends and auto-trades based on signals');
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Git repository management
  const [isGitModalOpen, setIsGitModalOpen] = useState(false);
  const [selectedNodeForGit, setSelectedNodeForGit] = useState<string | null>(null);
  const [gitRepoUrl, setGitRepoUrl] = useState('');
  const [gitBranch, setGitBranch] = useState('main');
  const [isGitOperationLoading, setIsGitOperationLoading] = useState(false);
  
  // Real-time monitoring
  const [logs, setLogs] = useState<Array<{nodeId: string, message: string, timestamp: Date, level: 'info' | 'warn' | 'error'}>>([]);
  const [isMonitoringActive, setIsMonitoringActive] = useState(false);
  const [debugNodes, setDebugNodes] = useState<string[]>([]);
  
  // Dependency management
  const [dependencyModal, setDependencyModal] = useState<{isOpen: boolean, nodeId: string | null}>({
    isOpen: false,
    nodeId: null
  });
  
  // Node and connection state
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: 'node-1',
      type: 'dataSource',
      title: 'Market Data',
      position: { x: 50, y: 30 },
      data: {
        Symbol: 'SOL/USDT',
        Timeframe: '1m',
        DataSource: 'Binance'
      },
      category: 'data',
      description: 'Fetches real-time market data from exchange APIs',
      inputs: [],
      outputs: ['data']
    },
    {
      id: 'node-2',
      type: 'aiProcessor',
      title: 'AI Analysis',
      position: { x: 300, y: 100 },
      data: {
        Model: 'Trend Predictor',
        Confidence: 75,
        Window: '12h'
      },
      category: 'ai',
      description: 'Applies machine learning to analyze market patterns',
      inputs: ['data'],
      outputs: ['prediction']
    },
    {
      id: 'node-3',
      type: 'action',
      title: 'Trading Decision',
      position: { x: 550, y: 180 },
      data: {
        Action: 'Buy',
        Amount: 25,
        StopLoss: 5
      },
      category: 'trading',
      description: 'Makes trading decisions based on AI analysis',
      inputs: ['prediction'],
      outputs: ['execute']
    }
  ]);
  
  const [connections, setConnections] = useState<Connection[]>([
    {
      id: 'connection-1',
      sourceNodeId: 'node-1',
      sourceOutput: 'data',
      targetNodeId: 'node-2',
      targetInput: 'data'
    },
    {
      id: 'connection-2',
      sourceNodeId: 'node-2',
      sourceOutput: 'prediction',
      targetNodeId: 'node-3',
      targetInput: 'prediction'
    }
  ]);
  
  // Saved agents 
  const [savedAgents, setSavedAgents] = useState<SavedAgent[]>([
    {
      id: 'agent-1',
      name: 'Price Alert Agent',
      description: 'Sends notifications when price moves beyond thresholds',
      status: 'deployed',
      nodes: [],
      connections: [],
      createdAt: new Date('2025-03-15'),
      lastUpdated: new Date('2025-03-28')
    },
    {
      id: 'agent-2',
      name: 'DCA Bot',
      description: 'Dollar cost average investment on schedule',
      status: 'draft',
      nodes: [],
      connections: [],
      createdAt: new Date('2025-03-20'),
      lastUpdated: new Date('2025-03-25')
    }
  ]);

  // Enhanced templates with categories, descriptions, and scripts
  const nodeTemplates: NodeTemplate[] = [
    // Data Sources
    {
      type: 'dataSource',
      title: 'Market Data',
      icon: 'ri-database-line',
      color: 'brutalism-blue',
      category: 'data',
      description: 'Fetches real-time market data from cryptocurrency exchanges',
      inputs: [],
      outputs: ['data', 'marketEvents'],
      data: {
        Symbol: 'SOL/USDT',
        Timeframe: '1m',
        DataSource: 'Binance'
      },
      gitRepo: {
        url: 'https://github.com/autryntix/market-data-connector',
        branch: 'main',
        lastUpdated: new Date('2025-03-15')
      },
      documentation: `
        <h3>Market Data Node</h3>
        <p>This node connects to cryptocurrency exchange APIs to fetch real-time market data.</p>
        <ul>
          <li><strong>Symbol:</strong> The trading pair to monitor (e.g., SOL/USDT)</li>
          <li><strong>Timeframe:</strong> The candle timeframe (e.g., 1m, 5m, 1h)</li>
          <li><strong>DataSource:</strong> The exchange to use (Binance, Coinbase, etc.)</li>
        </ul>
        <p>Output <code>data</code> provides OHLCV (Open, High, Low, Close, Volume) data.</p>
        <p>Output <code>marketEvents</code> provides significant market events such as large trades, price breakouts, etc.</p>
      `,
      script: `// This script fetches market data from an API
const symbol = data.Symbol;
const timeframe = data.Timeframe;
const source = data.DataSource;

log("Fetching market data for " + symbol + " on " + timeframe + " timeframe");

// In a real implementation, you would make an API call here
// For this example, we'll simulate data
outputs.data = {
  symbol: symbol,
  timeframe: timeframe,
  price: 100 + Math.random() * 5,
  volume: 1000000 + Math.random() * 500000,
  timestamp: new Date().toISOString()
};

// Also detect any significant market events
outputs.marketEvents = {
  largeOrders: [
    {
      side: "buy",
      size: 25000,
      impact: 0.5,
      timestamp: new Date().toISOString()
    }
  ],
  volumeSpikes: Boolean(Math.random() > 0.7)
};

log("Market data fetched successfully");`
    },
    {
      type: 'dataSource',
      title: 'DeFi Protocol Scanner',
      icon: 'ri-bar-chart-box-line',
      color: 'brutalism-blue',
      category: 'data',
      description: 'Monitors DeFi protocols for yield, TVL, and other metrics',
      inputs: [],
      outputs: ['stats', 'opportunities'],
      data: {
        Protocol: 'Raydium',
        Metrics: 'APY, TVL, Volume',
        UpdateFrequency: 300
      },
      gitRepo: {
        url: 'https://github.com/autryntix/defi-metrics-scanner',
        branch: 'main',
        lastUpdated: new Date('2025-03-25')
      },
      documentation: `
        <h3>DeFi Protocol Scanner</h3>
        <p>This node monitors decentralized finance protocols and tracks key metrics.</p>
        <ul>
          <li><strong>Protocol:</strong> The DeFi protocol to monitor (e.g., Raydium, Orca)</li>
          <li><strong>Metrics:</strong> The metrics to track (APY, TVL, etc.)</li>
          <li><strong>UpdateFrequency:</strong> How often to update data in seconds</li>
        </ul>
        <p>Output <code>stats</code> provides the latest protocol metrics.</p>
        <p>Output <code>opportunities</code> identifies potentially profitable opportunities.</p>
      `,
      script: `// This script monitors DeFi protocols
const protocol = data.Protocol;
const metrics = data.Metrics.split(', ');
const frequency = data.UpdateFrequency;

log("Monitoring " + protocol + " for " + metrics.join(", "));

// Simulate protocol metrics data
outputs.stats = {
  protocol: protocol,
  tvl: 35000000 + Math.random() * 1000000,
  apy: 8.5 + Math.random() * 2,
  volume24h: 12000000 + Math.random() * 500000,
  updated: new Date().toISOString()
};

// Identify potential opportunities
outputs.opportunities = {
  highYield: [
    {
      pool: protocol + "-USDC-SOL",
      apy: 12.5,
      risk: "medium",
      impermanentLoss: "low"
    }
  ],
  arbitrage: Boolean(Math.random() > 0.7)
};

log("DeFi protocol data updated");`
    },
    {
      type: 'dataSource',
      title: 'News Feed',
      icon: 'ri-newspaper-line',
      color: 'brutalism-blue',
      category: 'data',
      description: 'Monitors and analyzes news sources for market-moving events',
      inputs: [],
      outputs: ['articles', 'sentiment'],
      data: {
        Sources: 'CryptoNews,Twitter',
        Keywords: 'Solana,Web3,DeFi',
        Refresh: '5m'
      }
    },
    {
      type: 'dataSource',
      title: 'On-Chain Data',
      icon: 'ri-server-line',
      color: 'brutalism-blue',
      category: 'data',
      description: 'Fetches on-chain metrics from blockchain explorers',
      inputs: [],
      outputs: ['metrics'],
      data: {
        Blockchain: 'Solana',
        Metrics: 'Transactions,FeeRevenue',
        Interval: '10m'
      }
    },
    
    // AI Processors
    {
      type: 'aiProcessor',
      title: 'Sentiment Analysis',
      icon: 'ri-emotion-line',
      color: 'brutalism-purple',
      category: 'ai',
      description: 'Analyzes text data for sentiment and market signals',
      inputs: ['text'],
      outputs: ['sentiment', 'score'],
      data: {
        Model: 'NLP Transformer',
        Sensitivity: 75,
        Context: 'Crypto Markets'
      },
      script: `// This script performs sentiment analysis on text input
const textInput = inputs.text ? inputs.text.value : "";
const sensitivity = data.Sensitivity / 100;
const context = data.Context;

log("Analyzing sentiment with sensitivity: " + sensitivity);

// Calculate sentiment score (simplified)
let sentimentScore = 0;
if (textInput) {
  // Look for positive and negative keywords
  const positiveWords = ["bullish", "growth", "rise", "gain", "breakthrough"];
  const negativeWords = ["bearish", "crash", "fall", "drop", "risk"];
  
  const text = textInput.toLowerCase();
  
  // Count positive and negative words
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    if (text.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (text.includes(word)) negativeCount++;
  });
  
  // Calculate normalized score (-1 to 1)
  sentimentScore = (positiveCount - negativeCount) / Math.max(1, positiveCount + negativeCount);
  
  // Apply sensitivity factor
  sentimentScore = sentimentScore * sensitivity;
}

// Output results
outputs.sentiment = {
  label: sentimentScore > 0.3 ? "positive" : sentimentScore < -0.3 ? "negative" : "neutral",
  context: context
};

outputs.score = {
  value: sentimentScore,
  timestamp: new Date().toISOString()
};

log("Sentiment analysis complete. Score: " + sentimentScore);`
    },
    {
      type: 'aiProcessor',
      title: 'Trend Predictor',
      icon: 'ri-line-chart-line',
      color: 'brutalism-purple',
      category: 'ai',
      description: 'Uses machine learning to predict price trends',
      inputs: ['data'],
      outputs: ['prediction'],
      data: {
        Model: 'LSTM Neural Net',
        Confidence: 80,
        Window: '24h'
      }
    },
    {
      type: 'aiProcessor',
      title: 'LLM Integration',
      icon: 'ri-ai-generate',
      color: 'brutalism-purple',
      category: 'ai',
      description: 'Leverages large language models for advanced analysis',
      inputs: ['context'],
      outputs: ['analysis', 'suggestion'],
      data: {
        Model: 'GPT-4',
        Temperature: 0.7,
        MaxTokens: 500
      }
    },
    
    // Trading & Actions
    {
      type: 'action',
      title: 'Trading Decision',
      icon: 'ri-exchange-line',
      color: 'brutalism-green',
      category: 'trading',
      description: 'Makes buying/selling decisions based on inputs',
      inputs: ['signal'],
      outputs: ['order'],
      data: {
        Action: 'Auto',
        Amount: 25,
        StopLoss: 3
      }
    },
    {
      type: 'action',
      title: 'Wallet Integration',
      icon: 'ri-wallet-3-line',
      color: 'brutalism-green',
      category: 'trading',
      description: 'Connects to crypto wallets for transaction signing',
      inputs: ['transaction'],
      outputs: ['receipt'],
      data: {
        WalletType: 'Phantom',
        ConfirmationRequired: true,
        GasAdjustment: 'Medium'
      }
    },
    
    // Logic & Flow Control
    {
      type: 'conditional',
      title: 'Threshold Filter',
      icon: 'ri-filter-line',
      color: 'brutalism-red',
      category: 'logic',
      description: 'Routes flow based on numeric thresholds',
      inputs: ['value'],
      outputs: ['above', 'below'],
      data: {
        Threshold: 50,
        Comparison: '>',
        Tolerance: 0.5
      },
      script: `// This script filters values based on a threshold
const inputValue = inputs.value ? inputs.value.value : 0;
const threshold = data.Threshold;
const comparison = data.Comparison;
const tolerance = data.Tolerance;

log("Filtering value: " + inputValue + " with threshold: " + threshold);

let result = false;
switch (comparison) {
  case ">":
    result = inputValue > threshold;
    break;
  case "<":
    result = inputValue < threshold;
    break;
  case "=":
    result = Math.abs(inputValue - threshold) <= tolerance;
    break;
  default:
    result = false;
}

if (result) {
  outputs.above = {
    value: inputValue,
    threshold: threshold,
    passed: true
  };
  log("Value passed threshold filter!");
} else {
  outputs.below = {
    value: inputValue,
    threshold: threshold,
    passed: false
  };
  log("Value did not pass threshold filter");
}
`
    },
    {
      type: 'conditional',
      title: 'Time Scheduler',
      icon: 'ri-time-line',
      color: 'brutalism-red',
      category: 'logic',
      description: 'Executes actions based on time schedules',
      inputs: ['trigger'],
      outputs: ['execute'],
      data: {
        Schedule: 'Daily',
        Time: '08:00',
        ActiveDays: 'Mon,Tue,Wed,Thu,Fri'
      }
    },
    
    // Notifications & Integrations
    {
      type: 'notification',
      title: 'Alert System',
      icon: 'ri-notification-line',
      color: 'brutalism-yellow',
      category: 'notification',
      description: 'Sends alerts via various channels',
      inputs: ['alert'],
      outputs: [],
      data: {
        Channels: 'Email,Telegram',
        Priority: 'High',
        Template: 'Default'
      }
    },
    {
      type: 'integration',
      title: 'Telegram Bot',
      icon: 'ri-telegram-line',
      color: 'brutalism-blue',
      category: 'integration',
      description: 'Sends and receives messages via Telegram',
      inputs: ['message'],
      outputs: ['response'],
      data: {
        BotToken: 'API_KEY_REQUIRED',
        ChatId: '-100123456789',
        ParseMode: 'Markdown'
      }
    },
    {
      type: 'integration',
      title: 'Discord Webhook',
      icon: 'ri-discord-line',
      color: 'brutalism-blue',
      category: 'integration',
      description: 'Sends messages to Discord channels',
      inputs: ['message'],
      outputs: [],
      data: {
        WebhookUrl: 'https://discord.com/api/webhooks/...',
        Username: 'Trading Bot',
        Avatar: 'bot_avatar.png'
      }
    },
    
    // Advanced node with bidirectional ports and Git integration
    {
      type: 'advanced',
      title: 'Custom API Gateway',
      icon: 'ri-api-line',
      color: 'brutalism-purple',
      category: 'integration',
      description: 'Bidirectional API gateway with support for multiple protocols',
      inputs: ['request'],
      outputs: ['response'],
      bidirectional: ['stream', 'websocket'],
      data: {
        Protocol: 'REST',
        Timeout: 30,
        EnableCache: true,
        RetryCount: 3
      },
      script: `// This script handles bidirectional API communications
const request = inputs.request ? inputs.request.value : null;
const protocol = data.Protocol;
const enableCache = data.EnableCache;

log("Processing API request via " + protocol);

// Handle bidirectional streams if active
if (port.stream.isActive) {
  // Stream data in both directions
  port.stream.write({
    timestamp: new Date().toISOString(),
    status: "processing",
    protocol: protocol
  });
  
  log("Stream connection active");
}

// Handle websocket connections if active  
if (port.websocket.isActive) {
  // Send data over websocket
  port.websocket.send({
    event: "status_update",
    data: {
      status: "connected",
      timestamp: new Date().toISOString()
    }
  });
  
  log("WebSocket connection active");
}

// Generate response
outputs.response = {
  status: 200,
  body: {
    success: true,
    timestamp: new Date().toISOString(),
    data: {
      message: "API request processed successfully"
    }
  }
};

log("API response generated");`,
      gitRepo: {
        url: 'https://github.com/solana-labs/api-gateway-examples.git',
        branch: 'main',
        lastCommit: 'f8e7d9c',
        lastUpdated: new Date('2025-03-30')
      }
    }
  ];
  
  // Handlers for workflow actions
  const handleNodeAdd = (template: NodeTemplate) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: template.type,
      title: template.title,
      position: { x: 100, y: 100 },
      data: { ...template.data },
      inputs: [...template.inputs],
      outputs: [...template.outputs],
      script: template.script,
      category: template.category,
      description: template.description,
      bidirectional: template.bidirectional || [],
      dependencies: [],
      debugMode: false
    };
    
    setNodes([...nodes, newNode]);
    
    // Log the node creation event to the monitoring console
    setLogs([
      ...logs, 
      {
        nodeId: newNode.id,
        message: `Node created: ${newNode.title} (${newNode.type})`,
        timestamp: new Date(),
        level: 'info'
      }
    ]);
    
    toast({
      title: "Node Added",
      description: `${template.title} node has been added to your workflow.`,
    });
  };
  
  const handleNodeUpdate = (nodeId: string, data: Partial<Node>) => {
    setNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, ...data } : node
    ));
  };
  
  const handleConnectionCreate = (connection: Connection) => {
    // Check if connection already exists
    const existingConnection = connections.find(
      conn => conn.sourceNodeId === connection.sourceNodeId && 
              conn.sourceOutput === connection.sourceOutput &&
              conn.targetNodeId === connection.targetNodeId &&
              conn.targetInput === connection.targetInput
    );
    
    if (existingConnection) {
      toast({
        title: "Connection already exists",
        description: "This connection is already present in your workflow.",
        variant: "destructive"
      });
      return;
    }
    
    setConnections([...connections, connection]);
    
    toast({
      title: "Connection Created",
      description: "Nodes have been connected successfully.",
    });
  };
  
  const handleConnectionDelete = (connectionId: string) => {
    setConnections(connections.filter(conn => conn.id !== connectionId));
    
    toast({
      title: "Connection Removed",
      description: "The connection has been deleted from your workflow.",
    });
  };
  
  const handleNodeDelete = (nodeId: string) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
    setConnections(connections.filter(
      conn => conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
    ));
    
    toast({
      title: "Node Deleted",
      description: "The node and all its connections have been removed.",
    });
  };
  
  // Save the current workflow
  const handleSaveWorkflow = () => {
    if (!workflowName.trim()) {
      toast({
        title: "Name Required",
        description: "Please provide a name for your workflow.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, you would save to backend/database
    const newAgent: SavedAgent = {
      id: `agent-${Date.now()}`,
      name: workflowName,
      description: workflowDescription,
      status: 'draft',
      nodes: [...nodes],
      connections: [...connections],
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    
    setSavedAgents([...savedAgents, newAgent]);
    
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    
    toast({
      title: "Workflow Saved",
      description: "Your AI agent workflow has been saved successfully.",
    });
  };
  
  // Deploy the workflow
  const handleDeployWorkflow = () => {
    if (!workflowName.trim()) {
      toast({
        title: "Name Required",
        description: "Please save your workflow before deploying.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate the workflow
    if (nodes.length === 0) {
      toast({
        title: "Empty Workflow",
        description: "Add at least one node to your workflow before deploying.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if wallet is connected
    if (!wallet) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to deploy this agent.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Deployment Started",
      description: "Your agent is being deployed to the Solana blockchain.",
    });
    
    // Simulate deployment process
    setTimeout(() => {
      toast({
        title: "Deployment Successful",
        description: "Your AI agent is now live on the Solana blockchain!",
      });
      
      // Update the status to deployed
      const updatedAgents = [...savedAgents];
      const existingIndex = updatedAgents.findIndex(a => a.name === workflowName);
      
      if (existingIndex >= 0) {
        updatedAgents[existingIndex].status = 'deployed';
        updatedAgents[existingIndex].lastUpdated = new Date();
      } else {
        updatedAgents.push({
          id: `agent-${Date.now()}`,
          name: workflowName,
          description: workflowDescription,
          status: 'deployed',
          nodes: [...nodes],
          connections: [...connections],
          createdAt: new Date(),
          lastUpdated: new Date()
        });
      }
      
      setSavedAgents(updatedAgents);
    }, 2000);
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <Header title="AI Agent Builder" wallet={wallet} />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-mono font-bold">Visual Node Workflow Designer</h2>
        <div className="flex space-x-3">
          <BrutalistButton color="default" onClick={() => setIsMonitoringActive(!isMonitoringActive)}>
            <i className={`${isMonitoringActive ? 'ri-eye-fill' : 'ri-eye-line'} mr-2`}></i> 
            {isMonitoringActive ? 'Monitoring On' : 'Monitoring Off'}
          </BrutalistButton>
          <BrutalistButton color="green" onClick={handleSaveWorkflow}>
            <i className="ri-save-line mr-2"></i> Save Workflow
          </BrutalistButton>
          <BrutalistButton color="purple" onClick={handleDeployWorkflow}>
            <i className="ri-rocket-line mr-2"></i> Deploy Agent
          </BrutalistButton>
        </div>
      </div>
      
      <BrutalistCard className="p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-brutalism-purple border-2 border-black mr-3">
              <i className="ri-flow-chart text-white"></i>
            </div>
            
            {isEditingInfo ? (
              <div className="flex-1">
                <BrutalistInput
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="Workflow name"
                  className="mb-2"
                />
                <BrutalistInput
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  placeholder="Short description"
                />
              </div>
            ) : (
              <div>
                <h3 className="font-mono font-bold">{workflowName}</h3>
                <p className="text-sm text-gray-400">{workflowDescription}</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {isEditingInfo ? (
              <BrutalistButton 
                color="green" 
                onClick={() => setIsEditingInfo(false)}
              >
                <i className="ri-check-line mr-1"></i> Done
              </BrutalistButton>
            ) : (
              <BrutalistButton 
                color="default"
                onClick={() => setIsEditingInfo(true)}
              >
                <i className="ri-edit-line mr-1"></i> Edit
              </BrutalistButton>
            )}
            
            <BrutalistButton className="mr-2" color="default">
              <i className="ri-download-line mr-1"></i> Import
            </BrutalistButton>
            <BrutalistButton color="default">
              <i className="ri-upload-line mr-1"></i> Export
            </BrutalistButton>
          </div>
        </div>
        
        {showSuccessMessage && (
          <div className="mt-3 py-2 px-3 bg-green-900 bg-opacity-30 text-green-400 text-sm rounded">
            <i className="ri-check-line mr-1"></i> Workflow saved successfully!
          </div>
        )}
      </BrutalistCard>
      
      {/* Node Canvas */}
      <NodeCanvas
        nodes={nodes}
        connections={connections}
        onNodeAdd={(node) => {
          // Node is already created and formatted properly in handleNodeAdd
          // This adapter resolves the type mismatch between NodeTemplate and Node
          setNodes([...nodes, node]);
        }}
        onNodeUpdate={handleNodeUpdate}
        onConnectionCreate={handleConnectionCreate}
        onConnectionDelete={handleConnectionDelete}
        onNodeDelete={handleNodeDelete}
      />
      
      {/* Node Templates */}
      <NodeTemplates
        templates={nodeTemplates}
        onAddNode={handleNodeAdd}
      />
      
      {/* Saved Agents */}
      <div className="mb-8">
        <h3 className="font-mono font-bold mb-3">Your Saved Agents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedAgents.map(agent => (
            <BrutalistCard key={agent.id} className="p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brutalism-purple border-2 border-black mr-2">
                  <i className="ri-robot-line text-white"></i>
                </div>
                <h4 className="font-mono font-bold">{agent.name}</h4>
              </div>
              
              <p className="text-sm text-gray-400 mb-3">{agent.description}</p>
              
              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded text-xs ${
                  agent.status === 'deployed' 
                    ? 'bg-green-800 bg-opacity-30 text-green-400' 
                    : 'bg-blue-800 bg-opacity-30 text-blue-400'
                }`}>
                  {agent.status === 'deployed' ? 'Deployed' : 'Draft'}
                </span>
                
                <div className="text-xs text-gray-500">
                  Last updated {new Date(agent.lastUpdated).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-3 pt-3 border-t border-gray-700">
                <Dialog>
                  <DialogTrigger asChild>
                    <BrutalistButton className="py-1 px-2 text-xs" color="blue">
                      <i className="ri-information-line mr-1"></i> Info
                    </BrutalistButton>
                  </DialogTrigger>
                  <DialogContent className="bg-[#1E1E1E] border-4 border-black">
                    <DialogHeader>
                      <DialogTitle>{agent.name}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="space-y-2">
                        <div>
                          <h4 className="text-sm font-bold">Description</h4>
                          <p className="text-sm text-gray-300">{agent.description}</p>
                        </div>
                        <div className="flex justify-between">
                          <div>
                            <h4 className="text-sm font-bold">Status</h4>
                            <span className={`px-2 py-1 rounded text-xs ${
                              agent.status === 'deployed' 
                                ? 'bg-green-800 bg-opacity-30 text-green-400' 
                                : 'bg-blue-800 bg-opacity-30 text-blue-400'
                            }`}>
                              {agent.status === 'deployed' ? 'Deployed' : 'Draft'}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold">Created</h4>
                            <p className="text-sm text-gray-300">{new Date(agent.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold">Node Count</h4>
                          <p className="text-sm text-gray-300">{agent.nodes.length || 'Unknown'}</p>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <BrutalistButton className="py-1 px-2 text-xs" color="default" onClick={() => {
                  // Load this agent's workflow
                  if (agent.nodes.length > 0) {
                    setNodes(agent.nodes);
                    setConnections(agent.connections);
                    setWorkflowName(agent.name);
                    setWorkflowDescription(agent.description);
                    
                    toast({
                      title: "Workflow Loaded",
                      description: `${agent.name} has been loaded into the editor.`,
                    });
                  } else {
                    toast({
                      title: "Empty Workflow",
                      description: "This saved agent doesn't have any nodes.",
                      variant: "destructive"
                    });
                  }
                }}>
                  <i className="ri-edit-line mr-1"></i> Edit
                </BrutalistButton>
              </div>
            </BrutalistCard>
          ))}
          
          {/* Add New Agent Card */}
          <BrutalistCard className="p-4 border-dashed">
            <div className="flex flex-col items-center justify-center h-full py-4">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-[#2A2A2A] border-2 border-dashed border-gray-600 mb-3">
                <i className="ri-add-line text-2xl text-gray-400"></i>
              </div>
              <h4 className="font-mono text-center mb-3">Create New Agent</h4>
              <BrutalistButton 
                className="py-1 px-3 text-sm"
                color="purple"
                onClick={() => {
                  // Reset the canvas
                  setNodes([]);
                  setConnections([]);
                  setWorkflowName('New Agent');
                  setWorkflowDescription('Description of your new agent');
                  setIsEditingInfo(true);
                  
                  toast({
                    title: "New Agent Started",
                    description: "Start adding nodes to create your workflow.",
                  });
                }}
              >
                <i className="ri-add-line mr-1"></i> Start New Workflow
              </BrutalistButton>
            </div>
          </BrutalistCard>
        </div>
      </div>
      
      {/* Git Repository Integration Modal */}
      <Dialog open={isGitModalOpen} onOpenChange={setIsGitModalOpen}>
        <DialogContent className="bg-[#1E1E1E] border-4 border-black max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-mono flex items-center">
              <i className="ri-git-branch-line mr-2 text-brutalism-purple"></i> 
              Git Repository Integration
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <p className="text-sm text-gray-400">
              Link this node to a Git repository to enable version control and collaborative development.
            </p>
            
            {selectedNodeForGit && (
              <div className="flex items-center bg-[#2A2A2A] p-2 rounded-sm">
                <div className="w-6 h-6 rounded-sm flex items-center justify-center mr-2" 
                  style={{backgroundColor: nodes.find(n => n.id === selectedNodeForGit)?.category === 'ai' ? '#9A55FF' : 
                                          nodes.find(n => n.id === selectedNodeForGit)?.category === 'data' ? '#4B9CFF' : 
                                          '#50C16E'}}>
                  <i className="ri-code-line text-white text-xs"></i>
                </div>
                <span className="text-sm">
                  {nodes.find(n => n.id === selectedNodeForGit)?.title || 'Selected Node'}
                </span>
              </div>
            )}
            
            <div className="space-y-3">
              <div>
                <label className="font-mono text-sm mb-1 block">Repository URL*</label>
                <BrutalistInput
                  value={gitRepoUrl}
                  onChange={(e) => setGitRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repo.git"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="font-mono text-sm mb-1 block">Branch</label>
                <BrutalistInput
                  value={gitBranch}
                  onChange={(e) => setGitBranch(e.target.value)}
                  placeholder="main"
                  className="w-full"
                />
              </div>
              
              <div className="pt-2">
                <label className="font-mono text-sm mb-1 block">Authentication</label>
                <div className="flex space-x-2">
                  <BrutalistButton color="blue" className="text-xs">
                    <i className="ri-key-line mr-1"></i> Use SSH Key
                  </BrutalistButton>
                  <BrutalistButton color="default" className="text-xs">
                    <i className="ri-lock-line mr-1"></i> Use Token
                  </BrutalistButton>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-4 border-t border-gray-700 mt-4">
              <div>
                <BrutalistButton 
                  color="red"
                  className="text-xs" 
                  disabled={!selectedNodeForGit || !nodes.find(n => n.id === selectedNodeForGit)?.gitRepo}
                  onClick={() => {
                    if (selectedNodeForGit) {
                      // Remove git repo from node
                      handleNodeUpdate(selectedNodeForGit, { 
                        gitRepo: undefined 
                      });
                      setIsGitModalOpen(false);
                      
                      toast({
                        title: "Repository Disconnected",
                        description: "Git repository has been disconnected from this node.",
                      });
                    }
                  }}
                >
                  <i className="ri-delete-bin-line mr-1"></i> Disconnect Repository
                </BrutalistButton>
              </div>
              
              <div className="flex space-x-2">
                <BrutalistButton color="default" onClick={() => setIsGitModalOpen(false)}>
                  Cancel
                </BrutalistButton>
                <BrutalistButton 
                  color="green" 
                  disabled={!gitRepoUrl.trim() || !selectedNodeForGit || isGitOperationLoading}
                  onClick={() => {
                    if (selectedNodeForGit && gitRepoUrl) {
                      setIsGitOperationLoading(true);
                      
                      // Simulate git operation
                      setTimeout(() => {
                        // Update node with git repo info
                        handleNodeUpdate(selectedNodeForGit, {
                          gitRepo: {
                            url: gitRepoUrl,
                            branch: gitBranch || 'main',
                            lastCommit: 'a1b2c3d',
                            lastUpdated: new Date()
                          }
                        });
                        
                        setIsGitOperationLoading(false);
                        setIsGitModalOpen(false);
                        
                        toast({
                          title: "Repository Connected",
                          description: "Git repository has been linked to this node.",
                        });
                      }, 1500);
                    }
                  }}
                >
                  {isGitOperationLoading ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i> Connecting...
                    </>
                  ) : (
                    <>
                      <i className="ri-link-m mr-2"></i> Connect Repository
                    </>
                  )}
                </BrutalistButton>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dependency Management Modal */}
      <Dialog open={dependencyModal.isOpen} onOpenChange={(open) => setDependencyModal({...dependencyModal, isOpen: open})}>
        <DialogContent className="bg-[#1E1E1E] border-4 border-black max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-mono flex items-center">
              <i className="ri-package-line mr-2 text-brutalism-blue"></i> 
              Node Dependencies
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {dependencyModal.nodeId && (
              <div className="flex items-center bg-[#2A2A2A] p-2 rounded-sm">
                <div className="w-6 h-6 rounded-sm flex items-center justify-center mr-2" 
                  style={{backgroundColor: nodes.find(n => n.id === dependencyModal.nodeId)?.category === 'ai' ? '#9A55FF' : 
                                          nodes.find(n => n.id === dependencyModal.nodeId)?.category === 'data' ? '#4B9CFF' : 
                                          '#50C16E'}}>
                  <i className="ri-code-line text-white text-xs"></i>
                </div>
                <span className="text-sm">
                  {nodes.find(n => n.id === dependencyModal.nodeId)?.title || 'Selected Node'}
                </span>
              </div>
            )}
            
            <div className="flex space-x-2">
              <BrutalistInput 
                placeholder="Add new dependency (e.g., pandas==1.3.0)" 
                className="flex-1"
              />
              <BrutalistButton color="blue">
                <i className="ri-add-line mr-1"></i> Add
              </BrutalistButton>
            </div>
            
            <div className="mt-4">
              <h4 className="font-mono text-sm font-bold mb-2">Current Dependencies</h4>
              <div className="bg-[#111] p-2 rounded-sm h-40 overflow-y-auto">
                <div className="space-y-1">
                  <div className="flex justify-between items-center py-1 px-2 bg-[#2A2A2A] rounded-sm">
                    <span className="text-sm">numpy==1.21.0</span>
                    <div className="flex space-x-1">
                      <button className="text-gray-400 hover:text-white text-xs" title="Update">
                        <i className="ri-refresh-line"></i>
                      </button>
                      <button className="text-gray-400 hover:text-red-500 text-xs" title="Remove">
                        <i className="ri-close-line"></i>
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1 px-2 bg-[#2A2A2A] rounded-sm">
                    <span className="text-sm">pandas==1.3.0</span>
                    <div className="flex space-x-1">
                      <button className="text-gray-400 hover:text-white text-xs" title="Update">
                        <i className="ri-refresh-line"></i>
                      </button>
                      <button className="text-gray-400 hover:text-red-500 text-xs" title="Remove">
                        <i className="ri-close-line"></i>
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1 px-2 bg-[#2A2A2A] rounded-sm">
                    <span className="text-sm">scikit-learn==1.0.1</span>
                    <div className="flex space-x-1">
                      <button className="text-gray-400 hover:text-white text-xs" title="Update">
                        <i className="ri-refresh-line"></i>
                      </button>
                      <button className="text-gray-400 hover:text-red-500 text-xs" title="Remove">
                        <i className="ri-close-line"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-4 border-t border-gray-700 mt-4">
              <BrutalistButton color="purple" className="text-xs">
                <i className="ri-magic-line mr-1"></i> Auto-resolve Dependencies
              </BrutalistButton>
              
              <BrutalistButton color="green">
                <i className="ri-check-line mr-1"></i> Save Dependencies
              </BrutalistButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Real-time Monitoring Panel */}
      {isMonitoringActive && (
        <BrutalistCard className="fixed bottom-4 right-4 w-96 bg-[#1A1A1A] border-4 border-black shadow-2xl">
          <div className="flex justify-between items-center p-2 bg-[#2A2A2A] border-b-2 border-black">
            <h4 className="font-mono font-bold flex items-center">
              <i className="ri-terminal-box-line mr-2 text-brutalism-green"></i> Monitoring Console
            </h4>
            <button 
              className="text-gray-400 hover:text-white" 
              onClick={() => setIsMonitoringActive(false)}
            >
              <i className="ri-close-line"></i>
            </button>
          </div>
          
          <Tabs defaultValue="logs">
            <TabsList className="w-full p-0 bg-[#222] rounded-none border-b-2 border-black">
              <TabsTrigger value="logs" className="flex-1 data-[state=active]:bg-[#2A2A2A]">
                Logs
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex-1 data-[state=active]:bg-[#2A2A2A]">
                Performance
              </TabsTrigger>
              <TabsTrigger value="data" className="flex-1 data-[state=active]:bg-[#2A2A2A]">
                Data Flow
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="logs" className="mt-0 p-0">
              <ScrollArea className="h-56">
                <div className="p-2 space-y-1 font-mono text-xs">
                  {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <div 
                        key={index} 
                        className={`p-1 ${
                          log.level === 'error' ? 'text-red-400' : 
                          log.level === 'warn' ? 'text-yellow-400' : 
                          'text-green-400'
                        }`}
                      >
                        <span className="opacity-70">[{log.timestamp.toLocaleTimeString()}]</span>{' '}
                        <span className="font-bold">[{nodes.find(n => n.id === log.nodeId)?.title || log.nodeId}]</span>{' '}
                        {log.message}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No logs available. Run your workflow to see logs.
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="p-2 bg-[#222] border-t-2 border-black flex space-x-2">
                <BrutalistButton color="default" className="text-xs py-1 flex-1">
                  <i className="ri-delete-bin-line mr-1"></i> Clear Logs
                </BrutalistButton>
                <BrutalistButton color="blue" className="text-xs py-1 flex-1">
                  <i className="ri-download-line mr-1"></i> Export Logs
                </BrutalistButton>
              </div>
            </TabsContent>
            
            <TabsContent value="performance" className="mt-0 p-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs">Memory Usage</span>
                  <span className="text-xs font-bold">284.5 MB</span>
                </div>
                <div className="h-2 bg-[#333] rounded-full overflow-hidden">
                  <div className="h-full bg-brutalism-blue w-1/3"></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs">CPU Usage</span>
                  <span className="text-xs font-bold">42%</span>
                </div>
                <div className="h-2 bg-[#333] rounded-full overflow-hidden">
                  <div className="h-full bg-brutalism-purple w-2/5"></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs">Network I/O</span>
                  <span className="text-xs font-bold">1.2 MB/s</span>
                </div>
                <div className="h-2 bg-[#333] rounded-full overflow-hidden">
                  <div className="h-full bg-brutalism-green w-1/4"></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs">Execution Time</span>
                  <span className="text-xs font-bold">124ms</span>
                </div>
                <div className="h-2 bg-[#333] rounded-full overflow-hidden">
                  <div className="h-full bg-brutalism-yellow w-1/5"></div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="data" className="mt-0 p-2">
              <div className="space-y-3">
                <div>
                  <h5 className="text-xs font-bold mb-1">Active Data Flows</h5>
                  <div className="bg-[#222] p-2 rounded-sm">
                    <div className="flex justify-between text-xs">
                      <span>Market Data → AI Analysis</span>
                      <span className="text-green-400">Active</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>AI Analysis → Trading Decision</span>
                      <span className="text-yellow-400">Pending</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-xs font-bold mb-1">Latest Data Sample</h5>
                  <pre className="bg-[#222] p-2 rounded-sm text-xs overflow-x-auto">
{`{
  "symbol": "SOL/USDT",
  "price": 103.45,
  "volume": 1234567,
  "timestamp": "2025-04-04T12:34:56Z"
}`}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </BrutalistCard>
      )}

      {/* Node Context Menu for Git Integration and Dependency Management */}
      <Dialog>
        <DialogContent className="bg-[#1E1E1E] border-4 border-black">
          <DialogHeader>
            <DialogTitle className="font-mono">Node Actions</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <BrutalistButton 
              color="blue" 
              className="w-full justify-start"
              onClick={() => {
                setSelectedNodeForGit('node-1'); // Example nodeId
                setIsGitModalOpen(true);
              }}
            >
              <i className="ri-git-branch-line mr-2"></i> Connect to Git Repository
            </BrutalistButton>
            
            <BrutalistButton 
              color="purple" 
              className="w-full justify-start"
              onClick={() => {
                setDependencyModal({
                  isOpen: true,
                  nodeId: 'node-1' // Example nodeId
                });
              }}
            >
              <i className="ri-package-line mr-2"></i> Manage Dependencies
            </BrutalistButton>
            
            <BrutalistButton 
              color="green" 
              className="w-full justify-start"
              onClick={() => {
                // Toggle debug mode for this node
                const nodeId = 'node-1'; // Example nodeId
                const node = nodes.find(n => n.id === nodeId);
                if (node) {
                  handleNodeUpdate(nodeId, { debugMode: !node.debugMode });
                  
                  if (!node.debugMode) {
                    setDebugNodes([...debugNodes, nodeId]);
                    toast({
                      title: "Debug Mode Enabled",
                      description: `${node.title} is now in debug mode.`,
                    });
                  } else {
                    setDebugNodes(debugNodes.filter(id => id !== nodeId));
                    toast({
                      title: "Debug Mode Disabled",
                      description: `${node.title} is no longer in debug mode.`,
                    });
                  }
                }
              }}
            >
              <i className="ri-bug-line mr-2"></i> Toggle Debug Mode
            </BrutalistButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIAgentBuilder;
