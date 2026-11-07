import { useEffect, useRef } from 'react';
import DashboardPreview from './DashboardPreview';
import PhonePreview from './PhonePreview';
import { DOWNLOAD_LINKS } from '../constants';

export default function DownloadView() {
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

    return () => {
      cards.forEach((card) => {
        card.removeEventListener('pointermove', handlePointerMove);
      });
    };
  }, []);

  return (
    <main className="page" id="dlpage" ref={containerRef}>
      <h1>Download Beatz Connect</h1>
      <p>
        You need two apps: one on your Windows PC and one on your phone. Install both, then pair them with a code.
      </p>

      <div className="g2">
        <div className="card">
          <span className="tag">Step 1</span>
          <h2>Windows app</h2>
          <p>
            One installer with everything included. It adds Start Menu and Desktop shortcuts and can start quietly in the system tray when Windows starts.
          </p>
          <p>Works on Windows 10 and 11.</p>
          <a
            className="btn lw"
            href={DOWNLOAD_LINKS.windows}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download for Windows
          </a>
        </div>

        <div className="card">
          <span className="tag">Step 2</span>
          <h2>Android app</h2>
          <p>
            The controller for your phone: touchpad, media buttons and your phone’s details shown on the PC.
          </p>
          <p>If Android asks, allow installs from your browser or file manager.</p>
          <a
            className="btn la"
            href={DOWNLOAD_LINKS.android}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download for Android
          </a>
        </div>
      </div>

      <h2>What the apps look like</h2>
      <div className="g2">
        <div className="card">
          <h2>PC dashboard</h2>
          <p>
            Your phone’s name, wallpaper and battery on the left. Connection state, mode, IP address and ping on the right. A slider sets pointer speed.
          </p>
          <DashboardPreview />
        </div>
        <div className="card">
          <h2>Phone controller</h2>
          <p>
            A full touchpad with media buttons underneath. Drag to move, tap to click.
          </p>
          <PhonePreview />
        </div>
      </div>
      <p>Previews use example values.</p>

      <h2>Set up in four steps</h2>
      <ol>
        <li>
          <b>Install the PC app.</b> Run the installer and finish the wizard. Beatz Connect opens its dashboard and keeps running in the system tray.
        </li>
        <li>
          <b>Install the phone app.</b> Open the downloaded file and allow the install.
        </li>
        <li>
          <b>Pair.</b> The PC shows a 6‑digit code and a QR code. Type or scan it on your phone.
        </li>
        <li>
          <b>Control.</b> Drag on the touchpad. The dashboard shows the status as Connected, with the mode and ping.
        </li>
      </ol>

      <h2>Good to know</h2>
      <dl className="facts">
        <dt>Install location</dt>
        <dd>C:\Program Files\Beatz Connect</dd>
        <dt>Start with Windows</dt>
        <dd>Added for your account only. It starts minimized in the system tray.</dd>
        <dt>Same Wi‑Fi</dt>
        <dd>Your phone connects straight to your PC over the local network.</dd>
        <dt>Other networks</dt>
        <dd>
          Both devices connect out to a cloud relay over a secure web connection on port 443, so no router changes are needed.
        </dd>
        <dt>Pointer speed</dt>
        <dd>Adjustable from 1.0× to 3.5× in the desktop dashboard.</dd>
        <dt>Installer file</dt>
        <dd>BeatzConnect_Setup.exe</dd>
        <dt>Pairing</dt>
        <dd>A unique 6‑digit code or QR code, created on your PC.</dd>
        <dt>Window</dt>
        <dd>
          A normal Windows title bar, so minimize, maximize and snap layouts work. Closing it hides the app in the tray.
        </dd>
        <dt>Phone details</dt>
        <dd>Your phone’s name, wallpaper and battery level appear on the PC.</dd>
        <dt>Status panel</dt>
        <dd>
          Connected, Disconnected or Reconnecting, plus network mode, IP address and ping in milliseconds.
        </dd>
        <dt>Built with</dt>
        <dd>Qt 6 (C++) desktop app, Flutter phone app, Node.js relay server.</dd>
      </dl>

      <h2>Questions</h2>
      <details>
        <summary>Windows asked about the firewall. What should I do?</summary>
        <p>
          Allow Beatz Connect on private networks. This lets your phone reach your PC on the same Wi‑Fi.
        </p>
      </details>
      <details>
        <summary>My phone can’t find my PC.</summary>
        <p>
          Check that the PC app is running in the tray and the code matches. If your phone is on mobile data or a different Wi‑Fi, use the cloud relay mode instead of the local one.
        </p>
      </details>
      <details>
        <summary>Does my movement go through the cloud?</summary>
        <p>
          Only on different networks. Then your movements pass through the relay server to reach your PC. On the same Wi‑Fi they go directly.
        </p>
      </details>
      <details>
        <summary>How do I remove it?</summary>
        <p>Uninstall it like any app from Windows Settings, in Apps.</p>
      </details>
    </main>
  );
}
