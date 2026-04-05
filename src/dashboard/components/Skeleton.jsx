export function SkeletonCard({ height = "120px" }) {
  return (
    <div style={{
      background: "#FFFFFF", border: "1px solid #2a2d3a", borderRadius: "10px",
      height, overflow: "hidden", position: "relative"
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        background: "linear-gradient(90deg, transparent 0%, #2a2d3a40 50%, transparent 100%)",
        animation: "shimmer 1.5s infinite",
      }} />
      <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
    </div>
  );
}

export function SkeletonText({ width = "60%", height = "14px" }) {
  return (
    <div style={{
      background: "#E3E8EE", borderRadius: "4px",
      width, height, position: "relative", overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        background: "linear-gradient(90deg, transparent 0%, #3a3d4a40 50%, transparent 100%)",
        animation: "shimmer 1.5s infinite",
      }} />
    </div>
  );
}

export function SkeletonGrid({ count = 4, height = "120px" }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} height={height} />)}
    </div>
  );
}
