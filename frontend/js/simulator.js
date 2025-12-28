class Simulator {
    constructor() {
        this.processes = [];
        this.resources = [];
        this.logs = [];
        this.isSimulating = false;
        this.graph = new Graph();
        this.autoAssignEnabled = true;
        this.autoDetectDeadlock = true;
        this.nextProcessId = 1;
        this.nextResourceId = 1;
        this.currentRunningProcess = null;
    }

    addProcess(name) {
        const process = {
            // Process Identification
            id: this.nextProcessId++,
            pid: Math.floor(Math.random() * 10000) + 1000,
            name: name || `P${this.processes.length + 1}`,
            state: 'ready',
            
            // Process State Information
            programCounter: Math.floor(Math.random() * 1000),
            cpuRegisters: {
                AX: Math.floor(Math.random() * 100),
                BX: Math.floor(Math.random() * 100),
                CX: Math.floor(Math.random() * 100),
                DX: Math.floor(Math.random() * 100),
                SP: Math.floor(Math.random() * 1000),
                BP: Math.floor(Math.random() * 1000),
                SI: Math.floor(Math.random() * 100),
                DI: Math.floor(Math.random() * 100)
            },
            
            // Process Control Information
            priority: Math.floor(Math.random() * 5) + 1,
            schedulingInfo: {
                arrivalTime: Date.now(),
                burstTime: 0,
                waitingTime: 0,
                turnaroundTime: 0
            },
            
            // Memory Management
            memoryInfo: {
                baseRegister: Math.floor(Math.random() * 10000),
                limitRegister: Math.floor(Math.random() * 1000) + 100,
                pageTable: []
            },
            
            // Resource Management
            allocated: {},
            requested: {},
            waiting: false,
            
            // Accounting Information
            cpuTimeUsed: 0,
            memoryUsed: Math.floor(Math.random() * 50) + 10
        };
        
        this.processes.push(process);
        this.log(`🟢 Process ${process.name} (PID: ${process.pid}) added to system`, "success");
        this.updateUI();
        
        if (this.autoAssignEnabled) {
            this.autoAssignResources();
        }
        
        return process;
    }

    addResource(name, instances = 1) {
        const resource = {
            id: this.nextResourceId++,
            name: name || `R${this.resources.length + 1}`,
            totalInstances: instances,
            availableInstances: instances,
            allocated: {}
        };
        this.resources.push(resource);
        this.log(`🟢 Resource ${resource.name} added with ${instances} instances`, "success");
        this.updateUI();
        
        if (this.autoAssignEnabled) {
            this.autoAssignResources();
        }
        
        return resource;
    }

    autoAssignResources() {
        let assigned = false;
        
        // First: Assign to processes with pending requests
        this.processes.forEach(process => {
            if (process.waiting) {
                Object.keys(process.requested).forEach(resourceName => {
                    const requestedCount = process.requested[resourceName];
                    if (requestedCount > 0) {
                        const resource = this.resources.find(r => r.name === resourceName);
                        if (resource && resource.availableInstances >= requestedCount) {
                            this.assignResource(process.id, resource.id, requestedCount);
                            assigned = true;
                        }
                    }
                });
            }
        });
        
        if (assigned) {
            this.log("Auto-assigned resources to waiting processes", "info");
        }
        
        return assigned;
    }

    assignResource(processId, resourceId, count = 1) {
        const process = this.processes.find(p => p.id === processId);
        const resource = this.resources.find(r => r.id === resourceId);
        
        if (!process || !resource) {
            this.log("Process or resource not found", "error");
            return false;
        }
        
        if (resource.availableInstances < count) {
            this.log(`Not enough instances of ${resource.name} available`, "warning");
            return false;
        }
        
        // Allocate resource
        resource.availableInstances -= count;
        resource.allocated[process.id] = (resource.allocated[process.id] || 0) + count;
        process.allocated[resource.name] = (process.allocated[resource.name] || 0) + count;
        
        // Remove from requested if it was there
        if (process.requested[resource.name] > 0) {
            process.requested[resource.name] -= count;
            if (process.requested[resource.name] <= 0) {
                delete process.requested[resource.name];
                process.waiting = false;
                process.state = 'running';
                this.log(`✅ ${process.name} acquired ${resource.name} - No longer waiting`, "success");
            }
        }
        
        // Update process state
        if (!process.waiting) {
            process.state = 'running';
        }
        
        this.log(`🔵 ${process.name} allocated ${count} instance(s) of ${resource.name}`, "success");
        
        // Update process statistics
        this.updateProcessStatistics();
        
        this.updateUI();
        
        // Auto-detect deadlock
        if (this.autoDetectDeadlock) {
            setTimeout(() => {
                this.detectDeadlock();
            }, 100);
        }
        
        return true;
    }

    requestResource(processId, resourceId, count = 1) {
        const process = this.processes.find(p => p.id === processId);
        const resource = this.resources.find(r => r.id === resourceId);
        
        if (!process || !resource) {
            this.log("Process or resource not found", "error");
            return false;
        }
        
        // Check if already allocated
        const currentAllocation = process.allocated[resource.name] || 0;
        if (currentAllocation > 0) {
            this.log(`⚠️ ${process.name} already has ${resource.name} allocated`, "warning");
            return false;
        }
        
        process.requested[resource.name] = (process.requested[resource.name] || 0) + count;
        process.waiting = true;
        process.state = 'waiting';
        
        this.log(`🟡 ${process.name} requested ${count} instance(s) of ${resource.name}`, "info");
        
        // Try to fulfill request immediately if resources are available
        if (resource.availableInstances >= count) {
            this.assignResource(processId, resourceId, count);
        } else {
            this.log(`⏳ ${process.name} waiting for ${resource.name}...`, "warning");
        }
        
        // Update process statistics
        this.updateProcessStatistics();
        
        this.updateUI();
        
        // Auto-detect deadlock
        if (this.autoDetectDeadlock) {
            setTimeout(() => {
                this.detectDeadlock();
            }, 100);
        }
        
        return true;
    }

    releaseResource(processId, resourceId, count = 1) {
        const process = this.processes.find(p => p.id === processId);
        const resource = this.resources.find(r => r.id === resourceId);
        
        if (!process || !resource) {
            this.log("Process or resource not found", "error");
            return false;
        }
        
        const allocatedCount = process.allocated[resource.name] || 0;
        if (allocatedCount < count) {
            this.log(`${process.name} doesn't have ${count} instances of ${resource.name} allocated (only has ${allocatedCount})`, "warning");
            return false;
        }
        
        // Release resource from process
        process.allocated[resource.name] = allocatedCount - count;
        if (process.allocated[resource.name] <= 0) {
            delete process.allocated[resource.name];
        }
        
        // Release resource from resource allocations
        const resourceAllocatedCount = resource.allocated[process.id] || 0;
        resource.allocated[process.id] = resourceAllocatedCount - count;
        if (resource.allocated[process.id] <= 0) {
            delete resource.allocated[process.id];
        }
        
        // Increase available instances
        resource.availableInstances += count;
        
        this.log(`🟣 ${process.name} released ${count} instance(s) of ${resource.name}`, "success");
        
        // Auto-assign to waiting processes
        if (this.autoAssignEnabled) {
            this.autoAssignResources();
        }
        
        // Update process statistics
        this.updateProcessStatistics();
        
        this.updateUI();
        
        // Auto-detect deadlock
        if (this.autoDetectDeadlock) {
            setTimeout(() => {
                this.detectDeadlock();
            }, 100);
        }
        
        return true;
    }

    releaseAllResources(processId) {
        const process = this.processes.find(p => p.id === processId);
        if (!process) {
            this.log("Process not found", "error");
            return false;
        }
        
        let releasedCount = 0;
        
        // Release each allocated resource
        Object.keys(process.allocated).forEach(resourceName => {
            const resource = this.resources.find(r => r.name === resourceName);
            if (resource) {
                const count = process.allocated[resourceName];
                
                // Update resource allocations
                resource.allocated[process.id] = (resource.allocated[process.id] || 0) - count;
                if (resource.allocated[process.id] <= 0) {
                    delete resource.allocated[process.id];
                }
                
                // Update available instances
                resource.availableInstances += count;
                releasedCount += count;
            }
        });
        
        // Clear all process allocations
        process.allocated = {};
        process.waiting = false;
        process.state = 'ready';
        
        this.log(`🟣 ${process.name} released all resources (${releasedCount} instances)`, "success");
        
        // Auto-assign released resources
        if (this.autoAssignEnabled) {
            this.autoAssignResources();
        }
        
        // Update process statistics
        this.updateProcessStatistics();
        
        this.updateUI();
        
        // Auto-detect deadlock
        if (this.autoDetectDeadlock) {
            setTimeout(() => {
                this.detectDeadlock();
            }, 100);
        }
        
        return true;
    }

    updateProcessStatistics() {
        this.processes.forEach(process => {
            if (process.state === 'running') {
                process.cpuTimeUsed += 10;
                process.schedulingInfo.burstTime += 10;
                process.programCounter += 4;
            } else if (process.waiting || process.state === 'ready') {
                process.schedulingInfo.waitingTime += 10;
            }
        });
    }

    detectDeadlock() {
        this.log("🔍 Scanning for deadlocks...", "info");
        
        const graph = this.buildGraph();
        const deadlockProcesses = this.graph.detectDeadlock(graph);
        
        if (deadlockProcesses.length > 0) {
            this.log(`🚨 DEADLOCK DETECTED! Processes involved: ${deadlockProcesses.join(', ')}`, "error");
            
            // Mark deadlocked processes
            this.processes.forEach(process => {
                if (deadlockProcesses.includes(process.name)) {
                    process.state = 'deadlocked';
                }
            });
        } else {
            const hadDeadlock = this.processes.some(p => p.state === 'deadlocked');
            if (hadDeadlock) {
                this.log("✅ Deadlock resolved - System operational", "success");
            }
            
            // Reset deadlocked state
            this.processes.forEach(process => {
                if (process.state === 'deadlocked') {
                    process.state = 'ready';
                }
            });
        }
        
        this.updateUI();
        return deadlockProcesses;
    }

    toggleAutoDetection() {
        this.autoDetectDeadlock = !this.autoDetectDeadlock;
        this.log(`⚙️ Auto deadlock detection ${this.autoDetectDeadlock ? 'enabled' : 'disabled'}`, "info");
        this.updateUI();
    }

    displayPCB(processId) {
        const process = this.processes.find(p => p.id === processId);
        if (!process) return;

        const pcbContainer = document.getElementById('pcb-display');
        const p = process;

        pcbContainer.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <!-- Process Identification -->
                <div class="col-span-2 bg-gray-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <i class="fas fa-fingerprint"></i>
                        Process Identification
                    </h3>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        <div>PID: <span class="font-mono font-bold">${p.pid}</span></div>
                        <div>Name: <span class="font-semibold">${p.name}</span></div>
                        <div>State: <span class="px-2 py-1 text-xs rounded-full ${
                            p.state === 'running' ? 'bg-green-100 text-green-800' :
                            p.state === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                            p.state === 'deadlocked' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                        }">${p.state}</span></div>
                        <div>Priority: <span class="font-semibold">${p.priority}</span></div>
                    </div>
                </div>

                <!-- CPU Registers -->
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <i class="fas fa-microchip"></i>
                        CPU Registers
                    </h3>
                    <div class="space-y-1 text-sm font-mono">
                        <div class="flex justify-between"><span>AX:</span><span class="font-bold">0x${p.cpuRegisters.AX.toString(16).toUpperCase()}</span></div>
                        <div class="flex justify-between"><span>BX:</span><span class="font-bold">0x${p.cpuRegisters.BX.toString(16).toUpperCase()}</span></div>
                        <div class="flex justify-between"><span>CX:</span><span class="font-bold">0x${p.cpuRegisters.CX.toString(16).toUpperCase()}</span></div>
                        <div class="flex justify-between"><span>DX:</span><span class="font-bold">0x${p.cpuRegisters.DX.toString(16).toUpperCase()}</span></div>
                    </div>
                </div>

                <!-- Process State -->
                <div class="bg-green-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <i class="fas fa-chart-line"></i>
                        Scheduling Info
                    </h3>
                    <div class="space-y-1 text-sm">
                        <div class="flex justify-between">
                            <span>Burst Time:</span>
                            <span class="font-semibold">${p.schedulingInfo.burstTime}ms</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Waiting Time:</span>
                            <span class="font-semibold">${p.schedulingInfo.waitingTime}ms</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Program Counter:</span>
                            <span class="font-mono">0x${p.programCounter.toString(16).toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                <!-- Resource Management -->
                <div class="col-span-2 bg-yellow-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <i class="fas fa-cubes"></i>
                        Resource Management
                    </h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <div class="font-medium mb-1">Allocated Resources:</div>
                            <div class="text-green-600">${Object.keys(p.allocated).map(r => `${r}(${p.allocated[r]})`).join(', ') || 'None'}</div>
                        </div>
                        <div>
                            <div class="font-medium mb-1">Requested Resources:</div>
                            <div class="text-red-600">${Object.keys(p.requested).map(r => `${r}(${p.requested[r]})`).join(', ') || 'None'}</div>
                        </div>
                    </div>
                </div>

                <!-- Memory Management -->
                <div class="bg-purple-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <i class="fas fa-memory"></i>
                        Memory Info
                    </h3>
                    <div class="space-y-1 text-sm">
                        <div class="flex justify-between">
                            <span>Base Register:</span>
                            <span class="font-mono">0x${p.memoryInfo.baseRegister.toString(16).toUpperCase()}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Limit Register:</span>
                            <span class="font-mono">${p.memoryInfo.limitRegister}KB</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Memory Used:</span>
                            <span class="font-semibold">${p.memoryUsed}KB</span>
                        </div>
                    </div>
                </div>

                <!-- Accounting -->
                <div class="bg-red-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <i class="fas fa-clock"></i>
                        Accounting
                    </h3>
                    <div class="space-y-1 text-sm">
                        <div class="flex justify-between">
                            <span>CPU Time Used:</span>
                            <span class="font-semibold">${p.cpuTimeUsed}ms</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Process ID:</span>
                            <span class="font-mono">${p.id}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    buildGraph() {
        const graph = {
            processes: {},
            resources: {},
            edges: []
        };
        
        this.processes.forEach(process => {
            graph.processes[process.name] = process;
        });
        
        this.resources.forEach(resource => {
            graph.resources[resource.name] = resource;
        });
        
        // Add allocation edges (resource -> process)
        this.resources.forEach(resource => {
            Object.keys(resource.allocated).forEach(processId => {
                const count = resource.allocated[processId];
                if (count > 0) {
                    const process = this.processes.find(p => p.id == processId);
                    if (process) {
                        graph.edges.push({
                            from: resource.name,
                            to: process.name,
                            type: 'allocation',
                            count: count
                        });
                    }
                }
            });
        });
        
        // Add request edges (process -> resource)
        this.processes.forEach(process => {
            Object.keys(process.requested).forEach(resourceName => {
                const count = process.requested[resourceName];
                if (count > 0) {
                    graph.edges.push({
                        from: process.name,
                        to: resourceName,
                        type: 'request',
                        count: count
                    });
                }
            });
        });
        
        return graph;
    }

    log(message, type = "info") {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;
        this.logs.unshift({ message: logEntry, type });
        
        if (this.logs.length > 50) {
            this.logs = this.logs.slice(0, 50);
        }
        
        this.updateLogsUI();
    }

    updateUI() {
        this.updateProcessList();
        this.updateResourceList();
        this.updateStatusPanels();
        this.updateDropdowns();
        this.updateStatistics();
        
        // Update auto-detection button
        const autoDetectBtn = document.getElementById('autoDetectBtn');
        if (autoDetectBtn) {
            autoDetectBtn.innerHTML = `<i class="fas fa-robot"></i> Auto Detect: ${this.autoDetectDeadlock ? 'On' : 'Off'}`;
            autoDetectBtn.className = `w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 ${this.autoDetectDeadlock ? 'pulse-animation' : ''}`;
        }
        
        if (this.graph && this.graph.render) {
            this.graph.render(this.processes, this.resources);
        }
    }

    updateStatistics() {
        document.getElementById('processCount').textContent = this.processes.length;
        document.getElementById('resourceCount').textContent = this.resources.length;
        
        const waitingProcesses = this.processes.filter(p => p.waiting).length;
        const deadlockedProcesses = this.processes.filter(p => p.state === 'deadlocked').length;
        
        // Update system status based on conditions
        if (deadlockedProcesses > 0) {
            document.getElementById('systemStatus').innerHTML = '<i class="fas fa-exclamation-triangle"></i> Deadlock Detected';
            document.getElementById('systemStatus').className = 'text-lg font-semibold text-red-600 flex items-center gap-2 pulse-animation';
        } else if (waitingProcesses > 0) {
            document.getElementById('systemStatus').innerHTML = '<i class="fas fa-clock"></i> Processes Waiting';
            document.getElementById('systemStatus').className = 'text-lg font-semibold text-yellow-600 flex items-center gap-2';
        } else {
            document.getElementById('systemStatus').innerHTML = '<i class="fas fa-check-circle"></i> Operational';
            document.getElementById('systemStatus').className = 'text-lg font-semibold text-green-600 flex items-center gap-2';
        }
    }

    updateProcessList() {
        const container = document.getElementById('processList');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.processes.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center">No processes yet</p>';
            return;
        }
        
        this.processes.forEach(process => {
            const bgClass = process.state === 'deadlocked' ? 'process-deadlocked' :
                          process.waiting ? 'process-waiting' : 'process-running';
            
            const processEl = document.createElement('div');
            processEl.className = `p-3 rounded border ${bgClass} mb-2 cursor-pointer hover:shadow-md transition-all duration-200`;
            processEl.innerHTML = `
                <div class="font-semibold">${process.name} (PID: ${process.pid})</div>
                <div class="text-sm">State: ${process.state}${process.waiting ? ' (waiting)' : ''}</div>
                <div class="text-sm">Allocated: ${Object.keys(process.allocated).map(r => `${r}(${process.allocated[r]})`).join(', ') || 'None'}</div>
                <div class="text-sm">Requested: ${Object.keys(process.requested).map(r => `${r}(${process.requested[r]})`).join(', ') || 'None'}</div>
                <button onclick="simulator.releaseAllResources(${process.id})" class="mt-2 bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded">
                    Release All
                </button>
            `;
            
            // Add click handler for PCB display
            processEl.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    this.displayPCB(process.id);
                }
            });
            
            container.appendChild(processEl);
        });
    }

    updateResourceList() {
        const container = document.getElementById('resourceList');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.resources.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center">No resources yet</p>';
            return;
        }
        
        this.resources.forEach(resource => {
            const resourceEl = document.createElement('div');
            resourceEl.className = `p-3 rounded border ${
                resource.availableInstances > 0 ? 'resource-available' : 'resource-allocated'
            } mb-2`;
            resourceEl.innerHTML = `
                <div class="font-semibold">${resource.name} (ID: ${resource.id})</div>
                <div class="text-sm">Available: ${resource.availableInstances}/${resource.totalInstances}</div>
                <div class="text-sm">Allocated to: ${Object.keys(resource.allocated).map(p => `P${p}(${resource.allocated[p]})`).join(', ') || 'None'}</div>
            `;
            container.appendChild(resourceEl);
        });
    }

    updateStatusPanels() {
        const processStatus = document.getElementById('processStatus');
        const resourceStatus = document.getElementById('resourceStatus');
        
        if (!processStatus || !resourceStatus) return;
        
        processStatus.innerHTML = '';
        resourceStatus.innerHTML = '';
        
        this.processes.forEach(process => {
            const statusEl = document.createElement('div');
            statusEl.className = 'flex justify-between text-sm mb-1';
            const statusClass = process.state === 'deadlocked' ? 'bg-red-100 text-red-800' :
                              process.waiting ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800';
            statusEl.innerHTML = `
                <span>${process.name}</span>
                <span class="px-2 py-1 text-xs rounded ${statusClass}">${process.state}${process.waiting ? ' (waiting)' : ''}</span>
            `;
            processStatus.appendChild(statusEl);
        });
        
        this.resources.forEach(resource => {
            const statusEl = document.createElement('div');
            statusEl.className = 'flex justify-between text-sm mb-1';
            statusEl.innerHTML = `
                <span>${resource.name}</span>
                <span class="px-2 py-1 text-xs rounded ${
                    resource.availableInstances > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }">${resource.availableInstances}/${resource.totalInstances}</span>
            `;
            resourceStatus.appendChild(statusEl);
        });
    }

    updateDropdowns() {
        const processSelect = document.getElementById('processSelect');
        const resourceSelect = document.getElementById('resourceSelect');
        
        if (!processSelect || !resourceSelect) return;
        
        processSelect.innerHTML = '<option value="">Select Process</option>';
        resourceSelect.innerHTML = '<option value="">Select Resource</option>';
        
        this.processes.forEach(process => {
            const option = document.createElement('option');
            option.value = process.id;
            option.textContent = `${process.name} (ID: ${process.id})`;
            processSelect.appendChild(option);
        });
        
        this.resources.forEach(resource => {
            const option = document.createElement('option');
            option.value = resource.id;
            option.textContent = `${resource.name} (ID: ${resource.id})`;
            resourceSelect.appendChild(option);
        });
    }

    updateLogsUI() {
        const logsContainer = document.getElementById('logs');
        if (!logsContainer) return;
        
        logsContainer.innerHTML = '';
        
        this.logs.forEach(log => {
            const logDiv = document.createElement('div');
            logDiv.className = `mb-1 log-${log.type}`;
            logDiv.textContent = log.message;
            logsContainer.appendChild(logDiv);
        });
        
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }

    autoSimulate() {
        if (this.isSimulating) return;
        
        this.isSimulating = true;
        this.log("🚀 Starting auto-simulation...", "info");
        
        this.resetSimulation();
        
        setTimeout(() => {
            this.addProcess("P1");
            this.addProcess("P2");
            this.addResource("R1", 1);
            this.addResource("R2", 1);
            
            setTimeout(() => {
                this.requestResource(1, 1, 1);
                this.requestResource(2, 2, 1);
                
                setTimeout(() => {
                    this.requestResource(1, 2, 1);
                    this.requestResource(2, 1, 1);
                    
                    setTimeout(() => {
                        this.detectDeadlock();
                        this.isSimulating = false;
                        this.log("✅ Auto-simulation completed", "success");
                    }, 2000);
                }, 2000);
            }, 1000);
        }, 500);
    }

    resetSimulation() {
        this.processes = [];
        this.resources = [];
        this.nextProcessId = 1;
        this.nextResourceId = 1;
        this.logs = [];
        this.log("🔄 Simulation reset - Ready for new scenario", "info");
        document.getElementById('systemStatus').innerHTML = '<i class="fas fa-check-circle"></i> Operational';
        document.getElementById('systemStatus').className = 'text-lg font-semibold text-green-600 flex items-center gap-2';
        this.updateUI();
    }
}

