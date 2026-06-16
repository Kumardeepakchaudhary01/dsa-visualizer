import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, RotateCcw, StepForward, ArrowLeft } from 'lucide-react';

import ArrayCanvas from '../components/ArrayCanvas';
import GraphCanvas from '../components/GraphCanvas';

import { bubbleSort, mergeSort, quickSort, selectionSort, insertionSort, SortStep } from '../algorithms/sorting';
import { bfs, dfs, dijkstra, generateRandomGraph, GraphData, GraphStep } from '../algorithms/graphs';

const graphAlgorithms = ['bfs', 'dfs', 'dijkstra'];

const Visualizer = () => {
  const { algorithmId } = useParams<{ algorithmId: string }>();
  const isGraphAlgo = graphAlgorithms.includes(algorithmId || '');
  
  // Controls
  const [dataSize, setDataSize] = useState(isGraphAlgo ? 15 : 50);
  const [speedMs, setSpeedMs] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Array State
  const [array, setArray] = useState<number[]>([]);
  const [comparing, setComparing] = useState<number[]>([]);
  const [swapping, setSwapping] = useState<number[]>([]);
  const [sorted, setSorted] = useState<number[]>([]);

  // Graph State
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [graphStep, setGraphStep] = useState<GraphStep>({ visitedNodes: [], currentNodes: [], activeEdges: [] });

  const arrayGeneratorRef = useRef<Generator<SortStep> | null>(null);
  const graphGeneratorRef = useRef<Generator<GraphStep> | null>(null);
  const timerRef = useRef<number | null>(null);

  const resetData = useCallback(() => {
    if (isGraphAlgo) {
      setGraphData(generateRandomGraph(dataSize));
      setGraphStep({ visitedNodes: [], currentNodes: [], activeEdges: [] });
      graphGeneratorRef.current = null;
    } else {
      const newArray = Array.from({ length: dataSize }, () => Math.floor(Math.random() * 100) + 5);
      setArray(newArray);
      setComparing([]);
      setSwapping([]);
      setSorted([]);
      arrayGeneratorRef.current = null;
    }
    setIsPlaying(false);
    setIsFinished(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [dataSize, isGraphAlgo, algorithmId]);

  useEffect(() => {
    // Reset sizes conditionally on algorithm type change
    setDataSize(isGraphAlgo ? 15 : 50);
  }, [isGraphAlgo]);

  useEffect(() => {
    resetData();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetData]);

  const stepForwardRef = useRef<() => void>(() => {});

  const stepForward = useCallback(() => {
    if (isFinished) return;
    
    if (isGraphAlgo) {
      if (!graphGeneratorRef.current) {
        const startNode = 0;
        switch (algorithmId) {
          case 'bfs': graphGeneratorRef.current = bfs(graphData, startNode); break;
          case 'dfs': graphGeneratorRef.current = dfs(graphData, startNode); break;
          case 'dijkstra': graphGeneratorRef.current = dijkstra(graphData, startNode); break;
          default: graphGeneratorRef.current = bfs(graphData, startNode);
        }
      }
      
      const result = graphGeneratorRef.current.next();
      if (!result.done) {
        setGraphStep(result.value);
      } else {
        setIsPlaying(false);
        setIsFinished(true);
        setGraphStep(prev => ({ ...prev, activeEdges: [], currentNodes: [] }));
      }
    } else {
      if (!arrayGeneratorRef.current) {
        switch (algorithmId) {
          case 'bubble-sort': arrayGeneratorRef.current = bubbleSort(array); break;
          case 'selection-sort': arrayGeneratorRef.current = selectionSort(array); break;
          case 'insertion-sort': arrayGeneratorRef.current = insertionSort(array); break;
          case 'merge-sort': arrayGeneratorRef.current = mergeSort(array); break;
          case 'quick-sort': arrayGeneratorRef.current = quickSort(array); break;
          default: arrayGeneratorRef.current = bubbleSort(array);
        }
      }

      const result = arrayGeneratorRef.current.next();
      if (!result.done) {
        const step = result.value;
        setArray(step.array);
        setComparing(step.comparing || []);
        setSwapping(step.swapping || []);
        setSorted(step.sorted || []);
      } else {
        setIsPlaying(false);
        setIsFinished(true);
        setComparing([]);
        setSwapping([]);
      }
    }
  }, [algorithmId, array, graphData, isFinished, isGraphAlgo]);

  useEffect(() => {
    stepForwardRef.current = stepForward;
  }, [stepForward]);

  // Play loop using robust interval pattern
  useEffect(() => {
    if (isPlaying && !isFinished) {
      timerRef.current = window.setInterval(() => {
        stepForwardRef.current();
      }, speedMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isFinished, speedMs]);

  const togglePlay = () => {
    if (isFinished) {
      resetData();
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const formatName = (id?: string) => {
    if (!id) return '';
    return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-surface border-b border-gray-800 p-4 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-white">{formatName(algorithmId)}</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 border-r border-gray-700 pr-6">
            <span className="text-sm text-gray-400 font-medium">Data Size: {dataSize}</span>
            <input 
              type="range" 
              min={isGraphAlgo ? 5 : 10} 
              max={isGraphAlgo ? 30 : 500} 
              value={dataSize} 
              onChange={(e) => setDataSize(Number(e.target.value))}
              disabled={isPlaying || ((isGraphAlgo ? graphGeneratorRef.current : arrayGeneratorRef.current) !== null && !isFinished)}
              className="w-32 accent-primary"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 font-medium">Speed: {speedMs}ms</span>
            <input 
              type="range" 
              min="1" 
              max="500" 
              value={501 - speedMs} 
              onChange={(e) => setSpeedMs(501 - Number(e.target.value))}
              className="w-32 accent-secondary"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col max-w-[1600px] mx-auto w-full gap-6">
        <div className="flex-1 flex flex-col">
          {isGraphAlgo ? (
            <GraphCanvas graph={graphData} step={graphStep} />
          ) : (
            <ArrayCanvas array={array} comparing={comparing} swapping={swapping} sorted={sorted} />
          )}
          
          <div className="mt-6 flex justify-center gap-4">
            <button 
              onClick={resetData}
              className="p-3 rounded-full bg-surface text-gray-400 hover:text-white hover:bg-gray-800 transition-colors border border-gray-700"
              title="Reset Data"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            <button 
              onClick={togglePlay}
              className="p-4 rounded-full bg-primary text-background hover:scale-105 transition-transform shadow-[0_0_15px_rgba(102,252,241,0.5)]"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>
            <button 
              onClick={() => { setIsPlaying(false); stepForward(); }}
              disabled={isPlaying || isFinished}
              className="p-3 rounded-full bg-surface text-gray-400 hover:text-white hover:bg-gray-800 transition-colors border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Step Forward"
            >
              <StepForward className="w-6 h-6" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Visualizer;
