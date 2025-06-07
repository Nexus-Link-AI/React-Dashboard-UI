import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";

interface TerminalLine {
  type: "command" | "output" | "prompt";
  content: string;
  timestamp: Date;
}

export function CLISimulator() {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      type: "output",
      content: '<div class="text-blue-400">Welcome to NexusLinkAI CLI v2.1.0</div><div class="text-green-400">Type "help" for available commands</div>',
      timestamp: new Date(),
    },
  ]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    // Auto-focus the input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleTerminalClick = () => {
    if (inputRef.current && !isExecuting) {
      inputRef.current.focus();
    }
  };

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    setIsExecuting(true);
    
    // Add command to terminal
    setLines(prev => [...prev, {
      type: "command",
      content: `nexus@cli:~$ ${command}`,
      timestamp: new Date(),
    }]);

    try {
      const parts = command.trim().split(" ");
      const mainCommand = parts[0];
      const args = parts.slice(1);

      let output = "";

      if (mainCommand === "help") {
        output = getHelpOutput();
      } else if (mainCommand === "clear") {
        setLines([]);
        setIsExecuting(false);
        return;
      } else {
        // Send command to backend
        const response = await fetch("/api/cli/execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            command: mainCommand,
            args,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        output = data.output || `<div class="text-yellow-400">Command executed but no output received</div>`;
      }

      // Add output to terminal
      setLines(prev => [...prev, {
        type: "output", 
        content: output,
        timestamp: new Date(),
      }]);

    } catch (error) {
      console.error("CLI command error:", error);
      const errorMessage = error instanceof Error ? error.message : "Command execution failed";
      setLines(prev => [...prev, {
        type: "output",
        content: `<div class="text-red-400">Error: ${errorMessage}</div>`,
        timestamp: new Date(),
      }]);
    }

    setIsExecuting(false);
    setCurrentCommand("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isExecuting) {
      executeCommand(currentCommand);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      // Could implement command history here
    }
  };

  const runSimulation = () => {
    executeCommand("potc commit --nodes compute --duration 4h");
  };

  const clearTerminal = () => {
    setLines([]);
  };

  const showNodeStatus = () => {
    executeCommand("node status --all");
  };

  return (
    <div className="bg-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Proof of Temporal Commitment - CLI Simulator</h2>
        <div className="flex space-x-2">
          <Button 
            onClick={runSimulation}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={isExecuting}
          >
            <i className="fas fa-play mr-2"></i>Run Simulation
          </Button>
          <Button 
            onClick={showNodeStatus}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isExecuting}
          >
            <i className="fas fa-network-wired mr-2"></i>Node Status
          </Button>
          <Button 
            onClick={clearTerminal}
            variant="outline"
            disabled={isExecuting}
          >
            <i className="fas fa-trash mr-2"></i>Clear
          </Button>
        </div>
      </div>

      <div 
        className="bg-black rounded-lg p-4 h-96 overflow-y-auto terminal-text cursor-text" 
        ref={terminalRef}
        onClick={handleTerminalClick}
      >
        {lines.map((line, index) => (
          <div 
            key={index}
            className={
              line.type === "command" ? "text-green-400 mt-2" :
              line.type === "output" ? "text-white mt-1" : 
              "text-green-400"
            }
            dangerouslySetInnerHTML={{ __html: line.content }}
          />
        ))}
        
        {/* Command Input */}
        <div className="flex items-center mt-2">
          <span className="text-green-400 mr-2">nexus@cli:~$</span>
          <input
            ref={inputRef}
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyPress}
            className="bg-transparent border-none text-white flex-1 p-0 focus:outline-none focus:ring-0 terminal-text"
            placeholder={isExecuting ? "Executing..." : "Enter command..."}
            disabled={isExecuting}
            autoFocus
            style={{ outline: 'none', boxShadow: 'none' }}
          />
          {isExecuting && <span className="text-white animate-pulse ml-2">█</span>}
        </div>
      </div>

      {/* Command Reference */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-3">
          <h4 className="text-sm font-semibold mb-2 text-blue-400">Node Commands</h4>
          <div className="text-xs space-y-1 text-gray-300">
            <div><code className="text-green-400">node status</code> - View all node statuses</div>
            <div><code className="text-green-400">node logs [id]</code> - View node logs</div>
            <div><code className="text-green-400">node start [type]</code> - Start node type</div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-3">
          <h4 className="text-sm font-semibold mb-2 text-orange-400">Training Commands</h4>
          <div className="text-xs space-y-1 text-gray-300">
            <div><code className="text-green-400">training submit</code> - Submit training job</div>
            <div><code className="text-green-400">training status</code> - Check training progress</div>
            <div><code className="text-green-400">training logs [id]</code> - View training logs</div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-3">
          <h4 className="text-sm font-semibold mb-2 text-purple-400">PoTC Commands</h4>
          <div className="text-xs space-y-1 text-gray-300">
            <div><code className="text-green-400">potc status</code> - View temporal commitments</div>
            <div><code className="text-green-400">potc commit --duration 8h</code> - Create commitment</div>
            <div><code className="text-green-400">potc history</code> - View commitment history</div>
            <div><code className="text-green-400">potc validate</code> - Run validation process</div>
            <div><code className="text-green-400">potc benchmark</code> - Network performance test</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getHelpOutput(): string {
  return `<div class="text-blue-400">═══════════════ NEXUSLINKAI CLI HELP ═══════════════</div>
    <div class="mt-2">
      <div class="text-green-400 font-semibold">Available Commands:</div>
      <div class="mt-2 space-y-1">
        <div><span class="text-orange-400">node</span> <span class="text-gray-400">status|logs|start</span> - Node management</div>
        <div><span class="text-orange-400">training</span> <span class="text-gray-400">submit|status|logs</span> - Training job management</div>
        <div><span class="text-orange-400">potc</span> <span class="text-gray-400">status|commit|history</span> - Temporal commitment management</div>
        <div><span class="text-orange-400">clear</span> - Clear terminal</div>
        <div><span class="text-orange-400">help</span> - Show this help message</div>
      </div>
      <div class="mt-3 text-gray-400">
        Example: <span class="text-green-400">node status --all</span>
      </div>
    </div>`;
}
