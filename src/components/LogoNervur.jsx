import { useState } from "react";

export default function LogoNervur({ height = 40, onClick, style = {}, variant = "light" }) {
  const [hovered, setHovered] = useState(false);
  const scale = height / 40;
  const fontSize = Math.round(22 * scale);

  const isLight = variant === "light" || variant === undefined;
  const textColor = isLight ? "#1D1D1F" : "#FFFFFF";

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        transition: "opacity 0.3s ease",
        opacity: hovered ? 0.7 : 1,
        ...style,
      }}
    >
      <div style={{
        fontSize: `${fontSize}px`,
        fontWeight: 800,
        letterSpacing: `${Math.round(scale * 1.5)}px`,
        color: textColor,
        lineHeight: 1,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}>
        <span>NERV</span>
        <span style={{ color: "#818CF8" }}>&#220;</span>
        <span>R</span>
      </div>
    </div>
  );
}
