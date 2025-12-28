from datetime import datetime

class SimuLockSimulator:
    """Main simulator class that coordinates all components"""
    
    def __init__(self):
        self.simulation_history = []
        self.is_running = False
        self.processes = []
        self.resources = []
        self.next_pid = 1
        self.next_rid = 1
        
    # Process Management
    def add_process(self, name, priority=1):
        """Add a new process to the simulation"""
        class SimpleProcess:
            def __init__(self, pid, name):
                self.pid = pid
                self.name = name
                self.state = "ready"
                self.allocated_resources = []
                self.requested_resources = []
        
        process = SimpleProcess(self.next_pid, name)
        self.processes.append(process)
        self.next_pid += 1
        
        self.record_action("process_created", {
            "pid": process.pid,
            "name": name,
            "priority": priority
        })
        
        return process
    
    def terminate_process(self, pid):
        """Terminate a process"""
        success = self.process_manager.terminate_process(pid)
        if success:
            # Release all resources held by this process
            resources = self.resource_manager.get_resources_by_holder(pid)
            for resource in resources:
                self.release_resource(pid, resource.rid)
            
            self.record_action("process_terminated", {"pid": pid})
        
        return success
    
    # Resource Management
    def add_resource(self, name, resource_type="binary"):
        """Add a new resource to the simulation"""
        class SimpleResource:
            def __init__(self, rid, name):
                self.rid = rid
                self.name = name
                self.available = True
                self.held_by = None
        
        resource = SimpleResource(self.next_rid, name)
        self.resources.append(resource)
        self.next_rid += 1
        
        self.record_action("resource_created", {
            "rid": resource.rid,
            "name": name,
            "type": resource_type
        })
        
        return resource
    
    def request_resource(self, process_id, resource_id):
        """Request a resource for a process"""
        process = next((p for p in self.processes if p.pid == process_id), None)
        resource = next((r for r in self.resources if r.rid == resource_id), None)
        
        if not process or not resource:
            return False, "Process or resource not found"
        
        if resource.available:
            resource.available = False
            resource.held_by = process_id
            process.allocated_resources.append(resource_id)
            process.state = "running"
            message = f"Resource {resource.name} allocated to {process.name}"
            action_type = "resource_allocated"
            success = True
        else:
            process.state = "waiting"
            process.requested_resources.append(resource_id)
            message = f"{process.name} waiting for {resource.name}"
            action_type = "resource_waiting"
            success = False
        
        self.record_action(action_type, {
            "pid": process_id,
            "rid": resource_id,
            "success": success
        })
        
        return success, message
    
    def release_resource(self, process_id, resource_id):
        """Release a resource from a process"""
        process = next((p for p in self.processes if p.pid == process_id), None)
        resource = next((r for r in self.resources if r.rid == resource_id), None)
        
        if not process or not resource:
            return False, "Process or resource not found"
        
        if resource_id not in process.allocated_resources:
            return False, f"Process {process.name} doesn't hold resource {resource.name}"
        
        process.allocated_resources.remove(resource_id)
        resource.available = True
        resource.held_by = None
        process.state = "ready"
        
        message = f"Resource {resource.name} released by {process.name}"
        self.record_action("resource_released", {
            "pid": process_id,
            "rid": resource_id
        })
        
        return True, message
    
    # Deadlock Detection
    def detect_deadlocks(self):
        """Detect deadlocks in the current system state"""
        # Simple deadlock detection
        deadlocks = []
        for p in self.processes:
            if p.state == "waiting" and p.requested_resources:
                for req_rid in p.requested_resources:
                    resource = next((r for r in self.resources if r.rid == req_rid), None)
                    if resource and resource.held_by:
                        holder = next((pp for pp in self.processes if pp.pid == resource.held_by), None)
                        if holder and holder.state == "waiting":
                            deadlocks.append([p.name, holder.name])
        
        result = {
            'has_deadlock': len(deadlocks) > 0,
            'deadlocks': deadlocks
        }
        
        if result['has_deadlock']:
            self.record_action("deadlock_detected", {
                "deadlocks": result['deadlocks'],
                "total_deadlocks": len(result['deadlocks'])
            })
        
        return result
    
    # System State Management
    def get_system_state(self):
        """Get complete system state"""
        return {
            "processes": [{
                "pid": p.pid,
                "name": p.name,
                "state": p.state,
                "allocated_resources": p.allocated_resources,
                "requested_resources": p.requested_resources
            } for p in self.processes],
            "resources": [{
                "rid": r.rid,
                "name": r.name,
                "available": r.available,
                "held_by": r.held_by
            } for r in self.resources],
            "timestamp": datetime.now().isoformat()
        }
    
    def get_system_statistics(self):
        """Get system statistics"""
        running_processes = len([p for p in self.processes if p.state == "running"])
        waiting_processes = len([p for p in self.processes if p.state == "waiting"])
        available_resources = len([r for r in self.resources if r.available])
        
        return {
            "total_processes": len(self.processes),
            "total_resources": len(self.resources),
            "running_processes": running_processes,
            "waiting_processes": waiting_processes,
            "available_resources": available_resources,
            "system_utilization": (running_processes / len(self.processes)) * 100 if self.processes else 0
        }
    
    def record_action(self, action_type, data):
        """Record simulation action for history"""
        action_record = {
            "timestamp": datetime.now().isoformat(),
            "action": action_type,
            "data": data
        }
        self.simulation_history.append(action_record)
        
        # Keep only last 200 records
        if len(self.simulation_history) > 200:
            self.simulation_history = self.simulation_history[-200:]
    
    def get_simulation_history(self, limit=50):
        """Get simulation history"""
        return self.simulation_history[-limit:] if self.simulation_history else []
    
    def reset_simulation(self):
        """Reset the entire simulation"""
        self.processes = []
        self.resources = []
        self.next_pid = 1
        self.next_rid = 1
        self.simulation_history.clear()
        
        self.record_action("system_reset", {})
        
        return True
    
    def auto_simulate_deadlock(self):
        """Automatically create a deadlock scenario for demonstration"""
        self.reset_simulation()
        
        # Create processes
        p1 = self.add_process("Process A")
        p2 = self.add_process("Process B")
        
        # Create resources
        r1 = self.add_resource("Resource X")
        r2 = self.add_resource("Resource Y")
        
        # Create deadlock scenario
        self.request_resource(p1.pid, r1.rid)  # P1 gets R1
        self.request_resource(p2.pid, r2.rid)  # P2 gets R2
        self.request_resource(p1.pid, r2.rid)  # P1 waits for R2
        self.request_resource(p2.pid, r1.rid)  # P2 waits for R1 - DEADLOCK!
        
        return {
            "message": "Deadlock scenario created automatically",
            "processes": [p1.pid, p2.pid],
            "resources": [r1.rid, r2.rid]
        }
    
    # backend/modules/simulator.py
