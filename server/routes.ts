import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertTrainingJobSchema, insertTemporalCommitmentSchema, nodeTypes } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  app.get("/api/nodes", async (req, res) => {
    try {
      const nodes = await storage.getNodes();
      res.json(nodes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch nodes" });
    }
  });

  app.get("/api/nodes/stats", async (req, res) => {
    try {
      const nodeStats = {};
      for (const type of nodeTypes) {
        const nodes = await storage.getNodesByType(type);
        nodeStats[type] = {
          total: nodes.length,
          active: nodes.filter(n => n.status === "active").length,
        };
      }
      res.json(nodeStats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch node stats" });
    }
  });

  app.get("/api/training-jobs", async (req, res) => {
    try {
      const jobs = await storage.getTrainingJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch training jobs" });
    }
  });

  app.post("/api/training-jobs", async (req, res) => {
    try {
      const validatedData = insertTrainingJobSchema.parse(req.body);
      const job = await storage.createTrainingJob(validatedData);
      
      // Broadcast to WebSocket clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "training_job_created",
            data: job
          }));
        }
      });
      
      res.status(201).json(job);
    } catch (error) {
      res.status(400).json({ error: "Invalid training job data" });
    }
  });

  app.get("/api/temporal-commitments", async (req, res) => {
    try {
      const commitments = await storage.getTemporalCommitments();
      res.json(commitments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch temporal commitments" });
    }
  });

  app.get("/api/temporal-commitments/stats", async (req, res) => {
    try {
      const allCommitments = await storage.getTemporalCommitments();
      const activeCommitments = await storage.getActiveTemporalCommitments();
      
      const stats = {
        total: allCommitments.length,
        active: activeCommitments.length,
        expired: allCommitments.length - activeCommitments.length,
        averageDuration: allCommitments.reduce((sum, c) => sum + c.commitmentDuration, 0) / allCommitments.length,
        totalComputationalPower: activeCommitments.reduce((sum, c) => sum + c.computationalPower, 0)
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch commitment stats" });
    }
  });

  app.post("/api/temporal-commitments", async (req, res) => {
    try {
      const validatedData = insertTemporalCommitmentSchema.parse(req.body);
      const commitment = await storage.createTemporalCommitment(validatedData);
      
      // Broadcast to WebSocket clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "temporal_commitment_created",
            data: commitment
          }));
        }
      });
      
      res.status(201).json(commitment);
    } catch (error) {
      res.status(400).json({ error: "Invalid temporal commitment data" });
    }
  });

  app.get("/api/network-metrics", async (req, res) => {
    try {
      const metrics = await storage.getLatestNetworkMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch network metrics" });
    }
  });

  // CLI Commands
  app.post("/api/cli/execute", async (req, res) => {
    try {
      const { command, args } = req.body;
      
      let output = "";
      
      switch (command) {
        case "node":
          if (args[0] === "status") {
            const nodeStats = {};
            for (const type of nodeTypes) {
              const nodes = await storage.getNodesByType(type);
              nodeStats[type] = {
                total: nodes.length,
                active: nodes.filter(n => n.status === "active").length,
              };
            }
            output = formatNodeStatus(nodeStats);
          }
          break;
          
        case "potc":
          if (args[0] === "status") {
            const commitmentStats = await storage.getActiveTemporalCommitments();
            output = formatPotcStatus(commitmentStats);
          } else if (args[0] === "commit") {
            // Simulate commitment creation
            const commitment = await storage.createTemporalCommitment({
              nodeId: `compute_${Math.floor(Math.random() * 847) + 1}`,
              jobId: null,
              commitmentDuration: 4,
              endTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
              status: "active",
              computationalPower: Math.floor(Math.random() * 1000 + 500),
            });
            output = formatCommitmentResult(commitment);
          }
          break;
          
        case "training":
          if (args[0] === "submit") {
            const jobs = await storage.getTrainingJobs();
            output = formatTrainingSubmission(jobs.length);
          } else if (args[0] === "status") {
            const jobs = await storage.getActiveTrainingJobs();
            output = formatTrainingStatus(jobs);
          }
          break;
          
        default:
          output = `Command not found: ${command}`;
      }
      
      res.json({ output });
    } catch (error) {
      res.status(500).json({ error: "CLI command execution failed" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket Server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Send initial data
    ws.send(JSON.stringify({
      type: "connected",
      message: "Connected to NexusLinkAI network"
    }));
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Simulate real-time updates
  setInterval(async () => {
    try {
      // Update training job progress
      const jobs = await storage.getActiveTrainingJobs();
      for (const job of jobs) {
        if (job.progress < 100 && Math.random() > 0.7) {
          const newProgress = Math.min(100, job.progress + Math.random() * 2);
          const newStep = Math.min(38, job.currentStep + (newProgress > job.progress + 1 ? 1 : 0));
          await storage.updateTrainingJobProgress(job.jobId, Math.floor(newProgress), newStep);
        }
      }
      
      // Update node statuses randomly
      const nodes = await storage.getNodes();
      const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
      if (Math.random() > 0.95) {
        await storage.updateNodeStatus(randomNode.nodeId, randomNode.status === "active" ? "inactive" : "active");
      }
      
      // Get updated stats
      const nodeStats = {};
      for (const type of nodeTypes) {
        const typeNodes = await storage.getNodesByType(type);
        nodeStats[type] = {
          total: typeNodes.length,
          active: typeNodes.filter(n => n.status === "active").length,
        };
      }
      
      const updatedJobs = await storage.getTrainingJobs();
      const commitmentStats = await storage.getActiveTemporalCommitments();
      
      // Broadcast updates to all connected clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "live_update",
            data: {
              nodeStats,
              trainingJobs: updatedJobs,
              commitmentCount: commitmentStats.length,
              timestamp: new Date().toISOString()
            }
          }));
        }
      });
    } catch (error) {
      console.error('Error in real-time update:', error);
    }
  }, 3000);

  return httpServer;
}

