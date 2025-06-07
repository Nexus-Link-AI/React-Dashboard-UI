import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";
import { useEffect, useState } from "react";
import type { TrainingJob } from "@shared/schema";

export function NetworkMetrics() {
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const { lastMessage } = useWebSocket();

  const { data: initialJobs, isLoading } = useQuery({
    queryKey: ["/api/training-jobs"],
  });

  const { data: commitmentStats } = useQuery({
    queryKey: ["/api/temporal-commitments/stats"],
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-600 rounded w-1/2 mb-4"></div>
            <div className="h-64 bg-gray-600 rounded"></div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-600 rounded w-1/2 mb-4"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-600 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeJobs = trainingJobs.filter(job => 
    job.status === "training" || job.status === "validating"
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Performance Chart */}
      <div className="bg-card rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Computational Power Over Time</h3>
        <div className="h-64 bg-gray-900 rounded-lg p-4 flex items-end justify-between">
          {/* Mock Chart Bars */}
          <div className="flex items-end space-x-2 h-full w-full">
            {Array.from({ length: 10 }).map((_, i) => {
              const height = Math.random() * 80 + 20;
              const isOrange = i < 5;
              return (
                <div
                  key={i}
                  className={`${isOrange ? 'bg-nexus-orange' : 'bg-nexus-red'} rounded-t transition-all duration-300 hover:scale-110`}
                  style={{ height: `${height}%`, width: '8%' }}
                ></div>
              );
            })}
          </div>
          <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-nexus-orange rounded"></div>
                <span>Compute Power</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-nexus-red rounded"></div>
                <span>Network Load</span>
              </div>
            </div>
          </div>
        </div>

        {/* Network Stats */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {commitmentStats?.totalComputationalPower 
                ? (commitmentStats.totalComputationalPower / 1000).toFixed(1) 
                : "847.3"} TH/s
            </div>
            <div className="text-xs text-muted-foreground">Network Power</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {commitmentStats?.active || 1089}
            </div>
            <div className="text-xs text-muted-foreground">Active Commitments</div>
          </div>
        </div>
      </div>
      
      {/* Active Jobs */}
      <div className="bg-card rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Active Training Jobs</h3>
        <div className="space-y-4">
          {activeJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active training jobs
            </div>
          ) : (
            activeJobs.map((job) => {
              const statusColor = getJobStatusColor(job.status);
              const borderColor = getJobBorderColor(job.status);
              
              return (
                <div key={job.id} className={`bg-gray-800 rounded-lg p-4 border-l-4 ${borderColor}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm">{job.name}</h4>
                    <span className={`text-xs px-2 py-1 ${statusColor} bg-opacity-20 rounded`}>
                      {job.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Job ID: <span>{job.jobId}</span> | Started: <span>{formatTimeAgo(job.startTime)}</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        job.status === "training" ? "bg-blue-500 animate-pulse" : "bg-purple-500"
                      }`}
                      style={{ width: `${job.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Progress: <span className={statusColor.replace('bg-', 'text-')}>{job.progress}%</span>
                    </span>
                    <span className="text-muted-foreground">
                      Step: <span className="text-green-400">{job.currentStep}/38</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function getJobStatusColor(status: string): string {
  switch (status) {
    case "training": return "text-blue-400";
    case "validating": return "text-orange-400";
    case "completed": return "text-green-400";
    case "queued": return "text-cyan-400";
    default: return "text-gray-400";
  }
}

function getJobBorderColor(status: string): string {
  switch (status) {
    case "training": return "border-blue-500";
    case "validating": return "border-orange-500";
    case "completed": return "border-green-500";
    case "queued": return "border-cyan-500";
    default: return "border-gray-500";
  }
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
