import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import NodeCanvas from '@/components/ai-agent/NodeCanvas';
import NodeTemplates, { NodeTemplate } from '@/components/ai-agent/NodeTemplates';
import { BrutalistCard } from '@/components/ui/brutalist-card';
import { BrutalistButton } from '@/components/ui/brutalist-button';
import { BrutalistInput } from '@/components/ui/brutalist-input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  script?: string;
  category?: string;
  description?: string;
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
      outputs: ['data'],
      data: {
        Symbol: 'SOL/USDT',
        Timeframe: '1m',
        DataSource: 'Binance'
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

log("Market data fetched successfully");`
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
      description: template.description
    };
    
    setNodes([...nodes, newNode]);
    
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
    </div>
  );
};

export default AIAgentBuilder;
