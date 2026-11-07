export default function DashboardPreview() {
  return (
    <div className="mk">
      <div className="mk-bar">
        <i></i>
        <i></i>
        <i></i>
        <span>Beatz Connect</span>
      </div>
      <div className="mk-body">
        <div className="mk-main">
          <b>Your phone</b>
          <div className="mk-wall"></div>
          Battery 82%
          <br />
          Pointer speed
          <div className="mk-sl">
            <u></u>
          </div>
        </div>
        <div className="mk-side">
          <b className="ok">● Connected</b>
          <span>Mode: Local Wi‑Fi</span>
          <span>IP: 192.168.1.24</span>
          <span>Ping: 12 ms</span>
        </div>
      </div>
    </div>
  );
}

