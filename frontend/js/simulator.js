class Simulator {
    constructor() {
        this.processes = [];
        this.resources = [];
        this.logs = [];
        this.isSimulating = false;
        this.graph = new Graph();
        this.autoAssignEnabled = true;
        this.nextProcessId = 1;
        this.nextResourceId = 1;
    }

    addProcess(name) {
        const process = {
            id: this.nextProcessId++,
            name: name || `P${this.processes.length + 1}`,
            allocated: {}, // {resourceName: count}
            requested: {}, // {resourceName: count}
            state: 'running',
            waiting: false
        };
        this.processes.push(process);
        this.log(`Process ${process.name} added`, "success");
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
            allocated: {} // {processId: count}
        };
        this.resources.push(resource);
        this.log(`Resource ${resource.name} added with ${instances} instances`, "success");
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
            if (process.state === 'running' && process.waiting) {
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
        
        // Second: Assign free resources to available processes
        if (!assigned) {
            this.processes.forEach(process => {
                if (process.state === 'running' && !process.waiting) {
                    this.resources.forEach(resource => {
                        if (resource.availableInstances > 0) {
                            const currentAllocation = process.allocated[resource.name] || 0;
                            if (currentAllocation === 0) {
                                this.assignResource(process.id, resource.id, 1);
                                assigned = true;
                            }
                        }
                    });
                }
            });
        }
        
        if (assigned) {
            this.log("Auto-assigned free resources to processes", "info");
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
        
        console.log(`Before assignment - Process ${process.name} allocated:`, process.allocated);
        console.log(`Before assignment - Resource ${resource.name} allocated:`, resource.allocated);
        
        // Allocate resource
        resource.availableInstances -= count;
        
        // Update process allocations
        process.allocated[resource.name] = (process.allocated[resource.name] || 0) + count;
        
        // Update resource allocations
        resource.allocated[process.id] = (resource.allocated[process.id] || 0) + count;
        
        // Remove from requested if it was there
        if (process.requested[resource.name] > 0) {
            process.requested[resource.name] -= count;
            if (process.requested[resource.name] <= 0) {
                delete process.requested[resource.name];
                process.waiting = false;
                this.log(`${process.name} got the requested ${resource.name} and is no longer waiting`, "success");
            }
        }
        
        console.log(`After assignment - Process ${process.name} allocated:`, process.allocated);
        console.log(`After assignment - Resource ${resource.name} allocated:`, resource.allocated);
        
        this.log(`Assigned ${count} instance(s) of ${resource.name} to ${process.name}`, "success");
        this.updateUI();
        return true;
    }

    requestResource(processId, resourceId, count = 1) {
        const process = this.processes.find(p => p.id === processId);
        const resource = this.resources.find(r => r.id === resourceId);
        
        if (!process || !resource) {
            this.log("Process or resource not found", "error");
            return false;
        }
        
        process.requested[resource.name] = (process.requested[resource.name] || 0) + count;
        process.waiting = true;
        
        this.log(`${process.name} requested ${count} instance(s) of ${resource.name}`, "info");
        
        // Try to fulfill request immediately
        if (resource.availableInstances >= count) {
            this.assignResource(processId, resourceId, count);
        } else {
            this.log(`${process.name} is now waiting for ${resource.name}`, "warning");
        }
        
        this.updateUI();
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
        console.log(`Release attempt - Process ${process.name} has ${allocatedCount} of ${resource.name}`);
        
        if (allocatedCount < count) {
            this.log(`${process.name} doesn't have ${count} instances of ${resource.name} allocated (only has ${allocatedCount})`, "warning");
            return false;
        }
        
        console.log(`Before release - Process ${process.name} allocated:`, process.allocated);
        console.log(`Before release - Resource ${resource.name} allocated:`, resource.allocated);
        console.log(`Before release - Resource ${resource.name} available: ${resource.availableInstances}`);
        
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
        
        console.log(`After release - Process ${process.name} allocated:`, process.allocated);
        console.log(`After release - Resource ${resource.name} allocated:`, resource.allocated);
        console.log(`After release - Resource ${resource.name} available: ${resource.availableInstances}`);
        
        this.log(`Released ${count} instance(s) of ${resource.name} from ${process.name}`, "success");
        
        // Auto-assign to waiting processes
        if (this.autoAssignEnabled) {
            setTimeout(() => {
                this.autoAssignResources();
            }, 100);
        }
        
        this.updateUI();
        return true;
    }

    releaseAllResources(processId) {
        const process = this.processes.find(p => p.id === processId);
        if (!process) {
            this.log("Process not found", "error");
            return false;
        }
        
        let releasedCount = 0;
        
        console.log(`Releasing all resources from ${process.name}`, process.allocated);
        
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
                
                console.log(`Released ${count} of ${resourceName} from ${process.name}`);
            }
        });
        
        // Clear all process allocations
        process.allocated = {};
        process.waiting = false;
        
        this.log(`Released all resources (${releasedCount} instances) from ${process.name}`, "success");
        
        // Auto-assign released resources
        if (this.autoAssignEnabled) {
            setTimeout(() => {
                this.autoAssignResources();
            }, 100);
        }
        
        this.updateUI();
        return true;
    }

    detectDeadlock() {
        this.log("Running deadlock detection...", "info");
        
        const graph = this.buildGraph();
        const deadlockProcesses = this.graph.detectDeadlock(graph);
        
        if (deadlockProcesses.length > 0) {
            this.log(`🚨 DEADLOCK DETECTED! Involved processes: ${deadlockProcesses.join(', ')}`, "error");
            
            // Mark deadlocked processes
            this.processes.forEach(process => {
                if (deadlockProcesses.includes(process.name)) {
                    process.state = 'deadlocked';
                }
            });
        } else {
            this.log("✅ No deadlock detected", "success");
            
            // Reset deadlocked state
            this.processes.forEach(process => {
                if (process.state === 'deadlocked') {
                    process.state = 'running';
                }
            });
        }
        
        this.updateUI();
        return deadlockProcesses;
    }

    buildGraph() {
        const graph = {
            processes: {},
            resources: {},
            edges: []
        };
        
        // Add processes to graph
        this.processes.forEach(process => {
            graph.processes[process.name] = process;
        });
        
        // Add resources to graph
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
        
        // Update graph
        if (this.graph && this.graph.render) {
            this.graph.render(this.processes, this.resources);
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
            processEl.className = `p-3 rounded border ${bgClass} mb-2`;
            processEl.innerHTML = `
                <div class="font-semibold">${process.name} (ID: ${process.id})</div>
                <div class="text-sm">State: ${process.state}${process.waiting ? ' (waiting)' : ''}</div>
                <div class="text-sm">Allocated: ${Object.keys(process.allocated).map(r => `${r}(${process.allocated[r]})`).join(', ') || 'None'}</div>
                <div class="text-sm">Requested: ${Object.keys(process.requested).map(r => `${r}(${process.requested[r]})`).join(', ') || 'None'}</div>
                <button onclick="simulator.releaseAllResources(${process.id})" class="mt-2 bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded">
                    Release All
                </button>
            `;
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
        this.log("Starting auto-simulation...", "info");
        
        this.resetSimulation();
        
        setTimeout(() => {
            this.addProcess("P1");
            this.addProcess("P2");
            this.addResource("R1", 1);
            this.addResource("R2", 1);
            
            setTimeout(() => {
                this.requestResource(1, 1, 1); // P1 requests R1
                this.requestResource(2, 2, 1); // P2 requests R2
                
                setTimeout(() => {
                    this.requestResource(1, 2, 1); // P1 requests R2
                    this.requestResource(2, 1, 1); // P2 requests R1
                    
                    setTimeout(() => {
                        this.detectDeadlock();
                        this.isSimulating = false;
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
        this.log("Simulation reset", "info");
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
        simulator.log('Please select both process and resource', 'warning');
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
        simulator.log('Please select both process and resource', 'warning');
        return;
    }
    
    simulator.releaseResource(processId, resourceId, 1);
}