# Deployment Guide

## Git Repository Setup

1. **Initialize Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: NexusLinkAI PoTC Network Dashboard"
   ```

2. **Add Remote Repository**
   ```bash
   git remote add origin <your-repository-url>
   git branch -M main
   git push -u origin main
   ```

## Environment Configuration

### Required Environment Variables
```bash
DATABASE_URL=postgresql://username:password@host:port/database
PGHOST=your-database-host
PGPORT=5432
PGUSER=your-database-user
PGPASSWORD=your-database-password
PGDATABASE=your-database-name
```

## Platform-Specific Deployment

### Replit Deployment
1. Fork or import the repository to Replit
2. Database is automatically provisioned
3. Run `npm run dev` to start development server
4. Use "Deploy" button for production deployment

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Railway Deployment
1. Connect GitHub repository to Railway
2. Add PostgreSQL database service
3. Configure environment variables
4. Deploy with automatic builds

### Docker Deployment
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t nexuslinkai-potc .
docker run -p 5000:5000 --env-file .env nexuslinkai-potc
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Database connection established
- [ ] SSL/TLS certificates configured
- [ ] Domain name configured
- [ ] Monitoring and logging set up
- [ ] Backup strategy implemented
- [ ] Security headers configured
- [ ] Performance optimization applied

## Monitoring

### Health Check Endpoint
```bash
curl http://your-domain.com/api/health
```

### Database Status
```bash
curl http://your-domain.com/api/nodes/stats
```

### WebSocket Connection
Test real-time functionality by monitoring network metrics updates in the dashboard.

## Scaling Considerations

- Database connection pooling
- Redis for session management
- Load balancer for multiple instances
- CDN for static assets
- Horizontal scaling for compute nodes