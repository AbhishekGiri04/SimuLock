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
<br>

---

## 📖 Problem Statement
Operating system students face significant challenges in understanding deadlock concepts, process synchronization, and resource allocation mechanisms. Traditional theoretical approaches lack hands-on experience and visual feedback required for comprehensive learning.

<br>

---

## 💡 Our Solution
SimuLock is a comprehensive educational platform built to:

- 🔍 **Real-time Deadlock Detection** using advanced graph algorithms
- 📊 **Interactive Process Management** with visual state tracking
- 🎮 **Auto Simulation** for quick demonstration and learning
- 📈 **Live Resource Allocation** with binary semaphore implementation
- 🌐 **Web-based Interface** accessible from any modern browser
<br>

---  

## 🚀 Features

✅  **Real-time deadlock detection** with cycle detection algorithms  
✅  **Interactive wait-for graph** visualization with live updates  
✅  **Process state management** (Ready/Running/Waiting/Deadlocked)  
✅  **Binary semaphore** resource allocation system  
✅  **Auto simulation** for quick deadlock scenario creation  
✅  **Comprehensive logging** with timestamped event history  
✅  **Responsive design** with modern UI/UX

<br>

---  

## 🛠️ Tech Stack

<div align="center">

<table>
<thead>
<tr>
<th>🖥️ Technology</th>
<th>⚙️ Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white"/></td>
<td>Core programming language for backend logic</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white"/></td>
<td>Lightweight web framework and API server</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white"/></td>
<td>Real-time bidirectional communication</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/NetworkX-FF6B6B?style=for-the-badge&logo=python&logoColor=white"/></td>
<td>Graph algorithms for deadlock detection</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/></td>
<td>Interactive frontend functionality</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white"/></td>
<td>Modern utility-first CSS framework</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/></td>
<td>Semantic markup and structure</td>
</tr>
</tbody>
</table>

</div>

<br>

---

## 📁 Project Directory Structure

```
SimuLock - Deadlock Detection Simulator/
├── 📂 backend/                     # 🔧 Flask backend service
│   ├── 📂 modules/                 # 🧩 Core simulation modules
│   │   ├── 📄 __init__.py          # 📦 Package initialization
│   │   ├── 📄 deadlock_detector.py # 🔍 Deadlock detection algorithms
│   │   ├── 📄 process.py           # 🔄 Process management
│   │   ├── 📄 resource.py          # 📦 Resource allocation
│   │   ├── 📄 semaphore.py         # 🔒 Binary semaphore implementation
│   │   └── 📄 simulator.py         # 🎮 Main simulation controller
│   ├── 📄 app.py                   # 🚀 Flask application server
│   └── 📄 requirements.txt         # 📋 Python dependencies
├── 📂 frontend/                    # 🎨 Web frontend interface
│   ├── 📂 css/                     # 🎨 Stylesheets
│   │   └── 📄 style.css            # 🎨 Custom styles and animations
│   ├── 📂 js/                      # ⚡ JavaScript modules
│   │   ├── 📄 app.js               # 🔗 Socket.IO and API communication
│   │   ├── 📄 graph.js             # 📊 Graph visualization utilities
│   │   └── 📄 simulator.js         # 🎮 Simulation control logic
│   ├── 📄 index.html               # 🏠 Main application interface
│   ├── 📄 about.html               # ℹ️ About page
│   ├── 📄 contact.html             # 📞 Contact information
│   └── 📄 loading.html             # ⏳ Loading screen
├── 📂 docs/                        # 📸 Documentation and assets
│   ├── 📄 About_Page.png           # 📸 About page screenshot
│   ├── 📄 Contact_Page.png         # 📸 Contact page screenshot
│   ├── 📄 Home_Page.png            # 📸 Home page screenshot
│   ├── 📄 Loading_Page.png         # 📸 Loading screen screenshot
│   └── 📄 Background.png           # 🖼️ Background image asset
├── 📄 .gitignore                   # 🚫 Git ignore rules
└── 📄 README.md                    # 📖 Project documentation
```
<br>

## 📸 Preview Images

| 📍 Page / Feature            | 📸 Screenshot                                              |
|:----------------------------|:-----------------------------------------------------------|
| Loading Screen              | ![Loading Screen](docs/Loading_Page.png)        |
| Home Page                   | ![Home Page](docs/Home_Page.png)                   |
| About Page                  | ![About Page](docs/About_Page.png)          |
| Contact Page                | ![Contact Page](docs/Contact_Page.png)    |

<br>

---

## 📦 How to Run

### 📌 Prerequisites
- ✅ **Python 3.8+** installed
- ✅ **pip** package manager
- ✅ **Modern web browser** (Chrome, Firefox, Safari, Edge)

<br>

---  

### 📌 Installation

```bash
# Windows
python -m venv venv
venv\Scripts\activate
python -m pip install -r requirements.txt

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
python -m pip install -r requirements.txt
```
<br>

