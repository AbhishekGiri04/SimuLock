from flask import Flask, request, jsonify, send_from_directory
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import os
import webbrowser
import threading
import time
from dotenv import load_dotenv
from contact_handler import ContactHandler
from modules import SimuLockSimulator

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'simulock_secret_2024'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Initialize contact handler
contact_handler = ContactHandler()

# Initialize simulator
sim = SimuLockSimulator()

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
    return send_from_directory('../frontend', 'loading.html')

@app.route('/index')
def serve_main():
    return send_from_directory('../frontend', 'index.html')

@app.route('/loading')
def serve_loading_page():
    return send_from_directory('../frontend', 'loading.html')

@app.route('/about')
def serve_about():
    return send_from_directory('../frontend', 'about.html')

@app.route('/locksmith')
def serve_locksmith():
    return send_from_directory('../frontend', 'locksmith.html')

@app.route('/guide')
def serve_guide():
    return send_from_directory('../frontend', 'guide.html')

@app.route('/contact')
def serve_contact():
    return send_from_directory('../frontend', 'contact.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('../frontend', filename)

# API Routes
@app.route('/api/processes', methods=['GET'])
def get_processes():
    return jsonify(sim.get_system_state())

@app.route('/api/add_process', methods=['POST'])
def api_add_process():
    data = request.json
    name = data.get('name', f'Process {len(sim.processes) + 1}')
    process = sim.add_process(name)
    
    system_state = sim.get_system_state()
    socketio.emit('system_update', system_state)
    socketio.emit('log_message', {'message': f'✅ Process {name} created (PID: {process.pid})', 'type': 'success'})
    
    return jsonify({"status": "success", "process": {
        "pid": process.pid,
        "name": process.name,
        "state": process.state,
        "allocated_resources": process.allocated_resources,
        "requested_resources": process.requested_resources
    }})

@app.route('/api/add_resource', methods=['POST'])
def api_add_resource():
    data = request.json
    name = data.get('name', f'Resource {len(sim.resources) + 1}')
    resource = sim.add_resource(name)
    
    system_state = sim.get_system_state()
    socketio.emit('system_update', system_state)
    socketio.emit('log_message', {'message': f'✅ Resource {name} created (RID: {resource.rid})', 'type': 'success'})
    
    return jsonify({"status": "success", "resource": {
        "rid": resource.rid,
        "name": resource.name,
        "available": resource.available,
        "held_by": resource.held_by
    }})

@app.route('/api/request_resource', methods=['POST'])
def api_request_resource():
    data = request.json
    process_id = data['process_id']
    resource_id = data['resource_id']
    
    success, message = sim.request_resource(process_id, resource_id)
    
    system_state = sim.get_system_state()
    socketio.emit('system_update', system_state)
    socketio.emit('log_message', {'message': message, 'type': 'success' if success else 'warning'})
    
    return jsonify({"status": "success" if success else "waiting", "message": message})

@app.route('/api/release_resource', methods=['POST'])
def api_release_resource():
    data = request.json
    process_id = data['process_id']
    resource_id = data['resource_id']
    
    success, message = sim.release_resource(process_id, resource_id)
    
    system_state = sim.get_system_state()
    socketio.emit('system_update', system_state)
    socketio.emit('log_message', {'message': message, 'type': 'success' if success else 'error'})
    
    return jsonify({"status": "success" if success else "error", "message": message})

@app.route('/api/auto_simulate', methods=['POST'])
def api_auto_simulate():
    result = sim.auto_simulate_deadlock()
    
    system_state = sim.get_system_state()
    socketio.emit('system_update', system_state)
    socketio.emit('log_message', {'message': '🤖 Auto simulation: Deadlock scenario created!', 'type': 'info'})
    
    return jsonify({"status": "success", "message": result['message']})

@app.route('/api/reset', methods=['POST'])
def api_reset():
    sim.reset_simulation()
    
    socketio.emit('system_update', sim.get_system_state())
    socketio.emit('log_message', {'message': '🔄 Simulation reset', 'type': 'info'})
    
    return jsonify({"status": "success"})

# WebSocket events
@socketio.on('connect')
def handle_connect():
    print('Client connected to SimuLock')
    emit('system_update', sim.get_system_state())
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

@app.route('/api/init', methods=['POST'])
def api_init():
    data = request.json or {}
    total = data.get('total', [3,3])
    pids = data.get('pids', ['P0','P1','P2'])
    max_claims = data.get('max_claims', {p:[1]*len(total) for p in pids})
    return jsonify({"ok": True})

@app.route('/api/request', methods=['POST'])
def api_request():
    data = request.json or {}
    pid = data.get('pid')
    req = data.get('request', [])
    mode = data.get('mode', 'banker')
    return jsonify({"granted": True, "reason": "success"})

@app.route('/api/detect', methods=['GET'])
def api_detect():
    cycles = sim.detect_deadlocks()
    return jsonify({"cycles": cycles})

@app.route('/api/recover', methods=['POST'])
def api_recover():
    data = request.json or {}
    strategy = data.get('strategy', 'terminate_lowest')
    deadlocked = data.get('deadlocked_set')
    return jsonify({"actions": []})

@app.route('/api/prevention/set', methods=['POST'])
def api_set_policy():
    data = request.json or {}
    policy = data.get('policy')
    order = data.get('resource_order')
    return jsonify({"ok": True})

@app.route('/api/snapshot', methods=['GET'])
def api_snapshot():
    return jsonify(sim.get_system_state())

@app.route('/api/banker', methods=['POST'])
def api_banker():
    return jsonify({"status": "success", "is_safe": True, "result": "Safe state - no deadlock"})

@app.route('/api/locksmith/detect', methods=['POST'])
def api_locksmith_detect():
    cycles = sim.detect_deadlocks()
    has_deadlock = cycles.get('has_deadlock', False)
    message = 'Deadlock detected' if has_deadlock else 'No deadlock detected'
    socketio.emit('log_message', {'message': f'🔍 {message}', 'type': 'error' if has_deadlock else 'success'})
    return jsonify({"status": "success", "has_deadlock": has_deadlock, "deadlocked_processes": []})

@app.route('/api/locksmith/random', methods=['POST'])
def api_locksmith_random():
    result = sim.auto_simulate_deadlock()
    socketio.emit('log_message', {'message': '🎲 Random scenario generated', 'type': 'info'})
    return jsonify({"status": "success", "state": result})

@app.route('/api/locksmith/configure', methods=['POST'])
def api_locksmith_configure():
    return jsonify({"status": "success"})

@app.route('/api/locksmith/state', methods=['GET'])
def api_locksmith_state():
    state = sim.get_system_state()
    return jsonify({"status": "success", "state": state})
@app.route('/api/contact', methods=['POST'])
def api_contact():
    try:
        data = request.json
        name = data.get('name', '')
        email = data.get('email', '')
        subject = data.get('subject', '')
        message = data.get('message', '')
        
        # Validate required fields
        if not name or not email or not message:
            return jsonify({"status": "error", "message": "Name, email, and message are required"}), 400
        
        # Send email using contact handler
        result = contact_handler.send_contact_email(name, email, subject, message)
        
        if result["success"]:
            return jsonify({"status": "success", "message": "Message sent successfully!"})
        else:
            return jsonify({"status": "error", "message": result["message"]}), 500
        
    except Exception as e:
        print(f"Contact form error: {e}")
        return jsonify({"status": "error", "message": "Failed to send message"}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5004))
    print(f"Starting SimuLock Server on port {port}")
    print("SimuLock: Advanced Deadlock Detection Simulator")
    
    # Only open browser in local development
    if os.environ.get('RENDER') != 'true':
        threading.Thread(target=open_browser).start()
    
    socketio.run(app, debug=False, port=port, host='0.0.0.0', allow_unsafe_werkzeug=True)