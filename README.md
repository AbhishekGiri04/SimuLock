<h1 align="center">🔒 SimuLock — Advanced Deadlock Detection Simulator</h1>

<p align="center">
  🚀 An interactive web-based simulator for understanding, detecting, and preventing deadlocks in operating systems using binary semaphores, with <b>real-time visualization</b> and intelligent resource allocation algorithms.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white"/>
  <img src="https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white"/>
</p>

---

## 📖 Problem Statement
Operating system students face significant challenges in understanding deadlock concepts, process synchronization, and resource allocation mechanisms. Traditional theoretical approaches lack hands-on experience and visual feedback required for comprehensive learning.

---

## 💡 Our Solution
SimuLock is a comprehensive educational platform built to:

- 🔍 **Real-time Deadlock Detection** using advanced graph algorithms
- 📊 **Interactive Process Management** with visual state tracking
- 🎮 **Auto Simulation** for quick demonstration and learning
- 📈 **Live Resource Allocation** with binary semaphore implementation
- 🌐 **Web-based Interface** accessible from any modern browser

---  

## 🚀 Features

✅  **Real-time deadlock detection** with cycle detection algorithms  
✅  **Interactive wait-for graph** visualization with live updates  
✅  **Process state management** (Ready/Running/Waiting/Deadlocked)  
✅  **Binary semaphore** resource allocation system  
✅  **Auto simulation** for quick deadlock scenario creation  
✅  **Comprehensive logging** with timestamped event history  
✅  **Responsive design** with modern UI/UX  
✅  **LockSmith Character Guide** with voice assistance  
✅  **Professional contact system** with email integration  

---  

## 🛠️ Tech Stack

<div align="center">

| 🖥️ Technology | ⚙️ Description |
|---------------|----------------|
| ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white) | Core programming language for backend logic |
| ![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white) | Lightweight web framework and API server |
| ![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white) | Real-time bidirectional communication |
| ![NetworkX](https://img.shields.io/badge/NetworkX-FF6B6B?style=for-the-badge&logo=python&logoColor=white) | Graph algorithms for deadlock detection |
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) | Interactive frontend functionality |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) | Modern utility-first CSS framework |
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) | Semantic markup and structure |

</div>

---

## 📁 Project Directory Structure

```
SimuLock/
├── 📂 backend/                     # 🔧 Flask backend service
│   ├── 📂 modules/                 # 🧩 Core simulation modules
│   │   ├── 📄 __init__.py          # 📦 Package initialization
│   │   ├── 📄 banker.py            # 🏦 Banker's algorithm implementation
│   │   ├── 📄 deadlock_detector.py # 🔍 Deadlock detection algorithms
│   │   ├── 📄 process.py           # 🔄 Process management
│   │   ├── 📄 resource.py          # 📦 Resource allocation
│   │   ├── 📄 semaphore.py         # 🔒 Binary semaphore implementation
│   │   └── 📄 simulator.py         # 🎮 Main simulation controller
│   ├── 📄 .env                     # 🔐 Environment variables
│   ├── 📄 app.py                   # 🚀 Flask application server
│   ├── 📄 contact_handler.py       # 📧 Email contact system
│   └── 📄 requirements.txt         # 📋 Python dependencies
├── 📂 docs/                        # 📸 Documentation and screenshots
│   ├── 📄 About_Page.png           # 📸 About page screenshot
│   ├── 📄 Background.png           # 🖼️ Background image asset
│   ├── 📄 Contact_Page.png         # 📸 Contact page screenshot
│   ├── 📄 Home_Page.png            # 📸 Main simulator screenshot
│   └── 📄 Loading_Page.png         # 📸 Loading screen screenshot
├── 📂 frontend/                    # 🎨 Web frontend interface
│   ├── 📂 assets/                  # 🖼️ Images and media files
│   │   ├── 📄 101.png              # 👤 LockSmith character face 1
│   │   ├── 📄 102.png              # 👤 LockSmith character face 2
│   │   ├── 📄 103.png              # 👤 LockSmith character face 3
│   │   ├── 📄 104.png              # 👤 LockSmith character face 4
│   │   ├── 📄 105.png              # 👤 LockSmith character face 5
│   │   ├── 📄 AbhishekGiri.jpg     # 👨💻 Developer photo
│   │   └── 📄 background.png       # 🌅 Background image
│   ├── 📂 css/                     # 🎨 Stylesheets
│   │   └── 📄 style.css            # 🎨 Custom styles and animations
│   ├── 📂 js/                      # ⚡ JavaScript modules
│   │   ├── 📄 app.js               # 🔗 Socket.IO and API communication
│   │   ├── 📄 graph.js             # 📊 Graph visualization utilities
│   │   └── 📄 simulator.js         # 🎮 Simulation control logic
│   ├── 📄 .env                     # 🔐 Frontend environment variables
│   ├── 📄 about.html               # ℹ️ About page
│   ├── 📄 contact.html             # 📞 Contact information
│   ├── 📄 index.html               # 🏠 Main application interface
│   └── 📄 loading.html             # ⏳ Loading screen
├── 📄 .gitignore                   # 🚫 Git ignore rules
├── 📄 README.md                    # 📖 Project documentation
├── 📄 start.sh                     # 🚀 Automated startup script
└── 📄 vercel.json                  # ⚡ Vercel deployment configuration
```

