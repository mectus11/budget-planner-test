# Budget Planner - Quick Start Guide

## 🚀 Quick Installation

### Option 1: Docker (Easiest)

```bash
# Start the app
docker compose up -d --build

# Access at http://localhost:5000
```

**Manage:**
```bash
docker compose logs -f    # View logs
docker compose down       # Stop
docker compose restart    # Restart
```

---

### Option 2: Direct Installation

**Prerequisites:** Node.js 20+

```bash
# Install dependencies
npm install

# Development (with hot reload)
npm run dev

# Production
npm run build
npm start

# Access at http://localhost:5000
```

---

## 📖 Full Documentation

- **[INSTALL.md](INSTALL.md)** - Detailed installation guide for all platforms
- **[DEPLOY.md](DEPLOY.md)** - Production deployment options
- **[README.md](README.md)** - Features and overview

---

## 🔧 Common Commands

### Docker Commands
```bash
# Build and start
docker compose up -d --build

# Stop and remove
docker compose down

# View logs
docker compose logs -f

# Restart
docker compose restart

# Rebuild after changes
docker compose up -d --build
```

### NPM Commands
```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build for production
npm start            # Start production server

# Utilities
npm run check        # Type check
npm run db:push      # Push database schema (if using DB)
```

---

## 🌐 Accessing the App

Once running, open your browser to:
```
http://localhost:5000
```

To access from other devices on your network:
```
http://YOUR_IP_ADDRESS:5000
```

Find your IP:
- **Windows:** `ipconfig`
- **macOS/Linux:** `ifconfig` or `ip addr`

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in docker-compose.yml or use environment variable
PORT=3000 npm start
```

### Docker Build Fails
```bash
# Clean and rebuild
docker compose down
docker system prune -a
docker compose up -d --build
```

### Can't Access from Other Devices
- Check firewall settings
- Ensure devices are on same network
- Use correct IP address (not localhost)

---

## 💾 Data Storage

All data is stored in your browser's local storage:
- ✅ Completely private
- ✅ No database setup needed
- ⚠️ Browser-specific (different browsers = different data)
- ⚠️ Clearing browser data will delete your budgets

---

## 🆘 Need Help?

See **[INSTALL.md](INSTALL.md)** for detailed troubleshooting and platform-specific instructions.
