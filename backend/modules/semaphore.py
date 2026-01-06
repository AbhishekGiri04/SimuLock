class BinarySemaphore:
    """Binary semaphore implementation for resource management"""
    
    def __init__(self, initial_value=1):
        self.value = initial_value  # 0 or 1
        self.waiting_queue = []  # List of process IDs waiting for the semaphore
        self.name = "BinarySemaphore"
        
    def wait(self, process_id):
        """P operation - Request semaphore"""
        if self.value == 1:
            self.value = 0
            print(f"Semaphore acquired by Process {process_id}")
            return True
        else:
            # Add to waiting queue if not already there
            if process_id not in self.waiting_queue:
                self.waiting_queue.append(process_id)
                print(f"Process {process_id} added to semaphore waiting queue")
            return False
    
    def signal(self):
        """V operation - Release semaphore"""
        if self.waiting_queue:
            # Wake up the first process in the queue
            next_process = self.waiting_queue.pop(0)
            print(f"Semaphore released, waking up Process {next_process}")
            return next_process
        else:
            self.value = 1
            print("Semaphore released, no processes waiting")
            return None
    
    def get_waiting_count(self):
        """Get number of processes waiting"""
        return len(self.waiting_queue)
    
    def is_available(self):
        """Check if semaphore is available"""
        return self.value == 1
    
    def to_dict(self):
        """Convert semaphore to dictionary"""
        return {
            "value": self.value,
            "waiting_queue": self.waiting_queue.copy(),
            "waiting_count": len(self.waiting_queue),
            "available": self.is_available()
        }


class SemaphoreManager:
    """Manages semaphores for resources"""
    
    def __init__(self):
        self.semaphores = {}  # resource_id -> BinarySemaphore
    
    def create_semaphore(self, resource_id, initial_value=1):
        """Create a semaphore for a resource"""
        semaphore = BinarySemaphore(initial_value)
        self.semaphores[resource_id] = semaphore
        return semaphore
    
    def get_semaphore(self, resource_id):
        """Get semaphore for a resource"""
        return self.semaphores.get(resource_id)
    
    def request_resource(self, resource_id, process_id):
        """Request resource using semaphore"""
        semaphore = self.get_semaphore(resource_id)
        if semaphore:
            return semaphore.wait(process_id)
        return False
    
    def release_resource(self, resource_id):
        """Release resource using semaphore"""
        semaphore = self.get_semaphore(resource_id)
        if semaphore:
            return semaphore.signal()
        return None
    
    def get_semaphore_status(self, resource_id):
        """Get status of a semaphore"""
        semaphore = self.get_semaphore(resource_id)
        if semaphore:
            return semaphore.to_dict()
        return None
    
    def reset(self):
        """Reset all semaphores"""
        self.semaphores.clear()
    
    def to_dict(self):
        """Convert all semaphores to dictionary"""
        return {
            resource_id: semaphore.to_dict()
            for resource_id, semaphore in self.semaphores.items()
        }