
import React from 'react';
import { useGlobalContext } from '../contexts/GlobalContext';

const Footer: React.FC = () => {
  const { translate } = useGlobalContext();
  return (
    <footer className="bg-secondary text-center p-6 shadow-top mt-auto">
      <p className="text-sm text-lightText mb-2">{translate('footerText')}</p>
      <div className="flex justify-center space-x-4">
        <a href="https://www.instagram.com/technosaqib_/" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-highlight transition-colors duration-300">
          <i className="fab fa-instagram fa-lg"></i> Instagram
        </a>
        <a href="https://www.linkedin.com/in/saqibsarwar1280/" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-highlight transition-colors duration-300">
          <i className="fab fa-linkedin fa-lg"></i> LinkedIn
        </a>
      </div>
    </footer>
  );
};

export default Footer;
