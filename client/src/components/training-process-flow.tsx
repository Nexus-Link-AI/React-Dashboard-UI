import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";
import { useEffect, useState } from "react";
import { PHASE_CONFIG } from "@/lib/constants";
import type { TrainingJob } from "@shared/schema";

export function TrainingProcessFlow() {
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const { lastMessage } = useWebSocket();

  const { data: initialJobs, isLoading } = useQuery({
    queryKey: ["/api/training-jobs"],
  });

  useEffect(() => {
    if (initialJobs) {
      setTrainingJobs(initialJobs);
    }
  }, [initialJobs]);

  useEffect(() => {
    if (lastMessage?.type === "live_update" && lastMessage.data?.trainingJobs) {
      setTrainingJobs(lastMessage.data.trainingJobs);
    }
  }, [lastMessage]);

  const activeJob = trainingJobs.find(job => job.status === "training") || trainingJobs[0];

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-600 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!activeJob) {
    return (
      <div className="bg-card rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6">Training Process Flow</h2>
        <div className="text-center py-8 text-muted-foreground">
          No active training jobs found
        </div>
      </div>
    );
  }

  const getPhaseProgress = (phaseIndex: number) => {
    const currentStep = activeJob.currentStep;
    
    switch (phaseIndex) {
      case 0: return currentStep > 11 ? 100 : Math.min(100, (currentStep / 11) * 100);
      case 1: return currentStep > 15 ? 100 : currentStep > 11 ? ((currentStep - 11) / 4) * 100 : 0;
      case 2: return currentStep > 19 ? 100 : currentStep > 15 ? ((currentStep - 15) / 4) * 100 : 0;
      case 3: return currentStep > 19 ? ((currentStep - 19) / 19) * 100 : 0;
      default: return 0;
    }
  };

  const getPhaseStatus = (phaseIndex: number) => {
    const progress = getPhaseProgress(phaseIndex);
    if (progress === 100) return { status: "completed", color: "text-green-400" };
    if (progress > 0) return { status: "in_progress", color: "text-orange-400" };
    return { status: "pending", color: "text-gray-500" };
  };

  return (
    <div className="bg-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">38-Step Training Process Flow</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Phase:</span>
            <span className="text-blue-400 font-semibold ml-1">
              {activeJob.currentPhase.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Step:</span>
            <span className="text-green-400 font-semibold ml-1">
              {activeJob.currentStep}/38
            </span>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Current Job: {activeJob.name}</h3>
        
        {/* Process Phases */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {PHASE_CONFIG.map((phase, index) => {
            const progress = getPhaseProgress(index);
            const { status, color } = getPhaseStatus(index);
            const isActive = status === "in_progress";
            
            return (
              <div 
                key={index}
                className={`bg-gray-800 rounded-lg p-4 border-l-4 border-${phase.color} ${isActive ? 'process-step active' : ''}`}
              >
                <h4 className="font-semibold text-sm mb-2">{phase.name}</h4>
                <div className="text-xs text-muted-foreground mb-2">Steps {phase.steps}</div>
                <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                  <div 
                    className={`bg-${phase.color} h-2 rounded-full transition-all duration-300 ${isActive ? 'animate-pulse' : ''}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className={`text-xs ${color} font-medium`}>
                  {status === "completed" ? "Completed" : 
                   status === "in_progress" ? "In Progress" : "Pending"}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Current Step Details */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-orange-400">
            Step {activeJob.currentStep}: {getCurrentStepDescription(activeJob.currentStep)}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-sm">
              <div className="text-muted-foreground mb-1">Training Progress:</div>
              <div className="text-orange-400 font-semibold">{activeJob.progress}%</div>
            </div>
            <div className="text-sm">
              <div className="text-muted-foreground mb-1">Current Phase:</div>
              <div className="text-blue-400 font-semibold">
                {activeJob.currentPhase.replace(/_/g, ' ')}
              </div>
            </div>
            <div className="text-sm">
              <div className="text-muted-foreground mb-1">Started:</div>
              <div className="text-green-400 font-semibold">
                {formatTimeAgo(activeJob.startTime)}
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-xs text-muted-foreground mb-2">Training Progress</div>
            <div className="w-full bg-gray-600 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full animate-pulse transition-all duration-300"
                style={{ width: `${activeJob.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCurrentStepDescription(step: number): string {
  const stepDescriptions = {
    1: "Consumer nodes receive training request",
    2: "RPC nodes process request routing", 
    3: "Data nodes prepare training dataset",
    4: "Oracle nodes establish connections",
    5: "Validator nodes verify parameters",
    6: "Full nodes record blockchain state",
    7: "Sentry nodes begin monitoring",
    8: "Compute nodes submit temporal commitments",
    9: "PoTC consensus locks resources",
    10: "Sentry nodes verify commitment proofs",
    11: "Validator nodes approve resources",
    12: "Data nodes shard training dataset",
    13: "Oracle nodes inject real-time feeds",
    14: "Full nodes distribute data shards",
    15: "Compute nodes receive data shards",
    16: "Compute nodes begin parallel training",
    17: "Temporal commitment protocol active",
    18: "Generate gradient updates",
    19: "Full nodes aggregate results",
    20: "Validator nodes verify progress",
    // ... add more step descriptions as needed
  };
  
  return stepDescriptions[step] || `Training step ${step}`;
}

function formatTimeAgo(date: Date | string | null): string {
  if (!date) return "Unknown";
  
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours > 0) {
    return `${diffHours}h ${diffMins}m ago`;
  }
  return `${diffMins}m ago`;
}
