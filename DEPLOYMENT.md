# Recuerdo Eterno - Deployment Guide

## Dokploy Deployment

### Prerequisites
- Dokploy instance running
- GitHub repository access
- NocoDB instance running at `https://recuerdoeternobd.fu-app.com`

### Environment Variables (Required)

Set these environment variables in Dokploy before deploying:

```bash
# NocoDB Configuration
NOCODB_BASE_URL=https://recuerdoeternobd.fu-app.com
NOCODB_TOKEN=your-nocodb-api-token

# Application Configuration
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Deployment Steps

1. **Create New Application in Dokploy**
   - Go to your Dokploy dashboard
   - Click "Create Application"
   - Choose "Git Repository"

2. **Repository Configuration**
   - Repository URL: `https://github.com/Almanzar001/recuerdo_eterno`
   - Branch: `main`
   - Build context: `/`
   - Dockerfile: `Dockerfile`

3. **Environment Variables**
   - Add all required environment variables listed above
   - Make sure `NOCODB_TOKEN` matches your actual NocoDB API token

4. **Port Configuration**
   - Internal Port: `3000`
   - External Port: `80` or `443` (for HTTPS)

5. **Deploy**
   - Click "Deploy"
   - Monitor build logs for any issues

### Post-Deployment

- Access your application at the configured domain
- Test all functionality:
  - Client creation
  - Difunto creation with photos
  - Admin interface
  - Image viewing and galleries

### Troubleshooting

- Check application logs in Dokploy dashboard
- Verify all environment variables are set correctly
- Ensure NocoDB instance is accessible from deployment server

### Health Check

The application includes a health check endpoint at `/api/health` for monitoring.