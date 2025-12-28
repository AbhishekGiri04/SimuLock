// Socket.IO connection
const socket = io('http://localhost:5004');

// Global state
let systemState = {
    processes: [],
    resources: [],
    statistics: {},
    wait_for_graph: { nodes: [], edges: [] },
    timestamp: ''
};

// Network visualization
let network = null;
let isConnected = false;

// Connection management
socket.on('connect', () => {
    isConnected = true;
    document.getElementById('connectionStatus').textContent = 'Connected';
    document.getElementById('connectionStatus').className = 'px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium';
    addLog('✅ Connected to SimuLock simulator', 'success');
});

socket.on('disconnect', () => {
    isConnected = false;
    document.getElementById('connectionStatus').textContent = 'Disconnected';
    document.getElementById('connectionStatus').className = 'px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium';
    addLog('❌ Disconnected from simulator', 'error');
});

// System updates
socket.on('system_update', (data) => {
    systemState = data;
    updateUI();
});

socket.on('log_message', (data) => {
    addLog(data.message, data.type || 'info');
});

socket.on('deadlock_detected', (data) => {
    showDeadlockAlert(data);
    if (data.has_deadlock) {
        playDeadlockSound();
    }
});

// UI Functions
function updateUI() {
    updateProcessList();
    updateResourceList();
    updateStatusPanels();
    updateDropdowns();
    updateStatistics();
    updateGraph();
    updateTimestamp();
}

function updateProcessList() {
    const container = document.getElementById('processList');
    container.innerHTML = '';
    
    if (systemState.processes.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm text-center">No processes yet</p>';
        return;
    }
    
    systemState.processes.forEach(process => {
        const bgColor = process.state === 'running' ? 'bg-green-50 border-green-200' :
                        process.state === 'waiting' ? 'bg-yellow-50 border-yellow-200' :
                        process.state === 'terminated' ? 'bg-gray-50 border-gray-200' :
                        'bg-blue-50 border-blue-200';
        
        const processEl = document.createElement('div');
        processEl.className = `p-3 rounded-lg border ${bgColor} fade-in`;
        processEl.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="font-medium text-gray-900">${process.name}</div>
                <span class="px-2 py-1 text-xs rounded-full ${
                    process.state === 'running' ? 'bg-green-100 text-green-800' :
                    process.state === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                    process.state === 'terminated' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                }">${process.state}</span>
            </div>
            <div class="text-xs text-gray-600 mt-1">PID: ${process.pid} | Priority: ${process.priority}</div>
            <div class="text-xs text-gray-600">Allocated: ${process.allocated_resources.join(', ') || 'None'}</div>
            <div class="text-xs text-gray-600">Requested: ${process.requested_resources.join(', ') || 'None'}</div>
            <div class="text-xs text-gray-500 mt-1">Wait: ${process.waiting_time.toFixed(1)}s</div>
        `;
        container.appendChild(processEl);
    });
}

function updateResourceList() {
    const container = document.getElementById('resourceList');
    container.innerHTML = '';
    
    if (systemState.resources.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm text-center">No resources yet</p>';
        return;
    }
    
    systemState.resources.forEach(resource => {
        const resourceEl = document.createElement('div');
        resourceEl.className = `p-3 rounded-lg border ${
            resource.available ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'
        } fade-in`;
        resourceEl.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="font-medium text-gray-900">${resource.name}</div>
                <span class="px-2 py-1 text-xs rounded-full ${
                    resource.available ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                }">${resource.available ? 'Available' : 'In Use'}</span>
            </div>
            <div class="text-xs text-gray-600 mt-1">RID: ${resource.rid} | Type: ${resource.type}</div>
            ${!resource.available ? `<div class="text-xs text-gray-600">Used by: Process ${resource.held_by}</div>` : ''}
            <div class="text-xs text-gray-600">Waiting: ${resource.waiting_count} processes</div>
            <div class="text-xs text-gray-500 mt-1">Used: ${resource.usage_count} times</div>
        `;
        container.appendChild(resourceEl);
    });
}

