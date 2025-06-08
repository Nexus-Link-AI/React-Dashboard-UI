import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Clock, Zap, Shield, TrendingUp, Users, Activity } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Validator {
  id: number;
  validatorId: string;
  nodeId: string;
  stakeAmount: number;
  commitmentDuration: number;
  startTime: string;
  endTime: string;
  uptime: number;
  reputation: number;
  potcScore: number;
  status: string;
  blocksProposed: number;
  blocksValidated: number;
  slashingEvents: number;
}

interface ConsensusRound {
  id: number;
  roundNumber: number;
  proposerValidatorId: string;
  blockHash: string;
  timestamp: string;
  consensusReached: boolean;
  votesFor: number;
  votesAgainst: number;
  roundDuration: number;
  potcThreshold: number;
}

interface ConsensusStats {
  totalRounds: number;
  successfulRounds: number;
  successRate: number;
  currentRound: number;
  topValidators: Validator[];
  isSimulationRunning: boolean;
}

export function PoTCConsensusDashboard() {
  const { data: validators, isLoading: validatorsLoading } = useQuery({
    queryKey: ["/api/validators/active"],
    refetchInterval: 5000,
  });

  const { data: consensusStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/consensus/stats"],
    refetchInterval: 3000,
  });

  const { data: recentRounds, isLoading: roundsLoading } = useQuery({
    queryKey: ["/api/consensus/rounds"],
    refetchInterval: 5000,
  });

  const startConsensusSimulation = async () => {
    try {
      const response = await fetch("/api/consensus/start", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to start consensus");
    } catch (error) {
      console.error("Failed to start consensus simulation:", error);
    }
  };

  const updateValidatorScores = async () => {
    try {
      const response = await fetch("/api/consensus/update-scores", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to update scores");
    } catch (error) {
      console.error("Failed to update validator scores:", error);
    }
  };

  const calculatePotcScore = (validator: Validator): number => {
    const timeWeight = Math.pow(validator.commitmentDuration / (24 * 60), 1.5);
    const stakeWeight = validator.stakeAmount / 10000;
    const uptimeWeight = validator.uptime / 100;
    const reputationWeight = validator.reputation / 100;
    const slashingPenalty = Math.pow(0.9, validator.slashingEvents);
    
    return Math.floor(
      (stakeWeight * timeWeight) * uptimeWeight * reputationWeight * slashingPenalty * 1000
    );
  };

  const getValidatorStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "slashed": return "bg-red-500";
      case "expired": return "bg-gray-500";
      default: return "bg-yellow-500";
    }
  };

  const getCommitmentTimeRemaining = (endTime: string): string => {
    const now = new Date();
    const end = new Date(endTime);
    const diffMs = end.getTime() - now.getTime();
    
    if (diffMs <= 0) return "Expired";
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
  };

  if (validatorsLoading || statsLoading || roundsLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PoTC Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Validators</p>
                <p className="text-2xl font-bold">{Array.isArray(validators) ? validators.length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Consensus Rate</p>
                <p className="text-2xl font-bold">{consensusStats && typeof consensusStats === 'object' && 'successRate' in consensusStats ? (consensusStats as ConsensusStats).successRate.toFixed(1) : '0.0'}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Current Round</p>
                <p className="text-2xl font-bold">{consensusStats && typeof consensusStats === 'object' && 'currentRound' in consensusStats ? (consensusStats as ConsensusStats).currentRound : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rounds</p>
                <p className="text-2xl font-bold">{consensusStats && typeof consensusStats === 'object' && 'totalRounds' in consensusStats ? (consensusStats as ConsensusStats).totalRounds : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            PoTC Consensus Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              onClick={startConsensusSimulation}
              disabled={consensusStats && typeof consensusStats === 'object' && 'isSimulationRunning' in consensusStats ? (consensusStats as ConsensusStats).isSimulationRunning : false}
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              {consensusStats && typeof consensusStats === 'object' && 'isSimulationRunning' in consensusStats && (consensusStats as ConsensusStats).isSimulationRunning ? "Simulation Running..." : "Start Consensus Round"}
            </Button>
            <Button 
              variant="outline" 
              onClick={updateValidatorScores}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Update PoTC Scores
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Validators by PoTC Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Top Validators (PoTC Score)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(validators) && validators.slice(0, 8).map((validator: Validator) => {
                const potcScore = calculatePotcScore(validator);
                const timeRemaining = getCommitmentTimeRemaining(validator.endTime);
                
                return (
                  <div key={validator.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getValidatorStatusColor(validator.status)}`}></div>
                      <div>
                        <p className="font-medium text-sm">{validator.validatorId}</p>
                        <p className="text-xs text-gray-500">
                          {validator.stakeAmount.toLocaleString()} TEMPO • {timeRemaining}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{potcScore.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        {validator.uptime}% uptime • {validator.reputation} rep
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Consensus Rounds */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Consensus Rounds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.isArray(recentRounds) && recentRounds.slice(0, 6).map((round: ConsensusRound) => (
                <div key={round.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">Round #{round.roundNumber}</span>
                      <Badge variant={round.consensusReached ? "default" : "destructive"}>
                        {round.consensusReached ? "Success" : "Failed"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Proposer: {round.proposerValidatorId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {round.votesFor}/{round.votesFor + round.votesAgainst}
                    </p>
                    <p className="text-xs text-gray-500">
                      {round.roundDuration}ms
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PoTC Formula Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Proof of Temporal Commitment (PoTC) Formula</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <p className="font-mono text-sm text-center">
                PoTC Score = (Stake × Time<sup>1.5</sup>) × Uptime × Reputation × Persistence × Anti-Slash
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Time Weight (Exponential)</h4>
                <p className="text-gray-600">Longer commitments get exponentially higher influence through Time<sup>1.5</sup> scaling</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Performance Factors</h4>
                <p className="text-gray-600">Uptime and historical reputation directly multiply the base score</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Persistence & Penalties</h4>
                <p className="text-gray-600">Ongoing commitment bonus, reduced by slashing events (0.9<sup>slashes</sup>)</p>
              </div>
            </div>
            <Separator />
            <div className="text-xs text-gray-500">
              <p><strong>Attack Resistance:</strong> Validators need both stake AND sustained time commitment to gain consensus power.</p>
              <p><strong>Network Security:</strong> 67% consensus threshold with time-weighted voting prevents short-term attacks.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}