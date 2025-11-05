from flask import Flask, request, jsonify, send_from_directory
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import os
import webbrowser
import threading
import time

# Get the absolute path to the frontend directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(os.path.dirname(BASE_DIR), 'frontend')

app = Flask(__name__)
app.config['SECRET_KEY'] = 'simulock_secret_2024'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Initialize simulator
simulator = {
    'processes': [],
    'resources': [],
    'next_pid': 1,
    'next_rid': 1
}

class Process:
    def __init__(self, pid, name):
        self.pid = pid
        self.name = name
        self.state = "ready"
        self.allocated_resources = []
        self.requested_resources = []
    
    def to_dict(self):
        return {
            "pid": self.pid,
            "name": self.name,
            "state": self.state,
            "allocated_resources": self.allocated_resources.copy(),
            "requested_resources": self.requested_resources.copy()
        }

class Resource:
    def __init__(self, rid, name):
        self.rid = rid
        self.name = name
        self.available = True
        self.held_by = None
    
    def to_dict(self):
        return {
            "rid": self.rid,
            "name": self.name,
            "available": self.available,
            "held_by": self.held_by
        }

def add_process(name):
    process = Process(simulator['next_pid'], name)
    simulator['processes'].append(process)
    simulator['next_pid'] += 1
    return process

def add_resource(name):
    resource = Resource(simulator['next_rid'], name)
    simulator['resources'].append(resource)
    simulator['next_rid'] += 1
    return resource

def request_resource(process_id, resource_id):
    process = next((p for p in simulator['processes'] if p.pid == process_id), None)
    resource = next((r for r in simulator['resources'] if r.rid == resource_id), None)
    
    if not process or not resource:
        return False, "Process or resource not found"
    
    if resource.available:
        resource.available = False
        resource.held_by = process_id
        process.allocated_resources.append(resource_id)
        process.state = "running"
        return True, f"Resource {resource.name} allocated to {process.name}"
    else:
        process.state = "waiting"
        process.requested_resources.append(resource_id)
        return False, f"{process.name} waiting for {resource.name}"

def release_resource(process_id, resource_id):
    process = next((p for p in simulator['processes'] if p.pid == process_id), None)
    resource = next((r for r in simulator['resources'] if r.rid == resource_id), None)
    
    if not process or not resource:
        return False, "Process or resource not found"
    
    if resource_id in process.allocated_resources:
        process.allocated_resources.remove(resource_id)
        resource.available = True
        resource.held_by = None
        process.state = "ready"
        return True, f"Resource {resource.name} released by {process.name}"
    
    return False, f"Process {process.name} doesn't hold resource {resource.name}"

def get_system_state():
    return {
        'processes': [p.to_dict() for p in simulator['processes']],
        'resources': [r.to_dict() for r in simulator['resources']]
    }

# Serve frontend files
@app.route('/')
def serve_loading():
    return send_from_directory(FRONTEND_DIR, 'loading.html')

@app.route('/index')
def serve_main():
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/loading')
def serve_loading_page():
    return send_from_directory(FRONTEND_DIR, 'loading.html')

@app.route('/about')
def serve_about():
    response = send_from_directory(FRONTEND_DIR, 'about.html')
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/contact')
def serve_contact():
    return send_from_directory(FRONTEND_DIR, 'contact.html')

@app.route('/docs/<path:filename>')
def serve_docs(filename):
    docs_dir = os.path.join(os.path.dirname(BASE_DIR), 'docs')
    return send_from_directory(docs_dir, filename)

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(FRONTEND_DIR, filename)

# API Routes
@app.route('/api/processes', methods=['GET'])
def get_processes():
    return jsonify(get_system_state())

@app.route('/api/add_process', methods=['POST'])
def api_add_process():
    data = request.json
    name = data.get('name', f'Process {simulator["next_pid"]}')
    process = add_process(name)
    
    system_state = get_system_state()
    socketio.emit('system_update', system_state)
    socketio.emit('log_message', {'message': f'✅ Process {name} created (PID: {process.pid})', 'type': 'success'})
    
    return jsonify({"status": "success", "process": process.to_dict()})

