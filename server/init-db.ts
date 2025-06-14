import { db } from "./db";
import { nodes, trainingJobs, temporalCommitments, networkMetrics, validators } from "@shared/schema";

export async function initializeDatabase() {
  try {
    // Check if data already exists
    const existingNodes = await db.select().from(nodes).limit(1);
    if (existingNodes.length > 0) {
      console.log("Database already initialized");
      return;
    }

    console.log("Initializing database with sample data...");

    // Initialize nodes
    const nodeTypes = [
      { type: "compute", count: 847, status: "active" },
      { type: "rpc", count: 124, status: "active" },
      { type: "sentry", count: 89, status: "active" },
      { type: "oracle", count: 156, status: "active" },
      { type: "data", count: 293, status: "active" },
      { type: "full", count: 567, status: "active" },
      { type: "consumer", count: 234, status: "active" },
      { type: "validator", count: 378, status: "active" }
    ];

    const nodeInserts = [];
    for (const nodeType of nodeTypes) {
      for (let i = 1; i <= nodeType.count; i++) {
        nodeInserts.push({
          nodeId: `${nodeType.type}_${i}`,
          type: nodeType.type,
          status: Math.random() > 0.05 ? "active" : "inactive",
          metadata: {
            location: `region_${Math.floor(Math.random() * 10) + 1}`,
            version: "2.1.0"
          }
        });
      }
    }

    await db.insert(nodes).values(nodeInserts);

    // Initialize training jobs
    const trainingJobsData = [
      {
        jobId: "job_847291",
        name: "ImageNet Classification",
        status: "training",
        currentPhase: "training",
        currentStep: 18,
        progress: 68,
        estimatedCompletion: new Date(Date.now() + 4 * 60 * 60 * 1000),
        metadata: {
          dataset: "ImageNet",
          model: "ResNet-50",
          epochs: 100,
          batchSize: 256
        }
      },
      {
        jobId: "job_847290",
        name: "NLP Transformer Model",
        status: "validating",
        currentPhase: "validation",
        currentStep: 27,
        progress: 100,
        estimatedCompletion: new Date(Date.now() + 2 * 60 * 60 * 1000),
        metadata: {
          dataset: "Common Crawl",
          model: "GPT-3.5",
          parameters: "175B"
        }
      },
      {
        jobId: "job_847289",
        name: "Computer Vision CNN",
        status: "queued",
        currentPhase: "initialization",
        currentStep: 1,
        progress: 5,
        estimatedCompletion: new Date(Date.now() + 8 * 60 * 60 * 1000),
        metadata: {
          dataset: "COCO",
          model: "YOLOv8",
          task: "object_detection"
        }
      }
    ];

    await db.insert(trainingJobs).values(trainingJobsData);

    // Initialize temporal commitments
    const commitmentInserts = [];
    for (let i = 0; i < 1089; i++) {
      const nodeId = `compute_${Math.floor(Math.random() * 847) + 1}`;
      const duration = Math.floor(Math.random() * 8 + 2) * 60 * 60 * 1000; // 2-10 hours in ms
      const startTime = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
      const endTime = new Date(startTime.getTime() + duration);
      
      commitmentInserts.push({
        nodeId,
        jobId: Math.random() > 0.3 ? trainingJobsData[Math.floor(Math.random() * trainingJobsData.length)].jobId : null,
        commitmentDuration: duration,
        startTime,
        endTime,
        status: endTime > new Date() ? "active" : "completed",
        computationalPower: Math.floor(Math.random() * 500 + 500)
      });
    }

    await db.insert(temporalCommitments).values(commitmentInserts);

    // Initialize network metrics
    const metricsData = {
      totalNodes: 2688,
      activeJobs: 3,
      totalCommitments: 1247,
      activeCommitments: 1089,
      networkPower: 847300,
      metrics: {
        throughput: 187.3,
        latency: 12.45,
        efficiency: 98.7,
        uptime: 99.94
      }
    };

    await db.insert(networkMetrics).values(metricsData);

    // Initialize validators with PoTC data
    const validatorInserts = [];
    const validatorNodeIds = nodeInserts.filter(n => n.type === "validator").slice(0, 50); // Top 50 validator nodes
    
    for (let i = 0; i < validatorNodeIds.length; i++) {
      const node = validatorNodeIds[i];
      const stakeAmount = Math.floor(Math.random() * 90000 + 10000); // 10k-100k TEMPO tokens
      const commitmentHours = [24, 48, 72, 168, 336, 720][Math.floor(Math.random() * 6)]; // 1 day to 1 month
      const commitmentDuration = commitmentHours * 60; // in minutes
      const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Started within last week
      const endTime = new Date(startTime.getTime() + commitmentDuration * 60 * 1000);
      
      validatorInserts.push({
        validatorId: `validator_${i + 1}`,
        nodeId: node.nodeId,
        stakeAmount,
        commitmentDuration,
        endTime,
        uptime: Math.floor(Math.random() * 15 + 85), // 85-100% uptime
        reputation: Math.floor(Math.random() * 20 + 80), // 80-100 reputation
        potcScore: 0, // Will be calculated by consensus engine
        status: endTime > new Date() ? "active" : "expired",
        blocksProposed: Math.floor(Math.random() * 50),
        blocksValidated: Math.floor(Math.random() * 200 + 100),
        slashingEvents: Math.random() > 0.9 ? 1 : 0, // 10% have been slashed once
      });
    }

    await db.insert(validators).values(validatorInserts);

    console.log("Database initialized successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}