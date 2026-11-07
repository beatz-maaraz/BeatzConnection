export default function ScrollHint({ visible }) {
  return (
    <div
      className="scroll"
      id="hint"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: 'none',
      }}
    >
      Scroll to explore
    </div>
  );
}

