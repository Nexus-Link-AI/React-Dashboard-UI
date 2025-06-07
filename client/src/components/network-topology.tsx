export function NetworkTopology() {
  return (
    <div className="bg-card rounded-xl p-6">
      <h3 className="text-xl font-semibold mb-4">Network Topology</h3>
      <div className="relative h-96 bg-gray-900 rounded-lg overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 800 400">
          {/* Central N Node */}
          <circle cx="400" cy="200" r="30" fill="hsl(217, 91%, 60%)" className="animate-pulse">
            <animate attributeName="r" values="30;35;30" dur="3s" repeatCount="indefinite"/>
          </circle>
          <text x="400" y="205" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">N</text>
          
          {/* Compute Node - Top */}
          <circle cx="400" cy="100" r="20" fill="hsl(20, 90%, 48%)" className="animate-pulse">
            <animate attributeName="fillOpacity" values="1;0.6;1" dur="2s" repeatCount="indefinite"/>
          </circle>
          <line x1="400" y1="120" x2="400" y2="170" stroke="hsl(20, 90%, 48%)" strokeWidth="2" className="network-connection"/>
          <text x="400" y="85" textAnchor="middle" fill="hsl(20, 90%, 48%)" fontSize="12">Compute</text>
          
          {/* RPC Node - Top Right */}
          <circle cx="556" cy="143" r="20" fill="hsl(0, 73%, 41%)" className="animate-pulse">
            <animate attributeName="fillOpacity" values="1;0.6;1" dur="2.2s" repeatCount="indefinite"/>
          </circle>
          <line x1="536" y1="153" x2="425" y2="185" stroke="hsl(0, 73%, 41%)" strokeWidth="2" className="network-connection"/>
          <text x="576" y="138" textAnchor="middle" fill="hsl(0, 73%, 41%)" fontSize="12">RPC</text>
          
          {/* Validator Node - Right */}
          <circle cx="500" cy="200" r="20" fill="hsl(158, 64%, 52%)" className="animate-pulse">
            <animate attributeName="fillOpacity" values="1;0.6;1" dur="3.4s" repeatCount="indefinite"/>
          </circle>
          <line x1="480" y1="200" x2="430" y2="200" stroke="hsl(158, 64%, 52%)" strokeWidth="2" className="network-connection"/>
          <text x="525" y="215" textAnchor="middle" fill="hsl(158, 64%, 52%)" fontSize="12">Validator</text>
          
          {/* Sentry Node - Bottom Right */}
          <circle cx="556" cy="257" r="20" fill="hsl(330, 81%, 60%)" className="animate-pulse">
            <animate attributeName="fillOpacity" values="1;0.6;1" dur="2.4s" repeatCount="indefinite"/>
          </circle>
          <line x1="536" y1="247" x2="425" y2="215" stroke="hsl(330, 81%, 60%)" strokeWidth="2" className="network-connection"/>
          <text x="576" y="275" textAnchor="middle" fill="hsl(330, 81%, 60%)" fontSize="12">Sentry</text>
          
          {/* Oracle Node - Bottom */}
          <circle cx="400" cy="300" r="20" fill="hsl(293, 69%, 49%)" className="animate-pulse">
            <animate attributeName="fillOpacity" values="1;0.6;1" dur="2.6s" repeatCount="indefinite"/>
          </circle>
          <line x1="400" y1="280" x2="400" y2="230" stroke="hsl(293, 69%, 49%)" strokeWidth="2" className="network-connection"/>
          <text x="400" y="325" textAnchor="middle" fill="hsl(293, 69%, 49%)" fontSize="12">Oracle</text>
          
          {/* Data Node - Bottom Left */}
          <circle cx="244" cy="257" r="20" fill="hsl(262, 83%, 58%)" className="animate-pulse">
            <animate attributeName="fillOpacity" values="1;0.6;1" dur="2.8s" repeatCount="indefinite"/>
          </circle>
          <line x1="264" y1="247" x2="375" y2="215" stroke="hsl(262, 83%, 58%)" strokeWidth="2" className="network-connection"/>
          <text x="224" y="275" textAnchor="middle" fill="hsl(262, 83%, 58%)" fontSize="12">Data</text>
          
          {/* Consumer Node - Left */}
          <circle cx="300" cy="200" r="20" fill="hsl(188, 94%, 30%)" className="animate-pulse">
            <animate attributeName="fillOpacity" values="1;0.6;1" dur="3.2s" repeatCount="indefinite"/>
          </circle>
          <line x1="320" y1="200" x2="370" y2="200" stroke="hsl(188, 94%, 30%)" strokeWidth="2" className="network-connection"/>
          <text x="275" y="215" textAnchor="middle" fill="hsl(188, 94%, 30%)" fontSize="12">Consumer</text>
          
          {/* Full Node - Top Left */}
          <circle cx="244" cy="143" r="20" fill="hsl(217, 91%, 60%)" className="animate-pulse">
            <animate attributeName="fillOpacity" values="1;0.6;1" dur="3s" repeatCount="indefinite"/>
          </circle>
          <line x1="264" y1="153" x2="375" y2="185" stroke="hsl(217, 91%, 60%)" strokeWidth="2" className="network-connection"/>
          <text x="224" y="138" textAnchor="middle" fill="hsl(217, 91%, 60%)" fontSize="12">Full</text>
        </svg>
        
        <div className="absolute top-4 right-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live Network Activity</span>
          </div>
          <div className="text-xs">
            Nodes: <span className="text-blue-400 font-semibold">2,688</span>
          </div>
        </div>
      </div>
    </div>
  );
}
