import React, { useState, useRef, useEffect } from 'react';
import { BrutalistCard } from '../ui/brutalist-card';
import { BrutalistButton } from '../ui/brutalist-button';
import { BrutalistInput } from '../ui/brutalist-input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { getNodeColor } from '@/lib/utils';

export interface NodeTemplate {
  type: string;
  title: string;
  icon: string;
  color: string;
  category: string;
  description: string;
  inputs: string[];
  outputs: string[];
  bidirectional?: string[]; // For ports that can work as both input and output
  data: Record<string, any>;
  script?: string;
  documentation?: string;
  examples?: Array<{title: string, config: Record<string, any>}>;
  gitRepo?: {
    url: string;
    branch: string;
    lastCommit?: string;
    lastUpdated?: Date;
  };
}

interface NodeTemplatesProps {
  templates: NodeTemplate[];
  onAddNode: (template: NodeTemplate) => void;
}

// Component to preview a node's functionality
const NodePreview: React.FC<{template: NodeTemplate}> = ({ template }) => {
  return (
    <div className="py-4">
      <div className="brutalist-card p-3 bg-[#252525] mx-auto max-w-[300px]">
        <div 
          className={`py-1 px-2 rounded-sm text-white font-mono text-sm mb-2 text-center`}
          style={{ backgroundColor: getNodeColor(template.type) }}
        >
          <i className={template.icon}></i> {template.title}
        </div>
        
        <div className="text-xs mb-4 text-gray-300">
          {template.description}
        </div>
        
        <div className="bg-[#1E1E1E] p-3 rounded mb-3">
          <h4 className="text-xs font-mono mb-2 text-gray-400">Configuration</h4>
          {Object.entries(template.data).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center mb-1 text-xs">
              <span>{key}:</span>
              <span className="text-brutalism-blue">{String(value)}</span>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between mb-2">
          <div className="flex flex-col space-y-2">
            <h4 className="text-xs font-mono text-gray-400">Inputs</h4>
            {template.inputs.length > 0 ? (
              template.inputs.map(input => (
                <div key={input} className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-brutalism-red mr-2"></div>
                  <span className="text-xs">{input}</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-gray-500">No inputs</span>
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <h4 className="text-xs font-mono text-gray-400">Outputs</h4>
            {template.outputs.length > 0 ? (
              template.outputs.map(output => (
                <div key={output} className="flex items-center">
                  <span className="text-xs">{output}</span>
                  <div className="w-3 h-3 rounded-full bg-brutalism-green ml-2"></div>
                </div>
              ))
            ) : (
              <span className="text-xs text-gray-500">No outputs</span>
            )}
          </div>
        </div>
        
        {template.bidirectional && template.bidirectional.length > 0 && (
          <div className="mt-3 border-t border-gray-700 pt-3">
            <h4 className="text-xs font-mono text-gray-400 mb-2">Bidirectional Ports</h4>
            <div className="flex flex-wrap gap-2">
              {template.bidirectional.map(port => (
                <div key={port} className="flex items-center bg-[#2A2A2A] px-2 py-0.5 rounded-sm">
                  <div className="w-2 h-2 rounded-full bg-brutalism-purple mr-2"></div>
                  <span className="text-xs">{port}</span>
                  <div className="w-2 h-2 rounded-full bg-brutalism-purple ml-2"></div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {template.gitRepo && (
          <div className="mt-3 border-t border-gray-700 pt-3">
            <h4 className="text-xs font-mono text-gray-400 mb-2 flex items-center">
              <i className="ri-git-branch-line mr-1"></i> Git Repository
            </h4>
            <div className="bg-[#2A2A2A] p-2 rounded-sm text-xs">
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Repository:</span>
                <span className="truncate max-w-[150px]">{template.gitRepo.url}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Branch:</span>
                <span>{template.gitRepo.branch}</span>
              </div>
              {template.gitRepo.lastCommit && (
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">Last Commit:</span>
                  <span>{template.gitRepo.lastCommit}</span>
                </div>
              )}
              {template.gitRepo.lastUpdated && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Updated:</span>
                  <span>{template.gitRepo.lastUpdated.toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {template.script && (
          <div className="mt-3 border-t border-gray-700 pt-3">
            <h4 className="text-xs font-mono mb-1 text-gray-400">Custom Script</h4>
            <div className="bg-[#1A1A1A] p-2 rounded text-xs font-mono overflow-x-auto max-h-20 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-brutalism-purple">{template.script}</pre>
            </div>
          </div>
        )}
      </div>
      
      {template.examples && template.examples.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-mono mb-2">Example Configurations</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {template.examples.map((example, index) => (
              <div key={index} className="brutalist-card p-2 bg-[#2A2A2A]">
                <h5 className="text-xs font-mono mb-1">{example.title}</h5>
                <div className="bg-[#1E1E1E] p-2 rounded text-xs">
                  {Object.entries(example.config).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span>{key}:</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Component for node documentation
const NodeDocumentation: React.FC<{template: NodeTemplate}> = ({ template }) => {
  return (
    <div className="py-2">
      <div className="prose prose-sm prose-invert">
        <div className="text-sm" dangerouslySetInnerHTML={{ __html: template.documentation || 'No documentation available for this node type.' }} />
      </div>
    </div>
  );
};

// Main NodeTemplates component
const NodeTemplates: React.FC<NodeTemplatesProps> = ({
  templates,
  onAddNode
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<NodeTemplate | null>(null);
  
  // Extract unique categories from templates
  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];
  
  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-mono font-bold">Node Template Gallery</h3>
        <div className="flex space-x-2">
          <BrutalistInput
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs text-sm"
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory} className="mb-4">
        <TabsList className="mb-2 bg-[#2A2A2A] p-1 border-2 border-black">
          {categories.map(category => (
            <TabsTrigger 
              key={category} 
              value={category}
              className="data-[state=active]:bg-brutalism-blue data-[state=active]:text-white"
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map(category => (
          <TabsContent key={category} value={category} className="mt-0">
            <ScrollArea className="h-64 border-2 border-black rounded-md bg-[#1A1A1A] p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <Dialog key={template.type}>
                    <BrutalistCard className="p-3 bg-[#2A2A2A] hover:scale-[1.02] transition-transform duration-200">
                      <div 
                        className={`py-1 px-2 rounded-sm text-white font-mono text-sm mb-2 flex items-center justify-between`}
                        style={{ backgroundColor: getNodeColor(template.type) }}
                      >
                        <span><i className={template.icon}></i> {template.title}</span>
                        <span className="text-xs px-2 py-0.5 bg-black bg-opacity-30 rounded">
                          {template.category}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-400 mb-3 line-clamp-2">{template.description}</p>
                      
                      <div className="flex justify-between items-center mb-2 text-xs text-gray-400">
                        <div>Inputs: {template.inputs.length}</div>
                        <div>Outputs: {template.outputs.length}</div>
                        {template.bidirectional && template.bidirectional.length > 0 && (
                          <div className="ml-2 flex items-center">
                            <div className="w-2 h-2 rounded-full bg-brutalism-purple mr-1"></div>
                            <span>Bi: {template.bidirectional.length}</span>
                          </div>
                        )}
                      </div>
                      
                      {template.gitRepo && (
                        <div className="flex items-center text-xs text-gray-400 mb-2 bg-[#222] p-1 rounded-sm">
                          <i className="ri-git-branch-line mr-1 text-brutalism-green"></i>
                          <span className="truncate">{template.gitRepo.url.split('/').slice(-2).join('/')}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between space-x-2 mt-3">
                        <DialogTrigger asChild>
                          <BrutalistButton
                            className="py-1 px-2 text-xs flex-1"
                            color="default"
                            onClick={() => setSelectedTemplate(template)}
                          >
                            Preview
                          </BrutalistButton>
                        </DialogTrigger>
                        <BrutalistButton
                          className="py-1 px-2 text-xs flex-1"
                          color="green"
                          onClick={() => onAddNode(template)}
                        >
                          <i className="ri-add-line mr-1"></i> Add
                        </BrutalistButton>
                      </div>
                    </BrutalistCard>
                    
                    <DialogContent className="bg-[#1E1E1E] border-4 border-black max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="font-mono">
                          <span 
                            className="inline-block px-2 py-1 rounded text-white"
                            style={{ backgroundColor: getNodeColor(template.type) }}
                          >
                            <i className={template.icon}></i> {template.title}
                          </span>
                        </DialogTitle>
                      </DialogHeader>
                      
                      <Tabs defaultValue="preview" className="w-full">
                        <TabsList className="mb-4 bg-[#2A2A2A] p-1 border-2 border-black">
                          <TabsTrigger value="preview">Preview</TabsTrigger>
                          <TabsTrigger value="docs">Documentation</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="preview">
                          {selectedTemplate && <NodePreview template={selectedTemplate} />}
                        </TabsContent>
                        
                        <TabsContent value="docs">
                          {selectedTemplate && <NodeDocumentation template={selectedTemplate} />}
                        </TabsContent>
                      </Tabs>
                      
                      <div className="flex justify-end space-x-2 mt-4">
                        <BrutalistButton
                          className="py-1 px-4"
                          color="green"
                          onClick={() => selectedTemplate && onAddNode(selectedTemplate)}
                        >
                          <i className="ri-add-line mr-1"></i> Add to Canvas
                        </BrutalistButton>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default NodeTemplates;
