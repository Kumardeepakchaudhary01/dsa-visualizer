import React, { useEffect, useRef } from 'react';

interface ArrayCanvasProps {
  array: number[];
  comparing?: number[];
  swapping?: number[];
  sorted?: number[];
}

const ArrayCanvas: React.FC<ArrayCanvasProps> = ({ array, comparing = [], swapping = [], sorted = [] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Only resize canvas if dimensions actually changed
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    const width = rect.width;
    const height = rect.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    if (array.length === 0) return;

    const maxVal = Math.max(...array);
    const barWidth = width / array.length;

    array.forEach((val, i) => {
      const barHeight = Math.max((val / maxVal) * height * 0.9, 2); // At least 2px height
      const x = i * barWidth;
      const y = height - barHeight;

      // Determine color
      let color = '#45A29E'; // secondary (default)
      
      if (swapping.includes(i)) {
        color = '#ef4444'; // Red for swapping
      } else if (comparing.includes(i)) {
        color = '#eab308'; // Yellow for comparing
      } else if (sorted.includes(i)) {
        color = '#66FCF1'; // primary for sorted
      }

      ctx.fillStyle = color;
      
      // Draw bar with a small gap if there's enough space
      const gap = barWidth > 3 ? 1 : 0;
      
      // Rounded top corners
      ctx.beginPath();
      if (barWidth > 4) {
        ctx.roundRect(x, y, barWidth - gap, barHeight, [4, 4, 0, 0]);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, barWidth - gap, barHeight);
      }
    });
  }, [array, comparing, swapping, sorted]);

  return (
    <div className="w-full h-[500px] bg-background rounded-xl border border-gray-800 p-2 shadow-inner">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block"
      />
    </div>
  );
};

export default ArrayCanvas;
