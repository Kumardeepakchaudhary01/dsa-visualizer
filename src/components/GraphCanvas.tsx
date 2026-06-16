import { useEffect, useRef } from 'react';
import type { GraphData, GraphStep } from '../algorithms/graphs';

interface GraphCanvasProps {
  graph: GraphData;
  step: GraphStep;
}

const GraphCanvas: React.FC<GraphCanvasProps> = ({ graph, step }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    const width = rect.width;
    const height = rect.height;
    
    ctx.clearRect(0, 0, width, height);
    
    if (!graph.nodes.length) return;

    const getNode = (id: number) => graph.nodes.find(n => n.id === id);

    // 1. Draw all default edges
    graph.edges.forEach(edge => {
      const source = getNode(edge.source);
      const target = getNode(edge.target);
      if (!source || !target) return;

      const isPath = step.pathEdges?.some(
        ([s, t]) => (s === edge.source && t === edge.target) || (s === edge.target && t === edge.source)
      );

      const isActive = step.activeEdges.some(
        ([s, t]) => (s === edge.source && t === edge.target) || (s === edge.target && t === edge.source)
      );

      ctx.beginPath();
      ctx.moveTo(source.x * width, source.y * height);
      ctx.lineTo(target.x * width, target.y * height);
      
      if (isPath) {
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#eab308'; // yellow for final path
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 10;
      } else if (isActive) {
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ef4444'; // red for active traversal
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
      } else {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#1F2833'; // base surface color
        ctx.shadowBlur = 0;
      }
      
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    });

    // 2. Draw Nodes
    graph.nodes.forEach(node => {
      const isVisited = step.visitedNodes.includes(node.id);
      const isCurrent = step.currentNodes.includes(node.id);
      const isPath = step.pathEdges?.flat().includes(node.id);

      ctx.beginPath();
      // slightly larger radius
      const radius = isCurrent ? 18 : 15;
      ctx.arc(node.x * width, node.y * height, radius, 0, 2 * Math.PI);
      
      if (isCurrent) {
        ctx.fillStyle = '#ef4444'; 
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 15;
      } else if (isPath) {
        ctx.fillStyle = '#eab308';
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 10;
      } else if (isVisited) {
        ctx.fillStyle = '#22c55e'; 
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 5;
      } else {
        ctx.fillStyle = '#45A29E'; 
        ctx.shadowBlur = 0;
      }
      
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0B0C10';
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Draw Distance or ID
      if (step.distances && step.distances[node.id] !== undefined) {
        const d = step.distances[node.id];
        ctx.fillStyle = '#0B0C10';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(d === Infinity ? '∞' : d.toString(), node.x * width, node.y * height);
      } else {
        ctx.fillStyle = '#0B0C10';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.id.toString(), node.x * width, node.y * height);
      }
    });

    // 3. Draw Legend
    const legendX = 20;
    let legendY = 30;
    const drawLegendItem = (color: string, label: string) => {
      ctx.beginPath();
      ctx.arc(legendX + 10, legendY, 8, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.fillStyle = '#C5C6C7';
      ctx.font = '14px Inter';
      ctx.textAlign = 'left';
      ctx.fillText(label, legendX + 30, legendY);
      legendY += 25;
    };

    drawLegendItem('#45A29E', 'Unvisited Node');
    drawLegendItem('#22c55e', 'Visited Node');
    drawLegendItem('#ef4444', 'Current / Active Edge');
    if (step.distances) {
      drawLegendItem('#eab308', 'Final Path');
    }

  }, [graph, step]);

  return (
    <div className="w-full h-[500px] bg-background rounded-xl border border-gray-800 p-2 shadow-inner relative">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block"
      />
    </div>
  );
};

export default GraphCanvas;