from threading import Lock
from modules.banker import ResourceManager, PreventionManager

_manager_lock = Lock()
_resource_manager = None
_prevention = None

def init_from_config(total, pids, max_claims):
    global _resource_manager, _prevention
    with _manager_lock:
        _resource_manager = ResourceManager(total, pids, max_claims)
        _prevention = PreventionManager(_resource_manager)
    return True

def ensure_initialized():
    if _resource_manager is None:
        # default small config; replace or call /api/init from frontend
        init_from_config([3,3], ['P0','P1','P2'], { 'P0':[2,1], 'P1':[1,2], 'P2':[1,1] })

def handle_request(pid, req, mode='banker'):
    ensure_initialized()
    with _manager_lock:
        if mode == 'banker':
            return _resource_manager.request_resources(pid, req)
        elif mode == 'prevention':
            return _prevention.request_with_prevention(pid, req)
        elif mode == 'direct':
            return _prevention.allow_direct_allocate(pid, req)
        else:
            return False, 'unknown_mode'

def detect_deadlocks():
    ensure_initialized()
    with _manager_lock:
        return _resource_manager.detect_deadlock()

def recover_deadlock(strategy='terminate_lowest', deadlocked_set=None):
    ensure_initialized()
    with _manager_lock:
        return _resource_manager.recover(strategy=strategy, deadlocked_set=deadlocked_set)

def set_prevention_policy(policy, resource_order=None):
    ensure_initialized()
    with _manager_lock:
        return _prevention.set_policy(policy, resource_order)

def snapshot():
    ensure_initialized()
    with _manager_lock:
        return _resource_manager.snapshot()
