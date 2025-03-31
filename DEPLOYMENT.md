# Human Match Deployment Guide

This guide provides instructions for deploying the Human Match application to a remote host using GitHub Actions CI/CD.

## Prerequisites

Before deploying, ensure you have:

1. A remote host with:
   - SSH access
   - Docker and Docker Compose installed
   - Sufficient disk space (at least 2GB)
   - Sufficient RAM (at least 2GB)

2. GitHub repository secrets configured:
   - `HOST`: Your remote host IP or domain
   - `USERNAME`: SSH username for the remote host
   - `SSH_PRIVATE_KEY`: SSH private key for authentication

## Deployment Options

### Option 1: GitHub Actions CI/CD (Recommended)

The repository includes a GitHub Actions workflow file (`.github/workflows/ci-cd.yml`) that:

1. Tests the application
2. Builds Docker images
3. Can deploy to your remote host (when configured)

To enable automatic deployment:

1. Uncomment the `deploy` job in `.github/workflows/ci-cd.yml`
2. Configure the GitHub repository secrets mentioned above
3. Update the deployment path in the script section

```yaml
script: |
  cd /path/to/deployment
  git pull
  docker-compose down
  docker-compose up -d --build
```

### Option 2: Manual Deployment

If you prefer to deploy manually:

1. SSH into your remote host:
   ```bash
   ssh username@host
   ```

2. Clone the repository:
   ```bash
   git clone https://github.com/Zhou4truth/human-match.git
   cd human-match
   ```

3. Deploy with Docker Compose:
   ```bash
   docker-compose up -d --build
   ```

## Environment Configuration

For production deployment, create a `.env` file in the project root with:

```
DATABASE_URL=sqlite:///./human_match.db
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
SIMILARITY_THRESHOLD=0.95
```

Replace `your_secret_key_here` with a secure random string.

## Verifying Deployment

After deployment:

1. Access the web application at `http://your-host-ip`
2. Access the API documentation at `http://your-host-ip/docs`
3. Log in with the default admin credentials:
   - Username: admin
   - Password: 123456

## Monitoring and Maintenance

### Viewing Logs

```bash
docker-compose logs -f
```

### Updating the Application

```bash
git pull
docker-compose down
docker-compose up -d --build
```

### Backing Up Data

```bash
docker-compose exec backend cp human_match.db human_match_backup.db
docker cp container_id:/app/human_match_backup.db ./human_match_backup.db
```

## Troubleshooting

### Container Issues

If containers fail to start:

```bash
docker-compose logs
```

### Face Recognition Issues

If face recognition is not working:

1. Check if the face_recognition library is installed correctly:
   ```bash
   docker-compose exec backend python -c "import face_recognition; print('OK')"
   ```

2. Verify that the upload directories exist and have correct permissions:
   ```bash
   docker-compose exec backend ls -la /app/uploads
   ```

### Database Issues

If database errors occur:

```bash
docker-compose exec backend sqlite3 human_match.db .tables
```

## Performance Optimization

For better performance:

1. Consider using PostgreSQL instead of SQLite
2. Increase the number of worker processes in the `docker-compose.yml` file:
   ```yaml
   command: ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
   ```

## Security Considerations

1. Change the default admin password immediately after deployment
2. Use HTTPS for production (configure with Nginx or a reverse proxy)
3. Update the `SECRET_KEY` in the `.env` file
4. Consider implementing rate limiting for the API
