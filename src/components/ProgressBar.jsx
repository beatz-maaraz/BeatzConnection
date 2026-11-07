export default function ProgressBar({ progress, visible }) {
  if (!visible) return null;

  return (
    <div
      id="bar"
      style={{
        transform: `scaleX(${progress})`,
      }}
    />
  );
}