function formatNodeStatus(nodeStats: any): string {
  const colors = {
    compute: "text-orange-500",
    rpc: "text-red-500", 
    sentry: "text-pink-500",
    oracle: "text-purple-500",
    data: "text-violet-500",
    full: "text-blue-500",
    consumer: "text-cyan-500",
    validator: "text-green-500"
  };
  
  let output = '<div class="text-blue-400">═══════════════════ NEXUSLINKAI NODE STATUS ═══════════════════</div><div class="mt-2">';
  
  Object.entries(nodeStats).forEach(([type, stats]: [string, any]) => {
    const color = colors[type] || "text-white";
    output += `<div><span class="${color}">●</span> <span class="${color}">${type.toUpperCase()} NODES</span>    <span class="text-white">${stats.active} active</span> <span class="text-green-400">[OPERATIONAL]</span></div>`;
  });
  
  output += '</div>';
  return output;
}

function formatPotcStatus(commitments: any[]): string {
  const total = 1247;
  const active = commitments.length;
  const expired = total - active;
  const avgDuration = 4.2;
  const networkPower = commitments.reduce((sum, c) => sum + c.computationalPower, 0) / 1000;
  
  return `<div class="text-blue-400">══════════ PROOF OF TEMPORAL COMMITMENT STATUS ══════════</div>
    <div class="mt-2">
      <div>Total Commitments: <span class="text-orange-400">${total}</span></div>
      <div>Active Commitments: <span class="text-green-400">${active}</span></div>
      <div>Expired Commitments: <span class="text-gray-400">${expired}</span></div>
      <div>Avg Commitment Duration: <span class="text-blue-400">${avgDuration} hours</span></div>
      <div>Network Computational Power: <span class="text-purple-400">${networkPower.toFixed(1)} TH/s</span></div>
    </div>`;
}

function formatCommitmentResult(commitment: any): string {
  return `<div class="text-blue-400">═══════ TEMPORAL COMMITMENT SIMULATION ═══════</div>
    <div class="mt-2">
      <div class="text-green-400">✓ Compute node ${commitment.nodeId} locked for ${commitment.commitmentDuration} hours</div>
      <div class="text-green-400">✓ Commitment proof generated</div>
      <div class="text-green-400">✓ Computational power: ${commitment.computationalPower} units</div>
      <div class="text-orange-400 animate-pulse">⚡ Commitment active until ${commitment.endTime.toLocaleString()}</div>
    </div>`;
}

function formatTrainingSubmission(jobCount: number): string {
  return `<div class="text-blue-400">═══════════════ TRAINING JOB SUBMISSION ═══════════════</div>
    <div class="mt-2">
      <div class="text-green-400">✓ Consumer nodes validated request</div>
      <div class="text-green-400">✓ RPC nodes processed routing</div>
      <div class="text-green-400">✓ Data nodes prepared dataset</div>
      <div class="text-green-400">✓ Oracle nodes established validation benchmarks</div>
      <div class="text-green-400">✓ Validator nodes approved job specifications</div>
      <div class="text-green-400">✓ Full nodes recorded blockchain entry</div>
      <div class="text-green-400">✓ Sentry nodes initiated security monitoring</div>
      <div class="text-orange-400 animate-pulse">⚡ Job queued as #${jobCount + 1}</div>
    </div>`;
}

function formatTrainingStatus(jobs: any[]): string {
  let output = '<div class="text-blue-400">═══════════════ ACTIVE TRAINING JOBS ═══════════════</div><div class="mt-2">';
  
  jobs.forEach(job => {
    const statusColor = job.status === "training" ? "text-orange-400" : "text-green-400";
    output += `<div class="mb-2">
      <div>Job: <span class="text-white">${job.name}</span> (${job.jobId})</div>
      <div>Status: <span class="${statusColor}">${job.status.toUpperCase()}</span> | Progress: <span class="text-blue-400">${job.progress}%</span></div>
      <div>Phase: <span class="text-purple-400">${job.currentPhase}</span> | Step: <span class="text-green-400">${job.currentStep}/38</span></div>
    </div>`;
  });
  
  output += '</div>';
  return output;
}
