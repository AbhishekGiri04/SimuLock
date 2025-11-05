from .process import ProcessManager
from .resource import ResourceManager
from .semaphore import SemaphoreManager
from .deadlock_detector import DeadlockDetector
import json
from datetime import datetime

class SimuLockSimulator:
    """Main simulator class that coordinates all components"""
    
    def __init__(self):
        self.process_manager = ProcessManager()
        self.resource_manager = ResourceManager()
        self.semaphore_manager = SemaphoreManager()
        self.deadlock_detector = DeadlockDetector()
        self.simulation_history = []
        self.is_running = False
        
    # Process Management
    def add_process(self, name, priority=1):
        """Add a new process to the simulation"""
        process = self.process_manager.create_process(name, priority)
        
        # Record action
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
        resource = self.resource_manager.create_resource(name, resource_type)
        
        # Create semaphore for the resource
        self.semaphore_manager.create_semaphore(resource.rid)
        
        self.record_action("resource_created", {
            "rid": resource.rid,
            "name": name,
            "type": resource_type
        })
        
        return resource
    
    def request_resource(self, process_id, resource_id):
        """Request a resource for a process"""
        process = self.process_manager.get_process(process_id)
        resource = self.resource_manager.get_resource(resource_id)
        
        if not process or not resource:
            return False, "Process or resource not found"
        
        # Use semaphore to request resource
        semaphore_success = self.semaphore_manager.request_resource(resource_id, process_id)
        
        if semaphore_success:
            # Semaphore acquired, allocate resource
            resource.allocate(process_id)
            process.allocate_resource(resource_id)
            process.cancel_request(resource_id)  # Remove from requested if it was there
            
            message = f"Resource {resource.name} allocated to {process.name}"
            action_type = "resource_allocated"
        else:
            # Semaphore not available, add to waiting
            resource.add_to_waiting_queue(process_id)
            process.request_resource(resource_id)
            
            message = f"{process.name} waiting for {resource.name}"
            action_type = "resource_waiting"
        
        self.record_action(action_type, {
            "pid": process_id,
            "rid": resource_id,
            "success": semaphore_success
        })
        
        return semaphore_success, message
    
    def release_resource(self, process_id, resource_id):
        """Release a resource from a process"""
        process = self.process_manager.get_process(process_id)
        resource = self.resource_manager.get_resource(resource_id)
        
        if not process or not resource:
            return False, "Process or resource not found"
        
        # Check if process actually holds this resource
        if resource_id not in process.allocated_resources:
            return False, f"Process {process.name} doesn't hold resource {resource.name}"
        
        # Release from process
        process.release_resource(resource_id)
        
        # Release from resource and semaphore
        previous_holder = resource.release()
        next_process = self.semaphore_manager.release_resource(resource_id)
        
        # If there's a process waiting, try to allocate to it
        if next_process:
            self.request_resource(next_process, resource_id)
        
        message = f"Resource {resource.name} released by {process.name}"
        self.record_action("resource_released", {
            "pid": process_id,
            "rid": resource_id,
            "next_process": next_process
        })
        
        return True, message
    
    # Deadlock Detection
    def detect_deadlocks(self):
        """Detect deadlocks in the current system state"""
        processes = self.process_manager.get_all_processes()
        resources = self.resource_manager.get_all_resources()
        
        result = self.deadlock_detector.detect_deadlocks(processes, resources)
        
        if result['has_deadlock']:
            self.record_action("deadlock_detected", {
                "deadlocks": result['deadlocks'],
                "total_deadlocks": len(result['deadlocks'])
            })
        
        return result
    
    # System State Management
    def get_system_state(self):
        """Get complete system state"""
        processes = self.process_manager.get_all_processes()
        resources = self.resource_manager.get_all_resources()
        
        # Build detailed state information
        system_state = {
            "processes": [p.to_dict() for p in processes],
            "resources": [r.to_dict() for r in resources],
            "semaphores": self.semaphore_manager.to_dict(),
            "statistics": self.get_system_statistics(),
            "wait_for_graph": self.deadlock_detector.get_graph_data(),
            "timestamp": datetime.now().isoformat()
        }
        
        return system_state
    
    def get_system_statistics(self):
        """Get system statistics"""
        processes = self.process_manager.get_all_processes()
        resources = self.resource_manager.get_all_resources()
        
        running_processes = len([p for p in processes if p.state == "running"])
        waiting_processes = len([p for p in processes if p.state == "waiting"])
        available_resources = len([r for r in resources if r.available])
        
        return {
            "total_processes": len(processes),
            "total_resources": len(resources),
            "running_processes": running_processes,
            "waiting_processes": waiting_processes,
            "available_resources": available_resources,
            "system_utilization": (running_processes / len(processes)) * 100 if processes else 0
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
        self.process_manager.reset()
        self.resource_manager.reset()
        self.semaphore_manager.reset()
        self.deadlock_detector.reset()
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
        
        # Create deadlock scenario: Process A holds Resource X, wants Resource Y
        # Process B holds Resource Y, wants Resource X
        self.request_resource(p1.pid, r1.rid)  # P1 gets R1
        self.request_resource(p2.pid, r2.rid)  # P2 gets R2
        self.request_resource(p1.pid, r2.rid)  # P1 waits for R2 (held by P2)
        self.request_resource(p2.pid, r1.rid)  # P2 waits for R1 (held by P1) - DEADLOCK!
        
        return {
            "message": "Deadlock scenario created automatically",
            "processes": [p1.pid, p2.pid],
            "resources": [r1.rid, r2.rid]
        }