// Create global simulator instance
const simulator = new Simulator();

// Helper functions for UI buttons
function requestResource() {
    const processSelect = document.getElementById('processSelect');
    const resourceSelect = document.getElementById('resourceSelect');
    
    const processId = parseInt(processSelect.value);
    const resourceId = parseInt(resourceSelect.value);
    
    if (!processId || !resourceId) {
        simulator.log('⚠️ Please select both process and resource', 'warning');
        return;
    }
    
    simulator.requestResource(processId, resourceId, 1);
}

function releaseResource() {
    const processSelect = document.getElementById('processSelect');
    const resourceSelect = document.getElementById('resourceSelect');
    
    const processId = parseInt(processSelect.value);
    const resourceId = parseInt(resourceSelect.value);
    
    if (!processId || !resourceId) {
        simulator.log('⚠️ Please select both process and resource', 'warning');
        return;
    }
    
    simulator.releaseResource(processId, resourceId, 1);
}

function clearLogs() {
    simulator.logs = [];
    simulator.updateLogsUI();
    simulator.log('🗑️ Logs cleared', 'info');
}

async function init(total,pids,max_claims){
  await fetch('/api/init', {method:'POST',headers:{'Content-Type':'application/json'},
    body: JSON.stringify({total,pids,max_claims})});
}

