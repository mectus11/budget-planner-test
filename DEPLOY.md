# Deployment Guide

This guide covers how to deploy the Budget Planner application in three ways:
1.  [**Docker**](#option-1-docker-deployment-recommended) (Recommended, easiest)
2.  [**Linux (Debian/Ubuntu)**](#option-2-linux-server-manual-debianubuntu) (Manual service setup)
3.  [**Local Development**](#option-3-local-development) (For coding and testing)

---

## Option 1: Docker Deployment (Recommended)

This method works on any system with Docker installed (Linux, Windows, Mac).

### 1. Prerequisites
- Docker & Docker Compose installed on your host machine.

### 2. Quick Start
Run the following cmd in the project root:

```bash
docker-compose up -d --build
```

That's it! Access the app at `http://YOUR_SERVER_IP:5000`.

### 3. Managing the Container
- **Stop**: `docker-compose down`
- **View Logs**: `docker-compose logs -f`
- **Restart**: `docker-compose restart`

---

## Option 2: Linux Server Manual (Debian/Ubuntu)

Use this method if you want to run the app natively as a system service.

### 1. Install Requirements
Update your system and install Node.js (v20+):

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (Official script)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v
npm -v
```

### 2. Clone & Build
Clone the project to your preferred directory (e.g., `/opt/budget-planner` or your home folder):

```bash
git clone https://github.com/mectus11/budget-planner-test.git
cd budget-planner-test

# Install dependencies and build
npm ci
npm run build
```

### 3. Setup Systemd Service
Create a service file to keep the app running in the background and restart on boot.

Create the file:
```bash
sudo nano /etc/systemd/system/budget-planner.service
```

Paste the following configuration (change `User` and `WorkingDirectory` to match yours):

```ini
[Unit]
Description=Budget Planner Service
After=network.target

[Service]
# CHANGE THESE TO YOUR USER AND PATH:
User=your_username
WorkingDirectory=/home/your_username/budget-planner-test
# ------------------------------------

ExecStart=/usr/bin/npm start
Restart=always
Environment=NODE_ENV=production
Environment=PORT=5000

[Install]
WantedBy=multi-user.target
```

### 4. Enable and Start
```bash
# Reload systemd to verify the new file
sudo systemctl daemon-reload

# Start the service
sudo systemctl start budget-planner

# Enable it to start on boot
sudo systemctl enable budget-planner

# Check status
sudo systemctl status budget-planner
```

Your app is now running on port 5000.

---

## Option 3: Local Development

For developing features or running locally on your PC.

1.  **Install**: `npm install`
2.  **Run Dev Server**: `npm run dev`
3.  **App URL**: `http://localhost:5000`
