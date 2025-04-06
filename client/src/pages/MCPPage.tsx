import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import { useWallet } from '@/lib/walletAdapter';
import { BrutalistCard } from '@/components/ui/brutalist-card';
import { ExternalLink, Server, Code, Shield, Award, Globe } from 'lucide-react';

interface MCPEntry {
  name: string;
  description: string;
  url: string;
  category: string;
  license?: string;
  security?: string;
  quality?: string;
  official?: boolean;
  language?: string;
}

interface FilterOption {
  id: string;
  label: string;
  count: number;
}

const MCPPage: React.FC = () => {
  const { wallet } = useWallet();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  // Source data from https://github.com/modelcontextprotocol/servers
  const mcpData: MCPEntry[] = [
    // MCP Tools
    {
      name: "queryApi",
      description: "MCP Server for query API operations with Axiom.js integration",
      url: "https://github.com/modelcontextprotocol/mcp-server-axiom-js",
      category: "Tools",
      language: "TypeScript"
    },
    {
      name: "calculate_expression",
      description: "MCP Calculate Server for mathematical expression evaluation",
      url: "https://github.com/modelcontextprotocol/calculate-server",
      category: "Tools",
      language: "TypeScript"
    },
    {
      name: "sequentialthinking_tools",
      description: "MCP Sequential Thinking Tools for step-by-step reasoning",
      url: "https://github.com/modelcontextprotocol/sequentialthinking-tools",
      category: "Tools",
      language: "TypeScript"
    },
    {
      name: "mcp-sequentialthinking-tools",
      description: "Additional tools for sequential thinking with MCP integration",
      url: "https://github.com/modelcontextprotocol/mcp-sequentialthinking-tools",
      category: "Tools",
      language: "TypeScript"
    },
    {
      name: "geminithinking",
      description: "Gemini Thinking Server for Google Gemini model integration",
      url: "https://github.com/modelcontextprotocol/geminithinking-server",
      category: "Tools",
      language: "TypeScript"
    },
    {
      name: "update_workflow",
      description: "Unstructured API MCP Server for workflow updates",
      url: "https://github.com/modelcontextprotocol/update-workflow-server",
      category: "Tools",
      language: "Python"
    },
    
    // MCP Servers
    {
      name: "Azure MCP Server",
      description: "Enables natural language interaction with Azure services through Claude, Bedrock, supporting resource management, error handling, and tenant selection with secure authentication.",
      url: "https://github.com/modelcontextprotocol/azure-mcp-server",
      category: "Servers",
      license: "MIT License",
      security: "high",
      quality: "high",
      official: true,
      language: "TypeScript"
    },
    {
      name: "Upstash MCP Server",
      description: "Model Context Protocol (MCP) is a new, standardized protocol for managing context between large language models (LLMs) and external systems. In this repository, we provide an installer as well as an MCP Server for Upstash Developer API's.",
      url: "https://github.com/modelcontextprotocol/upstash-mcp-server",
      category: "Servers",
      license: "MIT License",
      security: "high",
      quality: "high",
      official: true,
      language: "TypeScript"
    },
    {
      name: "Doppler MCP Server",
      description: "MCP Server for interacting with Doppler secrets management services.",
      url: "https://github.com/modelcontextprotocol/doppler-mcp-server",
      category: "Servers",
      license: "MIT License",
      security: "high",
      quality: "high",
      language: "TypeScript"
    },
    {
      name: "GitHub MCP Server",
      description: "MCP Server for GitHub integration that allows language models to interact with GitHub repositories, issues, and PRs.",
      url: "https://github.com/modelcontextprotocol/github-mcp-server",
      category: "Servers",
      license: "MIT License",
      security: "high",
      quality: "high",
      language: "TypeScript"
    },
    
    // Core Components
    {
      name: "MCP Protocol",
      description: "Core specifications and standards for the Model Context Protocol",
      url: "https://github.com/modelcontextprotocol/protocol",
      category: "Core",
      official: true,
      language: "Documentation"
    },
    {
      name: "MCP CLI Tool",
      description: "Command-line interface for working with MCP servers and tools",
      url: "https://github.com/modelcontextprotocol/mcp-cli",
      category: "Core",
      official: true,
      language: "TypeScript"
    },
    {
      name: "MCP SDK",
      description: "Software development kit for building applications with MCP",
      url: "https://github.com/modelcontextprotocol/mcp-sdk",
      category: "Core",
      official: true,
      language: "TypeScript"
    }
  ];

  // Filter types based on count
  const filterTypes: FilterOption[] = [
    { id: 'all', label: 'All', count: mcpData.length },
    { id: 'official', label: 'Official', count: mcpData.filter(item => item.official).length },
    { id: 'local', label: 'Local', count: mcpData.filter(item => item.category === 'Tools').length },
    { id: 'remote', label: 'Remote', count: mcpData.filter(item => item.category === 'Servers').length },
    { id: 'hybrid', label: 'Hybrid', count: mcpData.filter(item => item.category === 'Core').length },
    { id: 'typescript', label: 'TypeScript', count: mcpData.filter(item => item.language === 'TypeScript').length },
    { id: 'python', label: 'Python', count: mcpData.filter(item => item.language === 'Python').length }
  ];

  // Filter data based on search query and selected type
  const filteredData = mcpData.filter(item => {
    const matchesSearch = searchQuery === '' || 
                         item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesType = true;
    if (selectedType !== 'all') {
      if (selectedType === 'official') {
        matchesType = !!item.official;
      } else if (selectedType === 'local') {
        matchesType = item.category === 'Tools';
      } else if (selectedType === 'remote') {
        matchesType = item.category === 'Servers';
      } else if (selectedType === 'hybrid') {
        matchesType = item.category === 'Core';
      } else if (selectedType === 'typescript') {
        matchesType = item.language === 'TypeScript';
      } else if (selectedType === 'python') {
        matchesType = item.language === 'Python';
      }
    }
    
    return matchesSearch && matchesType;
  });

  // Group filtered data by category
  const groupedData: Record<string, MCPEntry[]> = {};
  filteredData.forEach(item => {
    if (!groupedData[item.category]) {
      groupedData[item.category] = [];
    }
    groupedData[item.category].push(item);
  });

  // Generate badge for specified type
  const renderBadge = (type: string, value?: string) => {
    if (!value) return null;
    
    let color, icon;
    
    if (type === 'license') {
      color = 'bg-blue-100 text-blue-800';
      icon = <Award className="h-3 w-3 mr-1" />;
    } else if (type === 'security') {
      color = 'bg-green-100 text-green-800';
      icon = <Shield className="h-3 w-3 mr-1" />;
    } else if (type === 'quality') {
      color = 'bg-purple-100 text-purple-800';
      icon = <Award className="h-3 w-3 mr-1" />;
    } else if (type === 'official') {
      color = 'bg-indigo-100 text-indigo-800';
      icon = <Globe className="h-3 w-3 mr-1" />;
    } else if (type === 'language') {
      color = 'bg-gray-100 text-gray-800';
      icon = <Code className="h-3 w-3 mr-1" />;
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${color}`}>
        {icon}
        {value}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Header title="MCP Library" wallet={wallet} />
      
      {/* Search and Filter */}
      <div className="mb-8">
        <div className="flex flex-col gap-4">
          {/* Search input */}
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search MCP servers, tools, or keywords..."
              className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          
          {/* Filter options - styled like the reference image */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {filterTypes.map((filter) => (
              <button
                key={filter.id}
                className={`px-3 py-2 flex justify-between items-center border-4 rounded-md transition-colors ${
                  selectedType === filter.id 
                    ? 'border-purple-600 bg-purple-50' 
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
                onClick={() => setSelectedType(filter.id)}
              >
                <span className="font-mono font-bold">{filter.label}</span>
                <span className="ml-2 bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Matching MCP tools heading */}
      <div className="mb-4 text-gray-500 text-sm">
        Matching MCP {selectedType === 'remote' ? 'servers' : 'tools'}:
      </div>
      
      {/* Content */}
      {Object.keys(groupedData).length > 0 ? (
        Object.entries(groupedData).map(([category, items]) => (
          <div key={category} className="mb-12">
            <h2 className="text-xl font-mono font-bold mb-4 border-b-2 border-gray-200 pb-2">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => (
                <BrutalistCard 
                  key={item.name} 
                  className="p-4 border-4 border-black h-full flex flex-col"
                  hover={true}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center ${
                      item.category === 'Servers' ? 'bg-blue-100' : 
                      item.category === 'Tools' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {item.category === 'Servers' ? (
                        <Server className="h-5 w-5 text-blue-700" />
                      ) : item.category === 'Tools' ? (
                        <Code className="h-5 w-5 text-green-700" />
                      ) : (
                        <Shield className="h-5 w-5 text-purple-700" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold">{item.name}</h3>
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      <p className="text-gray-600 text-sm mt-1 mb-3">{item.description}</p>
                      
                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {item.official && renderBadge('official', 'Official')}
                        {item.license && renderBadge('license', item.license)}
                        {item.security && renderBadge('security', 'Security')}
                        {item.quality && renderBadge('quality', 'Quality')}
                        {item.language && renderBadge('language', item.language)}
                      </div>
                    </div>
                  </div>
                </BrutalistCard>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-16 border-4 border-dashed border-gray-300 rounded-lg">
          <h3 className="text-2xl font-bold mb-2">No results found</h3>
          <p className="text-gray-600">Try adjusting your search query or filters</p>
        </div>
      )}
      
      {/* Resources */}
      <div className="mt-12 mb-8">
        <h2 className="text-xl font-mono font-bold mb-4 border-b-2 border-gray-200 pb-2">Related Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BrutalistCard className="p-6 border-4 border-black">
            <h3 className="text-lg font-bold mb-2">MCP Documentation</h3>
            <p className="text-gray-600 mb-4">
              Learn more about the Model Context Protocol and how to use it in your applications.
            </p>
            <a 
              href="https://github.com/modelcontextprotocol/protocol" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600"
            >
              <span>Read the docs</span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </BrutalistCard>
          
          <BrutalistCard className="p-6 border-4 border-black">
            <h3 className="text-lg font-bold mb-2">Getting Started</h3>
            <p className="text-gray-600 mb-4">
              Follow step-by-step tutorials to build your first application with MCP.
            </p>
            <a 
              href="https://github.com/modelcontextprotocol/servers" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600"
            >
              <span>View tutorials</span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </BrutalistCard>
          
          <BrutalistCard className="p-6 border-4 border-black">
            <h3 className="text-lg font-bold mb-2">Developer Community</h3>
            <p className="text-gray-600 mb-4">
              Join the MCP developer community to connect with other builders.
            </p>
            <a 
              href="https://github.com/modelcontextprotocol" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600"
            >
              <span>Join community</span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </BrutalistCard>
        </div>
      </div>
      
      {/* Footer note */}
      <div className="mt-8 p-4 bg-gray-100 border-2 border-gray-300 rounded-md text-sm text-gray-600">
        <p>
          <strong>Note:</strong> This page compiles information about Model Context Protocol (MCP) servers and tools from GitHub for educational purposes. 
          The content may not represent the latest developments. 
          Always refer to the original sources for the most up-to-date information.
        </p>
      </div>
    </div>
  );
};

export default MCPPage;