### 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "SimuLock - Deadlock Detection Simulator"
   ```

2. **Navigate to backend and install dependencies:**
   ```bash
   cd backend
   python -m pip install -r requirements.txt
   ```

3. **Start the server:**
   ```bash
   python app.py
   ```

4. **Access the application:**
   ```
   http://localhost:5004
   ```

### 🔧 Alternative Installation

```bash
# Install dependencies individually if requirements.txt fails
python -m pip install flask==2.3.3 flask-socketio==5.3.6 flask-cors==4.0.0 networkx==3.1 eventlet==0.33.3
```

### 🛑 Stop Server

```bash
# Press Ctrl+C in terminal to stop the server
```
<br>

---

## 📖 Core Components

* **app.py** — Flask server with Socket.IO integration
* **deadlock_detector.py** — Wait-for graph and cycle detection algorithms
* **process.py** — Process state management and synchronization
* **resource.py** — Binary semaphore resource allocation
* **simulator.py** — Main simulation controller and logic
* **index.html** — Interactive web interface with embedded JavaScript
* **graph.js** — SVG-based graph visualization utilities
* **app.js** — Real-time communication and UI updates

<br>

---

## 🌐 API Endpoints

```bash
# Backend API (Port 5004)
GET  /                     # Loading page
GET  /index                # Main application
GET  /about                # About page
GET  /contact              # Contact page
POST /api/add_process      # Create new process
POST /api/add_resource     # Create new resource
POST /api/request_resource # Request resource allocation
POST /api/release_resource # Release allocated resource
POST /api/auto_simulate    # Run automatic deadlock scenario
POST /api/reset            # Reset simulation state
GET  /api/processes        # Get system state
```
<br>

---

## 🧪 Testing

```bash
# Test server startup
python app.py

# Test API endpoints
curl http://localhost:5004/
curl http://localhost:5004/api/processes

# Test auto simulation
curl -X POST http://localhost:5004/api/auto_simulate
```

## ⚠️ Common Issues

**Port 5004 already in use:**
```bash
# Change port in app.py or kill existing process
netstat -ano | findstr :5004  # Windows
lsof -ti:5004 | xargs kill    # Mac/Linux
```

**Module not found errors:**
```bash
cd backend
python -m pip install -r requirements.txt
```

**Virtual environment issues:**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```
<br>

---

## 🎮 Usage Guide

### Quick Demo (30 seconds)
1. **Click "Auto Simulate"** button
2. **Watch** automatic deadlock creation and detection
3. **Observe** the red deadlock alert and graph visualization

### Manual Deadlock Creation
```
1. Click "Add Process" twice
2. Click "Add Resource" twice  
3. Select Process 1 + Resource 1 → Click "Request"
4. Select Process 2 + Resource 2 → Click "Request"
5. Select Process 1 + Resource 2 → Click "Request"
6. Select Process 2 + Resource 1 → Click "Request"
7. Click "Detect Deadlock"
```

<br>

---

## 📊 Performance Metrics

- **Real-time Detection** — Instant deadlock identification
- **Interactive Graphs** — Live wait-for graph updates
- **Process Management** — Multiple process state tracking
- **Resource Allocation** — Binary semaphore implementation
- **Educational Focus** — Designed for learning and understanding

<br>

---

## 🌱 Future Scope
- 📱 **Mobile Responsive** — Enhanced mobile device support
- 🔄 **Advanced Algorithms** — Banker's algorithm implementation
- 📊 **Analytics Dashboard** — Performance metrics and statistics
- 🎓 **Educational Modules** — Guided tutorials and lessons
- 🌐 **Multi-user Support** — Collaborative simulation sessions

<br>

---  

## 📞 Help & Contact  

> 💬 *Got questions or need assistance with SimuLock?*  
> We're here to help with technical support and educational guidance!

<div align="center">

**👤 Abhishek Giri**  
<a href="https://www.linkedin.com/in/abhishek-giri04/">
  <img src="https://img.shields.io/badge/Connect%20on-LinkedIn-blue?style=for-the-badge&logo=linkedin" alt="LinkedIn - Abhishek Giri"/>
</a>  
<a href="https://github.com/abhishekgiri04">
  <img src="https://img.shields.io/badge/Follow%20on-GitHub-black?style=for-the-badge&logo=github" alt="GitHub - Abhishek Giri"/>
</a>  
<a href="https://t.me/AbhishekGiri7">
  <img src="https://img.shields.io/badge/Chat%20on-Telegram-blue?style=for-the-badge&logo=telegram" alt="Telegram - Abhishek Giri"/>
</a>

<br/>

---

**🔒 Built with ❤️ for Operating Systems Education**  
*Transforming Deadlock Learning Through Interactive Simulation*

</div>

---

<div align="center">

**© 2025 SimuLock - Deadlock Detection Simulator. All Rights Reserved.**

</div>