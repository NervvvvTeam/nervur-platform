export default function ScoreGauge({ score = 0, label = "Score global" }) {
  const percentage = (score / 5) * 100;
  const color = score >= 4 ? "#6366f1" : score >= 3 ? "#A1A1AA" : "#ef4444";

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);

  return (
    <div style={{ textAlign: "center" }}>
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#1e1e22" strokeWidth="8" />
        <circle cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div style={{ marginTop: "-95px", position: "relative" }}>
        <div style={{ fontSize: "32px", fontWeight: 600, color: "#FAFAFA" }}>{score.toFixed(1)}</div>
        <div style={{ fontSize: "12px", color: "#71717A" }}>/5</div>
      </div>
      <div style={{ marginTop: "50px", fontSize: "12px", fontWeight: 500, color: "#52525B" }}>{label}</div>
    </div>
  );
}
