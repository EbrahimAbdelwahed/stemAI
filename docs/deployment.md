# Deployment Guide

This guide provides instructions for deploying the STEM AI Assistant to production environments.

## Prerequisites

Before deploying, ensure you have:

1. A complete and tested version of the STEM AI Assistant
2. API keys for all required services:
   - OpenAI API key
   - xAI API key (for Grok models)
   - Google AI API key (for Gemini models)
3. A PostgreSQL database with pgvector extension installed
4. A Vercel account (recommended deployment platform)
5. Git repository with your code

## Deployment Options

The STEM AI Assistant can be deployed using several approaches:

1. **Vercel** (Recommended): Easiest deployment option with built-in Next.js optimizations
2. **Self-hosted**: Deploy on your own infrastructure
3. **Docker**: Containerized deployment for custom hosting environments

## Deploying to Vercel

### 1. Prepare Your Project

Ensure your project is ready for deployment:

```bash
# Install dependencies
npm install

# Build the project to check for errors
npm run build
```

### 2. Set Up Environment Variables

Create a `.env.production` file with your production environment variables:

```env
# OpenAI API Key (required)
OPENAI_API_KEY=your_openai_api_key

# Google API Key (for Gemini models)
GOOGLE_API_KEY=your_google_api_key

# xAI API Key (required for Grok models)
XAI_API_KEY=your_xai_api_key

# Database URL (required)
DATABASE_URL=postgres://username:password@hostname:port/database
```

### 3. Set Up Version Control

If not already done, initialize a Git repository and commit your code:

```bash
git init
git add .
git commit -m "Initial commit for deployment"
```

### 4. Deploy to Vercel

#### Using Vercel CLI

Install and use the Vercel CLI for deployment:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

Follow the prompts to deploy your application.

#### Using Vercel Web Interface

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Log in to your Vercel account
3. Click "New Project"
4. Import your repository
5. Configure the project:
   - Set the Framework Preset to "Next.js"
   - Add all environment variables from your `.env.production` file
   - Configure any other settings as needed
6. Click "Deploy"

### 5. Configure PostgreSQL with pgvector

For production, you'll need a PostgreSQL database with pgvector installed:

#### Option 1: Managed Database (Recommended)

Use a managed PostgreSQL service with pgvector support:

