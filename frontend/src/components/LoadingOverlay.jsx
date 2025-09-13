import '../styles/loading-overlay.css';
import React from 'react';

const LoadingOverlay = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-30 z-50 backdrop-blur-sm">
      <span className="loader"></span>
    </div>
  );
};

export default LoadingOverlay;
