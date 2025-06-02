
import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      {text && <p className="mt-3 text-lightText text-lg animate-pulse-subtle">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
