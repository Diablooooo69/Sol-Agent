import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BrutalistCard } from '../ui/brutalist-card';
import { BrutalistButton } from '../ui/brutalist-button';
import { BrutalistInput } from '../ui/brutalist-input';
import { getNodeColor } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

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

interface PortDetails {
  nodeId: string;
  portName: string;
  isOutput: boolean;
  position: { x: number; y: number };
}

interface NodeCanvasProps {
  nodes: Node[];
  connections: Connection[];
  onNodeAdd: (node: any) => void;
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
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [creatingConnection, setCreatingConnection] = useState<{
    sourceNodeId: string;
    sourceOutput: string;
    mousePosition: { x: number; y: number };
  } | null>(null);
  const [zoom, setZoom] = useState(100);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [hoveredPort, setHoveredPort] = useState<PortDetails | null>(null);
  const [isScriptEditorOpen, setIsScriptEditorOpen] = useState(false);
  const [currentScript, setCurrentScript] = useState('');
  const [currentScriptNode, setCurrentScriptNode] = useState<string | null>(null);

  // Handle canvas panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Middle mouse button (wheel) for panning
    if (e.button === 1) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - canvasOffset.x,
        y: e.clientY - canvasOffset.y
      });
    }
  };

  // Handle node dragging
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    
    if ((e.target as HTMLElement).closest('.node-port')) {
      // Handle port click for connection
      return;
    }
    
    setSelectedNode(nodeId);
    
    if ((e.target as HTMLElement).closest('.node-header')) {
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

  const handleCanvasMouseMove = useCallback((e: MouseEvent) => {
    // Update canvas position if panning
    if (isDragging && selectedNode === null && e.buttons === 4) {
      setCanvasOffset({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  }, [isDragging, selectedNode, dragOffset]);

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

      // Check if hovering over a valid input port
      const portElement = document.elementFromPoint(e.clientX, e.clientY);
      if (portElement?.classList.contains('node-port-input')) {
        const nodeId = portElement.getAttribute('data-node-id');
        const portName = portElement.getAttribute('data-port-name');
        
        if (nodeId && portName) {
          const rect = portElement.getBoundingClientRect();
          setHoveredPort({
            nodeId,
            portName,
            isOutput: false,
            position: {
              x: rect.left - (canvasRef.current?.getBoundingClientRect().left || 0) + rect.width / 2,
              y: rect.top - (canvasRef.current?.getBoundingClientRect().top || 0) + rect.height / 2
            }
          });
          return;
        }
      }
      
      setHoveredPort(null);
    }
  }, [isDragging, selectedNode, nodes, dragOffset, creatingConnection, onNodeUpdate]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (creatingConnection && hoveredPort) {
      // Complete the connection
      onConnectionCreate({
        id: `connection-${Date.now()}`,
        sourceNodeId: creatingConnection.sourceNodeId,
        sourceOutput: creatingConnection.sourceOutput,
        targetNodeId: hoveredPort.nodeId,
        targetInput: hoveredPort.portName
      });
    }
    
    setIsDragging(false);
    setCreatingConnection(null);
    setHoveredPort(null);
  }, [creatingConnection, hoveredPort, onConnectionCreate]);

  // Set up event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    canvasRef.current?.addEventListener('mousemove', handleCanvasMouseMove as any);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      canvasRef.current?.removeEventListener('mousemove', handleCanvasMouseMove as any);
    };
  }, [handleMouseMove, handleMouseUp, handleCanvasMouseMove]);

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
    
    const portElement = document.querySelector(
      `.node-port-${isOutput ? 'output' : 'input'}[data-node-id="${nodeId}"][data-port-name="${portName}"]`
    );
    
    if (portElement) {
      const rect = portElement.getBoundingClientRect();
      const canvasRect = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
      
      return {
        x: rect.left - canvasRect.left + rect.width / 2,
        y: rect.top - canvasRect.top + rect.height / 2
      };
    }
    
    // Fallback to approximate positions
    const nodeElement = document.getElementById(`node-${nodeId}`);
    if (!nodeElement) return { x: 0, y: 0 };
    
    const nodeRect = nodeElement.getBoundingClientRect();
    const canvasRect = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    
    const x = node.position.x + (isOutput ? nodeRect.width : 0);
    const y = node.position.y + nodeRect.height / 2;
    
    return { x, y };
  };

  // Generate SVG path for connections
  const generateConnectionPath = (sourcePosition: { x: number; y: number }, targetPosition: { x: number; y: number }) => {
    const dx = targetPosition.x - sourcePosition.x;
    const dy = targetPosition.y - sourcePosition.y;
    const bezierX = Math.abs(dx) * 0.75;
    
    return `M${sourcePosition.x},${sourcePosition.y} C${sourcePosition.x + bezierX},${sourcePosition.y} ${targetPosition.x - bezierX},${targetPosition.y} ${targetPosition.x},${targetPosition.y}`;
  };

  // Handle connection selection and deletion
  const handleConnectionClick = (e: React.MouseEvent, connectionId: string) => {
    e.stopPropagation();
    setSelectedConnection(connectionId === selectedConnection ? null : connectionId);
  };

  // Handle zoom in/out
  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 25, 50));
  };

  // Handle script editing
  const handleScriptEdit = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setCurrentScript(node.script || '');
      setCurrentScriptNode(nodeId);
      setIsScriptEditorOpen(true);
    }
  };

  const handleScriptSave = () => {
    if (currentScriptNode) {
      onNodeUpdate(currentScriptNode, { script: currentScript });
      setIsScriptEditorOpen(false);
      
      toast({
        title: "Script Updated",
        description: "Your custom script has been saved to the node.",
      });
    }
  };

  // Test/run a node's script
  const handleRunScript = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !node.script) return;
    
    try {
      // Create a safe execution context with access to node data
      const scriptContext: {
        inputs: Record<string, any>;
        outputs: Record<string, any>;
        data: Record<string, any>;
        log: (message: string) => void;
      } = {
        inputs: {},
        outputs: {},
        data: { ...node.data },
        log: (message: string) => console.log(`[Node ${node.title}]`, message)
      };
      
      // Add input connections
      connections.forEach(conn => {
        if (conn.targetNodeId === nodeId) {
          const sourceNode = nodes.find(n => n.id === conn.sourceNodeId);
          if (sourceNode) {
            scriptContext.inputs[conn.targetInput] = {
              nodeId: sourceNode.id,
              nodeType: sourceNode.type,
              outputName: conn.sourceOutput,
              // In a real implementation, you would use actual values
              value: "Sample input value" 
            };
          }
        }
      });
      
      // Execute script in a function context
      const scriptFn = new Function('context', `
        with (context) {
          try {
            ${node.script}
            return { success: true, outputs };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
      `);
      
      const result = scriptFn(scriptContext);
      
      if (result.success) {
        toast({
          title: "Script executed successfully",
          description: "Check the console for output logs",
        });
      } else {
        toast({
          title: "Script execution failed",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Script execution error",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
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
            onClick={() => selectedConnection && onConnectionDelete(selectedConnection)}
            disabled={!selectedConnection}
          >
            <i className="ri-scissors-line mr-1"></i> Cut Connection
          </BrutalistButton>
          
          <BrutalistButton
            className="py-1 px-3 text-sm"
            color="red"
            onClick={() => selectedNode && onNodeDelete(selectedNode)}
            disabled={!selectedNode}
          >
            <i className="ri-delete-bin-line mr-1"></i> Delete Node
          </BrutalistButton>
        </div>
        
        <div className="flex space-x-2">
          <BrutalistButton
            className="py-1 px-2 text-sm"
            color="default"
            onClick={handleZoomOut}
          >
            <i className="ri-zoom-out-line"></i>
          </BrutalistButton>
          
          <BrutalistButton
            className="py-1 px-3 text-sm"
            color="default"
          >
            {zoom}%
          </BrutalistButton>
          
          <BrutalistButton
            className="py-1 px-2 text-sm"
            color="default"
            onClick={handleZoomIn}
          >
            <i className="ri-zoom-in-line"></i>
          </BrutalistButton>
        </div>
      </div>
      
      <div 
        ref={canvasRef} 
        className="canvas-container h-[500px] p-4 relative overflow-hidden" 
        style={{ 
          backgroundSize: '25px 25px',
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)'
        }}
        onMouseDown={handleCanvasMouseDown}
      >
        <div 
          className="canvas-transform-layer absolute"
          style={{
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom / 100})`,
            transformOrigin: '0 0'
          }}
        >
          {/* SVG layer for connections */}
          <svg 
            width="5000" 
            height="5000" 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              pointerEvents: 'none',
              overflow: 'visible'
            }}
          >
            {/* Render existing connections */}
            {connections.map(connection => {
              const sourcePosition = getPortPosition(connection.sourceNodeId, connection.sourceOutput, true);
              const targetPosition = getPortPosition(connection.targetNodeId, connection.targetInput, false);
              const path = generateConnectionPath(sourcePosition, targetPosition);
              
              const isSelected = connection.id === selectedConnection;
              
              return (
                <g key={connection.id} onClick={(e) => handleConnectionClick(e as any, connection.id)}>
                  <path
                    d={path}
                    className={`connector-line ${isSelected ? 'connector-line-selected' : ''}`}
                    stroke={isSelected ? "#FF5A5F" : "#FFD60A"}
                    strokeWidth={isSelected ? 5 : 3}
                    fill="none"
                    style={{ cursor: 'pointer', pointerEvents: 'all' }}
                  />
                  
                  {/* Small data flow animation dots */}
                  <circle 
                    className="connector-flow-dot" 
                    r="3" 
                    fill="#FFFFFF"
                    opacity="0.8"
                  >
                    <animateMotion 
                      dur="2s" 
                      repeatCount="indefinite" 
                      path={path} 
                    />
                  </circle>
                </g>
              );
            })}
            
            {/* Render currently creating connection */}
            {creatingConnection && (
              <path
                d={generateConnectionPath(
                  getPortPosition(creatingConnection.sourceNodeId, creatingConnection.sourceOutput, true),
                  hoveredPort ? hoveredPort.position : creatingConnection.mousePosition
                )}
                className="connector-line connector-line-active"
                stroke="#FF5A5F"
                strokeWidth={3}
                strokeDasharray={hoveredPort ? "none" : "7,3"}
                fill="none"
              />
            )}
          </svg>
          
          {/* Render nodes */}
          {nodes.map(node => (
            <div
              id={`node-${node.id}`}
              key={node.id}
              className={`node brutalist-card p-3 bg-[#2A2A2A] absolute ${node.id === selectedNode ? 'node-selected' : ''}`}
              style={{
                top: node.position.y,
                left: node.position.x,
                boxShadow: node.id === selectedNode ? '0 0 0 3px #FF5A5F' : 'none',
                width: '240px',
                zIndex: node.id === selectedNode ? 10 : 1
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
            >
              <div 
                className={`py-1 px-2 rounded-sm text-white font-mono text-sm mb-2 flex justify-between items-center node-header`}
                style={{ backgroundColor: getNodeColor(node.type) }}
              >
                <span className="flex items-center">
                  <i className={`${node.type === 'dataSource' ? 'ri-database-line' : 
                                  node.type === 'aiProcessor' ? 'ri-brain-line' : 
                                  node.type === 'action' ? 'ri-settings-line' : 
                                  node.type === 'conditional' ? 'ri-git-branch-line' : 
                                  'ri-function-line'} mr-2`}></i>
                  {node.title}
                </span>
                <i className="ri-drag-move-line cursor-move"></i>
              </div>
              
              <div className="p-2 bg-[#1E1E1E] rounded-sm mb-2 max-h-40 overflow-y-auto scrollbar-thin">
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
                        className="brutalist-input text-xs py-1 px-2 w-28 bg-[#333] text-white !border-2"
                      />
                    ) : typeof value === 'number' ? (
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => {
                          const updatedData = { ...node.data, [key]: parseFloat(e.target.value) };
                          onNodeUpdate(node.id, { data: updatedData });
                        }}
                        className="brutalist-input text-xs py-1 px-2 w-28 bg-[#333] text-white !border-2"
                      />
                    ) : typeof value === 'boolean' ? (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => {
                            const updatedData = { ...node.data, [key]: e.target.checked };
                            onNodeUpdate(node.id, { data: updatedData });
                          }}
                          className="mr-2"
                        />
                        <span className="text-xs">{value ? 'True' : 'False'}</span>
                      </div>
                    ) : (
                      <select
                        value={value as string}
                        onChange={(e) => {
                          const updatedData = { ...node.data, [key]: e.target.value };
                          onNodeUpdate(node.id, { data: updatedData });
                        }}
                        className="brutalist-input text-xs py-1 px-2 w-28 bg-[#333] text-white !border-2"
                      >
                        <option value="option1">Option 1</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                      </select>
                    )}
                  </div>
                ))}
              </div>

              {/* Custom script indicator */}
              {node.script && (
                <div className="text-xs text-brutalism-purple mb-2 flex items-center">
                  <i className="ri-code-line mr-1"></i> Custom Script Attached
                </div>
              )}
              
              {/* Port connections */}
              <div className="flex justify-between mt-3">
                <div className="flex flex-col space-y-2">
                  {node.inputs.map(input => (
                    <div key={input} className="flex items-center">
                      <div 
                        className="node-port node-port-input w-3 h-3 rounded-full bg-brutalism-red mr-2 border border-white cursor-crosshair"
                        data-node-id={node.id}
                        data-port-name={input}
                        onMouseDown={(e) => handlePortMouseDown(e, node.id, input, false)}
                      />
                      <span className="text-xs">{input}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col space-y-2">
                  {node.outputs.map(output => (
                    <div key={output} className="flex items-center">
                      <span className="text-xs">{output}</span>
                      <div 
                        className="node-port node-port-output w-3 h-3 rounded-full bg-brutalism-green ml-2 border border-white cursor-crosshair"
                        data-node-id={node.id}
                        data-port-name={output}
                        onMouseDown={(e) => handlePortMouseDown(e, node.id, output, true)}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Node actions */}
              <div className="flex justify-between mt-3 pt-2 border-t border-gray-700">
                <BrutalistButton
                  className="py-0.5 px-2 text-xs"
                  color="blue"
                  onClick={() => handleScriptEdit(node.id)}
                >
                  <i className="ri-code-line"></i>
                </BrutalistButton>
                
                <BrutalistButton
                  className="py-0.5 px-2 text-xs"
                  color="purple"
                  onClick={() => handleRunScript(node.id)}
                  disabled={!node.script}
                >
                  <i className="ri-play-line"></i>
                </BrutalistButton>
                
                <BrutalistButton
                  className="py-0.5 px-2 text-xs"
                  color="default"
                  onClick={() => {
                    // Duplicate node
                    const newNode = {
                      ...node,
                      id: `node-${Date.now()}`,
                      position: {
                        x: node.position.x + 20,
                        y: node.position.y + 20
                      }
                    };
                    onNodeAdd(newNode);
                  }}
                >
                  <i className="ri-file-copy-line"></i>
                </BrutalistButton>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Script editor dialog */}
      <Dialog open={isScriptEditorOpen} onOpenChange={setIsScriptEditorOpen}>
        <DialogContent className="bg-[#1E1E1E] border-4 border-black max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="font-mono">
              <span className="inline-block px-2 py-1 rounded text-white bg-brutalism-purple">
                <i className="ri-code-line mr-1"></i> Node Script Editor
              </span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-2">
            <div className="bg-[#252525] p-2 rounded-sm mb-2 text-xs">
              <p>Write custom JavaScript code to process this node's data. Use <code>inputs</code> to access incoming data, set <code>outputs</code> for outgoing connections.</p>
            </div>
            
            <textarea
              value={currentScript}
              onChange={(e) => setCurrentScript(e.target.value)}
              className="w-full h-64 bg-[#1A1A1A] text-white font-mono text-sm p-3 border-2 border-[#333] rounded"
              placeholder="// Example:
// Access input data
const inputValue = inputs.data ? inputs.data.value : null;

// Process data
const result = inputValue ? inputValue * 2 : 0;

// Set output
outputs.result = {
  value: result,
  timestamp: new Date().toISOString()
};

// Log for debugging
log('Processing complete! Result: ' + result);"
            />
          </div>
          
          <div className="flex justify-end space-x-3 mt-4">
            <BrutalistButton
              className="py-1 px-3"
              color="default"
              onClick={() => setIsScriptEditorOpen(false)}
            >
              Cancel
            </BrutalistButton>
            
            <BrutalistButton
              className="py-1 px-3"
              color="green"
              onClick={handleScriptSave}
            >
              <i className="ri-save-line mr-1"></i> Save Script
            </BrutalistButton>
          </div>
        </DialogContent>
      </Dialog>
    </BrutalistCard>
  );
};

export default NodeCanvas;
