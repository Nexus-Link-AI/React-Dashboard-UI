import { useQuery } from "@tanstack/react-query";
import { NODE_CONFIG } from "@/lib/constants";
import { useWebSocket } from "@/hooks/use-websocket";
import { useEffect, useState } from "react";

interface NodeStats {
  [key: string]: {
    total: number;
    active: number;
  };
}

export function NodeStatusGrid() {
  const [nodeStats, setNodeStats] = useState<NodeStats>({});
  const { lastMessage } = useWebSocket();

  const { data: initialStats, isLoading } = useQuery({
    queryKey: ["/api/nodes/stats"],
  });

  useEffect(() => {
    if (initialStats) {
      setNodeStats(initialStats);
    }
  }, [initialStats]);

  useEffect(() => {
    if (lastMessage?.type === "live_update" && lastMessage.data?.nodeStats) {
      setNodeStats(lastMessage.data.nodeStats);
    }
  }, [lastMessage]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
            <div className="h-10 w-10 bg-gray-600 rounded-full mb-3"></div>
            <div className="h-4 bg-gray-600 rounded mb-2"></div>
            <div className="h-6 bg-gray-600 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {Object.entries(NODE_CONFIG).map(([type, config]) => {
        const stats = nodeStats[type] || { total: 0, active: 0 };
        const statusColor = stats.active > 0 ? "bg-green-500" : "bg-red-500";

        return (
          <div
            key={type}
            className={`bg-card rounded-xl p-4 border ${config.borderColor} hover:${config.borderColor} transition-all duration-300 hover:scale-105 group`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${config.bgColor} rounded-full flex items-center justify-center text-white group-hover:animate-pulse`}>
                <i className={`fas ${config.icon}`}></i>
              </div>
              <div className={`w-3 h-3 ${statusColor} rounded-full animate-pulse`}></div>
            </div>
            
            <h3 className="font-semibold text-sm mb-1">{config.name}</h3>
            <p className="text-xs text-muted-foreground mb-2">{config.description}</p>
            
            <div className={`${config.textColor} font-bold text-lg`}>
              {stats.active.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              of {stats.total.toLocaleString()} nodes
            </div>
          </div>
        );
      })}
    </div>
  );
}
