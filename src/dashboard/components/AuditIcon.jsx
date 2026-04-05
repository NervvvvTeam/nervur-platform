export default function AuditIcon({ color = "#6B7C93", size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" stroke={color} />
      <path d="M12 16h.01" stroke={color} />
      <path d="M12 8v4" stroke={color} />
    </svg>
  );
}
