import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Visualizer from './pages/Visualizer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/visualize/:algorithmId" element={<Visualizer />} />
      </Routes>
    </Router>
  );
}

export default App;
