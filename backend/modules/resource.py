import json
from datetime import datetime

class Resource:
    def __init__(self, rid, name, resource_type="binary"):
        self.rid = rid
        self.name = name
        self.resource_type = resource_type  # binary, counting, etc.
        self.available = True
        self.held_by = None  # PID of process holding this resource
        self.waiting_queue = []  # List of PIDs waiting for this resource
        self.created_at = datetime.now()
        self.usage_count = 0
        
    def allocate(self, process_id):
        """Allocate resource to a process"""
        if self.available:
            self.available = False
            self.held_by = process_id
            self.usage_count += 1
            
            # Remove from waiting queue if present
            if process_id in self.waiting_queue:
                self.waiting_queue.remove(process_id)
                
            print(f"Resource {self.rid} allocated to Process {process_id}")
            return True
        return False
    
    def release(self):
        """Release the resource"""
        if not self.available:
            previous_holder = self.held_by
            self.available = True
            self.held_by = None
            print(f"Resource {self.rid} released by Process {previous_holder}")
            return previous_holder
        return None
    
    def add_to_waiting_queue(self, process_id):
        """Add process to waiting queue"""
        if process_id not in self.waiting_queue:
            self.waiting_queue.append(process_id)
            return True
        return False
    
    def remove_from_waiting_queue(self, process_id):
        """Remove process from waiting queue"""
        if process_id in self.waiting_queue:
            self.waiting_queue.remove(process_id)
            return True
        return False
    
    def get_next_waiting_process(self):
        """Get the next process in waiting queue (FIFO)"""
        if self.waiting_queue:
            return self.waiting_queue[0]
        return None
    
    def is_available(self):
        """Check if resource is available"""
        return self.available
    
    def get_holder(self):
        """Get current holder of the resource"""
        return self.held_by
    
    def get_waiting_count(self):
        """Get number of processes waiting for this resource"""
        return len(self.waiting_queue)
    
    def to_dict(self):
        """Convert resource to dictionary for JSON serialization"""
        return {
            "rid": self.rid,
            "name": self.name,
            "type": self.resource_type,
            "available": self.available,
            "held_by": self.held_by,
            "waiting_queue": self.waiting_queue.copy(),
            "waiting_count": len(self.waiting_queue),
            "usage_count": self.usage_count,
            "created_at": self.created_at.isoformat()
        }
    
    def __str__(self):
        status = "Available" if self.available else f"Held by Process {self.held_by}"
        return f"Resource {self.rid} ({self.name}) - {status}"
    
    def __repr__(self):
        return f"Resource(rid={self.rid}, name={self.name}, available={self.available})"


class ResourceManager:
    """Manages all resources in the system"""
    
    def __init__(self):
        self.resources = []
        self.next_rid = 1
    
    def create_resource(self, name, resource_type="binary"):
        """Create a new resource"""
        resource = Resource(self.next_rid, name, resource_type)
        self.resources.append(resource)
        self.next_rid += 1
        return resource
    
    def get_resource(self, rid):
        """Get resource by RID"""
        for resource in self.resources:
            if resource.rid == rid:
                return resource
        return None
    
    def get_available_resources(self):
        """Get all available resources"""
        return [r for r in self.resources if r.available]
    
    def get_allocated_resources(self):
        """Get all allocated resources"""
        return [r for r in self.resources if not r.available]
    
    def release_resource(self, rid):
        """Release a resource"""
        resource = self.get_resource(rid)
        if resource:
            return resource.release()
        return None
    
    def get_resources_by_holder(self, process_id):
        """Get all resources held by a specific process"""
        return [r for r in self.resources if r.held_by == process_id]
    
    def get_all_resources(self):
        """Get all resources"""
        return self.resources.copy()
    
    def get_resource_count(self):
        """Get total number of resources"""
        return len(self.resources)
    
    def reset(self):
        """Reset all resources"""
        self.resources.clear()
        self.next_rid = 1
    
    def to_dict(self):
        """Convert all resources to dictionary"""
        return {
            "resources": [r.to_dict() for r in self.resources],
            "total_resources": len(self.resources),
            "next_rid": self.next_rid
        }