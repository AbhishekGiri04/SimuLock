"""
Banker's Algorithm + Prevention & Recovery Strategies
File: banker.py

Features:
  - ResourceManager: Banker's avoidance (safety check + request handling)
  - Deadlock detection via wait-for graph (cycle detection)
  - Recovery strategies: terminate victim, preempt resources, rollback to checkpoint
  - PreventionManager: prevention policies (resource ordering, no-hold-and-wait, direct allocation)
"""
from copy import deepcopy
import random

class ResourceManager:
    def __init__(self, total_resources, process_ids, max_claims):
        """
        total_resources: list[int]      - total units per resource type
        process_ids: list[hashable]     - process identifiers
        max_claims: dict pid -> list[int] - maximum claim per process per resource
        """
        self.total = list(total_resources)
        self.m = len(total_resources)
        self.processes = list(process_ids)

        # state vectors/matrices
        self.available = list(total_resources)  # initially all available
        self.max = {pid: list(max_claims[pid]) for pid in process_ids}
        self.allocation = {pid: [0]*self.m for pid in process_ids}
        self.need = {pid: [self.max[pid][i] - self.allocation[pid][i] for i in range(self.m)] for pid in process_ids}

        # simple checkpoints for rollback demonstration
        self.checkpoints = {pid: [] for pid in process_ids}

    def snapshot(self):
        """Return deep copy of manager state (for debugging/testing)."""
        return {
            'available': list(self.available),
            'allocation': deepcopy(self.allocation),
            'need': deepcopy(self.need)
        }

    def take_checkpoint(self, pid):
        """Save a lightweight checkpoint for pid (allocation + need)."""
        if pid not in self.processes:
            return
        self.checkpoints[pid].append((list(self.allocation[pid]), list(self.need[pid])))
        # keep last k checkpoints
        if len(self.checkpoints[pid]) > 5:
            self.checkpoints[pid].pop(0)

    def rollback_to_checkpoint(self, pid):
        """Restore most recent checkpoint for pid (if any). Returns True if rolled back."""
        if pid not in self.processes:
            return False
        if not self.checkpoints[pid]:
            return False
        alloc, need = self.checkpoints[pid].pop()  # last
        # compute diff and adjust available
        diff = [self.allocation[pid][i] - alloc[i] for i in range(self.m)]
        for i in range(self.m):
            self.available[i] += diff[i]
        self.allocation[pid] = alloc
        self.need[pid] = need
        return True

    def is_safe_state(self):
        """Run safety algorithm to see if system is in safe state. Returns (True, seq) or (False, None)"""
        work = list(self.available)
        finish = {pid: False for pid in self.processes}
        seq = []
        changed = True
        while changed:
            changed = False
            for pid in self.processes:
                if not finish[pid]:
                    if all(self.need[pid][i] <= work[i] for i in range(self.m)):
                        # pretend to run
                        for i in range(self.m):
                            work[i] += self.allocation[pid][i]
                        finish[pid] = True
                        seq.append(pid)
                        changed = True
        if all(finish.values()):
            return True, seq
        return False, None

    def request_resources(self, pid, req):
        """
        Attempt to allocate req(list) to pid using Banker's algorithm.
        Returns (granted: bool, reason: str)
        """
        # basic checks
        if pid not in self.processes:
            return False, "unknown pid"
        if any(req[i] > self.need[pid][i] for i in range(self.m)):
            return False, "request exceeds declared maximum need"

        if all(req[i] <= self.available[i] for i in range(self.m)):
            # pretend allocate
            for i in range(self.m):
                self.available[i] -= req[i]
                self.allocation[pid][i] += req[i]
                self.need[pid][i] -= req[i]

            safe, seq = self.is_safe_state()
            if safe:
                # take a checkpoint (optional) for rollback
                self.take_checkpoint(pid)
                return True, f"granted, safe sequence: {seq}"
            else:
                # rollback pretend allocation
                for i in range(self.m):
                    self.available[i] += req[i]
                    self.allocation[pid][i] -= req[i]
                    self.need[pid][i] += req[i]
                return False, "denied: would lead to unsafe state"
        else:
            return False, "blocked: not enough available resources"

    # ---------- Deadlock detection: wait-for graph approach ----------
    def build_wait_for_graph(self):
        """Return adjacency list: pid -> list of pids it's waiting for."""
        # a process p is waiting for q if p has a pending request that cannot be satisfied
        # here we infer waiting: if need>0 and available doesn't suffice, add edges to holders
        adjacency = {pid: [] for pid in self.processes}
        for pid in self.processes:
            # if process still needs resources and cannot be satisfied immediately
            if any(self.need[pid][i] > 0 for i in range(self.m)):
                if any(self.need[pid][i] > self.available[i] for i in range(self.m)):
                    # add edges to processes holding the needed resource(s)
                    for i in range(self.m):
                        if self.need[pid][i] > self.available[i]:
                            # link to all processes that hold resource i
                            holders = [q for q in self.processes if self.allocation[q][i] > 0]
                            for h in holders:
                                if h != pid and h not in adjacency[pid]:
                                    adjacency[pid].append(h)
        return adjacency

    def detect_deadlock(self):
        """Detect cycles in wait-for graph. Returns list of cycles (each cycle is list of pids)."""
        g = self.build_wait_for_graph()
        visited = set()
        stack = []
        onstack = set()
        cycles = []

        def dfs(u):
            visited.add(u)
            stack.append(u); onstack.add(u)
            for v in g.get(u, []):
                if v not in visited:
                    dfs(v)
                elif v in onstack:
                    # found a cycle; reconstruct
                    idx = stack.index(v)
                    cycle = stack[idx:]
                    cycles.append(list(cycle))
            stack.pop(); onstack.remove(u)

        for node in self.processes:
            if node not in visited:
                dfs(node)
        return cycles

    # ---------- Recovery strategies ----------
    def terminate_victim(self, pid):
        """Simulate termination: free pid's resources and remove from system."""
        if pid not in self.processes:
            return False
        # free resources
        for i in range(self.m):
            self.available[i] += self.allocation[pid][i]
        # remove
        self.processes.remove(pid)
        del self.allocation[pid]
        del self.need[pid]
        del self.max[pid]
        del self.checkpoints[pid]
        return True

    def preempt_resources(self, pid, amount=None):
        """Preempt some or all resources from pid.
        amount: optional list specifying how many units to take from pid per resource
        If amount is None, preempt all held resources.
        Returns freed vector.
        """
        if pid not in self.processes:
            return [0]*self.m
        if amount is None:
            amount = list(self.allocation[pid])
        freed = [0]*self.m
        for i in range(self.m):
            take = min(self.allocation[pid][i], amount[i])
            self.allocation[pid][i] -= take
            self.available[i] += take
            freed[i] = take
            # increase need accordingly
            self.need[pid][i] += take
        return freed

    def recover(self, strategy='terminate_lowest', deadlocked_set=None):
        """
        strategy options:
            - 'terminate_lowest': terminate process holding least resources
            - 'terminate_least_progress': terminate random or chosen pid (simulate least progress)
            - 'preempt_min': preempt smallest resources from victim(s)
            - 'rollback_checkpoint': attempt rollback on victims
        deadlocked_set: list of pids in deadlock (if None, detect automatically)
        Returns list of actions performed.
        """
        if deadlocked_set is None:
            cycles = self.detect_deadlock()
            if not cycles:
                return ['no_deadlock_detected']
            # flatten cycles to set
            deadlocked_set = list({p for cycle in cycles for p in cycle})

        actions = []
        if strategy == 'terminate_lowest':
            # choose victim with smallest total allocated
            victim = min(deadlocked_set, key=lambda p: sum(self.allocation[p]))
            self.terminate_victim(victim)
            actions.append(f'terminated {victim}')
            return actions

        if strategy == 'terminate_least_progress':
            victim = random.choice(deadlocked_set)
            self.terminate_victim(victim)
            actions.append(f'terminated {victim} (random/least progress)')
            return actions

        if strategy == 'preempt_min':
            # preempt 50% of each resource held by victims (rounded)
            for v in deadlocked_set:
                amt = [self.allocation[v][i]//2 for i in range(self.m)]
                freed = self.preempt_resources(v, amt)
                actions.append(f'preempted {freed} from {v}')
            return actions

        if strategy == 'rollback_checkpoint':
            rolled = []
            for v in deadlocked_set:
                ok = self.rollback_to_checkpoint(v)
                rolled.append((v, ok))
                actions.append(f'rolled_back {v}: {ok}')
            return actions

        return ['unknown_strategy']


# ---------- Prevention strategies (policies) ----------
def enforce_global_resource_ordering(process_order, resource_order):
    """
    Helper: ensure each process requests resources following resource_order.
    `process_order` is list of pids in the order they will request resources (not strictly used here).
    `resource_order` is a list of resource indices defining global order.
    This function is a guideline — actual enforcement should be done at request-time by checking
    that a process's next request obeys the global order.
    """
    # This is a placeholder helper; enforcement happens in request_with_prevention below.
    return resource_order

def _check_request_follows_order(pid, req, resource_order, last_requested):
    """
    Check that the request vector `req` only asks for resources in non-decreasing order
    according to resource_order relative to last_requested index for pid.
    `last_requested` is a dict pid->last_resource_index_requested (or -1).
    """
    # find indices with non-zero request
    indices = [i for i, v in enumerate(req) if v > 0]
    if not indices:
        return True
    # map to positions in resource_order
    positions = [resource_order.index(i) for i in indices]
    # require positions to be non-decreasing and >= last_requested
    if last_requested.get(pid, -1) > max(positions):
        return False
    return positions == sorted(positions)

class PreventionManager:
    """
    Wrapper to manage prevention policies on top of ResourceManager.
    Policies supported:
      - 'resource_ordering': enforce a global ordering of resource types.
      - 'no_hold_and_wait' : require processes to request all resources at once (atomic).
      - 'no_preemption'   : default UNIX-like, means we won't forcibly preempt unless recovery chosen.
    """
    def __init__(self, resource_manager: ResourceManager):
        self.rm = resource_manager
        self.policy = None
        self.resource_order = list(range(self.rm.m))
        self.last_requested = {pid: -1 for pid in self.rm.processes}

    def set_policy(self, policy, resource_order=None):
        self.policy = policy
        if resource_order:
            self.resource_order = list(resource_order)
        return True

    def request_with_prevention(self, pid, req):
        """
        Apply prevention policy checks and then either pass to Banker's avoidance or handle according to policy.
        Returns (granted:bool, reason:str)
        """
        if pid not in self.rm.processes:
            return False, "unknown pid"

        # No-hold-and-wait: require request to be entire remaining need
        if self.policy == 'no_hold_and_wait':
            if any(req[i] < self.rm.need[pid][i] for i in range(self.rm.m)):
                return False, "policy no_hold_and_wait: must request entire remaining need at once"

        # Resource ordering: check request indices follow global order
        if self.policy == 'resource_ordering':
            ok = _check_request_follows_order(pid, req, self.resource_order, self.last_requested)
            if not ok:
                return False, "policy resource_ordering: request order violation"
            # update last requested position
            indices = [self.resource_order.index(i) for i,v in enumerate(req) if v>0]
            if indices:
                self.last_requested[pid] = max(self.last_requested.get(pid, -1), max(indices))

        # After prevention checks, delegate to Banker's avoidance check if available
        return self.rm.request_resources(pid, req)

    def allow_direct_allocate(self, pid, req):
        """
        Bypass prevention and Banker's checks, try to allocate if available (useful for comparing policies).
        Returns (granted, reason)
        """
        if pid not in self.rm.processes:
            return False, "unknown pid"
        if any(req[i] > self.rm.need[pid][i] for i in range(self.rm.m)):
            return False, "request exceeds maximum need"
        if all(req[i] <= self.rm.available[i] for i in range(self.rm.m)):
            for i in range(self.rm.m):
                self.rm.available[i] -= req[i]
                self.rm.allocation[pid][i] += req[i]
                self.rm.need[pid][i] -= req[i]
            self.rm.take_checkpoint(pid)
            return True, "granted (direct)"
        else:
            return False, "blocked: not enough available"
