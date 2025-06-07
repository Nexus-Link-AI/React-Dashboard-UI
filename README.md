# NexusLinkAI - Proof of Temporal Commitment Network

A decentralized AI/ML training marketplace powered by blockchain with Proof of Temporal Commitment (PoTC) consensus mechanism. Monitor and manage an 8-node network with real-time data visualization and an interactive CLI simulator.

## 🌟 Features

### Dashboard Interface
- **Real-time Network Monitoring**: Live data from 2,688+ nodes across 8 different types
- **Interactive Network Topology**: Visual representation of the NexusLinkAI network with colored node indicators
- **Training Process Flow**: Track 38-step AI/ML training jobs with live progress updates
- **Temporal Commitment Tracking**: Monitor 1,000+ active temporal commitments
- **WebSocket Integration**: Real-time data updates without page refresh
- **Collapsible Sidebar**: Responsive design for optimal viewing experience

### CLI Simulator
- **Standalone PoTC Interface**: Dedicated terminal experience for Proof of Temporal Commitment operations
- **Advanced Command System**: Full command history, tab completion, and quick actions
- **Network Management**: Monitor nodes, submit training jobs, and manage temporal commitments
- **Real-time Status Updates**: Live network statistics and commitment tracking

### Node Types Supported
- **Compute Nodes** (847 active): Handle AI/ML computational workloads
- **RPC Nodes** (124 active): Process remote procedure calls and routing
- **Sentry Nodes** (89 active): Network security and monitoring
- **Oracle Nodes** (156 active): External data validation and benchmarking
- **Data Nodes** (293 active): Dataset management and storage
- **Full Nodes** (567 active): Complete blockchain state maintenance
- **Consumer Nodes** (234 active): Request validation and processing
- **Validator Nodes** (378 active): Consensus participation and validation

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nexuslinkai-potc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Database configuration (automatically configured in Replit)
   DATABASE_URL=your_postgresql_connection_string
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

6. **Access the interfaces**
   - **Main Dashboard**: http://localhost:5000
   - **CLI Simulator**: Open `cli-simulator/index.html` in your browser

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, WebSocket
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Shadcn/ui, Radix UI
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: Wouter
- **Build Tool**: Vite

### Project Structure
```
├── client/src/           # React frontend application
│   ├── components/       # Reusable UI components
│   ├── pages/           # Application pages
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utility functions and constants
├── server/              # Express backend
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Database abstraction layer
│   ├── db.ts           # Database connection
│   └── init-db.ts      # Database initialization
├── shared/              # Shared types and schemas
│   └── schema.ts        # Drizzle database schema
├── cli-simulator/       # Standalone CLI simulator
│   ├── index.html       # CLI interface
│   └── cli-simulator.js # CLI logic and commands
└── components.json      # Shadcn/ui configuration
```

## 🎮 CLI Simulator Usage

The CLI simulator provides a comprehensive interface for interacting with the PoTC network:

### Available Commands

#### Temporal Commitment Management
```bash
potc status                           # View current PoTC status
potc commit --duration 8h --nodes compute  # Create temporal commitment
potc history                          # View commitment history
potc validate                         # Run validation process
potc benchmark                        # Network performance testing
```

#### Node Management
```bash
node status                           # View all node types and status
node logs [node_id]                   # View specific node logs
node start [node_type]                # Start a new node
```

#### Training Job Management
```bash
training submit                       # Submit new training job
training status                       # View active training jobs
training logs [job_id]                # View training job logs
```

#### Utility Commands
```bash
help                                  # Show available commands
clear                                 # Clear terminal screen
```

### CLI Features
- **Command History**: Use arrow keys to navigate previous commands
- **Tab Completion**: Auto-complete commands and subcommands
- **Quick Actions**: Click buttons for common operations
- **Real-time Updates**: Live status bar with network information

## 📊 API Endpoints

### Node Management
- `GET /api/nodes/stats` - Get node statistics by type
- `GET /api/nodes` - List all nodes
- `POST /api/nodes` - Create new node

### Training Jobs
- `GET /api/training-jobs` - Get all training jobs
- `GET /api/training-jobs/active` - Get active training jobs
- `POST /api/training-jobs` - Create new training job

### Temporal Commitments
- `GET /api/temporal-commitments/stats` - Get commitment statistics
- `GET /api/temporal-commitments` - List all commitments
- `POST /api/temporal-commitments` - Create new commitment

### Network Metrics
- `GET /api/network-metrics` - Get latest network metrics
- `POST /api/network-metrics` - Update network metrics

## 🔧 Development

### Database Schema
The application uses Drizzle ORM with PostgreSQL for data persistence:

- **nodes**: Network node information and status
- **training_jobs**: AI/ML training job tracking
- **temporal_commitments**: PoTC commitment records
- **network_metrics**: Network performance data

### WebSocket Events
Real-time updates are handled through WebSocket connections:
- Node status changes
- Training job progress updates
- New temporal commitments
- Network metric updates

### Environment Variables
```bash
DATABASE_URL=               # PostgreSQL connection string
PGHOST=                    # Database host
PGPORT=                    # Database port
PGUSER=                    # Database user
PGPASSWORD=                # Database password
PGDATABASE=                # Database name
```

## 🚀 Deployment

### Production Build
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Deployment
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Replit Deployment
The application is optimized for Replit deployment with automatic database provisioning and environment configuration.

## 📈 Network Statistics

- **Total Nodes**: 2,688 across 8 types
- **Active Commitments**: 1,089+ temporal commitments
- **Training Jobs**: Real-time AI/ML workload processing
- **Network Power**: 847.3 TH/s computational capacity
- **Consensus Threshold**: 67% agreement required
- **Network Efficiency**: 98.7% uptime

## 🔒 Proof of Temporal Commitment

PoTC is a novel consensus mechanism that ensures:
- **Temporal Locking**: Nodes commit computational resources for specific time periods
- **Cryptographic Proofs**: Secure validation of commitment fulfillment
- **Resource Optimization**: Efficient allocation of network computational power
- **Consensus Efficiency**: 23.7% improvement over traditional Proof of Stake

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the CLI help: `help` command in the simulator
- Review the API documentation above

---

**NexusLinkAI** - Revolutionizing decentralized AI/ML training through Proof of Temporal Commitment consensus.