---

## 📸 Application Screenshots

| 📍 Page / Feature | 📸 Screenshot |
|:------------------|:--------------|
| **Loading Screen** | ![Loading Screen](docs/Loading_Page.png) |
| **Main Simulator** | ![Home Page](docs/Home_Page.png) |
| **About Page** | ![About Page](docs/About_Page.png) |
| **Contact Page** | ![Contact Page](docs/Contact_Page.png) |

---

## 🚀 Quick Start

### 📌 Prerequisites
- ✅ **Python 3.8+** installed
- ✅ **pip** package manager
- ✅ **Modern web browser** (Chrome, Firefox, Safari, Edge)

### 🎯 Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/abhishekgiri04/SimuLock.git
cd SimuLock

# Run the automated startup script
./start.sh
```

### 🔧 Option 2: Manual Setup

```bash
# Clone the repository
git clone https://github.com/abhishekgiri04/SimuLock.git
cd SimuLock

# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python app.py
```

### 🌐 Access the Application
```
http://localhost:5004
```

---

## 📖 Core Components

* **app.py** — Flask server with Socket.IO integration and API endpoints
* **deadlock_detector.py** — Wait-for graph and cycle detection algorithms
* **process.py** — Process state management and synchronization
* **resource.py** — Binary semaphore resource allocation system
* **simulator.py** — Main simulation controller and logic
* **banker.py** — Banker's algorithm for deadlock prevention
* **contact_handler.py** — Professional email contact system
* **index.html** — Interactive web interface with embedded JavaScript
* **graph.js** — SVG-based graph visualization utilities
* **app.js** — Real-time communication and UI updates

---

## 🌐 API Endpoints

```bash
# Main Application Routes
GET  /                     # Loading page
GET  /index                # Main simulator interface
GET  /about                # About page
GET  /contact              # Contact page

# Simulation API
POST /api/add_process      # Create new process
POST /api/add_resource     # Create new resource
POST /api/request_resource # Request resource allocation
POST /api/release_resource # Release allocated resource
POST /api/auto_simulate    # Run automatic deadlock scenario
POST /api/reset            # Reset simulation state
GET  /api/processes        # Get current system state

