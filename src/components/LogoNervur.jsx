import { useState } from "react";

export default function LogoNervur({ height = 40, onClick, style = {} }) {
  const [hovered, setHovered] = useState(false);
  const scale = height / 40;
  const iconSize = Math.round(32 * scale);
  const fontSize = Math.round(22 * scale);
  const gap = Math.round(10 * scale);

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
        transform: hovered ? "scale(1.03)" : "scale(1)",
        ...style,
      }}
    >
      {/* N Icon */}
      <div style={{
        width: `${iconSize}px`,
        height: `${iconSize}px`,
        borderRadius: `${Math.round(iconSize * 0.28)}px`,
        background: hovered
          ? "linear-gradient(135deg, #6366f1, #818CF8, #6366f1)"
          : "linear-gradient(135deg, #111118, #1a1a2e)",
        border: `1.5px solid ${hovered ? "rgba(129,140,248,0.5)" : "rgba(129,140,248,0.2)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.4s ease",
        boxShadow: hovered
          ? "0 0 20px rgba(99,102,241,0.4), 0 0 40px rgba(99,102,241,0.15)"
          : "0 2px 8px rgba(0,0,0,0.3)",
      }}>
        {/* Shine sweep effect */}
        <div style={{
          position: "absolute",
          top: 0, left: hovered ? "120%" : "-120%",
          width: "60%", height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
          transition: "left 0.6s ease",
          transform: "skewX(-20deg)",
        }} />
        {/* N letter */}
        <svg
          width={Math.round(iconSize * 0.55)}
          height={Math.round(iconSize * 0.55)}
          viewBox="0 0 24 28"
          fill="none"
          style={{
            transition: "transform 0.3s ease",
            transform: hovered ? "translateY(-1px)" : "none",
          }}
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
        fontStyle: "italic",
        letterSpacing: `${Math.round(scale * 2)}px`,
        color: "#FAFAFA",
        lineHeight: 1,
        position: "relative",
        transition: "all 0.3s ease",
      }}>
        <span>NERV</span>
        <span style={{
          color: hovered ? "#a5b4fc" : "#818CF8",
          transition: "color 0.3s ease",
        }}>&#220;</span>
        <span>R</span>
        {/* Animated underline */}
        <div style={{
          position: "absolute",
          bottom: `${Math.round(-3 * scale)}px`,
          left: 0,
          height: `${Math.max(1.5, Math.round(1.5 * scale))}px`,
          width: hovered ? "100%" : "0%",
          background: "linear-gradient(90deg, #6366f1, #818CF8, #a5b4fc)",
          borderRadius: "2px",
          transition: "width 0.4s ease",
        }} />
      </div>

      <style>{`
        @keyframes nervur-logo-pulse {
          0%, 100% { box-shadow: 0 0 10px rgba(99,102,241,0.2); }
          50% { box-shadow: 0 0 25px rgba(99,102,241,0.4); }
        }
      `}</style>
    </div>
  );
}