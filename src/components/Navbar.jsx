import { useRef, useEffect, useState, useCallback } from 'react';

export default function Navbar({ activeView, onViewChange }) {
  const navRef = useRef(null);
  const homeRef = useRef(null);
  const dlRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    x: 0,
    width: 0,
    opacity: 0,
  });

  const updateIndicator = useCallback(() => {
    const target = activeView === 'home' ? homeRef.current : dlRef.current;
    if (target && navRef.current) {
      setIndicatorStyle({
        x: target.offsetLeft,
        width: target.offsetWidth,
        opacity: 1,
      });
    }
  }, [activeView]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  return (
    <nav className="nav" ref={navRef} aria-label="Pages">
      <div
        className="nav-indicator"
        style={{
          transform: `translateX(${indicatorStyle.x}px)`,
          width: `${indicatorStyle.width}px`,
          opacity: indicatorStyle.opacity,
        }}
      />
      <a
        ref={homeRef}
        id="n-home"
        href="#"
        aria-current={activeView === 'home' ? 'page' : undefined}
        className={activeView === 'home' ? 'active' : ''}
        onClick={(e) => {
          e.preventDefault();
          onViewChange('home');
        }}
      >
        Home
      </a>
      <a
        ref={dlRef}
        id="n-dl"
        href="#download"
        aria-current={activeView === 'download' ? 'page' : undefined}
        className={activeView === 'download' ? 'active' : ''}
        onClick={(e) => {
          e.preventDefault();
          onViewChange('download');
        }}
      >
        Download
      </a>
    </nav>
  );
}