# Advanced Features
POST /api/detect           # Manual deadlock detection
POST /api/recover          # Deadlock recovery strategies
POST /api/contact          # Send contact message
```

---

## 🎮 Usage Guide

### 🚀 Quick Demo (30 seconds)
1. **Click "Auto Simulate"** button
2. **Watch** automatic deadlock creation and detection
3. **Observe** the red deadlock alert and graph visualization
4. **Listen** to LockSmith character guidance

### 🔧 Manual Deadlock Creation
```
1. Click "Add Process" twice (creates P1, P2)
2. Click "Add Resource" twice (creates R1, R2)
3. P1 requests R1 → Click "Request" (P1 gets R1)
4. P2 requests R2 → Click "Request" (P2 gets R2)
5. P1 requests R2 → Click "Request" (P1 waits for R2)
6. P2 requests R1 → Click "Request" (P2 waits for R1)
7. Click "Detect Deadlock" → DEADLOCK DETECTED!
```

### 🎯 Key Features to Explore
- **LockSmith Character** - Interactive guide with voice assistance
- **Real-time Graph** - Visual representation of process-resource relationships
- **Process Control Block** - Click on processes to view detailed PCB information
- **Auto Detection** - Toggle automatic deadlock detection on/off
- **Recovery Strategies** - Test different deadlock recovery methods
- **Professional Logging** - Download or copy simulation logs

---

## 🧪 Testing & Troubleshooting

### ✅ Test Server Startup
```bash
cd backend
python app.py
# Should show: "🚀 Server starting on http://localhost:5004"
```

### 🔍 Test API Endpoints
```bash
# Test basic connectivity
curl http://localhost:5004/

# Test system state
curl http://localhost:5004/api/processes

# Test auto simulation
curl -X POST http://localhost:5004/api/auto_simulate
```

### ⚠️ Common Issues & Solutions

**Port 5004 already in use:**
```bash
# Windows
netstat -ano | findstr :5004
# Mac/Linux
lsof -ti:5004 | xargs kill
```

**Module not found errors:**
```bash
cd backend
pip install -r requirements.txt
```

**Virtual environment issues:**
```bash
# Recreate virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate  # Mac/Linux
# or
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

---

## 📊 Performance Metrics

- **⚡ Real-time Detection** — Instant deadlock identification (<100ms)
- **🎨 Interactive Graphs** — Live wait-for graph updates
- **🔄 Process Management** — Multiple process state tracking
- **🔒 Resource Allocation** — Binary semaphore implementation
- **🎓 Educational Focus** — Designed for learning and understanding
- **📱 Responsive Design** — Works on desktop, tablet, and mobile
- **🌐 Cross-browser** — Compatible with all modern browsers

---

## 🌱 Future Enhancements
- 📱 **Enhanced Mobile Support** — Improved mobile device experience
- 🔄 **Advanced Algorithms** — Banker's algorithm full implementation
- 📊 **Analytics Dashboard** — Detailed performance metrics and statistics
- 🎓 **Educational Modules** — Guided tutorials and interactive lessons
- 🌐 **Multi-user Support** — Collaborative simulation sessions
- 🔊 **Audio Feedback** — Enhanced sound effects and notifications
- 📈 **Performance Monitoring** — Real-time system performance tracking

---

## 👨💻 Developer

<div align="center">

**Abhishek Giri**  
*Senior Software Engineer & System Architect*  
*Operating Systems & Concurrency Control Specialist*

<a href="https://www.linkedin.com/in/abhishek-giri04/">
  <img src="https://img.shields.io/badge/Connect%20on-LinkedIn-blue?style=for-the-badge&logo=linkedin" alt="LinkedIn"/>
</a>  
<a href="https://github.com/abhishekgiri04">
  <img src="https://img.shields.io/badge/Follow%20on-GitHub-black?style=for-the-badge&logo=github" alt="GitHub"/>
</a>  
<a href="https://t.me/AbhishekGiri7">
  <img src="https://img.shields.io/badge/Chat%20on-Telegram-blue?style=for-the-badge&logo=telegram" alt="Telegram"/>
</a>

</div>

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Operating Systems Concepts** by Abraham Silberschatz
- **Modern Operating Systems** by Andrew S. Tanenbaum
- **Flask Documentation** and community
- **Socket.IO** for real-time communication
- **Tailwind CSS** for modern styling
- **NetworkX** for graph algorithms

---

<div align="center">

**🔒 Built with ❤️ for Operating Systems Education**  
*Transforming Deadlock Learning Through Interactive Simulation*

**© 2025 SimuLock - Advanced Deadlock Detection Simulator. All Rights Reserved.**

</div>