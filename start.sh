#!/bin/bash

# SimuLock - Advanced Deadlock Detection Simulator
# Startup Script

echo "SimuLock - Advanced Deadlock Detection Simulator"
echo "================================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3.8+ to continue."
    exit 1
fi

echo "Python detected"

# Navigate to backend directory
cd backend

# Install dependencies
echo "Installing dependencies..."
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies. Please check your Python installation."
    exit 1
fi

echo "Dependencies installed successfully"

# Start the server
echo ""
echo "Starting SimuLock Server..."
echo "Server will be available at: http://localhost:5004"
echo "Frontend will be accessible at: http://localhost:5004"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 app.py