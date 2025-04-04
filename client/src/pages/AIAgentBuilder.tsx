import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import NodeCanvas from '@/components/ai-agent/NodeCanvas';
import NodeTemplates, { NodeTemplate } from '@/components/ai-agent/NodeTemplates';
import { BrutalistCard } from '@/components/ui/brutalist-card';
import { BrutalistButton } from '@/components/ui/brutalist-button';
import { useWallet } from '@/lib/walletAdapter';

interface Node {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  data: Record<string, any>;
  inputs: string[];
  outputs: string[];
}

interface Connection {
  id: string;
  sourceNodeId: string;
  sourceOutput: string;
  targetNodeId: string;
  targetInput: string;
}

const AIAgentBuilder: React.FC = () => {
  const { wallet } = useWallet();
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: 'node-1',
      type: 'dataSource',
      title: 'Market Data',
      position: { x: 50, y: 30 },
      data: {
        Symbol: 'SOL/USDT',
        Timeframe: '1m'
      },
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
        Confidence: '75%'
      },
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
        Amount: '25%'
      },
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
  
  const nodeTemplates: NodeTemplate[] = [
    {
      type: 'dataSource',
      title: 'Data Source',
      icon: 'ri-database-line',
      color: 'brutalism-blue',
      inputs: [],
      outputs: ['data'],
      data: {
        Source: 'API',
        Filter: 'None'
      }
    },
    {
      type: 'aiProcessor',
      title: 'AI Processor',
      icon: 'ri-brain-line',
      color: 'brutalism-purple',
      inputs: ['data'],
      outputs: ['result'],
      data: {
        Model: 'Default',
        Parameters: 'Standard'
      }
    },
    {
      type: 'action',
      title: 'Action',
      icon: 'ri-settings-line',
      color: 'brutalism-green',
      inputs: ['trigger'],
      outputs: ['result'],
      data: {
        Type: 'Execute',
        Target: 'System'
      }
    },
    {
      type: 'conditional',
      title: 'Conditional',
      icon: 'ri-git-branch-line',
      color: 'brutalism-red',
      inputs: ['input'],
      outputs: ['true', 'false'],
      data: {
        Condition: 'equals',
        Value: '0'
      }
    },
    {
      type: 'notification',
      title: 'Notification',
      icon: 'ri-notification-line',
      color: 'brutalism-yellow',
      inputs: ['trigger'],
      outputs: [],
      data: {
        Channel: 'Email',
        Template: 'Default'
      }
    }
  ];
  
  const handleNodeAdd = (template: NodeTemplate) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: template.type,
      title: template.title,
      position: { x: 100, y: 100 },
      data: { ...template.data },
      inputs: [...template.inputs],
      outputs: [...template.outputs]
    };
    
    setNodes([...nodes, newNode]);
  };
  
  const handleNodeUpdate = (nodeId: string, data: Partial<Node>) => {
    setNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, ...data } : node
    ));
  };
  
  const handleConnectionCreate = (connection: Connection) => {
    setConnections([...connections, connection]);
  };
  
  const handleConnectionDelete = (connectionId: string) => {
    setConnections(connections.filter(conn => conn.id !== connectionId));
  };
  
  const handleNodeDelete = (nodeId: string) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
    setConnections(connections.filter(
      conn => conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
    ));
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <Header title="AI Agent Builder" wallet={wallet} />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-mono font-bold">AI Agent Builder</h2>
        <div className="flex space-x-3">
          <BrutalistButton color="green">
            <i className="ri-save-line mr-2"></i> Save Workflow
          </BrutalistButton>
          <BrutalistButton color="purple">
            <i className="ri-play-circle-line mr-2"></i> Deploy Agent
          </BrutalistButton>
        </div>
      </div>
      
      <BrutalistCard className="p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-brutalism-purple border-2 border-black mr-3">
              <i className="ri-flow-chart text-white"></i>
            </div>
            <div>
              <h3 className="font-mono font-bold">Market Analyzer Agent</h3>
              <p className="text-sm text-gray-400">Detects market trends and auto-trades based on signals</p>
            </div>
          </div>
          <div className="flex items-center">
            <BrutalistButton className="mr-2" color="default">
              <i className="ri-download-line mr-1"></i> Import
            </BrutalistButton>
            <BrutalistButton color="default">
              <i className="ri-upload-line mr-1"></i> Export
            </BrutalistButton>
          </div>
        </div>
      </BrutalistCard>
      
      {/* Node Canvas */}
      <NodeCanvas
        nodes={nodes}
        connections={connections}
        onNodeAdd={handleNodeAdd}
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
          <BrutalistCard className="p-4">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brutalism-purple border-2 border-black mr-2">
                <i className="ri-robot-line text-white"></i>
              </div>
              <h4 className="font-mono font-bold">Price Alert Agent</h4>
            </div>
            <p className="text-sm text-gray-400 mb-3">Sends notifications when price moves beyond thresholds</p>
            <div className="flex justify-between">
              <span className="bg-green-800 bg-opacity-30 text-green-400 px-2 py-1 rounded text-xs">Deployed</span>
              <BrutalistButton className="py-1 px-2 text-xs" color="default">
                <i className="ri-edit-line mr-1"></i> Edit
              </BrutalistButton>
            </div>
          </BrutalistCard>
          
          <BrutalistCard className="p-4">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brutalism-purple border-2 border-black mr-2">
                <i className="ri-robot-line text-white"></i>
              </div>
              <h4 className="font-mono font-bold">DCA Bot</h4>
            </div>
            <p className="text-sm text-gray-400 mb-3">Dollar cost average investment on schedule</p>
            <div className="flex justify-between">
              <span className="bg-blue-800 bg-opacity-30 text-blue-400 px-2 py-1 rounded text-xs">Draft</span>
              <BrutalistButton className="py-1 px-2 text-xs" color="default">
                <i className="ri-edit-line mr-1"></i> Edit
              </BrutalistButton>
            </div>
          </BrutalistCard>
        </div>
      </div>
    </div>
  );
};

export default AIAgentBuilder;
