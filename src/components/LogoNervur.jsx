import { useState } from "react";

export default function LogoNervur({ height = 40, onClick, style = {}, variant = "light" }) {
  const [hovered, setHovered] = useState(false);
  const scale = height / 40;
  const iconSize = Math.round(32 * scale);
  const fontSize = Math.round(22 * scale);
  const gap = Math.round(10 * scale);

  const isLight = variant === "light";
  const textColor = isLight ? "#0F172A" : "#FFFFFF";
  const accentColor = isLight ? "#4F46E5" : "#818CF8";
  const iconBg = isLight
    ? (hovered ? "#1E293B" : "#0F172A")
    : (hovered ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.1)");
  const iconBorder = isLight
    ? (hovered ? "#334155" : "#1E293B")
    : (hovered ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.15)");

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: `${gap}px`,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        transition: "transform 0.3s ease",
        transform: hovered ? "scale(1.02)" : "scale(1)",
        ...style,
      }}
    >
      {/* N Icon */}
      <div style={{
        width: `${iconSize}px`,
        height: `${iconSize}px`,
        borderRadius: `${Math.round(iconSize * 0.25)}px`,
        background: iconBg,
        border: `1.5px solid ${iconBorder}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s ease",
      }}>
        <svg
          width={Math.round(iconSize * 0.5)}
          height={Math.round(iconSize * 0.5)}
          viewBox="0 0 24 28"
          fill="none"
        >
          <path
            d="M2 26V2L22 26V2"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* NERVÜR text */}
      <div style={{
        fontSize: `${fontSize}px`,
        fontWeight: 800,
        letterSpacing: `${Math.round(scale * 1.5)}px`,
        color: textColor,
        lineHeight: 1,
        transition: "all 0.3s ease",
      }}>
        <span>NERV</span>
        <span style={{ color: accentColor, transition: "color 0.3s ease" }}>&#220;</span>
        <span>R</span>
      </div>
    </div>
  );
}
