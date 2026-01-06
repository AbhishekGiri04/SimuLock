import networkx as nx
from datetime import datetime

class DeadlockDetector:
    """Detects deadlocks using Wait-For Graph analysis"""
    
    def __init__(self):
        self.wait_for_graph = nx.DiGraph()
        self.detection_history = []
        
    def build_wait_for_graph(self, processes, resources):
        """Build Wait-For Graph from current system state"""
        self.wait_for_graph.clear()
        
        # Add process nodes
        for process in processes:
            node_id = f"P{process.pid}"
            self.wait_for_graph.add_node(node_id, type='process', pid=process.pid, name=process.name)
        
        # Add resource nodes
        for resource in resources:
            node_id = f"R{resource.rid}"
            self.wait_for_graph.add_node(node_id, type='resource', rid=resource.rid, name=resource.name)
        
        # Add edges based on resource allocation and requests
        for process in processes:
            process_node = f"P{process.pid}"
            
            # Process -> Resource edges (process is waiting for resource)
            for resource_id in process.requested_resources:
                resource_node = f"R{resource_id}"
                self.wait_for_graph.add_edge(process_node, resource_node, 
                                           type='waiting_for', weight=1)
            
            # Resource -> Process edges (resource is held by process)
            for resource_id in process.allocated_resources:
                resource_node = f"R{resource_id}"
                self.wait_for_graph.add_edge(resource_node, process_node,
                                           type='held_by', weight=1)
        
        return self.wait_for_graph
    
    def detect_deadlocks(self, processes, resources):
        """Detect deadlocks in the system"""
        # Build the current Wait-For Graph
        self.build_wait_for_graph(processes, resources)
        
        # Find all cycles in the graph
        try:
            cycles = list(nx.simple_cycles(self.wait_for_graph))
            deadlocks = []
            
            for cycle in cycles:
                if self.is_deadlock_cycle(cycle):
                    deadlock_info = {
                        'cycle': cycle,
                        'description': self.format_cycle_description(cycle),
                        'processes_involved': self.get_processes_from_cycle(cycle),
                        'resources_involved': self.get_resources_from_cycle(cycle),
                        'timestamp': datetime.now().isoformat(),
                        'cycle_length': len(cycle)
                    }
                    deadlocks.append(deadlock_info)
            
            # Record detection attempt
            detection_record = {
                'timestamp': datetime.now().isoformat(),
                'deadlocks_found': len(deadlocks),
                'total_cycles': len(cycles),
                'graph_nodes': len(self.wait_for_graph.nodes()),
                'graph_edges': len(self.wait_for_graph.edges())
            }
            self.detection_history.append(detection_record)
            
            # Keep only last 100 records
            if len(self.detection_history) > 100:
                self.detection_history = self.detection_history[-100:]
            
            return {
                'has_deadlock': len(deadlocks) > 0,
                'deadlocks': deadlocks,
                'total_processes': len(processes),
                'total_resources': len(resources),
                'wait_for_graph': self.get_graph_data()
            }
            
        except Exception as e:
            return {
                'has_deadlock': False,
                'deadlocks': [],
                'error': str(e),
                'wait_for_graph': self.get_graph_data()
            }
    
    def is_deadlock_cycle(self, cycle):
        """Check if a cycle represents a real deadlock"""
        if len(cycle) < 2:
            return False
        
        # A valid deadlock cycle should alternate between processes and resources
        # and have at least 2 processes involved
        process_count = sum(1 for node in cycle if node.startswith('P'))
        return process_count >= 2
    
    def format_cycle_description(self, cycle):
        """Format cycle into human-readable description"""
        description_parts = []
        for i in range(len(cycle)):
            current = cycle[i]
            next_node = cycle[(i + 1) % len(cycle)]
            
            if current.startswith('P') and next_node.startswith('R'):
                desc = f"{current} is waiting for {next_node}"
            elif current.startswith('R') and next_node.startswith('P'):
                desc = f"{current} is held by {next_node}"
            else:
                desc = f"{current} -> {next_node}"
            
            description_parts.append(desc)
        
        return " → ".join(cycle) + f" (Cycle of {len(cycle)} nodes)"
    
    def get_processes_from_cycle(self, cycle):
        """Extract process IDs from cycle"""
        processes = []
        for node in cycle:
            if node.startswith('P'):
                pid = int(node[1:])  # Remove 'P' prefix
                processes.append(pid)
        return processes
    
    def get_resources_from_cycle(self, cycle):
        """Extract resource IDs from cycle"""
        resources = []
        for node in cycle:
            if node.startswith('R'):
                rid = int(node[1:])  # Remove 'R' prefix
                resources.append(rid)
        return resources
    
    def get_graph_data(self):
        """Get graph data for visualization"""
        nodes = []
        edges = []
        
        for node in self.wait_for_graph.nodes():
            node_data = {
                'id': node,
                'label': node,
                'type': 'process' if node.startswith('P') else 'resource'
            }
            
            # Add additional attributes
            if 'name' in self.wait_for_graph.nodes[node]:
                node_data['name'] = self.wait_for_graph.nodes[node]['name']
            
            nodes.append(node_data)
        
        for edge in self.wait_for_graph.edges(data=True):
            edge_data = {
                'from': edge[0],
                'to': edge[1],
                'type': edge[2].get('type', 'unknown'),
                'weight': edge[2].get('weight', 1)
            }
            edges.append(edge_data)
        
        return {
            'nodes': nodes,
            'edges': edges,
            'total_nodes': len(nodes),
            'total_edges': len(edges)
        }
    
    def get_detection_history(self):
        """Get detection history"""
        return self.detection_history
    
    def reset(self):
        """Reset detector"""
        self.wait_for_graph.clear()
        self.detection_history.clear()