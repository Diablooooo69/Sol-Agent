import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BrutalistCard } from '../ui/brutalist-card';
import { BrutalistButton } from '../ui/brutalist-button';
import { getNodeColor } from '@/lib/utils';

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

interface NodeCanvasProps {
  nodes: Node[];
  connections: Connection[];
  onNodeAdd: (node: Node) => void;
  onNodeUpdate: (nodeId: string, data: Partial<Node>) => void;
  onConnectionCreate: (connection: Connection) => void;
  onConnectionDelete: (connectionId: string) => void;
  onNodeDelete: (nodeId: string) => void;
}

const NodeCanvas: React.FC<NodeCanvasProps> = ({
  nodes,
  connections,
  onNodeAdd,
  onNodeUpdate,
  onConnectionCreate,
  onConnectionDelete,
  onNodeDelete
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [creatingConnection, setCreatingConnection] = useState<{
    sourceNodeId: string;
    sourceOutput: string;
    mousePosition: { x: number; y: number };
  } | null>(null);
  const [zoom, setZoom] = useState(100);

  // Handle node dragging
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    
    if ((e.target as HTMLElement).closest('.node-port')) {
      // Handle port click for connection
      return;
    }
    
    if ((e.target as HTMLElement).closest('.node-header')) {
      setSelectedNode(nodeId);
      setIsDragging(true);
      
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      
      const nodeRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setDragOffset({
        x: e.clientX - nodeRect.left,
        y: e.clientY - nodeRect.top
      });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && selectedNode && canvasRef.current) {
      const node = nodes.find(n => n.id === selectedNode);
      if (!node) return;
      
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const newX = e.clientX - canvasRect.left - dragOffset.x;
      const newY = e.clientY - canvasRect.top - dragOffset.y;
      
      onNodeUpdate(selectedNode, {
        position: {
          x: Math.max(0, newX),
          y: Math.max(0, newY)
        }
      });
    }
    
    if (creatingConnection) {
      setCreatingConnection({
        ...creatingConnection,
        mousePosition: {
          x: e.clientX - (canvasRef.current?.getBoundingClientRect().left || 0),
          y: e.clientY - (canvasRef.current?.getBoundingClientRect().top || 0)
        }
      });
    }
  }, [isDragging, selectedNode, nodes, dragOffset, creatingConnection, onNodeUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setSelectedNode(null);
    setCreatingConnection(null);
  }, []);

  // Set up event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Handle connection creation
  const handlePortMouseDown = (e: React.MouseEvent, nodeId: string, portName: string, isOutput: boolean) => {
    e.stopPropagation();
    
    if (isOutput) {
      // Start creating a connection from this output port
      setCreatingConnection({
        sourceNodeId: nodeId,
        sourceOutput: portName,
        mousePosition: {
          x: e.clientX - (canvasRef.current?.getBoundingClientRect().left || 0),
          y: e.clientY - (canvasRef.current?.getBoundingClientRect().top || 0)
        }
      });
    } else if (creatingConnection) {
      // Complete a connection to this input port
      onConnectionCreate({
        id: `connection-${Date.now()}`,
        sourceNodeId: creatingConnection.sourceNodeId,
        sourceOutput: creatingConnection.sourceOutput,
        targetNodeId: nodeId,
        targetInput: portName
      });
      
      setCreatingConnection(null);
    }
  };

  // Calculate position for each port
  const getPortPosition = (nodeId: string, portName: string, isOutput: boolean) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    
    // This is simplified - in a real implementation, you'd calculate exact positions
    const nodeElement = document.getElementById(`node-${nodeId}`);
    if (!nodeElement) return { x: 0, y: 0 };
    
    const nodeRect = nodeElement.getBoundingClientRect();
    const canvasRect = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    
    // For simplicity, approximate port positions
    const x = node.position.x + (isOutput ? nodeRect.width : 0);
    const y = node.position.y + nodeRect.height / 2;
    
    return { x, y };
  };

  // Generate SVG path for connections
  const generateConnectionPath = (sourcePosition: { x: number; y: number }, targetPosition: { x: number; y: number }) => {
    const dx = targetPosition.x - sourcePosition.x;
    const dy = targetPosition.y - sourcePosition.y;
    const bezierX = Math.abs(dx) * 0.5;
    
    return `M${sourcePosition.x},${sourcePosition.y} C${sourcePosition.x + bezierX},${sourcePosition.y} ${targetPosition.x - bezierX},${targetPosition.y} ${targetPosition.x},${targetPosition.y}`;
  };

  return (
    <BrutalistCard className="mb-6 bg-[#1A1A1A] overflow-hidden relative">
      <div className="flex justify-between items-center p-4 bg-[#2A2A2A] border-b-4 border-black">
        <div className="flex space-x-2">
          <BrutalistButton
            className="py-1 px-3 text-sm"
            color="blue"
          >
            <i className="ri-add-line mr-1"></i> Add Node
          </BrutalistButton>
          <BrutalistButton
            className="py-1 px-3 text-sm"
            color="default"
          >
            <i className="ri-link mr-1"></i> Connect
          </BrutalistButton>
          <BrutalistButton
            className="py-1 px-3 text-sm"
            color="default"
            onClick={() => selectedNode && onNodeDelete(selectedNode)}
          >
            <i className="ri-delete-bin-line mr-1"></i> Delete
          </BrutalistButton>
        </div>
        <div>
          <BrutalistButton
            className="py-1 px-3 text-sm"
            color="default"
          >
            <i className="ri-zoom-in-line mr-1"></i> {zoom}%
          </BrutalistButton>
        </div>
      </div>
      
      <div ref={canvasRef} className="canvas-container h-96 p-4 relative">
        {/* Render nodes */}
        {nodes.map(node => (
          <div
            id={`node-${node.id}`}
            key={node.id}
            className="node brutalist-card p-3 bg-[#2A2A2A]"
            style={{
              top: node.position.y,
              left: node.position.x
            }}
            onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
          >
            <div className={`${getNodeColor(node.type)} py-1 px-2 rounded-sm text-white font-mono text-sm mb-2 flex justify-between items-center node-header`}>
              <span>{node.title}</span>
              <i className="ri-drag-move-line"></i>
            </div>
            
            <div className="p-2 bg-[#1E1E1E] rounded-sm mb-2">
              {Object.entries(node.data).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center mb-1">
                  <span className="text-xs">{key}</span>
                  {typeof value === 'string' ? (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => {
                        const updatedData = { ...node.data, [key]: e.target.value };
                        onNodeUpdate(node.id, { data: updatedData });
                      }}
                      className="brutalist-input text-xs py-1 px-2 w-24 bg-[#333] text-white !border-2"
                    />
                  ) : (
                    <select
                      value={value as string}
                      onChange={(e) => {
                        const updatedData = { ...node.data, [key]: e.target.value };
                        onNodeUpdate(node.id, { data: updatedData });
                      }}
                      className="brutalist-input text-xs py-1 px-2 bg-[#333] text-white !border-2"
                    >
                      <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                      <option value="option3">Option 3</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-between">
              <div className="flex flex-col space-y-2">
                {node.inputs.map(input => (
                  <div 
                    key={input}
                    className="node-port"
                    onMouseDown={(e) => handlePortMouseDown(e, node.id, input, false)}
                  />
                ))}
              </div>
              <div className="flex flex-col space-y-2">
                {node.outputs.map(output => (
                  <div 
                    key={output}
                    className="node-port"
                    onMouseDown={(e) => handlePortMouseDown(e, node.id, output, true)}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
        
        {/* SVG layer for connections */}
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
          {/* Render existing connections */}
          {connections.map(connection => {
            const sourcePosition = getPortPosition(connection.sourceNodeId, connection.sourceOutput, true);
            const targetPosition = getPortPosition(connection.targetNodeId, connection.targetInput, false);
            const path = generateConnectionPath(sourcePosition, targetPosition);
            
            return (
              <path
                key={connection.id}
                d={path}
                className="connector-line"
                stroke="#FFD60A"
                strokeWidth={3}
                fill="none"
              />
            );
          })}
          
          {/* Render currently creating connection */}
          {creatingConnection && (
            <path
              d={generateConnectionPath(
                getPortPosition(creatingConnection.sourceNodeId, creatingConnection.sourceOutput, true),
                creatingConnection.mousePosition
              )}
              className="connector-line connector-line-active"
              stroke="#FF5A5F"
              strokeWidth={3}
              fill="none"
            />
          )}
        </svg>
      </div>
    </BrutalistCard>
  );
};

export default NodeCanvas;
