import { Link } from 'react-router-dom';
import { Activity, Cpu, Database, Terminal } from 'lucide-react';

const algorithms = [
  { id: 'bubble-sort', name: 'Bubble Sort', category: 'Sorting', description: 'Simple adjacent swapping algorithm. O(n²).' },
  { id: 'merge-sort', name: 'Merge Sort', category: 'Sorting', description: 'Divide and conquer algorithm. O(n log n).' },
  { id: 'quick-sort', name: 'Quick Sort', category: 'Sorting', description: 'Efficient partition-based sorting. O(n log n).' },
  { id: 'selection-sort', name: 'Selection Sort', category: 'Sorting', description: 'Finds minimum and places it at the start. O(n²).' },
  { id: 'insertion-sort', name: 'Insertion Sort', category: 'Sorting', description: 'Builds sorted array one element at a time. O(n²).' },
  { id: 'bfs', name: 'Breadth-First Search', category: 'Graphs', description: 'Level-order graph traversal. O(V + E).' },
  { id: 'dfs', name: 'Depth-First Search', category: 'Graphs', description: 'Depth-first graph traversal. O(V + E).' },
  { id: 'dijkstra', name: 'Dijkstra\'s Algorithm', category: 'Graphs', description: 'Shortest path algorithm for graphs. O((V+E) log V).' },
];

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-surface p-6 rounded-xl border border-gray-800 shadow-lg flex items-center space-x-4">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-gray-400 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="mb-12 border-b border-gray-800 pb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Terminal className="text-primary" />
            DSA Visualizer
          </h1>
          <p className="text-gray-400">Advanced Interactive Algorithm Learning Platform</p>
        </div>
      </header>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Algorithms" value="8" icon={Activity} color="bg-primary/20" />
        <StatCard title="Operations Simulated" value="50,000+" icon={Cpu} color="bg-blue-500/20" />
        <StatCard title="Supported Structures" value="Arrays & Graphs" icon={Database} color="bg-secondary/20" />
        <StatCard title="Max Data Size" value="500+" icon={Activity} color="bg-purple-500/20" />
      </div>

      {/* Algorithms Grid */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-6 border-b border-gray-800 pb-2">Available Visualizations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {algorithms.map((algo) => (
            <Link 
              key={algo.id} 
              to={`/visualize/${algo.id}`}
              className="bg-surface p-6 rounded-xl border border-gray-800 hover:border-primary transition-colors group relative overflow-hidden block"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{algo.name}</h3>
                  <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">{algo.category}</span>
                </div>
                <p className="text-gray-400 text-sm">{algo.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