function updateStatusPanels() {
    // Update process status
    const processStatus = document.getElementById('processStatus');
    processStatus.innerHTML = '';
    
    if (systemState.processes.length === 0) {
        processStatus.innerHTML = '<p class="text-gray-500 text-sm">No processes yet</p>';
    } else {
        systemState.processes.forEach(process => {
            const statusEl = document.createElement('div');
            statusEl.className = 'flex justify-between items-center py-2 border-b border-gray-100';
            statusEl.innerHTML = `
                <div class="flex items-center">
                    <span class="status-dot ${
                        process.state === 'running' ? 'bg-green-500' :
                        process.state === 'waiting' ? 'bg-yellow-500' :
                        'bg-gray-500'
                    }"></span>
                    <span class="font-medium text-sm">${process.name}</span>
                </div>
                <span class="px-2 py-1 text-xs rounded-full ${
                    process.state === 'running' ? 'bg-green-100 text-green-800' :
                    process.state === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                }">${process.state}</span>
            `;
            processStatus.appendChild(statusEl);
        });
    }
    
    // Update resource status
    const resourceStatus = document.getElementById('resourceStatus');
    resourceStatus.innerHTML = '';
    
    if (systemState.resources.length === 0) {
        resourceStatus.innerHTML = '<p class="text-gray-500 text-sm">No resources yet</p>';
    } else {
        systemState.resources.forEach(resource => {
            const statusEl = document.createElement('div');
            statusEl.className = 'flex justify-between items-center py-2 border-b border-gray-100';
            statusEl.innerHTML = `
                <div class="flex items-center">
                    <span class="status-dot ${resource.available ? 'bg-blue-500' : 'bg-orange-500'}"></span>
                    <span class="font-medium text-sm">${resource.name}</span>
                </div>
                <span class="px-2 py-1 text-xs rounded-full ${
                    resource.available ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                }">${resource.available ? 'Free' : 'Used'}</span>
            `;
            resourceStatus.appendChild(statusEl);
        });
    }
}

function updateDropdowns() {
    const processSelect = document.getElementById('processSelect');
    const resourceSelect = document.getElementById('resourceSelect');
    
    processSelect.innerHTML = '<option value="">Select Process</option>';
    resourceSelect.innerHTML = '<option value="">Select Resource</option>';
    
    systemState.processes.forEach(process => {
        const option = document.createElement('option');
        option.value = process.pid;
        option.textContent = `${process.name} (PID: ${process.pid})`;
        processSelect.appendChild(option);
    });
    
    systemState.resources.forEach(resource => {
        const option = document.createElement('option');
        option.value = resource.rid;
        option.textContent = `${resource.name} (RID: ${resource.rid})`;
        resourceSelect.appendChild(option);
    });
}

function updateStatistics() {
    const stats = systemState.statistics;
    if (stats && Object.keys(stats).length > 0) {
        // Update any statistics display if needed
        console.log('System Statistics:', stats);
    }
}

function updateTimestamp() {
    if (systemState.timestamp) {
        const timestamp = new Date(systemState.timestamp).toLocaleTimeString();
        // You can display this timestamp somewhere in the UI
    }
}