- [Neon](https://neon.tech/): Native pgvector support
- [Supabase](https://supabase.com/): Includes pgvector
- [AWS RDS for PostgreSQL](https://aws.amazon.com/rds/postgresql/) with pgvector extension

After setting up your database:

1. Create the required tables:
   ```sql
   CREATE EXTENSION vector;
   
   CREATE TABLE documents (
     id SERIAL PRIMARY KEY,
     title VARCHAR(255) NOT NULL,
     content TEXT NOT NULL,
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMP NOT NULL DEFAULT NOW()
   );
   
   CREATE TABLE chunks (
     id SERIAL PRIMARY KEY,
     document_id SERIAL REFERENCES documents(id) ON DELETE CASCADE,
     content TEXT NOT NULL,
     embedding VECTOR(1536),
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMP NOT NULL DEFAULT NOW()
   );
   ```

2. Update the `DATABASE_URL` environment variable in your Vercel project

#### Option 2: Self-Hosted Database

If running your own PostgreSQL instance:

1. Install the pgvector extension:
   ```bash
   # On Ubuntu/Debian
   sudo apt-get install postgresql-13-pgvector
   
   # Using Docker
   docker run -d \
     --name postgres-pgvector \
     -e POSTGRES_PASSWORD=postgres \
     -p 5432:5432 \
     pgvector/pgvector:pg13
   ```

2. Connect to your database and create the required tables (same as above)

### 6. Test Your Deployment

After deployment is complete:

1. Visit your deployed application URL
2. Test the chat functionality with different models
3. Upload test documents to verify RAG functionality
4. Check error handling and responsiveness

## Deploying with Docker

### 1. Create a Dockerfile

Create a `Dockerfile` in your project root:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 2. Create Docker Compose Configuration

Create a `docker-compose.yml` file:

```yaml
version: '3'

services:
  stemaiapp:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - XAI_API_KEY=${XAI_API_KEY}
      - DATABASE_URL=${DATABASE_URL}
    restart: always
    depends_on:
      - postgres

  postgres:
    image: pgvector/pgvector:latest
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=stemai
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    restart: always

volumes:
  postgres-data:
```

### 3. Create Database Initialization Script

Create an `init-db.sql` file:

```sql
CREATE EXTENSION vector;

CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE chunks (
  id SERIAL PRIMARY KEY,
  document_id SERIAL REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 4. Build and Run with Docker Compose

```bash
# Start the containers
docker-compose up -d

# View logs
docker-compose logs -f
```

## Self-Hosting on a VPS

### 1. Set Up a Virtual Private Server

Provision a VPS with:
- Ubuntu 20.04 or newer
- At least 2 GB RAM
- 2 CPU cores minimum
- 20+ GB SSD storage

### 2. Install Required Software

SSH into your server and install required software:

```bash
# Update package lists
sudo apt update
sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Install pgvector
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install

# Install PM2 for process management
sudo npm install -g pm2
```

### 3. Configure PostgreSQL with pgvector

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE stemai;
CREATE USER stemaiuser WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE stemai TO stemaiuser;
\c stemai

# Enable pgvector extension
CREATE EXTENSION vector;

# Create required tables
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE chunks (
  id SERIAL PRIMARY KEY,
  document_id SERIAL REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 4. Deploy the Application

```bash
# Clone your repository
git clone https://github.com/yourusername/stemAI.git
cd stemAI

# Install dependencies
npm install

# Create .env.production file
cat > .env.production << EOL
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_api_key
XAI_API_KEY=your_xai_api_key
DATABASE_URL=postgres://stemaiuser:your_password@localhost:5432/stemai
EOL

# Build the application
npm run build

# Start with PM2
pm2 start npm --name "stemai" -- start
pm2 save
pm2 startup
```

### 5. Set Up Nginx as a Reverse Proxy

```bash
# Install Nginx
sudo apt-get install -y nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/stemai

# Add the following configuration
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/stemai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Set up SSL with Let's Encrypt
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your_domain.com
```

## Production Considerations

### Scaling

For high-traffic deployments:

1. **Database Scaling**:
   - Implement connection pooling
   - Consider read replicas for heavy read operations
   - Add indexes for frequently queried fields

2. **Application Scaling**:
   - Use Vercel's automatic scaling
   - For self-hosted, consider Kubernetes for container orchestration

### Monitoring

Set up monitoring for your production deployment:

1. **Application Monitoring**:
   - [Vercel Analytics](https://vercel.com/analytics) for Vercel deployments
   - [Datadog](https://www.datadoghq.com/) or [New Relic](https://newrelic.com/) for comprehensive monitoring
   - [Sentry](https://sentry.io/) for error tracking

2. **Database Monitoring**:
   - [pganalyze](https://pganalyze.com/) for PostgreSQL monitoring
   - Set up alerts for high database load

### Backup Strategy

Implement a robust backup strategy:

1. **Database Backups**:
   - Daily automated backups
   - Point-in-time recovery capability
   - Test restoration procedures regularly

2. **Application Backups**:
   - Version control for code
   - Environment variable backup
   - Document all configuration settings

### Security

Enhance security for production:

1. **API Security**:
   - Implement rate limiting
   - Add authentication and authorization
   - Use HTTPS for all connections

2. **Database Security**:
   - Use TLS for database connections
   - Implement least privilege access
   - Regular security audits

3. **Environment Variables**:
   - Use Vercel's environment variable encryption
   - Rotate API keys periodically
   - Use secret management services for self-hosted deployments

## Troubleshooting Common Deployment Issues

### Connection Issues with Database

1. Check firewall settings allowing connections to PostgreSQL
2. Verify the DATABASE_URL format and credentials
3. Test direct connection to the database

### API Key Issues

1. Verify all API keys are correctly set in environment variables
2. Check for any restrictions or quotas on your API keys
3. Ensure API keys have the necessary permissions

### Performance Issues

1. Monitor memory usage and increase if needed
2. Check for slow database queries
3. Consider adding caching for frequently accessed data

## Continuous Deployment

Set up a CI/CD pipeline for automated deployments:

1. **GitHub Actions**:
   ```yaml
   name: Deploy to Production
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         
         - name: Setup Node.js
           uses: actions/setup-node@v2
           with:
             node-version: '18'
             
         - name: Install Dependencies
           run: npm ci
           
         - name: Build
           run: npm run build
           
         - name: Deploy to Vercel
           uses: amondnet/vercel-action@v20
           with:
             vercel-token: ${{ secrets.VERCEL_TOKEN }}
             vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
             vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
             vercel-args: '--prod'
   ```

2. **Vercel Git Integration**:
   - Connect your repository to Vercel
   - Configure automatic deployments on push to main 