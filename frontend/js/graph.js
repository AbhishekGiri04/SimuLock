class Graph {
    constructor() {
        this.svg = document.getElementById('graph-canvas');
        this.nodes = [];
        this.edges = [];
    }

    render(processes, resources) {
        if (!this.svg) {
            console.error("Graph canvas not found!");
            return;
        }
        
        // Clear SVG
        this.svg.innerHTML = '';
        
        this.updateGraph(processes, resources);
        this.drawGraph();
    }

    updateGraph(processes, resources) {
        this.nodes = [];
        this.edges = [];
        
        // Position processes at top
        processes.forEach((process, index) => {
            this.nodes.push({
                id: process.name,
                type: 'process',
                x: 100 + (index * 150),
                y: 80,
                state: process.state,
                waiting: process.waiting,
                allocated: process.allocated,
                requested: process.requested
            });
        });
        
        // Position resources at bottom
        resources.forEach((resource, index) => {
            this.nodes.push({
                id: resource.name,
                type: 'resource',
                x: 100 + (index * 150),
                y: 220,
                available: resource.availableInstances,
                total: resource.totalInstances,
                allocated: resource.allocated
            });
        });
        
        // Add allocation edges (resource -> process)
        resources.forEach(resource => {
            Object.keys(resource.allocated).forEach(processId => {
                const allocatedCount = resource.allocated[processId];
                if (allocatedCount > 0) {
                    const process = processes.find(p => p.id == processId);
                    if (process) {
                        this.edges.push({
                            from: resource.name,
                            to: process.name,
                            type: 'allocation',
                            count: allocatedCount
                        });
                    }
                }
            });
        });
        
        // Add request edges (process -> resource)
        processes.forEach(process => {
            Object.keys(process.requested).forEach(resourceName => {
                const requestedCount = process.requested[resourceName];
                if (requestedCount > 0) {
                    this.edges.push({
                        from: process.name,
                        to: resourceName,
                        type: 'request',
                        count: requestedCount
                    });
                }
            });
        });
    }

    drawGraph() {
        // Draw edges first (so they appear behind nodes)
        this.edges.forEach(edge => {
            this.drawEdge(edge);
        });
        
        // Draw nodes on top
        this.nodes.forEach(node => {
            this.drawNode(node);
        });
    }

    drawNode(node) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        let fillColor, strokeColor;
        if (node.type === 'process') {
            // Process node (circle)
            fillColor = node.state === 'deadlocked' ? '#ef4444' : 
                       node.waiting ? '#f59e0b' : '#3b82f6';
            strokeColor = '#1e40af';
            
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);
            circle.setAttribute('r', 25);
            circle.setAttribute('fill', fillColor);
            circle.setAttribute('stroke', strokeColor);
            circle.setAttribute('stroke-width', '2');
            group.appendChild(circle);
            
            // Process label
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', node.x);
            text.setAttribute('y', node.y + 5);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', 'white');
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('font-size', '12');
            text.textContent = node.id;
            group.appendChild(text);
            
        } else {
            // Resource node (rectangle)
            fillColor = node.available > 0 ? '#10b981' : '#ef4444';
            strokeColor = '#047857';
            
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', node.x - 30);
            rect.setAttribute('y', node.y - 20);
            rect.setAttribute('width', 60);
            rect.setAttribute('height', 40);
            rect.setAttribute('fill', fillColor);
            rect.setAttribute('stroke', strokeColor);
            rect.setAttribute('stroke-width', '2');
            rect.setAttribute('rx', '5'); // Rounded corners
            group.appendChild(rect);
            
            // Resource label
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', node.x);
            text.setAttribute('y', node.y - 5);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', 'white');
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('font-size', '12');
            text.textContent = node.id;
            group.appendChild(text);
            
            // Resource availability
            const availabilityText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            availabilityText.setAttribute('x', node.x);
            availabilityText.setAttribute('y', node.y + 10);
            availabilityText.setAttribute('text-anchor', 'middle');
            availabilityText.setAttribute('fill', 'white');
            availabilityText.setAttribute('font-size', '10');
            availabilityText.textContent = `${node.available}/${node.total}`;
            group.appendChild(availabilityText);
        }
        
        this.svg.appendChild(group);
    }

    drawEdge(edge) {
        const fromNode = this.nodes.find(n => n.id === edge.from);
        const toNode = this.nodes.find(n => n.id === edge.to);
        
        if (!fromNode || !toNode) {
            console.warn(`Edge from ${edge.from} to ${edge.to} - node not found`);
            return;
        }
        
        // Create line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', fromNode.x);
        line.setAttribute('y1', fromNode.y);
        line.setAttribute('x2', toNode.x);
        line.setAttribute('y2', toNode.y);
        line.setAttribute('stroke', edge.type === 'allocation' ? '#10b981' : '#ef4444');
        line.setAttribute('stroke-width', '2');
        
        if (edge.type === 'request') {
            line.setAttribute('stroke-dasharray', '5,5');
        }
        
        this.svg.appendChild(line);
        
        // Draw arrowhead
        this.drawArrowhead(fromNode, toNode, edge.type);
        
        // Draw edge label if count > 1
        if (edge.count > 1) {
            const midX = (fromNode.x + toNode.x) / 2;
            const midY = (fromNode.y + toNode.y) / 2;
            
            const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            
            const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            background.setAttribute('x', midX - 10);
            background.setAttribute('y', midY - 8);
            background.setAttribute('width', 20);
            background.setAttribute('height', 16);
            background.setAttribute('fill', 'white');
            background.setAttribute('stroke', edge.type === 'allocation' ? '#10b981' : '#ef4444');
            background.setAttribute('stroke-width', '1');
            background.setAttribute('rx', '3');
            labelGroup.appendChild(background);
            
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', midX);
            label.setAttribute('y', midY + 4);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('font-size', '10');
            label.setAttribute('font-weight', 'bold');
            label.setAttribute('fill', edge.type === 'allocation' ? '#10b981' : '#ef4444');
            label.textContent = edge.count.toString();
            labelGroup.appendChild(label);
            
            this.svg.appendChild(labelGroup);
        }
    }

    drawArrowhead(fromNode, toNode, edgeType) {
        const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
        const headlen = 10;
        
        // Calculate arrow position based on node types
        let startX, startY;
        
        if (fromNode.type === 'process') {
            // Arrow starts from process circle edge
            startX = fromNode.x + 25 * Math.cos(angle);
            startY = fromNode.y + 25 * Math.sin(angle);
        } else {
            // Arrow starts from resource rectangle edge
            // Simple approach: use line intersection with rectangle
            const dx = toNode.x - fromNode.x;
            const dy = toNode.y - fromNode.y;
            const scale = 30 / Math.max(Math.abs(dx), Math.abs(dy));
            startX = fromNode.x + dx * scale;
            startY = fromNode.y + dy * scale;
        }
        
        // Adjust end point to avoid overlapping with target node
        let endX, endY;
        if (toNode.type === 'process') {
            // Arrow ends at process circle edge
            endX = toNode.x - 25 * Math.cos(angle);
            endY = toNode.y - 25 * Math.sin(angle);
        } else {
            // Arrow ends at resource rectangle edge
            const dx = fromNode.x - toNode.x;
            const dy = fromNode.y - toNode.y;
            const scale = 30 / Math.max(Math.abs(dx), Math.abs(dy));
            endX = toNode.x - dx * scale;
            endY = toNode.y - dy * scale;
        }
        
        // Redraw the line with adjusted endpoints
        const existingLine = this.svg.querySelector('line:last-of-type');
        if (existingLine) {
            existingLine.setAttribute('x1', startX);
            existingLine.setAttribute('y1', startY);
            existingLine.setAttribute('x2', endX);
            existingLine.setAttribute('y2', endY);
        }
        
        // Create arrowhead
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const pathData = `M ${endX} ${endY} 
                        L ${endX - headlen * Math.cos(angle - Math.PI/6)} ${endY - headlen * Math.sin(angle - Math.PI/6)}
                        L ${endX - headlen * Math.cos(angle + Math.PI/6)} ${endY - headlen * Math.sin(angle + Math.PI/6)}
                        Z`;
        
        arrow.setAttribute('d', pathData);
        arrow.setAttribute('fill', edgeType === 'allocation' ? '#10b981' : '#ef4444');
        this.svg.appendChild(arrow);
    }

    detectDeadlock(graph) {
        const visited = new Set();
        const recursionStack = new Set();
        const deadlockNodes = new Set();

        const dfs = (nodeName, path = []) => {
            if (recursionStack.has(nodeName)) {
                // Cycle detected
                const cycleStart = path.indexOf(nodeName);
                if (cycleStart !== -1) {
                    const cycle = path.slice(cycleStart);
                    cycle.forEach(node => deadlockNodes.add(node));
                }
                return;
            }

            if (visited.has(nodeName)) return;

            visited.add(nodeName);
            recursionStack.add(nodeName);

            // Get outgoing edges from this node
            const outgoingEdges = graph.edges.filter(edge => edge.from === nodeName);
            
            for (const edge of outgoingEdges) {
                dfs(edge.to, [...path, nodeName]);
            }

            recursionStack.delete(nodeName);
        };

        // Start DFS from each process node
        Object.keys(graph.processes).forEach(processName => {
            if (!visited.has(processName)) {
                dfs(processName);
            }
        });

        // Start DFS from each resource node
        Object.keys(graph.resources).forEach(resourceName => {
            if (!visited.has(resourceName)) {
                dfs(resourceName);
            }
        });

        return Array.from(deadlockNodes).filter(node => graph.processes[node]);
    }
}