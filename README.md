# DSA Visualizer

A highly optimized, browser-based interactive Data Structures and Algorithms (DSA) Visualizer. Designed with a focus on high performance, technical depth, and architectural separation of concerns.

![DSA Visualizer Banner](./public/banner.png) <!-- Add a banner image here later -->

## 🚀 Features
- **High-Performance Rendering Engine**: Built directly on top of the **HTML5 Canvas API**, avoiding virtual DOM reflow bottlenecks. Sustains a consistent 60 FPS framerate even when rendering up to 500+ array elements.
- **Granular Execution Control**: Algorithms are decoupled from the UI using **Generator Functions (`function*`)**, enabling true step-by-step playback, pausing, and bi-directional speed control without blocking the main JavaScript thread.
- **Premium Aesthetics**: Styled with TailwindCSS to deliver a responsive, sleek dark-mode UI with vibrant accents and micro-animations.

## 🧠 Supported Algorithms

### Sorting (Arrays)
- Bubble Sort `O(n²)`
- Selection Sort `O(n²)`
- Insertion Sort `O(n²)`
- Merge Sort `O(n log n)`
- Quick Sort `O(n log n)`

### Pathfinding & Traversal (Graphs)
- Breadth-First Search (BFS) `O(V + E)`
- Depth-First Search (DFS) `O(V + E)`
- Dijkstra's Algorithm `O((V+E) log V)`

## 🛠️ Technology Stack
- **Frontend Framework**: React 18 (TypeScript) via Vite
- **Styling**: TailwindCSS, PostCSS
- **Rendering**: HTML5 Canvas API
- **Icons**: Lucide React
- **State Management**: React Hooks + Generator Function pattern

## ⚙️ Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/Kumardeepakchaudhary01/dsa-visualizer.git
   ```
2. Navigate to the project directory:
   ```bash
   cd dsa-visualizer
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

The project architecture strictly separates algorithm logic from rendering mechanisms:
1. **Algorithms (`src/algorithms/`)**: Written purely as Generator functions. They yield state snapshots (e.g., active edges, comparing indices, sorted partitions) but know nothing about the UI.
2. **Rendering (`src/components/`)**: `ArrayCanvas` and `GraphCanvas` take raw state snapshots and paint them directly to the canvas context, bypassing React's reconciler for performance.
3. **Control Loop (`src/pages/Visualizer.tsx`)**: An interval loop calls `.next()` on the active generator, managing the timing, speed, and passing the yielded state down to the Canvas components.

## 📝 License
MIT License
