export type GraphNode = {
  id: number;
  x: number;
  y: number;
};

export type GraphEdge = {
  source: number;
  target: number;
  weight: number;
};

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type GraphStep = {
  visitedNodes: number[];
  currentNodes: number[];
  activeEdges: [number, number][]; // [source, target]
  pathEdges?: [number, number][]; // Final shortest path edges
  distances?: Record<number, number>; // For Dijkstra
};

const buildAdjList = (graph: GraphData) => {
  const adjList: Record<number, GraphEdge[]> = {};
  graph.nodes.forEach(n => adjList[n.id] = []);
  graph.edges.forEach(e => {
    adjList[e.source].push(e);
    adjList[e.target].push({ source: e.target, target: e.source, weight: e.weight });
  });
  return adjList;
};

// Generates a clean circular layout with cross connections
export const generateRandomGraph = (numNodes: number): GraphData => {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  
  const centerX = 0.5;
  const centerY = 0.5;
  const radius = 0.35; 

  // Create nodes in a circle
  for (let i = 0; i < numNodes; i++) {
    const angle = (i / numNodes) * 2 * Math.PI - Math.PI / 2; // Start at top
    // Alternating slightly inner/outer for more organic look if many nodes
    const rOffset = numNodes > 10 ? (i % 2 === 0 ? 0.05 : -0.05) : 0;
    nodes.push({
      id: i,
      x: centerX + (radius + rOffset) * Math.cos(angle),
      y: centerY + (radius + rOffset) * Math.sin(angle),
    });
  }

  // Create edges: form a continuous outer ring to guarantee connectivity
  for (let i = 0; i < numNodes; i++) {
    const target1 = (i + 1) % numNodes;
    edges.push({ source: i, target: target1, weight: Math.floor(Math.random() * 9) + 1 });
    
    // Add random cross connections
    if (Math.random() > 0.5 && numNodes > 5) {
      // Connect to a node somewhat across the circle
      const target2 = (i + Math.floor(numNodes / 2) + Math.floor(Math.random() * 3) - 1 + numNodes) % numNodes;
      if (target2 !== i && target2 !== target1) {
        // Prevent exact duplicate edges
        if (!edges.some(e => (e.source === i && e.target === target2) || (e.source === target2 && e.target === i))) {
          edges.push({ source: i, target: target2, weight: Math.floor(Math.random() * 9) + 1 });
        }
      }
    }
  }

  return { nodes, edges };
};

export function* bfs(graph: GraphData, startNode: number): Generator<GraphStep> {
  const visited = new Set<number>();
  const queue = [startNode];
  visited.add(startNode);
  const adjList = buildAdjList(graph);

  yield {
    visitedNodes: Array.from(visited),
    currentNodes: [startNode],
    activeEdges: [],
  };

  while (queue.length > 0) {
    const current = queue.shift()!;
    yield {
      visitedNodes: Array.from(visited),
      currentNodes: [current],
      activeEdges: [],
    };

    for (const neighbor of adjList[current] || []) {
      yield {
        visitedNodes: Array.from(visited),
        currentNodes: [current, neighbor.target],
        activeEdges: [[current, neighbor.target]],
      };

      if (!visited.has(neighbor.target)) {
        visited.add(neighbor.target);
        queue.push(neighbor.target);
        yield {
          visitedNodes: Array.from(visited),
          currentNodes: [current, neighbor.target],
          activeEdges: [[current, neighbor.target]],
        };
      }
    }
  }
  
  yield {
    visitedNodes: Array.from(visited),
    currentNodes: [],
    activeEdges: [],
  };
}

export function* dfs(graph: GraphData, startNode: number): Generator<GraphStep> {
  const visited = new Set<number>();
  const adjList = buildAdjList(graph);

  function* dfsHelper(current: number, parent: number | null): Generator<GraphStep> {
    visited.add(current);
    yield {
      visitedNodes: Array.from(visited),
      currentNodes: [current],
      activeEdges: parent !== null ? [[parent, current]] : [],
    };

    for (const neighbor of adjList[current] || []) {
      if (!visited.has(neighbor.target)) {
        yield {
          visitedNodes: Array.from(visited),
          currentNodes: [current, neighbor.target],
          activeEdges: [[current, neighbor.target]],
        };
        yield* dfsHelper(neighbor.target, current);
        
        // Backtrack
        yield {
          visitedNodes: Array.from(visited),
          currentNodes: [current],
          activeEdges: [[neighbor.target, current]],
        };
      } else if (neighbor.target !== parent) {
        // Visualize checking an already visited node
         yield {
          visitedNodes: Array.from(visited),
          currentNodes: [current, neighbor.target],
          activeEdges: [[current, neighbor.target]],
        };
      }
    }
  }

  yield* dfsHelper(startNode, null);
  yield {
    visitedNodes: Array.from(visited),
    currentNodes: [],
    activeEdges: [],
  };
}

export function* dijkstra(graph: GraphData, startNode: number): Generator<GraphStep> {
  const distances: Record<number, number> = {};
  const previous: Record<number, number | null> = {};
  const unvisited = new Set<number>();
  const adjList = buildAdjList(graph);
  
  // Track visited nodes for visualization
  const visitedNodesForVis = new Set<number>();

  graph.nodes.forEach(n => {
    distances[n.id] = Infinity;
    previous[n.id] = null;
    unvisited.add(n.id);
  });

  distances[startNode] = 0;

  while (unvisited.size > 0) {
    let current: number | null = null;
    let minD = Infinity;
    for (const u of Array.from(unvisited)) {
      if (distances[u] < minD) {
        minD = distances[u];
        current = u;
      }
    }

    if (current === null || distances[current] === Infinity) {
      break; 
    }

    unvisited.delete(current);
    visitedNodesForVis.add(current);

    yield {
      visitedNodes: Array.from(visitedNodesForVis),
      currentNodes: [current],
      activeEdges: previous[current] !== null ? [[previous[current] as number, current]] : [],
      distances: { ...distances }
    };

    for (const edge of adjList[current] || []) {
      const neighbor = edge.target;
      if (unvisited.has(neighbor)) {
        yield {
          visitedNodes: Array.from(visitedNodesForVis),
          currentNodes: [current, neighbor],
          activeEdges: [[current, neighbor]],
          distances: { ...distances }
        };

        const alt = distances[current] + edge.weight;
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = current;
          yield {
            visitedNodes: Array.from(visitedNodesForVis),
            currentNodes: [current, neighbor],
            activeEdges: [[current, neighbor]],
            distances: { ...distances }
          };
        }
      }
    }
  }

  // Backtrack to find longest/target path if we had a target, 
  // but here we just find the path to the furthest node to show something cool.
  let furthestNode = startNode;
  let maxDist = -1;
  for (const [node, dist] of Object.entries(distances)) {
    if (dist > maxDist && dist !== Infinity) {
      maxDist = dist;
      furthestNode = parseInt(node);
    }
  }

  const pathEdges: [number, number][] = [];
  let curr = furthestNode;
  while (previous[curr] !== null) {
    const prev = previous[curr] as number;
    pathEdges.push([prev, curr]);
    curr = prev;
  }

  yield {
    visitedNodes: Array.from(visitedNodesForVis),
    currentNodes: [],
    activeEdges: [],
    pathEdges,
    distances
  };
}
