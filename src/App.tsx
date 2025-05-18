import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { registerEventListeners } from '@/services/eventListeners';
import StaticFileProvider from '@/data/StaticFileProvider';

/**
 * The root application component.
 * This acts as the main container for all views within the application.
 */
const App: React.FC = () => {
  useEffect(() => {
    const cleanup = registerEventListeners();
    return cleanup;
  }, []);
  return (
    <div className="app-container">
      <h1>IntelliMetric Explorer</h1>
      <p>OTLP Metrics Inspector</p>
      
      <Routes>
        <Route path="/" element={
          <div>
            <p>Drop an OTLP file to analyze metrics</p>
            <StaticFileProvider className="file-drop-zone" />
          </div>
        } />
        <Route path="/metrics/:id" element={<div>Metric detail view (coming soon)</div>} />
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </div>
  );
};

export default App;