@app.route('/api/add_resource', methods=['POST'])
def api_add_resource():
    data = request.json
    name = data.get('name', f'Resource {simulator["next_rid"]}')
    resource = add_resource(name)
    
    system_state = get_system_state()
    socketio.emit('system_update', system_state)
    socketio.emit('log_message', {'message': f'✅ Resource {name} created (RID: {resource.rid})', 'type': 'success'})
    
    return jsonify({"status": "success", "resource": resource.to_dict()})

@app.route('/api/request_resource', methods=['POST'])
def api_request_resource():
    data = request.json
    process_id = data['process_id']
    resource_id = data['resource_id']
    
    success, message = request_resource(process_id, resource_id)
    
    system_state = get_system_state()
    socketio.emit('system_update', system_state)
    socketio.emit('log_message', {'message': message, 'type': 'success' if success else 'warning'})
    
    return jsonify({"status": "success" if success else "waiting", "message": message})

@app.route('/api/release_resource', methods=['POST'])
def api_release_resource():
    data = request.json
    process_id = data['process_id']
    resource_id = data['resource_id']
    
    success, message = release_resource(process_id, resource_id)
    
    system_state = get_system_state()
    socketio.emit('system_update', system_state)
    socketio.emit('log_message', {'message': message, 'type': 'success' if success else 'error'})
    
    return jsonify({"status": "success" if success else "error", "message": message})

@app.route('/api/auto_simulate', methods=['POST'])
def api_auto_simulate():
    # Reset first
    simulator['processes'] = []
    simulator['resources'] = []
    simulator['next_pid'] = 1
    simulator['next_rid'] = 1
    
    # Create deadlock scenario
    p1 = add_process("Process A")
    p2 = add_process("Process B")
    r1 = add_resource("Resource X")
    r2 = add_resource("Resource Y")
    
    # Create deadlock
    request_resource(p1.pid, r1.rid)  # P1 gets R1
    request_resource(p2.pid, r2.rid)  # P2 gets R2
    request_resource(p1.pid, r2.rid)  # P1 waits for R2
    request_resource(p2.pid, r1.rid)  # P2 waits for R1 - DEADLOCK!
    
    system_state = get_system_state()
    socketio.emit('system_update', system_state)
    socketio.emit('log_message', {'message': '🤖 Auto simulation: Deadlock scenario created!', 'type': 'info'})
    
    return jsonify({"status": "success", "message": "Auto simulation completed"})

@app.route('/api/reset', methods=['POST'])
def api_reset():
    simulator['processes'] = []
    simulator['resources'] = []
    simulator['next_pid'] = 1
    simulator['next_rid'] = 1
    
    socketio.emit('system_update', get_system_state())
    socketio.emit('log_message', {'message': '🔄 Simulation reset', 'type': 'info'})
    
    return jsonify({"status": "success"})

# WebSocket events
@socketio.on('connect')
def handle_connect():
    print('Client connected to SimuLock')
    emit('system_update', get_system_state())
    emit('log_message', {'message': '🔗 Connected to SimuLock simulator', 'type': 'info'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

browser_opened = False

def open_browser():
    global browser_opened
    if not browser_opened:
        time.sleep(1.5)
        webbrowser.open('http://localhost:5004')
        browser_opened = True

if __name__ == '__main__':
    # Check if frontend directory exists
    if not os.path.exists(FRONTEND_DIR):
        print(f"❌ Error: Frontend directory not found at {FRONTEND_DIR}")
        print("Please ensure the frontend directory exists in the project root.")
        exit(1)
    
    print("🚀 Starting SimuLock Server on http://localhost:5004")
    print("📊 SimuLock: Advanced Deadlock Detection Simulator")
    print("💡 Access the frontend at http://localhost:5004")
    print(f"📁 Frontend directory: {FRONTEND_DIR}")
    
    threading.Thread(target=open_browser).start()
    socketio.run(app, debug=False, port=5004, host='0.0.0.0', allow_unsafe_werkzeug=True)