export default function LogoNervur({ height = 40, onClick, style = {} }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        ...style,
      }}
    >
      <img
        src="/LOGO.png"
        alt="NERVÜR"
        style={{
          height: `${height}px`,
          width: "auto",
          objectFit: "contain",
        }}
      />
    </div>
  );
}
