import React from 'react';
import { BrutalistCard } from '../ui/brutalist-card';
import { BrutalistButton } from '../ui/brutalist-button';

export interface NodeTemplate {
  type: string;
  title: string;
  icon: string;
  color: string;
  inputs: string[];
  outputs: string[];
  data: Record<string, any>;
}

interface NodeTemplatesProps {
  templates: NodeTemplate[];
  onAddNode: (template: NodeTemplate) => void;
}

const NodeTemplates: React.FC<NodeTemplatesProps> = ({
  templates,
  onAddNode
}) => {
  return (
    <div className="mb-6">
      <h3 className="font-mono font-bold mb-3">Available Nodes</h3>
      <div className="flex overflow-x-auto space-x-4 pb-2">
        {templates.map((template) => (
          <BrutalistCard key={template.type} className="p-3 bg-[#2A2A2A] min-w-[150px]">
            <div 
              className={`bg-${template.color} py-1 px-2 rounded-sm text-white font-mono text-sm mb-2 text-center`}
              style={{ backgroundColor: template.color === 'brutalism-yellow' ? '#FFD60A' : undefined }}
            >
              {template.title}
            </div>
            <div className="flex justify-center space-x-2">
              <BrutalistButton
                className="py-1 px-2 text-xs"
                color="default"
                onClick={() => onAddNode(template)}
              >
                <i className="ri-add-line mr-1"></i> Add
              </BrutalistButton>
            </div>
          </BrutalistCard>
        ))}
      </div>
    </div>
  );
};

export default NodeTemplates;