async function requestResources(pid, reqArr, mode='banker'){
  const resp = await fetch('/api/request', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({pid: pid, request: reqArr, mode})
  });
  return resp.json();
}

async function detect(){
  const r = await fetch('/api/detect'); return r.json();
}

async function recover(strategy, deadlocked_set=null){
  const r = await fetch('/api/recover',{
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({strategy, deadlocked_set})
  });
  return r.json();
}

async function setPolicy(policy, order=null){
  const r = await fetch('/api/prevention/set', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({policy, resource_order: order})
  });
  return r.json();
}

// Send resource request
async function sendRequest(pid, req, mode='banker') {
  const res = await fetch('/api/request', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({pid, request: req, mode})
  });
  const data = await res.json();
  showMessage(`Request from ${pid}: ${data.reason}`);
}

// Detect deadlocks
async function detectDeadlock() {
  const res = await fetch('/api/detect');
  const data = await res.json();
  if (data.cycles.length > 0)
    showMessage(`Deadlock detected among: ${JSON.stringify(data.cycles)}`);
  else
    showMessage('No deadlock detected.');
}

// Recover from deadlock
async function recover(strategy='terminate_lowest') {
  const res = await fetch('/api/recover', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({strategy})
  });
  const data = await res.json();
  showMessage(`Recovery: ${data.actions}`);
}

// Set prevention policy
async function setPolicy(policy='resource_ordering', order=[0,1]) {
  const res = await fetch('/api/prevention/set', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({policy, resource_order: order})
  });
  const data = await res.json();
  showMessage(`Policy set: ${policy}`);
}

// Utility to show output (you can update your HTML DOM instead)
function showMessage(msg) {
  console.log(msg);
  document.getElementById('output').textContent += msg + '\\n';
}
