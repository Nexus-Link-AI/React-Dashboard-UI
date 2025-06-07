import { nodes, trainingJobs, temporalCommitments, networkMetrics, type Node, type InsertNode, type TrainingJob, type InsertTrainingJob, type TemporalCommitment, type InsertTemporalCommitment, type NetworkMetrics, type InsertNetworkMetrics, type NodeType } from "@shared/schema";

export interface IStorage {
  // Nodes
  getNodes(): Promise<Node[]>;
  getNodesByType(type: NodeType): Promise<Node[]>;
  createNode(node: InsertNode): Promise<Node>;
  updateNodeStatus(nodeId: string, status: string): Promise<Node | undefined>;
  
  // Training Jobs
  getTrainingJobs(): Promise<TrainingJob[]>;
  getActiveTrainingJobs(): Promise<TrainingJob[]>;
  createTrainingJob(job: InsertTrainingJob): Promise<TrainingJob>;
  updateTrainingJobProgress(jobId: string, progress: number, currentStep: number): Promise<TrainingJob | undefined>;
  
  // Temporal Commitments
  getTemporalCommitments(): Promise<TemporalCommitment[]>;
  getActiveTemporalCommitments(): Promise<TemporalCommitment[]>;
  createTemporalCommitment(commitment: InsertTemporalCommitment): Promise<TemporalCommitment>;
  
  // Network Metrics
  getLatestNetworkMetrics(): Promise<NetworkMetrics | undefined>;
  createNetworkMetrics(metrics: InsertNetworkMetrics): Promise<NetworkMetrics>;
}

export class MemStorage implements IStorage {
  private nodes: Map<number, Node>;
  private trainingJobs: Map<number, TrainingJob>;
  private temporalCommitments: Map<number, TemporalCommitment>;
  private networkMetrics: Map<number, NetworkMetrics>;
  private currentId: number;

  constructor() {
    this.nodes = new Map();
    this.trainingJobs = new Map();
    this.temporalCommitments = new Map();
    this.networkMetrics = new Map();
    this.currentId = 1;
    
    // Initialize with some nodes
    this.initializeNodes();
    this.initializeTrainingJobs();
    this.initializeCommitments();
    this.initializeMetrics();
  }

  private initializeNodes() {
    const nodeTypes = [
      { type: "compute", count: 847, status: "active" },
      { type: "rpc", count: 124, status: "active" },
      { type: "sentry", count: 89, status: "active" },
      { type: "oracle", count: 156, status: "active" },
      { type: "data", count: 293, status: "active" },
      { type: "full", count: 567, status: "active" },
      { type: "consumer", count: 234, status: "active" },
      { type: "validator", count: 378, status: "active" },
    ];

    nodeTypes.forEach(({ type, count, status }) => {
      for (let i = 0; i < count; i++) {
        const node: Node = {
          id: this.currentId++,
          nodeId: `${type}_${i + 1}`,
          type,
          status,
          lastSeen: new Date(),
          metadata: {
            region: Math.random() > 0.5 ? "us-west" : "eu-central",
            version: "2.1.0"
          }
        };
        this.nodes.set(node.id, node);
      }
    });
  }

  private initializeTrainingJobs() {
    const jobs = [
      {
        jobId: "job_847291",
        name: "ImageNet Classification",
        status: "training",
        currentPhase: "training_execution",
        currentStep: 18,
        progress: 68,
        metadata: {
          dataset: "ImageNet-2012",
          epochs: 100,
          batchSize: 256
        }
      },
      {
        jobId: "job_847290", 
        name: "NLP Transformer Model",
        status: "validating",
        currentPhase: "validation_monitoring",
        currentStep: 27,
        progress: 100,
        metadata: {
          dataset: "OpenWebText",
          epochs: 50,
          batchSize: 128
        }
      },
      {
        jobId: "job_847289",
        name: "Computer Vision CNN",
        status: "queued",
        currentPhase: "initialization",
        currentStep: 1,
        progress: 5,
        metadata: {
          dataset: "CIFAR-100",
          epochs: 200,
          batchSize: 64
        }
      }
    ];

    jobs.forEach(job => {
      const trainingJob: TrainingJob = {
        id: this.currentId++,
        ...job,
        startTime: new Date(Date.now() - Math.random() * 86400000 * 2),
        estimatedCompletion: new Date(Date.now() + Math.random() * 86400000 * 3),
      };
      this.trainingJobs.set(trainingJob.id, trainingJob);
    });
  }

