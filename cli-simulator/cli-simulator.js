class PoTCCLISimulator {
  constructor() {
    this.terminal = document.getElementById('terminal');
    this.commandInput = document.getElementById('commandInput');
    this.cursor = document.getElementById('cursor');
    this.isExecuting = false;
    this.commandHistory = [];
    this.historyIndex = -1;
    
    this.initializeEventListeners();
    this.startCursorAnimation();
  }
  
  initializeEventListeners() {
    this.commandInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
    this.terminal.addEventListener('click', () => this.commandInput.focus());
    
    // Keep input focused
    this.commandInput.addEventListener('blur', () => {
      setTimeout(() => this.commandInput.focus(), 10);
    });
  }
  
  startCursorAnimation() {
    setInterval(() => {
      if (!this.isExecuting) {
        this.cursor.style.opacity = this.cursor.style.opacity === '0' ? '1' : '0';
      }
    }, 500);
  }
  
  handleKeyDown(e) {
    if (this.isExecuting) return;
    
    switch (e.key) {
      case 'Enter':
        this.executeCommand(this.commandInput.value.trim());
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.navigateHistory(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.navigateHistory(1);
        break;
      case 'Tab':
        e.preventDefault();
        this.autocomplete();
        break;
    }
  }
  
  navigateHistory(direction) {
    if (this.commandHistory.length === 0) return;
    
    this.historyIndex += direction;
    
    if (this.historyIndex < 0) {
      this.historyIndex = -1;
      this.commandInput.value = '';
    } else if (this.historyIndex >= this.commandHistory.length) {
      this.historyIndex = this.commandHistory.length - 1;
    } else {
      this.commandInput.value = this.commandHistory[this.historyIndex];
    }
  }
  
  autocomplete() {
    const input = this.commandInput.value;
    const commands = ['potc', 'node', 'training', 'help', 'clear'];
    const subcommands = {
      potc: ['status', 'commit', 'history', 'validate', 'benchmark'],
      node: ['status', 'logs', 'start'],
      training: ['submit', 'status', 'logs']
    };
    
    const parts = input.split(' ');
    const lastPart = parts[parts.length - 1];
    
    if (parts.length === 1) {
      const matches = commands.filter(cmd => cmd.startsWith(lastPart));
      if (matches.length === 1) {
        this.commandInput.value = matches[0] + ' ';
      }
    } else if (parts.length === 2 && subcommands[parts[0]]) {
      const matches = subcommands[parts[0]].filter(cmd => cmd.startsWith(lastPart));
      if (matches.length === 1) {
        this.commandInput.value = parts[0] + ' ' + matches[0] + ' ';
      }
    }
  }
  
  executeCommand(command) {
    if (!command) return;
    
    this.isExecuting = true;
    this.cursor.style.opacity = '1';
    
    // Add command to history
    if (command !== this.commandHistory[this.commandHistory.length - 1]) {
      this.commandHistory.push(command);
      if (this.commandHistory.length > 50) {
        this.commandHistory.shift();
      }
    }
    this.historyIndex = -1;
    
    // Display command
    this.addTerminalLine(`nexus@potc:~$ ${command}`, 'command-line');
    
    // Clear input
    this.commandInput.value = '';
    
    // Process command
    setTimeout(() => {
      this.processCommand(command);
      this.isExecuting = false;
      this.scrollToBottom();
    }, 100);
  }
  
  processCommand(command) {
    const parts = command.trim().split(/\s+/);
    const mainCommand = parts[0];
    const args = parts.slice(1);
    
    switch (mainCommand) {
      case 'help':
        this.showHelp();
        break;
      case 'clear':
        this.clearTerminal();
        break;
      case 'potc':
        this.handlePotcCommand(args);
        break;
      case 'node':
        this.handleNodeCommand(args);
        break;
      case 'training':
        this.handleTrainingCommand(args);
        break;
      default:
        this.addOutput(`<span class="text-red-400">Command not found: ${mainCommand}</span>`);
        this.addOutput(`<span class="text-gray-400">Type "help" for available commands</span>`);
    }
  }
  
  handlePotcCommand(args) {
    if (args.length === 0) {
      this.addOutput(`<span class="text-yellow-400">Usage: potc [status|commit|history|validate|benchmark]</span>`);
      return;
    }
    
    switch (args[0]) {
      case 'status':
        this.showPotcStatus();
        break;
      case 'commit':
        this.createCommitment(args);
        break;
      case 'history':
        this.showCommitmentHistory();
        break;
      case 'validate':
        this.runValidation();
        break;
      case 'benchmark':
        this.runBenchmark();
        break;
      default:
        this.addOutput(`<span class="text-red-400">Unknown PoTC command: ${args[0]}</span>`);
    }
  }
  
  handleNodeCommand(args) {
    if (args.length === 0) {
      this.addOutput(`<span class="text-yellow-400">Usage: node [status|logs|start]</span>`);
      return;
    }
    
    switch (args[0]) {
      case 'status':
        this.showNodeStatus();
        break;
      case 'logs':
        this.showNodeLogs(args[1]);
        break;
      case 'start':
        this.startNode(args[1]);
        break;
      default:
        this.addOutput(`<span class="text-red-400">Unknown node command: ${args[0]}</span>`);
    }
  }
  
  handleTrainingCommand(args) {
    if (args.length === 0) {
      this.addOutput(`<span class="text-yellow-400">Usage: training [submit|status|logs]</span>`);
      return;
    }
    
    switch (args[0]) {
      case 'submit':
        this.submitTrainingJob();
        break;
      case 'status':
        this.showTrainingStatus();
        break;
      case 'logs':
        this.showTrainingLogs(args[1]);
        break;
      default:
        this.addOutput(`<span class="text-red-400">Unknown training command: ${args[0]}</span>`);
    }
  }
  
  showHelp() {
    this.addOutput(`<div class="text-blue-400">═══════════════ NEXUSLINKAI POTC CLI HELP ═══════════════</div>`);
    this.addOutput(`<div class="text-green-400">Available Commands:</div>`);
    this.addOutput(`<div><span class="text-orange-400">potc</span> <span class="text-gray-400">status|commit|history|validate|benchmark</span> - Temporal commitment management</div>`);
    this.addOutput(`<div><span class="text-orange-400">node</span> <span class="text-gray-400">status|logs|start</span> - Node management</div>`);
    this.addOutput(`<div><span class="text-orange-400">training</span> <span class="text-gray-400">submit|status|logs</span> - Training job management</div>`);
    this.addOutput(`<div><span class="text-orange-400">clear</span> - Clear terminal</div>`);
    this.addOutput(`<div><span class="text-orange-400">help</span> - Show this help message</div>`);
    this.addOutput(``);
    this.addOutput(`<div class="text-gray-400">Examples:</div>`);
    this.addOutput(`<div class="text-green-400">  potc commit --duration 8h --nodes compute</div>`);
    this.addOutput(`<div class="text-green-400">  node status --all</div>`);
    this.addOutput(`<div class="text-green-400">  training submit --model transformer</div>`);
  }
  
  showPotcStatus() {
    this.addOutput(`<div class="text-blue-400">══════════ PROOF OF TEMPORAL COMMITMENT STATUS ══════════</div>`);
    this.addOutput(`<div>Total Commitments: <span class="text-orange-400">1,247</span></div>`);
    this.addOutput(`<div>Active Commitments: <span class="text-green-400">1,089</span></div>`);
    this.addOutput(`<div>Expired Commitments: <span class="text-gray-400">158</span></div>`);
    this.addOutput(`<div>Avg Commitment Duration: <span class="text-blue-400">4.2 hours</span></div>`);
    this.addOutput(`<div>Network Computational Power: <span class="text-purple-400">847.3 TH/s</span></div>`);
    this.addOutput(`<div>Consensus Threshold: <span class="text-cyan-400">67%</span></div>`);
    this.addOutput(`<div>Network Efficiency: <span class="text-green-400">98.7%</span></div>`);
  }
  
  createCommitment(args) {
    const duration = this.parseArgument(args, '--duration') || '4h';
    const nodeType = this.parseArgument(args, '--nodes') || 'compute';
    const power = Math.floor(Math.random() * 500 + 500);
    
    this.addOutput(`<div class="text-blue-400">═══════ TEMPORAL COMMITMENT CREATION ═══════</div>`);
    this.addOutput(`<div class="text-green-400">✓ Generating cryptographic proof...</div>`);
    this.addOutput(`<div class="text-green-400">✓ Locking ${nodeType} node resources for ${duration}</div>`);
    this.addOutput(`<div class="text-green-400">✓ Commitment proof validated by network</div>`);
    this.addOutput(`<div class="text-green-400">✓ Computational power: ${power} units committed</div>`);
    this.addOutput(`<div class="text-orange-400 animate-pulse">⚡ Commitment ID: POTC-${Date.now().toString(36).toUpperCase()}</div>`);
  }
  
  showCommitmentHistory() {
    this.addOutput(`<div class="text-blue-400">═══════════ TEMPORAL COMMITMENT HISTORY ═══════════</div>`);
    for (let i = 0; i < 5; i++) {
      const nodeId = `compute_${Math.floor(Math.random() * 847) + 1}`;
      const duration = Math.floor(Math.random() * 8 + 2);
      const remaining = Math.floor(Math.random() * duration);
      const status = remaining > 0 ? 'text-green-400' : 'text-gray-400';
      this.addOutput(`<div><span class="${status}">●</span> Node: <span class="text-cyan-400">${nodeId}</span> | Duration: <span class="text-orange-400">${duration}h</span> | Remaining: <span class="text-purple-400">${remaining}h</span></div>`);
    }
  }
  
  runValidation() {
    this.addOutput(`<div class="text-blue-400">═══════════ POTC VALIDATION PROCESS ═══════════</div>`);
    this.addOutput(`<div class="text-green-400">✓ Cryptographic proof verification completed</div>`);
    this.addOutput(`<div class="text-green-400">✓ Temporal lock mechanisms validated</div>`);
    this.addOutput(`<div class="text-green-400">✓ Consensus threshold reached (67% agreement)</div>`);
    this.addOutput(`<div class="text-green-400">✓ Node commitment integrity confirmed</div>`);
    this.addOutput(`<div class="text-orange-400 animate-pulse">⚡ Validation score: 98.7% network confidence</div>`);
  }
  
  runBenchmark() {
    const throughput = (Math.random() * 50 + 150).toFixed(1);
    const latency = (Math.random() * 5 + 10).toFixed(2);
    const efficiency = (Math.random() * 10 + 85).toFixed(1);
    
    this.addOutput(`<div class="text-blue-400">═══════════ NETWORK BENCHMARK RESULTS ═══════════</div>`);
    this.addOutput(`<div>Transaction Throughput: <span class="text-green-400">${throughput} TPS</span></div>`);
    this.addOutput(`<div>Average Latency: <span class="text-orange-400">${latency}ms</span></div>`);
    this.addOutput(`<div>Consensus Efficiency: <span class="text-purple-400">${efficiency}%</span></div>`);
    this.addOutput(`<div>Network Reliability: <span class="text-cyan-400">99.94% uptime</span></div>`);
    this.addOutput(`<div class="text-blue-400">Temporal commitment protocol outperforming PoS by 23.7%</div>`);
  }
  
  showNodeStatus() {
    this.addOutput(`<div class="text-blue-400">═══════════════════ NEXUSLINKAI NODE STATUS ═══════════════════</div>`);
    const nodeTypes = [
      { type: 'COMPUTE', count: 847, color: 'text-orange-400' },
      { type: 'RPC', count: 124, color: 'text-red-400' },
      { type: 'SENTRY', count: 89, color: 'text-pink-400' },
      { type: 'ORACLE', count: 156, color: 'text-purple-400' },
      { type: 'DATA', count: 293, color: 'text-blue-400' },
      { type: 'FULL', count: 567, color: 'text-cyan-400' },
      { type: 'CONSUMER', count: 234, color: 'text-green-400' },
      { type: 'VALIDATOR', count: 378, color: 'text-yellow-400' }
    ];
    
    nodeTypes.forEach(node => {
      this.addOutput(`<div><span class="${node.color}">●</span> <span class="${node.color}">${node.type} NODES</span>    <span class="text-white">${node.count} active</span> <span class="text-green-400">[OPERATIONAL]</span></div>`);
    });
  }
  
  showNodeLogs(nodeId) {
    if (!nodeId) {
      this.addOutput(`<span class="text-yellow-400">Usage: node logs [node_id]</span>`);
      return;
    }
    
    this.addOutput(`<div class="text-blue-400">═══════════ NODE LOGS: ${nodeId} ═══════════</div>`);
    this.addOutput(`<div class="text-gray-400">[2024-06-07 20:30:15] INFO: Node started successfully</div>`);
    this.addOutput(`<div class="text-green-400">[2024-06-07 20:30:16] INFO: Connected to network peers</div>`);
    this.addOutput(`<div class="text-cyan-400">[2024-06-07 20:30:17] INFO: Temporal commitment pool initialized</div>`);
    this.addOutput(`<div class="text-orange-400">[2024-06-07 20:30:18] INFO: Processing commitment requests</div>`);
  }
  
  startNode(nodeType) {
    if (!nodeType) {
      this.addOutput(`<span class="text-yellow-400">Usage: node start [compute|rpc|sentry|oracle|data|full|consumer|validator]</span>`);
      return;
    }
    
    this.addOutput(`<div class="text-blue-400">═══════════ STARTING ${nodeType.toUpperCase()} NODE ═══════════</div>`);
    this.addOutput(`<div class="text-green-400">✓ Initializing node configuration...</div>`);
    this.addOutput(`<div class="text-green-400">✓ Connecting to NexusLinkAI network...</div>`);
    this.addOutput(`<div class="text-green-400">✓ Synchronizing blockchain state...</div>`);
    this.addOutput(`<div class="text-green-400">✓ Node ${nodeType}_${Math.floor(Math.random() * 1000)} is now active</div>`);
  }
  
  submitTrainingJob() {
    const jobId = `job_${Date.now()}`;
    this.addOutput(`<div class="text-blue-400">═══════════════ TRAINING JOB SUBMISSION ═══════════════</div>`);
    this.addOutput(`<div class="text-green-400">✓ Consumer nodes validated request</div>`);
    this.addOutput(`<div class="text-green-400">✓ RPC nodes processed routing</div>`);
    this.addOutput(`<div class="text-green-400">✓ Data nodes prepared dataset</div>`);
    this.addOutput(`<div class="text-green-400">✓ Oracle nodes established validation benchmarks</div>`);
    this.addOutput(`<div class="text-green-400">✓ Validator nodes approved job specifications</div>`);
    this.addOutput(`<div class="text-green-400">✓ Full nodes recorded blockchain entry</div>`);
    this.addOutput(`<div class="text-green-400">✓ Sentry nodes initiated security monitoring</div>`);
    this.addOutput(`<div class="text-orange-400 animate-pulse">⚡ Job ID: ${jobId}</div>`);
  }
  
  showTrainingStatus() {
    this.addOutput(`<div class="text-blue-400">═══════════════ ACTIVE TRAINING JOBS ═══════════════</div>`);
    const jobs = [
      { name: 'ImageNet Classification', id: 'job_847291', status: 'TRAINING', progress: 68, step: 18 },
      { name: 'NLP Transformer Model', id: 'job_847290', status: 'VALIDATING', progress: 100, step: 27 },
      { name: 'Computer Vision CNN', id: 'job_847289', status: 'QUEUED', progress: 5, step: 1 }
    ];
    
    jobs.forEach(job => {
      const statusColor = job.status === 'TRAINING' ? 'text-orange-400' : job.status === 'VALIDATING' ? 'text-green-400' : 'text-cyan-400';
      this.addOutput(`<div>Job: <span class="text-white">${job.name}</span> (${job.id})</div>`);
      this.addOutput(`<div>Status: <span class="${statusColor}">${job.status}</span> | Progress: <span class="text-blue-400">${job.progress}%</span></div>`);
      this.addOutput(`<div>Current Step: <span class="text-green-400">${job.step}/38</span></div>`);
      this.addOutput(``);
    });
  }
  
  showTrainingLogs(jobId) {
    if (!jobId) {
      this.addOutput(`<span class="text-yellow-400">Usage: training logs [job_id]</span>`);
      return;
    }
    
    this.addOutput(`<div class="text-blue-400">═══════════ TRAINING LOGS: ${jobId} ═══════════</div>`);
    this.addOutput(`<div class="text-gray-400">[20:30:15] Epoch 1/100 - Loss: 2.347, Accuracy: 0.234</div>`);
    this.addOutput(`<div class="text-gray-400">[20:30:25] Epoch 2/100 - Loss: 2.156, Accuracy: 0.267</div>`);
    this.addOutput(`<div class="text-gray-400">[20:30:35] Epoch 3/100 - Loss: 1.987, Accuracy: 0.298</div>`);
    this.addOutput(`<div class="text-green-400">[20:30:45] Validation checkpoint saved</div>`);
  }
  
  parseArgument(args, flag) {
    const index = args.indexOf(flag);
    return index !== -1 && index + 1 < args.length ? args[index + 1] : null;
  }
  
  clearTerminal() {
    const lines = this.terminal.querySelectorAll('.terminal-line');
    lines.forEach(line => line.remove());
  }
  
  addTerminalLine(content, className) {
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    line.innerHTML = content;
    
    // Insert before the input container
    const inputContainer = this.terminal.querySelector('.input-container');
    this.terminal.insertBefore(line, inputContainer);
  }
  
  addOutput(content) {
    this.addTerminalLine(content, 'output-line');
  }
  
  scrollToBottom() {
    this.terminal.scrollTop = this.terminal.scrollHeight;
  }
}

// Quick command function for buttons
function executeQuickCommand(command) {
  if (window.cliSimulator) {
    window.cliSimulator.executeCommand(command);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.cliSimulator = new PoTCCLISimulator();
});

// Add some dynamic network status updates
setInterval(() => {
  const statusBar = document.querySelector('.status-bar');
  if (statusBar) {
    const activeCommitments = Math.floor(Math.random() * 10) + 1085;
    const commitmentSpan = statusBar.querySelector('.text-green-400');
    if (commitmentSpan) {
      commitmentSpan.textContent = `${activeCommitments} active`;
    }
  }
}, 5000);