function updateGraph() {
    const container = document.getElementById('graphContainer');
    
    if (!systemState.wait_for_graph || systemState.wait_for_graph.nodes.length === 0) {
        container.innerHTML = `
            <div class="h-full flex items-center justify-center">
                <div class="text-center">
                    <div class="text-gray-400 text-4xl mb-2">📊</div>
                    <p class="text-gray-500">Wait-For Graph Visualization</p>
                    <p class="text-gray-400 text-sm mt-1">Add processes and resources to see the graph</p>
                    <p class="text-gray-400 text-xs mt-2">Processes: ● | Resources: ■</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Initialize network if not exists
    if (!network) {
        initializeNetwork(container);
    }
    
    // Update network data
    const nodes = new vis.DataSet(systemState.wait_for_graph.nodes.map(node => ({
        id: node.id,
        label: node.label,
        color: getNodeColor(node),
        shape: node.type === 'process' ? 'ellipse' : 'box',
        font: { size: 16, face: 'monospace' },
        borderWidth: 2,
        shadow: true
    })));
    
    const edges = new vis.DataSet(systemState.wait_for_graph.edges.map(edge => ({
        from: edge.from,
        to: edge.to,
        arrows: 'to',
        color: getEdgeColor(edge),
        width: 2,
        shadow: true
    })));
    
    network.setData({ nodes, edges });
}

function initializeNetwork(container) {
    const options = {
        layout: {
            randomSeed: 2,
            improvedLayout: true,
            hierarchical: {
                enabled: false,
                direction: 'UD',
                sortMethod: 'directed'
            }
        },
        physics: {
            enabled: true,
            stabilization: {
                iterations: 100
            },
            barnesHut: {
                gravitationalConstant: -8000,
                springConstant: 0.04,
                springLength: 95
            }
        },
        interaction: {
            dragNodes: true,
            dragView: true,
            zoomView: true
        },
        nodes: {
            shape: 'ellipse',
            size: 25,
            font: {
                size: 16,
                face: 'monospace'
            },
            borderWidth: 2,
            shadow: true
        },
        edges: {
            arrows: 'to',
            width: 2,
            shadow: true
        }
    };
    
    network = new vis.Network(container, { nodes: new vis.DataSet([]), edges: new vis.DataSet([]) }, options);
    
    // Add event listeners for network
    network.on("click", function (params) {
        if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            const node = systemState.wait_for_graph.nodes.find(n => n.id === nodeId);
            if (node) {
                addLog(`Clicked on ${node.type}: ${node.label}`, 'info');
            }
        }
    });
}

function getNodeColor(node) {
    if (node.type === 'process') {
        const process = systemState.processes.find(p => `P${p.pid}` === node.id);
        if (process) {
            return process.state === 'waiting' ? 
                { background: '#fef3c7', border: '#f59e0b' } : 
                { background: '#3b82f6', border: '#1d4ed8' };
        }
        return { background: '#3b82f6', border: '#1d4ed8' };
    } else {
        const resource = systemState.resources.find(r => `R${r.rid}` === node.id);
        if (resource) {
            return resource.available ? 
                { background: '#10b981', border: '#047857' } : 
                { background: '#f97316', border: '#ea580c' };
        }
        return { background: '#10b981', border: '#047857' };
    }
}

function getEdgeColor(edge) {
    return edge.type === 'waiting_for' ? '#f59e0b' : 
           edge.type === 'held_by' ? '#3b82f6' : 
           '#6b7280';
}

function showDeadlockAlert(deadlockInfo) {
    const alert = document.getElementById('deadlockAlert');
    const details = document.getElementById('deadlockDetails');
    
    if (deadlockInfo.has_deadlock && deadlockInfo.deadlocks.length > 0) {
        const cycle = deadlockInfo.deadlocks[0];
        details.innerHTML = `
            <div class="mb-2">
                <strong>Cycle detected:</strong> ${cycle.description}
            </div>
            <div class="text-xs">
                <strong>Processes involved:</strong> ${cycle.processes_involved.join(', ')}<br>
                <strong>Resources involved:</strong> ${cycle.resources_involved.join(', ')}
            </div>
        `;
        alert.classList.remove('hidden');
        alert.classList.add('pulse-red');
        
        // Highlight cycle nodes in graph
        if (network && cycle.cycle) {
            const cycleNodes = cycle.cycle;
            const nodes = systemState.wait_for_graph.nodes.map(node => ({
                ...node,
                color: cycleNodes.includes(node.id) ? 
                    { background: '#ef4444', border: '#dc2626' } : 
                    getNodeColor(node)
            }));
            
            network.setData({
                nodes: new vis.DataSet(nodes),
                edges: new vis.DataSet(systemState.wait_for_graph.edges)
            });
        }
    } else {
        alert.classList.add('hidden');
        alert.classList.remove('pulse-red');
    }
}

function playDeadlockSound() {
    // Create a simple beep sound for deadlock detection
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 200;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log('Audio not supported');
    }
}

function addLog(message, type = 'info') {
    const logs = document.getElementById('logs');
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    
    const typeClass = {
        'info': 'log-info',
        'success': 'log-success',
        'warning': 'log-warning',
        'error': 'log-error'
    }[type] || 'log-info';
    
    logEntry.className = `mb-1 ${typeClass}`;
    logEntry.innerHTML = `<span class="text-gray-500">[${timestamp}]</span> ${message}`;
    
    // Remove "Waiting for simulation events..." if it exists
    if (logs.firstChild && logs.firstChild.textContent.includes('Waiting for simulation events')) {
        logs.removeChild(logs.firstChild);
    }
    
    logs.appendChild(logEntry);
    logs.scrollTop = logs.scrollHeight;
}

// Control Functions
function addProcess() {
    if (!isConnected) {
        addLog('❌ Not connected to server', 'error');
        return;
    }
    
    const processName = `Process ${systemState.processes.length + 1}`;
    
    fetch('/api/add_process', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: processName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Success message will come via WebSocket
        }
    })
    .catch(error => {
        addLog('❌ Error adding process: ' + error.message, 'error');
        console.error('Error:', error);
    });
}

function addResource() {
    if (!isConnected) {
        addLog('❌ Not connected to server', 'error');
        return;
    }
    
    const resourceName = `Resource ${systemState.resources.length + 1}`;
    
    fetch('/api/add_resource', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: resourceName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Success message will come via WebSocket
        }
    })
    .catch(error => {
        addLog('❌ Error adding resource: ' + error.message, 'error');
        console.error('Error:', error);
    });
}

function requestResource() {
    if (!isConnected) {
        addLog('❌ Not connected to server', 'error');
        return;
    }
    
    const processSelect = document.getElementById('processSelect');
    const resourceSelect = document.getElementById('resourceSelect');
    
    const processId = parseInt(processSelect.value);
    const resourceId = parseInt(resourceSelect.value);
    
    if (!processId || !resourceId) {
        addLog('⚠️ Please select both process and resource', 'warning');
        return;
    }
    
    fetch('/api/request_resource', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            process_id: processId, 
            resource_id: resourceId 
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success' || data.status === 'waiting') {
            // Message will come via WebSocket
        }
    })
    .catch(error => {
        addLog('❌ Error requesting resource: ' + error.message, 'error');
        console.error('Error:', error);
    });
}

function releaseResource() {
    if (!isConnected) {
        addLog('❌ Not connected to server', 'error');
        return;
    }
    
    const processSelect = document.getElementById('processSelect');
    const resourceSelect = document.getElementById('resourceSelect');
    
    const processId = parseInt(processSelect.value);
    const resourceId = parseInt(resourceSelect.value);
    
    if (!processId || !resourceId) {
        addLog('⚠️ Please select both process and resource', 'warning');
        return;
    }
    
    fetch('/api/release_resource', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            process_id: processId, 
            resource_id: resourceId 
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Message will come via WebSocket
        } else {
            addLog('❌ ' + data.message, 'error');
        }
    })
    .catch(error => {
        addLog('❌ Error releasing resource: ' + error.message, 'error');
        console.error('Error:', error);
    });
}

function detectDeadlock() {
    if (!isConnected) {
        addLog('❌ Not connected to server', 'error');
        return;
    }
    
    fetch('/api/detect_deadlock')
    .then(response => response.json())
    .then(data => {
        if (data.has_deadlock) {
            showDeadlockAlert(data);
            addLog('🔍 Manual check: Deadlock detected!', 'error');
        } else {
            addLog('🔍 Manual check: No deadlock found', 'success');
            // Hide deadlock alert
            document.getElementById('deadlockAlert').classList.add('hidden');
        }
    })
    .catch(error => {
        addLog('❌ Error detecting deadlock: ' + error.message, 'error');
        console.error('Error:', error);
    });
}

function autoSimulate() {
    if (!isConnected) {
        addLog('❌ Not connected to server', 'error');
        return;
    }
    
    addLog('🤖 Starting auto simulation...', 'info');
    
    fetch('/api/auto_simulate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        addLog('✅ Auto simulation completed', 'success');
    })
    .catch(error => {
        addLog('❌ Error in auto simulation: ' + error.message, 'error');
        console.error('Error:', error);
    });
}

function resetSimulation() {
    if (!isConnected) {
        addLog('❌ Not connected to server', 'error');
        return;
    }
    
    if (confirm('Are you sure you want to reset the simulation? All processes and resources will be removed.')) {
        fetch('/api/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            // Message will come via WebSocket
        })
        .catch(error => {
            addLog('❌ Error resetting simulation: ' + error.message, 'error');
            console.error('Error:', error);
        });
        
        // Hide deadlock alert
        document.getElementById('deadlockAlert').classList.add('hidden');
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl + 1: Add process
    if (event.ctrlKey && event.key === '1') {
        event.preventDefault();
        addProcess();
    }
    // Ctrl + 2: Add resource
    else if (event.ctrlKey && event.key === '2') {
        event.preventDefault();
        addResource();
    }
    // Ctrl + D: Detect deadlock
    else if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        detectDeadlock();
    }
    // Ctrl + R: Reset
    else if (event.ctrlKey && event.key === 'r') {
        event.preventDefault();
        resetSimulation();
    }
});

// Initialize tooltips
function initTooltips() {
    const tooltips = {
        'addProcess': 'Add a new process to the simulation (Ctrl+1)',
        'addResource': 'Add a new resource to the simulation (Ctrl+2)',
        'detectDeadlock': 'Manually check for deadlocks (Ctrl+D)',
        'autoSimulate': 'Create an automatic deadlock scenario',
        'resetSimulation': 'Reset the entire simulation (Ctrl+R)'
    };
    
    Object.keys(tooltips).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.title = tooltips[id];
        }
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initTooltips();
    addLog('🚀 SimuLock Deadlock Simulator initialized', 'success');
    addLog('💡 Use buttons to add processes and resources, then request resources to create deadlocks', 'info');
});