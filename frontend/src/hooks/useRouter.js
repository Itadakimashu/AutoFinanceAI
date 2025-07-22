import { useState, useEffect } from 'react';
import { getCurrentView } from '../utils/helpers';

export const useRouter = () => {
  const [currentView, setCurrentView] = useState(getCurrentView());

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentView(getCurrentView());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return { currentView };
};
