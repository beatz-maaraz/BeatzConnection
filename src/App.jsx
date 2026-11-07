import { useState, useEffect, useCallback } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Scene3D from './components/Scene3D';
import Navbar from './components/Navbar';
import ProgressBar from './components/ProgressBar';
import ScrollHint from './components/ScrollHint';
import HomeView from './components/HomeView';
import DownloadView from './components/DownloadView';

export default function App() {
  const getInitialView = () => (window.location.hash === '#download' ? 'download' : 'home');

  const [view, setView] = useState(getInitialView);
  const [slideDirection, setSlideDirection] = useState('none');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const current = window.location.hash === '#download' ? 'download' : 'home';
      setView((prev) => {
        if (prev !== current) {
          setSlideDirection(current === 'download' ? 'from-right' : 'from-left');
        }
        return current;
      });
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (view === 'home') {
      document.title = 'Beatz Connect – Use your phone as your PC’s mouse and keyboard';
    } else {
      document.title = 'Download Beatz Connect';
    }
  }, [view]);

  const handleViewChange = (newView) => {
    if (newView === view) return;
    setSlideDirection(newView === 'download' ? 'from-right' : 'from-left');

    if (newView === 'download') {
      window.location.hash = '#download';
    } else {
      window.location.hash = '';
      if (window.history.pushState) {
        window.history.pushState(null, '', window.location.pathname);
      }
    }
    setView(newView);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleScrollUpdate = useCallback(({ progress, scrolledPast: isScrolled }) => {
    setScrollProgress(progress);
    setScrolledPast(isScrolled);
  }, []);

  return (
    <div className="app-shell">
      <ProgressBar progress={scrollProgress} visible={view === 'home'} />
      <Scene3D isVisible={view === 'home'} onScrollUpdate={handleScrollUpdate} />
      <Navbar activeView={view} onViewChange={handleViewChange} />
      <ScrollHint visible={view === 'home' && !scrolledPast} />

      <div
        key={view}
        className={`view-slide-container ${
          slideDirection === 'from-right'
            ? 'slide-in-right'
            : slideDirection === 'from-left'
            ? 'slide-in-left'
            : ''
        }`}
      >
        {view === 'home' ? (
          <HomeView onGoToDownload={() => handleViewChange('download')} />
        ) : (
          <DownloadView />
        )}
      </div>
      <SpeedInsights />
    </div>
  );
}
