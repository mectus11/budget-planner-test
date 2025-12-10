# Local Development & Deployment Guide

This guide explains how to run the Budget Planner application on your local machine for development or deployment.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: Version 20 or higher (LTS recommended)
- **npm**: Installed automatically with Node.js
- **Git**: To clone the repository

## Quick Start (Local Development)

Follow these steps to run the application in development mode with hot-reloading:

1.  **Clone the Repository**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Start the Development Server**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5000`.

## Production Deployment (Local Server)

To run the optimized production build on your local server:

1.  **Build the Application**
    Compiles the React frontend and server code.
    ```bash
    npm run build
    ```

2.  **Start the Production Server**
    Runs the Node.js server with the built assets.
    ```bash
    npm start
    ```
    The application will be available at `http://localhost:5000` (or the port specified in your environment).

    *Note: To run on a specific port:*
    ```bash
    PORT=3000 npm start
    ```

## Static Deployment (Frontend Only)

If you only want to serve the frontend files using a static web server (like Nginx, Apache, or Python's http.server):

1.  **Build the Project**
    ```bash
    npm run build
    ```

2.  **Locate Static Files**
    The built frontend files are located in the `dist/public/` directory.

3.  **Serve the Files**
    You can point any web server to the `dist/public/` directory.

    *Example using Python (for testing):*
    ```bash
    cd dist/public
    python3 -m http.server 8000
    ```
    Then visit `http://localhost:8000`.
