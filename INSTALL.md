# Budget Planner - Home Server Installation Guide

This guide covers deploying Budget Planner on your home server using Docker. Perfect for Raspberry Pi, old laptops, dedicated servers, or NAS devices.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installing Docker on Your Home Server](#installing-docker-on-your-home-server)
- [Deploying Budget Planner](#deploying-budget-planner)
- [Accessing on Your Local Network](#accessing-on-your-local-network)
- [Advanced Setup](#advanced-setup)
  - [Reverse Proxy with Nginx](#reverse-proxy-with-nginx)
  - [SSL Certificates](#ssl-certificates-with-lets-encrypt)
  - [Remote Access](#remote-access-from-anywhere)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

**Hardware:**
- Home server (Raspberry Pi 3/4/5, old laptop/desktop, NAS, etc.)
- At least 1GB RAM
- 2GB free storage space

**Software:**
- Linux OS (Ubuntu/Debian recommended)
- SSH access to your server
- Basic command line knowledge

**Network:**
- Static local IP for your server (recommended)
- Router access (for remote access setup)

---

## Installing Docker on Your Home Server

### Step 1: Connect to Your Server

SSH into your home server:

```bash
ssh username@your-server-ip
# Example: ssh pi@192.168.1.100
```

### Step 2: Update Your System

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 3: Install Docker

```bash
# Download and run Docker installation script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to the docker group (to run without sudo)
sudo usermod -aG docker $USER

# Install Docker Compose plugin
sudo apt install docker-compose-plugin -y
```

### Step 4: Verify Installation

Log out and back in for group changes to take effect, then verify:

```bash
docker --version
docker compose version
```

You should see version information for both commands.

---

## Deploying Budget Planner

### Step 1: Create Project Directory

```bash
# Create a directory for the app
mkdir -p ~/apps/budget-planner
cd ~/apps/budget-planner
```

### Step 2: Clone the Repository

```bash
git clone https://github.com/mectus11/budget-planner-test.git .
```

If you don't have git installed:
```bash
sudo apt install git -y
git clone https://github.com/mectus11/budget-planner-test.git .
```

### Step 3: Build and Start the Application

```bash
# Build and start in detached mode (runs in background)
docker compose up -d --build
```

This will:
- Build the Docker image (takes 2-5 minutes first time)
- Start the container
- Make the app available on port 5000

### Step 4: Verify It's Running

```bash
# Check container status
docker compose ps

# View logs
docker compose logs -f
# Press Ctrl+C to exit logs
```

You should see output indicating the server is running on port 5000.

---

## Accessing on Your Local Network

### Find Your Server's IP Address

```bash
hostname -I
# Example output: 192.168.1.100
```

### Access the Application

From any device on your network, open a web browser and go to:

```
http://YOUR_SERVER_IP:5000
```

Example: `http://192.168.1.100:5000`

### Set Static IP (Recommended)

To ensure your server always has the same IP address:

1. **Find your server's MAC address:**
   ```bash
   ip link show
   # Look for your network interface (eth0, wlan0, enp3s0, etc.)
   # The MAC address is after "link/ether"
   ```

2. **Configure in your router:**
   - Log into your router's admin panel (usually `192.168.1.1` or `192.168.0.1`)
   - Find "DHCP Reservation", "Static IP", or "Address Reservation"
   - Add a reservation for your server's MAC address
   - Assign a static IP (e.g., `192.168.1.100`)
   - Save and reboot your server

### Managing the Application

**View logs:**
```bash
docker compose logs -f
```

**Stop the application:**
```bash
docker compose down
```

**Restart the application:**
```bash
docker compose restart
```

**Update to latest version:**
```bash
git pull
docker compose up -d --build
```

**Remove everything:**
```bash
docker compose down -v
```

---

## Advanced Setup

### Reverse Proxy with Nginx

A reverse proxy allows you to:
- Access via a domain name instead of IP:port
- Use SSL/HTTPS for secure connections
- Run multiple services on the same server
- Hide port numbers (use standard ports 80/443)

#### Create Enhanced Docker Compose

Replace your `docker-compose.yml` with this enhanced version:

```yaml
version: '3.8'

services:
  budget-planner:
    build:
      context: .
      dockerfile: Dockerfile
    image: budget-planner:latest
    container_name: budget-planner
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=5000
    # Only expose to nginx, not externally
    expose:
      - "5000"
    networks:
      - budget-network

  nginx:
    image: nginx:alpine
    container_name: budget-planner-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - budget-planner
    networks:
      - budget-network

networks:
  budget-network:
    driver: bridge
```

#### Create Nginx Configuration

Create `nginx.conf` in your project directory:

```nginx
events {
    worker_connections 1024;
}

http {
    # Basic settings
    sendfile on;
    tcp_nopush on;
    keepalive_timeout 65;
    client_max_body_size 20M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript;

    # HTTP server
    server {
        listen 80;
        server_name _;  # Accept any hostname

        location / {
            proxy_pass http://budget-planner:5000;
            proxy_http_version 1.1;
            
            # WebSocket support
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            
            # Forward real IP
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

#### Apply Changes

```bash
docker compose down
docker compose up -d --build
```

Now access at: `http://YOUR_SERVER_IP` (no port needed!)

---

### SSL Certificates with Let's Encrypt

To enable HTTPS, you'll need a domain name pointing to your server.

#### Prerequisites

- Domain name (can use free services like DuckDNS - see [Remote Access](#remote-access-from-anywhere))
- Ports 80 and 443 forwarded to your server

#### Install Certbot

```bash
sudo apt install certbot -y
```

#### Get Certificate

```bash
# Stop nginx temporarily
docker compose stop nginx

# Get certificate (replace with your domain)
sudo certbot certonly --standalone -d yourdomain.duckdns.org

# Copy certificates to project
sudo mkdir -p ~/apps/budget-planner/ssl
sudo cp /etc/letsencrypt/live/yourdomain.duckdns.org/fullchain.pem ~/apps/budget-planner/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.duckdns.org/privkey.pem ~/apps/budget-planner/ssl/
sudo chown -R $USER:$USER ~/apps/budget-planner/ssl
```

#### Update Nginx for HTTPS

Update your `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    sendfile on;
    tcp_nopush on;
    keepalive_timeout 65;
    client_max_body_size 20M;

    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript;

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name yourdomain.duckdns.org;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name yourdomain.duckdns.org;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;

        location / {
            proxy_pass http://budget-planner:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

#### Restart Services

```bash
docker compose up -d
```

Access at: `https://yourdomain.duckdns.org`

#### Auto-Renewal

Set up automatic certificate renewal:

```bash
# Add cron job
sudo crontab -e

# Add this line (runs twice daily)
0 0,12 * * * certbot renew --quiet --deploy-hook "cp /etc/letsencrypt/live/yourdomain.duckdns.org/*.pem /home/YOUR_USERNAME/apps/budget-planner/ssl/ && docker compose -f /home/YOUR_USERNAME/apps/budget-planner/docker-compose.yml restart nginx"
```

---

### Remote Access from Anywhere

Access your Budget Planner from outside your home network (phone, work, etc.).

#### Step 1: Port Forwarding

Configure your router to forward traffic to your server:

1. **Access your router:**
   - Usually `192.168.1.1`, `192.168.0.1`, or `192.168.1.254`
   - Login with admin credentials

2. **Find port forwarding settings:**
   - Look for "Port Forwarding", "Virtual Server", or "NAT"

3. **Add forwarding rules:**

   | Service | External Port | Internal Port | Internal IP | Protocol |
   |---------|---------------|---------------|-------------|----------|
   | HTTP | 80 | 80 | 192.168.1.100 | TCP |
   | HTTPS | 443 | 443 | 192.168.1.100 | TCP |

   Replace `192.168.1.100` with your server's static IP.

4. **Save and apply**

#### Step 2: Find Your Public IP

```bash
curl ifconfig.me
```

You can now access at: `http://YOUR_PUBLIC_IP`

#### Step 3: Dynamic DNS (Recommended)

Most home IPs change periodically. Use Dynamic DNS for a permanent domain.

**Using DuckDNS (Free & Easy):**

1. **Sign up at [duckdns.org](https://www.duckdns.org/)**

2. **Create a subdomain:**
   - Example: `mybudget.duckdns.org`
   - Note your token

3. **Install updater on your server:**

```bash
# Create directory
mkdir -p ~/duckdns
cd ~/duckdns

# Create update script
nano duck.sh
```

Add this (replace with your details):

```bash
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=mybudget&token=YOUR_TOKEN&ip=" | curl -k -o ~/duckdns/duck.log -K -
```

Make it run automatically:

```bash
# Make executable
chmod +x duck.sh

# Test it
./duck.sh

# Add to cron (updates every 5 minutes)
crontab -e

# Add this line:
*/5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1
```

4. **Update Nginx config** with your DuckDNS domain

5. **Get SSL certificate** (see SSL section above)

Now access from anywhere: `https://mybudget.duckdns.org`

#### Security Best Practices

When exposing to the internet:

1. **Enable firewall:**
   ```bash
   sudo ufw allow 22/tcp   # SSH
   sudo ufw allow 80/tcp   # HTTP
   sudo ufw allow 443/tcp  # HTTPS
   sudo ufw enable
   ```

2. **Install fail2ban** (prevents brute force):
   ```bash
   sudo apt install fail2ban -y
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

3. **Keep system updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **Use SSH keys** instead of passwords

5. **Regular backups** of your data

---

## Troubleshooting

### Container Won't Start

**Check logs:**
```bash
docker compose logs -f
```

**Common issues:**
- Port 5000 already in use: Change port in `docker-compose.yml`
- Build errors: Run `docker compose down` then `docker compose up -d --build`

### Can't Access from Browser

**Check if container is running:**
```bash
docker compose ps
```

**Verify port is accessible:**
```bash
curl http://localhost:5000
```

**Check firewall:**
```bash
sudo ufw status
# If blocking, allow port 5000:
sudo ufw allow 5000/tcp
```

### Docker Build Fails

**Clean and rebuild:**
```bash
docker compose down
docker system prune -a
docker compose up -d --build
```

### Out of Disk Space

**Clean Docker cache:**
```bash
docker system prune -a --volumes
```

**Check disk usage:**
```bash
df -h
```

### SSL Certificate Issues

**Verify certificate files exist:**
```bash
ls -la ~/apps/budget-planner/ssl/
```

**Check certificate expiry:**
```bash
sudo certbot certificates
```

**Renew manually:**
```bash
sudo certbot renew
```

### Can't Access Remotely

1. **Verify port forwarding** in router
2. **Check public IP:** `curl ifconfig.me`
3. **Test from outside network** (use mobile data)
4. **Check firewall** on server
5. **Verify DuckDNS** is updating: check `~/duckdns/duck.log`

---

## Data Storage

Budget Planner stores all data in your browser's local storage:
- ✅ Completely private - stays on your device
- ✅ No database setup required
- ⚠️ Browser-specific (different browsers = different data)
- ⚠️ Clearing browser data will delete your budgets

---

## Getting Help

If you encounter issues:

1. Check the logs: `docker compose logs -f`
2. Review [GitHub Issues](https://github.com/mectus11/budget-planner-test/issues)
3. Verify all prerequisites are met
4. Check your firewall and network settings

---

## Next Steps

- **[QUICKSTART.md](QUICKSTART.md)** - Quick reference commands
- **[README.md](README.md)** - Features and overview
- **[DEPLOY.md](DEPLOY.md)** - Additional deployment options

---

*Made with ❤️ for simple, private budget tracking on your own server*
