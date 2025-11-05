import json
from datetime import datetime

class Process:
    def __init__(self, pid, name, priority=1):
        self.pid = pid
        self.name = name
        self.priority = priority
        self.state = "ready"  # ready, running, waiting, terminated
        self.allocated_resources = []
        self.requested_resources = []
        self.created_at = datetime.now()
        self.last_state_change = datetime.now()
        self.execution_time = 0
        self.waiting_time = 0
        
    def set_state(self, new_state):
        """Update process state and track timing"""
        old_state = self.state
        self.state = new_state
        self.last_state_change = datetime.now()
        
        # Log state transition
        print(f"Process {self.pid} state changed: {old_state} -> {new_state}")
        return True
    
    def allocate_resource(self, resource_id):
        """Allocate a resource to this process"""
        if resource_id not in self.allocated_resources:
            self.allocated_resources.append(resource_id)
            self.set_state("running")
            return True
        return False
    
    def release_resource(self, resource_id):
        """Release a resource from this process"""
        if resource_id in self.allocated_resources:
            self.allocated_resources.remove(resource_id)
            # If no resources allocated, set to ready
            if not self.allocated_resources and self.state == "running":
                self.set_state("ready")
            return True
        return False
    
    def request_resource(self, resource_id):
        """Request a resource"""
        if resource_id not in self.requested_resources:
            self.requested_resources.append(resource_id)
            self.set_state("waiting")
            return True
        return False
    
    def cancel_request(self, resource_id):
        """Cancel a resource request"""
        if resource_id in self.requested_resources:
            self.requested_resources.remove(resource_id)
            # If no more requests and no resources, set to ready
            if not self.requested_resources and not self.allocated_resources:
                self.set_state("ready")
            return True
        return False
    
    def terminate(self):
        """Terminate the process"""
        self.set_state("terminated")
        self.allocated_resources.clear()
        self.requested_resources.clear()
        return True
    
    def get_waiting_time(self):
        """Calculate total waiting time"""
        if self.state == "waiting":
            current_wait = (datetime.now() - self.last_state_change).total_seconds()
            return self.waiting_time + current_wait
        return self.waiting_time
    
    def to_dict(self):
        """Convert process to dictionary for JSON serialization"""
        return {
            "pid": self.pid,
            "name": self.name,
            "state": self.state,
            "priority": self.priority,
            "allocated_resources": self.allocated_resources.copy(),
            "requested_resources": self.requested_resources.copy(),
            "created_at": self.created_at.isoformat(),
            "waiting_time": self.get_waiting_time(),
            "execution_time": self.execution_time
        }
    
    def __str__(self):
        return f"Process {self.pid} ({self.name}) - State: {self.state}"
    
    def __repr__(self):
        return f"Process(pid={self.pid}, name={self.name}, state={self.state})"


class ProcessManager:
    """Manages all processes in the system"""
    
    def __init__(self):
        self.processes = []
        self.next_pid = 1
    
    def create_process(self, name, priority=1):
        """Create a new process"""
        process = Process(self.next_pid, name, priority)
        self.processes.append(process)
        self.next_pid += 1
        return process
    
    def get_process(self, pid):
        """Get process by PID"""
        for process in self.processes:
            if process.pid == pid:
                return process
        return None
    
    def get_processes_by_state(self, state):
        """Get all processes in a specific state"""
        return [p for p in self.processes if p.state == state]
    
    def terminate_process(self, pid):
        """Terminate a process"""
        process = self.get_process(pid)
        if process:
            return process.terminate()
        return False
    
    def get_all_processes(self):
        """Get all processes"""
        return self.processes.copy()
    
    def get_process_count(self):
        """Get total number of processes"""
        return len(self.processes)
    
    def reset(self):
        """Reset all processes"""
        self.processes.clear()
        self.next_pid = 1
    
    def to_dict(self):
        """Convert all processes to dictionary"""
        return {
            "processes": [p.to_dict() for p in self.processes],
            "total_processes": len(self.processes),
            "next_pid": self.next_pid
        }