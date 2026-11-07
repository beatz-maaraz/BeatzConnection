import { useEffect, useRef } from 'react';
import DashboardPreview from './DashboardPreview';
import { DOWNLOAD_LINKS } from '../constants';

export default function HomeView({ onGoToDownload }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const cards = root.querySelectorAll('.card');
    const handlePointerMove = (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
      e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
    };

    cards.forEach((card) => {
      card.addEventListener('pointermove', handlePointerMove, { passive: true });
    });

    // IntersectionObserver for reveal animations
    const revealTargets = root.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
    );

    revealTargets.forEach((el) => observer.observe(el));

    return () => {
      cards.forEach((card) => {
        card.removeEventListener('pointermove', handlePointerMove);
      });
      observer.disconnect();
    };
  }, []);

  const handleExploreClick = (e) => {
    e.preventDefault();
    const panes = containerRef.current?.querySelectorAll('.pane');
    if (panes && panes[1]) {
      panes[1].scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main id="home" ref={containerRef}>
      <section className="pane top" id="experience">
        <div className="hero-t">
          <h1>Your phone is now your PC’s mouse.</h1>
          <p>
            Beatz Connect turns your phone into a touchpad, keyboard and media remote for Windows.
          </p>
          <div className="hero-cta">
            <a
              className="btn"
              href="#download"
              onClick={(e) => {
                e.preventDefault();
                onGoToDownload();
              }}
            >
              Get Beatz Connect
            </a>
            <a
              className="btn secondary"
              href="#explore"
              onClick={handleExploreClick}
            >
              Explore the experience
            </a>
          </div>
        </div>
      </section>

      <section className="pane">
        <div className="card reveal">
          <div className="kicker">Your devices. One connection.</div>
          <span className="tag">Step 1 · Pair</span>
          <h2>Enter one code</h2>
          <p>
            Open Beatz Connect on your PC. It shows a 6‑digit code and a QR code. Type or scan it on your phone and the two devices find each other.
          </p>
        </div>
      </section>

      <section className="pane r">
        <div className="card reveal">
          <div className="kicker">Designed for seamless control</div>
          <span className="tag">Step 2 · Move</span>
          <h2>Same Wi‑Fi? It’s direct.</h2>
          <p>
            Drag a finger on the touchpad. Tiny movement packets go straight to your PC over the local network, with no cloud in between.
          </p>
        </div>
      </section>

      <section className="pane">
        <div className="card reveal">
          <div className="kicker">Designed for seamless control</div>
          <span className="tag">Different network</span>
          <h2>Away from home? Use the relay.</h2>
          <p>
            On mobile data, both devices connect out to a cloud relay over a secure port. The relay passes your movements through, so there is nothing to set up on your router.
          </p>
        </div>
      </section>

      <section className="pane r">
        <div className="card reveal">
          <div className="kicker">Designed for seamless control</div>
          <span className="tag">Step 3 · Control</span>
          <h2>Your PC follows</h2>
          <p>
            The pointer moves at the speed you set in the desktop dashboard, which also shows your phone, battery, connection mode and ping.
          </p>
        </div>
      </section>

      <section className="pane">
        <div className="card reveal">
          <div className="kicker">Designed for seamless control</div>
          <span className="tag">Built for speed</span>
          <h2>Precise and instant</h2>
          <ul className="f">
            <li>
              <b>Pointer speed from 1.0× to 3.5×</b>
              <span>Set it once in the desktop app. Your movement is scaled before it reaches the pointer.</span>
            </li>
            <li>
              <b>Moves like a real mouse</b>
              <span>Movement is sent as small relative steps, so the pointer never jumps.</span>
            </li>
            <li>
              <b>Sent immediately</b>
              <span>Each tiny packet goes out as it happens instead of waiting in a buffer.</span>
            </li>
            <li>
              <b>Never freezes the app</b>
              <span>Touch input at 60–120 times a second is handled on its own thread, apart from the window.</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="pane r">
        <div className="card reveal">
          <div className="kicker">Designed for seamless control</div>
          <span className="tag">On your PC</span>
          <h2>A calm dashboard</h2>
          <p>
            The desktop window is a companion, like Phone Link. It shows your phone and the connection, and tucks into the tray when you close it.
          </p>
          <DashboardPreview />
          <small>Preview with example values</small>
        </div>
      </section>

      <section className="pane">
        <div className="card reveal">
          <div className="kicker">Designed for seamless control</div>
          <h2>Everything in one app</h2>
          <ul className="f">
            <li>
              <b>Touchpad and gestures</b>
              <span>Move, click and scroll.</span>
            </li>
            <li>
              <b>Media controls</b>
              <span>Play, pause, skip, volume.</span>
            </li>
            <li>
              <b>Runs from the tray</b>
              <span>Close the window; it keeps listening and can start with Windows.</span>
            </li>
            <li>
              <b>Live status</b>
              <span>See your phone’s name, wallpaper, battery, connection mode, IP address and ping on the PC.</span>
            </li>
            <li>
              <b>Stays connected</b>
              <span>A check every 15 seconds keeps the relay connection from dropping when idle.</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="pane r">
        <div className="card reveal">
          <div className="kicker">Ready when you are</div>
          <h2>Download Beatz Connect</h2>
          <p>Install the Windows app first, then the phone app, and pair them with the code.</p>
          <a
            className="btn"
            id="dl-win"
            href={DOWNLOAD_LINKS.windows}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download for Windows
          </a>
          <a
            className="btn"
            id="dl-and"
            href={DOWNLOAD_LINKS.android}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download for Android
          </a>
          <small>
            Windows 10 and 11 · Android phones ·{' '}
            <a
              href="#download"
              style={{ color: 'var(--accent)', cursor: 'pointer' }}
              onClick={(e) => {
                e.preventDefault();
                onGoToDownload();
              }}
            >
              Install steps and details
            </a>
          </small>
        </div>
      </section>
    </main>
  );
}