  private initializeCommitments() {
    // Create temporal commitments
    for (let i = 0; i < 1089; i++) {
      const commitment: TemporalCommitment = {
        id: this.currentId++,
        nodeId: `compute_${Math.floor(Math.random() * 847) + 1}`,
        jobId: Math.random() > 0.3 ? "job_847291" : null,
        commitmentDuration: Math.floor(Math.random() * 8 + 2), // 2-10 hours
        startTime: new Date(Date.now() - Math.random() * 86400000),
        endTime: new Date(Date.now() + Math.random() * 86400000),
        status: "active",
        computationalPower: Math.floor(Math.random() * 1000 + 500),
      };
      this.temporalCommitments.set(commitment.id, commitment);
    }
  }

  private initializeMetrics() {
    const metrics: NetworkMetrics = {
      id: this.currentId++,
      timestamp: new Date(),
      totalNodes: 2688,
      activeJobs: 3,
      totalCommitments: 1247,
      activeCommitments: 1089,
      networkPower: 847300,
      metrics: {
        cpuUtilization: 78.5,
        memoryUtilization: 65.2,
        networkThroughput: 12.7,
        validationRate: 99.8
      }
    };
    this.networkMetrics.set(metrics.id, metrics);
  }

  async getNodes(): Promise<Node[]> {
    return Array.from(this.nodes.values());
  }

  async getNodesByType(type: NodeType): Promise<Node[]> {
    return Array.from(this.nodes.values()).filter(node => node.type === type);
  }

  async createNode(insertNode: InsertNode): Promise<Node> {
    const node: Node = {
      ...insertNode,
      id: this.currentId++,
      lastSeen: new Date(),
    };
    this.nodes.set(node.id, node);
    return node;
  }

  async updateNodeStatus(nodeId: string, status: string): Promise<Node | undefined> {
    const node = Array.from(this.nodes.values()).find(n => n.nodeId === nodeId);
    if (node) {
      node.status = status;
      node.lastSeen = new Date();
      this.nodes.set(node.id, node);
      return node;
    }
    return undefined;
  }

  async getTrainingJobs(): Promise<TrainingJob[]> {
    return Array.from(this.trainingJobs.values());
  }

  async getActiveTrainingJobs(): Promise<TrainingJob[]> {
    return Array.from(this.trainingJobs.values()).filter(
      job => job.status === "training" || job.status === "validating"
    );
  }

  async createTrainingJob(insertJob: InsertTrainingJob): Promise<TrainingJob> {
    const job: TrainingJob = {
      ...insertJob,
      id: this.currentId++,
      startTime: new Date(),
    };
    this.trainingJobs.set(job.id, job);
    return job;
  }

  async updateTrainingJobProgress(jobId: string, progress: number, currentStep: number): Promise<TrainingJob | undefined> {
    const job = Array.from(this.trainingJobs.values()).find(j => j.jobId === jobId);
    if (job) {
      job.progress = progress;
      job.currentStep = currentStep;
      this.trainingJobs.set(job.id, job);
      return job;
    }
    return undefined;
  }

  async getTemporalCommitments(): Promise<TemporalCommitment[]> {
    return Array.from(this.temporalCommitments.values());
  }

  async getActiveTemporalCommitments(): Promise<TemporalCommitment[]> {
    return Array.from(this.temporalCommitments.values()).filter(
      commitment => commitment.status === "active" && commitment.endTime > new Date()
    );
  }

  async createTemporalCommitment(insertCommitment: InsertTemporalCommitment): Promise<TemporalCommitment> {
    const commitment: TemporalCommitment = {
      ...insertCommitment,
      id: this.currentId++,
      startTime: new Date(),
    };
    this.temporalCommitments.set(commitment.id, commitment);
    return commitment;
  }

  async getLatestNetworkMetrics(): Promise<NetworkMetrics | undefined> {
    const metrics = Array.from(this.networkMetrics.values());
    return metrics.length > 0 ? metrics[metrics.length - 1] : undefined;
  }

  async createNetworkMetrics(insertMetrics: InsertNetworkMetrics): Promise<NetworkMetrics> {
    const metrics: NetworkMetrics = {
      ...insertMetrics,
      id: this.currentId++,
      timestamp: new Date(),
    };
    this.networkMetrics.set(metrics.id, metrics);
    return metrics;
  }
}

export const storage = new MemStorage();
