import { NodeStatusGrid } from "@/components/node-status-grid";
import { NetworkTopology } from "@/components/network-topology";
import { TrainingProcessFlow } from "@/components/training-process-flow";
import { CLISimulator } from "@/components/cli-simulator";
import { NetworkMetrics } from "@/components/network-metrics";
import { WhitepaperSection } from "@/components/whitepaper-section";
import { useWebSocket } from "@/hooks/use-websocket";
import logoPath from "@assets/file_00000000e78061f5a4384f2375398923_1749325359882.png";

export default function Dashboard() {
  const { isConnected } = useWebSocket();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            {/* NexusLinkAI Logo */}
            <div className="relative">
              <img 
                src={logoPath} 
                alt="NexusLinkAI Logo" 
                className="w-12 h-12 object-contain animate-pulse-slow"
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-bounce-slow"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">NexusLinkAI</h1>
              <p className="text-sm text-muted-foreground">Decentralized AI/ML Training Marketplace</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Network Status</div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`font-semibold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border min-h-screen">
          <nav className="p-4 space-y-2">
            <button onClick={() => scrollToSection('overview')} className="flex items-center space-x-3 px-4 py-3 bg-primary bg-opacity-20 text-primary rounded-lg w-full text-left">
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </button>
            <button onClick={() => scrollToSection('overview')} className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-muted rounded-lg transition-colors w-full text-left">
              <i className="fas fa-network-wired"></i>
              <span>Node Network</span>
            </button>
            <button onClick={() => scrollToSection('training-flow')} className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-muted rounded-lg transition-colors w-full text-left">
              <i className="fas fa-brain"></i>
              <span>Training Jobs</span>
            </button>
            <button onClick={() => scrollToSection('cli-simulator')} className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-muted rounded-lg transition-colors w-full text-left">
              <i className="fas fa-clock"></i>
              <span>Temporal Commitments</span>
            </button>
            <button onClick={() => scrollToSection('cli-simulator')} className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-muted rounded-lg transition-colors w-full text-left">
              <i className="fas fa-terminal"></i>
              <span>CLI Simulator</span>
            </button>
            <button onClick={() => scrollToSection('metrics')} className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-muted rounded-lg transition-colors w-full text-left">
              <i className="fas fa-chart-line"></i>
              <span>Analytics</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Network Overview */}
          <section id="overview" className="mb-8">
            <h2 className="text-3xl font-bold mb-6">Network Overview</h2>
            
            {/* Node Status Grid */}
            <div className="mb-8">
              <NodeStatusGrid />
            </div>

            {/* Network Topology Visualization */}
            <NetworkTopology />
          </section>

          {/* Training Process Flow */}
          <section id="training-flow" className="mb-8">
            <TrainingProcessFlow />
          </section>

          {/* PoTC CLI Simulator */}
          <section id="cli-simulator" className="mb-8">
            <CLISimulator />
          </section>

          {/* Network Metrics */}
          <section id="metrics" className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Network Performance Metrics</h2>
            <NetworkMetrics />
          </section>

          {/* Whitepaper & Documentation */}
          <section id="documentation" className="mb-8">
            <WhitepaperSection />
          </section>
        </main>
      </div>
    </div>
  );
}
