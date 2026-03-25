import { useAuth } from "../hooks/useAuth";
import { useApi } from "../hooks/useApi";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";

const styleTag = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes statusPulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
  50% { opacity: 0.8; box-shadow: 0 0 0 4px rgba(34,197,94,0); }
}
@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(10px, -10px) scale(1.05); }
  66% { transform: translate(-5px, 5px) scale(0.97); }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
@keyframes borderRotate {
  0% { --angle: 0deg; }
  100% { --angle: 360deg; }
}
@keyframes typewriter {
  from { width: 0; }
  to { width: 100%; }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
@keyframes countUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.1); }
  50% { box-shadow: 0 0 40px rgba(99,102,241,0.25); }
}
@keyframes rotateGradient {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}
`;

const fadeInUp = {
  animation: "fadeInUp 0.5s ease-out forwards",
  opacity: 0,
};

// ═══════════════════════════════════════════
// TYPING TEXT EFFECT
// ═══════════════════════════════════════════
function TypingText({ text, speed = 60, delay = 500 }) {
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; }
        else { clearInterval(interval); setTimeout(() => setShowCursor(false), 1500); }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);
  return <span>{displayed}{showCursor && <span style={{ animation: "blink 1s infinite", color: "#818CF8" }}>|</span>}</span>;
}

// ═══════════════════════════════════════════
// ANIMATED COUNTER
// ═══════════════════════════════════════════
function AnimatedCounter({ value, duration = 1500, suffix = "", color = "#f0f0f3" }) {
  const [count, setCount] = useState(0);
  const numVal = parseFloat(value) || 0;
  useEffect(() => {
    let start = 0;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(numVal * eased);
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [numVal, duration]);
  return <span style={{ color, fontWeight: 600 }}>{Number.isInteger(numVal) ? Math.round(count) : count.toFixed(1)}{suffix}</span>;
}

// ═══════════════════════════════════════════
// 3D TILT CARD
// ═══════════════════════════════════════════
function TiltCard({ children, style, onClick, onMouseEnter, onMouseLeave, active = true }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isOver, setIsOver] = useState(false);

  const handleMove = (e) => {
    if (!active || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -8, y: x * 8 });
  };

  const handleLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsOver(false);
    onMouseLeave?.();
  };

  const handleEnter = (e) => {
    setIsOver(true);
    onMouseEnter?.(e);
  };

  return (
    <div ref={cardRef}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={onClick}
      style={{
        ...style,
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${isOver && active ? "translateY(-4px)" : ""}`,
        transition: isOver ? "box-shadow 0.3s, border-color 0.3s" : "all 0.4s ease",
      }}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════
// ANIMATED GRADIENT BORDER
// ═══════════════════════════════════════════
function GradientBorder({ color, active, children }) {
  if (!active) return children;
  return (
    <div style={{ position: "relative", borderRadius: "14px", padding: "1px" }}>
      <div style={{
        position: "absolute", inset: "-1px", borderRadius: "15px", overflow: "hidden", zIndex: 0
      }}>
        <div style={{
          position: "absolute", inset: "-50%",
          background: `conic-gradient(from 0deg, ${color}, transparent 30%, transparent 70%, ${color})`,
          animation: "rotateGradient 4s linear infinite", opacity: 0.4
        }} />
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════
// LIVE CLOCK
// ═══════════════════════════════════════════
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const fmt = time.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const clock = time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return (
    <div style={{ position: "absolute", top: "28px", right: "32px", textAlign: "right", animation: "fadeInUp 0.6s ease-out 1.5s forwards", opacity: 0 }}>
      <div style={{ fontSize: "22px", fontWeight: 600, color: "#f0f0f3", fontVariantNumeric: "tabular-nums", letterSpacing: "1px" }}>{clock}</div>
      <div style={{ fontSize: "12px", color: "#6b7280", textTransform: "capitalize", marginTop: "2px" }}>{fmt}</div>
    </div>
  );
}

// ═══════════════════════════════════════════
// INTERACTIVE AURORA CANVAS
// ═══════════════════════════════════════════
const AURORA_COLORS = [
  { r: 239, g: 68, b: 68 },    // red
  { r: 139, g: 92, b: 246 },   // purple
  { r: 16, g: 185, b: 129 },   // green
  { r: 6, g: 182, b: 212 },    // cyan
  { r: 99, g: 102, b: 241 },   // indigo
];

function AuroraCanvas({ width = 300, height = 340 }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: width / 2, y: height / 2 });
  const frameRef = useRef(null);
  const wavesRef = useRef([]);

  useEffect(() => {
    // Initialize waves
    wavesRef.current = AURORA_COLORS.map((c, i) => ({
      color: c, offset: i * 1.2, speed: 0.003 + i * 0.001,
      amplitude: 30 + i * 10, y: height * 0.3 + i * 40
    }));

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let time = 0;

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      time += 0.016;

      // Background glow at mouse position
      const glow = ctx.createRadialGradient(mx, my, 0, mx, my, 120);
      glow.addColorStop(0, "rgba(129, 140, 248, 0.08)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // Draw aurora waves
      for (const wave of wavesRef.current) {
        const { color, offset, speed, amplitude, y } = wave;

        // Mouse influence on wave
        const mouseInfluence = Math.max(0, 1 - Math.abs(my - y) / 150) * 20;
        const mouseXInfluence = (mx / width - 0.5) * 30;

        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 2) {
          const normalX = x / width;
          const waveY = y
            + Math.sin(normalX * 4 + time * speed * 60 + offset) * amplitude
            + Math.sin(normalX * 2.5 + time * speed * 40) * (amplitude * 0.5)
            + Math.sin(normalX * 7 + time * speed * 80 + offset * 2) * (amplitude * 0.2)
            - mouseInfluence * Math.sin(normalX * 3 + time * 2)
            + mouseXInfluence * Math.sin(normalX * 5 + time);

          ctx.lineTo(x, waveY);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, y - amplitude, 0, height);
        grad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.12)`);
        grad.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, 0.04)`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fill();

        // Wave highlight line
        ctx.beginPath();
        for (let x = 0; x <= width; x += 2) {
          const normalX = x / width;
          const waveY = y
            + Math.sin(normalX * 4 + time * speed * 60 + offset) * amplitude
            + Math.sin(normalX * 2.5 + time * speed * 40) * (amplitude * 0.5)
            + Math.sin(normalX * 7 + time * speed * 80 + offset * 2) * (amplitude * 0.2)
            - mouseInfluence * Math.sin(normalX * 3 + time * 2)
            + mouseXInfluence * Math.sin(normalX * 5 + time);
          if (x === 0) ctx.moveTo(x, waveY);
          else ctx.lineTo(x, waveY);
        }
        ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.25)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Floating particles that follow mouse
      for (let i = 0; i < 8; i++) {
        const angle = (time * 0.5 + i * 0.785) % (Math.PI * 2);
        const dist = 40 + Math.sin(time * 2 + i) * 20;
        const px = mx + Math.cos(angle) * dist;
        const py = my + Math.sin(angle) * dist;
        const size = 2 + Math.sin(time * 3 + i * 2) * 1;
        const c = AURORA_COLORS[i % AURORA_COLORS.length];

        ctx.beginPath();
        const pGlow = ctx.createRadialGradient(px, py, 0, px, py, size * 3);
        pGlow.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 0.4)`);
        pGlow.addColorStop(1, "transparent");
        ctx.fillStyle = pGlow;
        ctx.arc(px, py, size * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 0.8)`;
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [width, height]);

  return (
    <div style={{
      height: height + "px", borderRadius: "14px", position: "relative",
      background: "#1e2029", border: "1px solid #2a2d3a",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)", overflow: "hidden"
    }}>
      <div style={{ position: "absolute", top: "14px", left: "16px", zIndex: 2, fontSize: "10px", fontWeight: 600, color: "#6b7280", letterSpacing: "1px", textTransform: "uppercase" }}>
        Aurora NERVÜR
      </div>
      <canvas ref={canvasRef} width={width} height={height}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }}
        onMouseLeave={() => { mouseRef.current = { x: width / 2, y: height / 2 }; }}
        style={{ width: "100%", height: "100%", cursor: "crosshair" }}
      />
    </div>
  );
}

// Keep ParticleNetwork for reference but use Aurora
const PARTICLE_COLORS = ["#ef4444", "#8b5cf6", "#10b981", "#06b6d4", "#f59e0b", "#6366f1"];

function ParticleNetwork({ width = 300, height = 600 }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef([]);
  const frameRef = useRef(null);

  const initParticles = useCallback(() => {
    const particles = [];
    const count = 40;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2.5 + 1.5,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        baseAlpha: Math.random() * 0.4 + 0.3,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = particles;
  }, [width, height]);

  useEffect(() => {
    initParticles();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function animate() {
      ctx.clearRect(0, 0, width, height);
      const mouse = mouseRef.current;
      const now = Date.now() * 0.001;

      // Update & draw particles
      for (const p of particlesRef.current) {
        // Mouse attraction
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150 * 0.02;
          p.vx += dx * force * 0.01;
          p.vy += dy * force * 0.01;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Damping
        p.vx *= 0.998;
        p.vy *= 0.998;

        // Bounce
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));

        // Pulsing alpha
        const alpha = p.baseAlpha + Math.sin(now * p.pulseSpeed * 60 + p.pulseOffset) * 0.15;

        // Glow
        ctx.beginPath();
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
        glow.addColorStop(0, p.color + Math.round(alpha * 40).toString(16).padStart(2, "0"));
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
      }

      // Draw connections
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.15;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw mouse connections
      if (mouse.x > 0 && mouse.y > 0) {
        for (const p of particles) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const alpha = (1 - dist / 150) * 0.25;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = p.color + Math.round(alpha * 255).toString(16).padStart(2, "0");
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
        // Mouse cursor glow
        ctx.beginPath();
        const cursorGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 30);
        cursorGlow.addColorStop(0, "rgba(129, 140, 248, 0.15)");
        cursorGlow.addColorStop(1, "transparent");
        ctx.fillStyle = cursorGlow;
        ctx.arc(mouse.x, mouse.y, 30, 0, Math.PI * 2);
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(animate);
    }

    animate();
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [width, height, initParticles]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }}
      onMouseLeave={() => { mouseRef.current = { x: -1000, y: -1000 }; }}
      style={{ position: "absolute", top: 0, right: 0, width, height, borderRadius: "14px", cursor: "crosshair" }}
    />
  );
}

// ═══════════════════════════════════════════
// LIVE ACTIVITY TICKER
// ═══════════════════════════════════════════
const ACTIVITY_ITEMS = [
  { icon: "🛡", text: "Nouvel avis 5 étoiles détecté", tool: "Sentinel", color: "#ef4444", time: "Il y a 2 min" },
  { icon: "⚡", text: "Score performance amélioré +12%", tool: "Phantom", color: "#8b5cf6", time: "Il y a 15 min" },
  { icon: "💗", text: "Uptime 99.9% — tous les sites en ligne", tool: "Pulse", color: "#ec4899", time: "Il y a 1h" },
  { icon: "🔒", text: "Scan sécurité terminé — 0 fuite", tool: "Vault", color: "#06b6d4", time: "Il y a 3h" },
  { icon: "🛡", text: "Réponse IA publiée automatiquement", tool: "Sentinel", color: "#ef4444", time: "Il y a 5h" },
  { icon: "⚡", text: "Nouveau rapport Lighthouse disponible", tool: "Phantom", color: "#8b5cf6", time: "Hier" },
];

function LiveTicker() {
  const [visibleIdx, setVisibleIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleIdx(prev => (prev + 1) % ACTIVITY_ITEMS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      padding: "16px 20px", borderRadius: "12px",
      background: "#1e2029", border: "1px solid #2a2d3a",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)", overflow: "hidden",
      position: "relative", minHeight: "70px"
    }}>
      <div style={{ fontSize: "10px", fontWeight: 600, color: "#6b7280", letterSpacing: "1px", marginBottom: "12px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", animation: "statusPulse 2s infinite", display: "inline-block" }} />
        Activité en direct
      </div>
      {ACTIVITY_ITEMS.map((item, i) => (
        <div key={i} style={{
          display: i === visibleIdx ? "flex" : "none",
          alignItems: "center", gap: "12px",
          animation: "fadeInUp 0.4s ease-out",
        }}>
          <span style={{ fontSize: "20px" }}>{item.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", color: "#d1d5db", fontWeight: 500 }}>{item.text}</div>
            <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px", display: "flex", gap: "8px" }}>
              <span style={{ color: item.color, fontWeight: 500 }}>{item.tool}</span>
              <span>{item.time}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════
const ShieldIcon = ({ color, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const PenIcon = ({ color, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
);
const BoltIcon = ({ color, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const ShieldCheckIcon = ({ color, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);
const HeartPulseIcon = ({ color, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19.5 12.572l-7.5 7.428-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.572"/>
    <path d="M12 6v4l2 2-2 2v4"/>
  </svg>
);
const MapIcon = ({ color, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="10" r="3"/>
    <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/>
  </svg>
);

// ═══════════════════════════════════════════
// TOOLS CONFIG
// ═══════════════════════════════════════════
const TOOLS = [
  {
    id: "sentinel", name: "Sentinel", subtitle: "E-réputation",
    desc: "Surveillez vos avis Google, répondez avec l'IA et analysez votre réputation en ligne.",
    color: "#ef4444", gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
    Icon: ShieldIcon, path: "/app/sentinel", stats: "Score • Avis • Réponses IA"
  },
  {
    id: "phantom", name: "Phantom", subtitle: "Performance web",
    desc: "Auditez vos pages web, obtenez vos scores Lighthouse et des recommandations d'optimisation.",
    color: "#8b5cf6", gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
    Icon: PenIcon, path: "/app/phantom", stats: "Audits • Performance • SEO"
  },
  // Nexus retiré — code conservé, réactivable

  {
    id: "pulse", name: "Pulse", subtitle: "Santé numérique",
    desc: "Surveillez la santé de vos sites : uptime, SSL, DNS, domaine et délivrabilité email.",
    color: "#ec4899", gradient: "linear-gradient(135deg, #ec4899, #f472b6)",
    Icon: HeartPulseIcon, path: "/app/pulse", stats: "Uptime • SSL • DNS • Email"
  },
  {
    id: "vault", name: "Vault", subtitle: "Cybersécurité",
    desc: "Surveillez les fuites de données et vérifiez si vos emails professionnels sont compromis.",
    color: "#06b6d4", gradient: "linear-gradient(135deg, #06b6d4, #22d3ee)",
    Icon: ShieldCheckIcon, path: "/app/vault", stats: "Scans • Alertes • Surveillance"
  },
];

const TIPS = [
  "Repondez aux avis dans les 24h pour ameliorer votre score.",
  "Utilisez Phantom pour optimiser le SEO de vos pages cles.",
  "Lancez un scan Vault chaque mois pour verifier vos emails.",
  "Surveillez votre uptime avec Pulse pour ne rater aucune panne.",
];

// ═══════════════════════════════════════════
// NERVÜR HOLOGRAM — CSS-only 3D branded element
// ═══════════════════════════════════════════
const holoStyles = `
@keyframes holoSpin { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(360deg); } }
@keyframes holoRing1 { 0% { transform: rotateX(70deg) rotateZ(0deg); } 100% { transform: rotateX(70deg) rotateZ(360deg); } }
@keyframes holoRing2 { 0% { transform: rotateX(40deg) rotateY(30deg) rotateZ(0deg); } 100% { transform: rotateX(40deg) rotateY(30deg) rotateZ(-360deg); } }
@keyframes holoRing3 { 0% { transform: rotateX(55deg) rotateY(-20deg) rotateZ(0deg); } 100% { transform: rotateX(55deg) rotateY(-20deg) rotateZ(360deg); } }
@keyframes holoPulse { 0%,100% { opacity:0.6; filter: blur(0px); } 50% { opacity:1; filter: blur(1px); } }
@keyframes holoFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes scanLine { 0% { top: 0%; } 100% { top: 100%; } }
.holo-container:hover .holo-core { animation-duration: 3s !important; }
.holo-container:hover .holo-ring { animation-duration: 2s !important; }
.holo-container:hover .holo-glow { opacity: 0.8 !important; }
`;

function NervurHologram() {
  return (
    <div className="holo-container" style={{
      height: "280px", borderRadius: "14px", position: "relative",
      background: "linear-gradient(180deg, #1a1b25 0%, #1e2029 50%, #1a1b25 100%)",
      border: "1px solid #2a2d3a", boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", perspective: "600px"
    }}>
      <style>{holoStyles}</style>

      {/* Scan line effect */}
      <div style={{
        position: "absolute", left: 0, right: 0, height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(129,140,248,0.3), transparent)",
        animation: "scanLine 3s linear infinite", pointerEvents: "none", zIndex: 3
      }} />

      {/* Grid background */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: "linear-gradient(rgba(129,140,248,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,0.5) 1px, transparent 1px)",
        backgroundSize: "30px 30px", pointerEvents: "none"
      }} />

      {/* Label */}
      <div style={{ position: "absolute", top: "12px", left: "14px", zIndex: 4 }}>
        <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(129,140,248,0.5)", letterSpacing: "2px", textTransform: "uppercase" }}>NERVÜR</div>
      </div>

      {/* Central floating element */}
      <div style={{ animation: "holoFloat 4s ease-in-out infinite", position: "relative", perspective: "400px", transformStyle: "preserve-3d" }}>
        {/* Glow behind */}
        <div className="holo-glow" style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: "120px", height: "120px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(129,140,248,0.1) 40%, transparent 70%)",
          animation: "holoPulse 3s ease-in-out infinite", transition: "opacity 0.5s"
        }} />

        {/* Ring 1 — Red (Sentinel) */}
        <div className="holo-ring" style={{
          position: "absolute", top: "50%", left: "50%",
          width: "140px", height: "140px", marginTop: "-70px", marginLeft: "-70px",
          border: "1.5px solid rgba(239,68,68,0.3)", borderRadius: "50%",
          animation: "holoRing1 8s linear infinite",
        }}>
          <div style={{ position: "absolute", top: "-3px", left: "50%", width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 8px #ef4444" }} />
        </div>

        {/* Ring 2 — Purple (Phantom) */}
        <div className="holo-ring" style={{
          position: "absolute", top: "50%", left: "50%",
          width: "110px", height: "110px", marginTop: "-55px", marginLeft: "-55px",
          border: "1.5px solid rgba(139,92,246,0.3)", borderRadius: "50%",
          animation: "holoRing2 6s linear infinite",
        }}>
          <div style={{ position: "absolute", bottom: "-3px", left: "50%", width: "6px", height: "6px", borderRadius: "50%", background: "#8b5cf6", boxShadow: "0 0 8px #8b5cf6" }} />
        </div>

        {/* Ring 3 — Green (Nexus) */}
        <div className="holo-ring" style={{
          position: "absolute", top: "50%", left: "50%",
          width: "170px", height: "170px", marginTop: "-85px", marginLeft: "-85px",
          border: "1px solid rgba(16,185,129,0.2)", borderRadius: "50%",
          animation: "holoRing3 10s linear infinite",
        }}>
          <div style={{ position: "absolute", top: "50%", right: "-3px", width: "5px", height: "5px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
        </div>

        {/* Core — 3D Cube with N */}
        <div className="holo-core" style={{
          width: "60px", height: "60px",
          position: "relative", zIndex: 2,
          transformStyle: "preserve-3d",
          animation: "holoSpin 12s linear infinite",
        }}>
          {/* Front face */}
          <div style={{
            position: "absolute", width: "60px", height: "60px",
            background: "linear-gradient(135deg, #6366f1, #818CF8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: "translateZ(30px)", backfaceVisibility: "hidden",
          }}>
            <span style={{ fontSize: "28px", fontWeight: 800, color: "#fff", fontFamily: "'Helvetica Neue', sans-serif" }}>N</span>
          </div>
          {/* Back face */}
          <div style={{
            position: "absolute", width: "60px", height: "60px",
            background: "linear-gradient(135deg, #4f46e5, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: "rotateY(180deg) translateZ(30px)", backfaceVisibility: "hidden",
          }}>
            <span style={{ fontSize: "28px", fontWeight: 800, color: "#fff", fontFamily: "'Helvetica Neue', sans-serif" }}>N</span>
          </div>
          {/* Right face */}
          <div style={{
            position: "absolute", width: "60px", height: "60px",
            background: "linear-gradient(180deg, #7c3aed, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: "rotateY(90deg) translateZ(30px)", backfaceVisibility: "hidden",
          }}>
            <span style={{ fontSize: "28px", fontWeight: 800, color: "#fff", fontFamily: "'Helvetica Neue', sans-serif" }}>N</span>
          </div>
          {/* Left face */}
          <div style={{
            position: "absolute", width: "60px", height: "60px",
            background: "linear-gradient(180deg, #818CF8, #4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: "rotateY(-90deg) translateZ(30px)", backfaceVisibility: "hidden",
          }}>
            <span style={{ fontSize: "28px", fontWeight: 800, color: "#fff", fontFamily: "'Helvetica Neue', sans-serif" }}>N</span>
          </div>
          {/* Top face */}
          <div style={{
            position: "absolute", width: "60px", height: "60px",
            background: "linear-gradient(135deg, #a78bfa, #818CF8)",
            transform: "rotateX(90deg) translateZ(30px)",
          }} />
          {/* Bottom face */}
          <div style={{
            position: "absolute", width: "60px", height: "60px",
            background: "linear-gradient(135deg, #4338ca, #4f46e5)",
            transform: "rotateX(-90deg) translateZ(30px)",
          }} />
        </div>
      </div>

      {/* Bottom stats bar */}
      <div style={{
        position: "absolute", bottom: "12px", left: "14px", right: "14px",
        display: "flex", justifyContent: "space-between", zIndex: 4
      }}>
        {[
          { label: "SEN", color: "#ef4444" },
          { label: "PHA", color: "#8b5cf6" },
          { label: "NEX", color: "#10b981" },
          { label: "VAU", color: "#06b6d4" },
        ].map((t, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ width: "24px", height: "2px", background: t.color, borderRadius: "1px", marginBottom: "4px", opacity: 0.6 }} />
            <div style={{ fontSize: "8px", color: t.color, letterSpacing: "1px", opacity: 0.5 }}>{t.label}</div>
          </div>
        ))}
      </div>

      {/* Corner decorations */}
      <div style={{ position: "absolute", top: "8px", right: "8px", width: "12px", height: "12px", borderTop: "1px solid rgba(129,140,248,0.2)", borderRight: "1px solid rgba(129,140,248,0.2)" }} />
      <div style={{ position: "absolute", bottom: "8px", left: "8px", width: "12px", height: "12px", borderBottom: "1px solid rgba(129,140,248,0.2)", borderLeft: "1px solid rgba(129,140,248,0.2)" }} />
    </div>
  );
}

// (kept for reference, not used)
function GravityPlayground({ width = 300, height = 300 }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, down: false });
  const orbsRef = useRef([]);
  const trailsRef = useRef([]);
  const frameRef = useRef(null);

  useEffect(() => {
    const orbs = [
      { x: 60, y: 60, vx: 1.5, vy: 0.8, r: 18, color: [239, 68, 68], label: "S", glow: 0 },
      { x: 200, y: 80, vx: -1, vy: 1.2, r: 16, color: [139, 92, 246], label: "P", glow: 0 },
      { x: 120, y: 200, vx: 0.8, vy: -1, r: 16, color: [16, 185, 129], label: "N", glow: 0 },
      { x: 220, y: 220, vx: -0.5, vy: -0.8, r: 15, color: [6, 182, 212], label: "V", glow: 0 },
      { x: 150, y: 140, vx: 0.3, vy: 0.6, r: 12, color: [99, 102, 241], label: "✦", glow: 0 },
    ];
    orbsRef.current = orbs;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function draw() {
      // Fade trail
      ctx.fillStyle = "rgba(30, 32, 41, 0.15)";
      ctx.fillRect(0, 0, width, height);

      const mouse = mouseRef.current;

      for (const orb of orbs) {
        // Mouse interaction
        const dx = mouse.x - orb.x;
        const dy = mouse.y - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 180 && mouse.x > 0) {
          const force = mouse.down ? -0.15 : 0.06; // Click = repel, hover = attract
          const strength = (180 - dist) / 180 * force;
          orb.vx += dx * strength;
          orb.vy += dy * strength;
          orb.glow = Math.min(1, orb.glow + 0.1);
        } else {
          orb.glow = Math.max(0, orb.glow - 0.02);
        }

        // Inter-orb repulsion (prevent overlap)
        for (const other of orbs) {
          if (other === orb) continue;
          const ox = orb.x - other.x;
          const oy = orb.y - other.y;
          const od = Math.sqrt(ox * ox + oy * oy);
          const minDist = orb.r + other.r + 5;
          if (od < minDist && od > 0) {
            const push = (minDist - od) / od * 0.3;
            orb.vx += ox * push;
            orb.vy += oy * push;
          }
        }

        // Gravity toward center (gentle)
        orb.vx += (width / 2 - orb.x) * 0.0003;
        orb.vy += (height / 2 - orb.y) * 0.0003;

        // Damping
        orb.vx *= 0.985;
        orb.vy *= 0.985;

        // Speed limit
        const speed = Math.sqrt(orb.vx * orb.vx + orb.vy * orb.vy);
        if (speed > 4) { orb.vx *= 4 / speed; orb.vy *= 4 / speed; }

        // Move
        orb.x += orb.vx;
        orb.y += orb.vy;

        // Bounce off walls
        if (orb.x - orb.r < 0) { orb.x = orb.r; orb.vx = Math.abs(orb.vx) * 0.7; }
        if (orb.x + orb.r > width) { orb.x = width - orb.r; orb.vx = -Math.abs(orb.vx) * 0.7; }
        if (orb.y - orb.r < 0) { orb.y = orb.r; orb.vy = Math.abs(orb.vy) * 0.7; }
        if (orb.y + orb.r > height) { orb.y = height - orb.r; orb.vy = -Math.abs(orb.vy) * 0.7; }

        // Draw trail
        const trailAlpha = Math.min(speed / 2, 0.4);
        if (trailAlpha > 0.05) {
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, orb.r * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${orb.color[0]}, ${orb.color[1]}, ${orb.color[2]}, ${trailAlpha * 0.15})`;
          ctx.fill();
        }

        // Draw glow
        const glowSize = orb.r * (2.5 + orb.glow * 2);
        const glow = ctx.createRadialGradient(orb.x, orb.y, orb.r * 0.5, orb.x, orb.y, glowSize);
        glow.addColorStop(0, `rgba(${orb.color[0]}, ${orb.color[1]}, ${orb.color[2]}, ${0.15 + orb.glow * 0.2})`);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Draw orb body
        const bodyGrad = ctx.createRadialGradient(orb.x - orb.r * 0.3, orb.y - orb.r * 0.3, 0, orb.x, orb.y, orb.r);
        bodyGrad.addColorStop(0, `rgba(${Math.min(255, orb.color[0] + 80)}, ${Math.min(255, orb.color[1] + 80)}, ${Math.min(255, orb.color[2] + 80)}, 1)`);
        bodyGrad.addColorStop(1, `rgba(${orb.color[0]}, ${orb.color[1]}, ${orb.color[2]}, 1)`);
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        // Shine highlight
        ctx.beginPath();
        ctx.arc(orb.x - orb.r * 0.25, orb.y - orb.r * 0.25, orb.r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.fill();

        // Label
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${orb.r * 0.8}px Inter, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(orb.label, orb.x, orb.y + 1);
      }

      // Draw connection lines between orbs
      for (let i = 0; i < orbs.length; i++) {
        for (let j = i + 1; j < orbs.length; j++) {
          const a = orbs[i], b = orbs[j];
          const d = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
          if (d < 140) {
            const alpha = (1 - d / 140) * 0.12;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            const lineGrad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            lineGrad.addColorStop(0, `rgba(${a.color[0]}, ${a.color[1]}, ${a.color[2]}, ${alpha})`);
            lineGrad.addColorStop(1, `rgba(${b.color[0]}, ${b.color[1]}, ${b.color[2]}, ${alpha})`);
            ctx.strokeStyle = lineGrad;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Mouse cursor glow when hovering
      if (mouse.x > 0 && mouse.y > 0) {
        ctx.beginPath();
        const mg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 40);
        mg.addColorStop(0, mouse.down ? "rgba(239,68,68,0.1)" : "rgba(129,140,248,0.08)");
        mg.addColorStop(1, "transparent");
        ctx.fillStyle = mg;
        ctx.arc(mouse.x, mouse.y, 40, 0, Math.PI * 2);
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(draw);
    }

    // Initial clear
    ctx.fillStyle = "#1e2029";
    ctx.fillRect(0, 0, width, height);
    draw();

    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [width, height]);

  return (
    <div style={{
      height: height + "px", borderRadius: "14px", position: "relative",
      overflow: "hidden", border: "1px solid #2a2d3a",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
    }}>
      <div style={{ position: "absolute", top: "12px", left: "14px", zIndex: 2 }}>
        <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase" }}>NERVÜR Universe</div>
        <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", marginTop: "2px" }}>Survolez pour attirer • Cliquez pour repousser</div>
      </div>
      <canvas ref={canvasRef} width={width} height={height}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          mouseRef.current = { ...mouseRef.current, x: e.clientX - rect.left, y: e.clientY - rect.top };
        }}
        onMouseDown={() => { mouseRef.current.down = true; }}
        onMouseUp={() => { mouseRef.current.down = false; }}
        onMouseLeave={() => { mouseRef.current = { x: -1000, y: -1000, down: false }; }}
        style={{ width: "100%", height: "100%", cursor: "grab" }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════
// RIGHT PANEL (dynamic data + contact form)
// ═══════════════════════════════════════════
function RightPanel({ hasAccess }) {
  const { get, post } = useApi();
  const [stats, setStats] = useState(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ subject: "", message: "" });
  const [contactSent, setContactSent] = useState(false);
  const [visibleIdx, setVisibleIdx] = useState(0);

  // Fetch real stats
  useEffect(() => {
    async function loadStats() {
      try {
        const data = {};
        if (hasAccess("sentinel")) {
          try {
            const businesses = await get("/api/sentinel-app/businesses");
            if (businesses?.[0]) {
              const s = await get(`/api/sentinel-app/businesses/${businesses[0]._id}/stats`);
              data.score = s?.averageRating?.toFixed(1) || "—";
              data.reviews = s?.totalReviews || 0;
              data.responseRate = s?.responseRate || 0;
            }
          } catch(e) {}
        }
        if (hasAccess("vault")) {
          try {
            const scans = await get("/api/vault/history");
            data.scans = scans?.length || 0;
          } catch(e) {}
        }
        data.tools = [hasAccess("sentinel"), hasAccess("phantom"), hasAccess("vault"), hasAccess("pulse")].filter(Boolean).length;
        setStats(data);
      } catch(e) { setStats({ tools: 0 }); }
    }
    loadStats();
  }, []);

  // Build activity based on real tools
  const activities = [];
  if (hasAccess("sentinel")) {
    activities.push({ icon: "🛡", text: "Surveillance e-réputation active", tool: "Sentinel", color: "#ef4444" });
    activities.push({ icon: "💬", text: "Réponses IA générées automatiquement", tool: "Sentinel", color: "#ef4444" });
  }
  if (hasAccess("phantom")) {
    activities.push({ icon: "⚡", text: "Audits de performance disponibles", tool: "Phantom", color: "#8b5cf6" });
  }
  if (hasAccess("pulse")) {
    activities.push({ icon: "💗", text: "Monitoring sante web actif", tool: "Pulse", color: "#ec4899" });
  }
  if (hasAccess("vault")) {
    activities.push({ icon: "🔒", text: "Protection données activée", tool: "Vault", color: "#06b6d4" });
  }
  if (activities.length === 0) {
    activities.push({ icon: "👋", text: "Souscrivez à un outil pour commencer", tool: "NERVÜR", color: "#6366f1" });
  }

  // Ticker rotation
  useEffect(() => {
    if (activities.length <= 1) return;
    const t = setInterval(() => setVisibleIdx(p => (p + 1) % activities.length), 4000);
    return () => clearInterval(t);
  }, [activities.length]);

  // Contact submit
  const handleContact = async () => {
    if (!contactForm.subject || !contactForm.message) return;
    try {
      await post("/api/sentinel-app/auth/contact", contactForm);
    } catch(e) {}
    setContactSent(true);
    setTimeout(() => { setContactSent(false); setContactOpen(false); setContactForm({ subject: "", message: "" }); }, 3000);
  };

  return (
    <div style={{
      width: "300px", flexShrink: 0,
      display: "flex", flexDirection: "column", gap: "16px",
      animation: "slideInRight 0.6s ease-out forwards", opacity: 0,
      animationDelay: "0.3s"
    }}>
      {/* Quick overview card */}
      <div style={{
        padding: "20px", borderRadius: "14px",
        background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(129,140,248,0.04) 100%)",
        border: "1px solid rgba(99,102,241,0.15)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ fontSize: "10px", fontWeight: 600, color: "#818CF8", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px" }}>NERVUR</div>
        <div style={{ fontSize: "13px", color: "#9ca3af", lineHeight: 1.7 }}>
          Votre espace de gestion centralise. Accedez a vos outils, suivez vos statistiques et gerez votre presence en ligne.
        </div>
        <div style={{
          marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap",
        }}>
          {[
            { label: "SEN", color: "#ef4444" },
            { label: "PHA", color: "#8b5cf6" },
            { label: "VAU", color: "#06b6d4" },
            { label: "PUL", color: "#ec4899" },
          ].map((t, i) => (
            <div key={i} style={{
              padding: "4px 10px", borderRadius: "4px",
              background: `${t.color}15`, border: `1px solid ${t.color}30`,
              fontSize: "9px", fontWeight: 600, color: t.color, letterSpacing: "1px",
            }}>
              {t.label}
            </div>
          ))}
        </div>
      </div>

      {/* Live Activity — dynamic */}
      <div style={{
        padding: "16px 20px", borderRadius: "12px",
        background: "#1e2029", border: "1px solid #2a2d3a",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)", minHeight: "70px",
        animation: "fadeInUp 0.5s ease-out 0.5s forwards", opacity: 0
      }}>
        <div style={{ fontSize: "10px", fontWeight: 600, color: "#6b7280", letterSpacing: "1px", marginBottom: "12px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", animation: "statusPulse 2s infinite", display: "inline-block" }} />
          Vos outils
        </div>
        {activities.map((item, i) => (
          <div key={i} style={{
            display: i === visibleIdx % activities.length ? "flex" : "none",
            alignItems: "center", gap: "12px",
            animation: "fadeInUp 0.4s ease-out",
          }}>
            <span style={{ fontSize: "20px" }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", color: "#d1d5db", fontWeight: 500 }}>{item.text}</div>
              <span style={{ fontSize: "11px", color: item.color, fontWeight: 500 }}>{item.tool}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats — real data */}
      <div style={{
        padding: "16px 20px", borderRadius: "12px",
        background: "#1e2029", border: "1px solid #2a2d3a",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        animation: "fadeInUp 0.5s ease-out 0.6s forwards", opacity: 0
      }}>
        <div style={{ fontSize: "10px", fontWeight: 600, color: "#6b7280", letterSpacing: "1px", marginBottom: "14px", textTransform: "uppercase" }}>
          Résumé rapide
        </div>
        {[
          { label: "Outils actifs", value: stats ? `${stats.tools}/${TOOLS.length}` : "—", color: "#22c55e" },
          ...(hasAccess("sentinel") ? [
            { label: "Score réputation", value: stats?.score || "—", color: "#ef4444" },
            { label: "Total avis", value: stats?.reviews ?? "—", color: "#ef4444" },
          ] : []),
          ...(hasAccess("vault") ? [
            { label: "Scans sécurité", value: stats?.scans ?? "—", color: "#06b6d4" },
          ] : []),
          ...(hasAccess("pulse") ? [
            { label: "Sites surveilles", value: "—", color: "#ec4899" },
          ] : []),
        ].map((stat, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 3 ? "1px solid #2a2d3a" : "none" }}>
            <span style={{ fontSize: "12px", color: "#9ca3af" }}>{stat.label}</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: stat.color }}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Contact / Support */}
      {!contactOpen ? (
        <button onClick={() => setContactOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "14px 20px", borderRadius: "12px", width: "100%",
            background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(129,140,248,0.05))",
            border: "1px solid rgba(99,102,241,0.15)",
            cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            transition: "all 0.3s",
            animation: "fadeInUp 0.5s ease-out 0.7s forwards", opacity: 0
          }}>
          <span style={{ fontSize: "20px" }}>💬</span>
          <div>
            <div style={{ fontSize: "13px", color: "#818CF8", fontWeight: 500 }}>Besoin d'aide ?</div>
            <div style={{ fontSize: "11px", color: "#6b7280" }}>Envoyez-nous un message</div>
          </div>
        </button>
      ) : (
        <div style={{
          padding: "18px 20px", borderRadius: "12px",
          background: "#1e2029", border: "1px solid #2a2d3a",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          animation: "fadeInScale 0.3s ease-out"
        }}>
          {contactSent ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>✅</div>
              <div style={{ fontSize: "14px", color: "#22c55e", fontWeight: 500 }}>Message envoyé !</div>
              <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>Nous vous répondrons sous 24h</div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#f0f0f3" }}>Contactez-nous</span>
                <button onClick={() => setContactOpen(false)} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "16px", fontFamily: "inherit" }}>✕</button>
              </div>
              <input value={contactForm.subject} onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))}
                placeholder="Sujet"
                style={{
                  width: "100%", padding: "10px 12px", background: "#141520", border: "1px solid #2a2d3a",
                  borderRadius: "8px", color: "#e4e4e7", fontSize: "13px", fontFamily: "inherit",
                  outline: "none", boxSizing: "border-box", marginBottom: "10px"
                }}
                onFocus={e => e.target.style.borderColor = "#6366f1"}
                onBlur={e => e.target.style.borderColor = "#2a2d3a"} />
              <textarea value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Votre message..."
                rows={4}
                style={{
                  width: "100%", padding: "10px 12px", background: "#141520", border: "1px solid #2a2d3a",
                  borderRadius: "8px", color: "#e4e4e7", fontSize: "13px", fontFamily: "inherit",
                  outline: "none", boxSizing: "border-box", marginBottom: "12px", resize: "vertical"
                }}
                onFocus={e => e.target.style.borderColor = "#6366f1"}
                onBlur={e => e.target.style.borderColor = "#2a2d3a"} />
              <button onClick={handleContact}
                style={{
                  width: "100%", padding: "10px", background: "linear-gradient(135deg, #6366f1, #818CF8)",
                  color: "#fff", border: "none", borderRadius: "8px",
                  fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit"
                }}>
                Envoyer
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════
export default function PortalPage() {
  const { user, hasAccess } = useAuth();
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const tipIndex = Math.floor(Date.now() / 86400000) % TIPS.length;

  return (
    <div style={{ position: "relative" }}>
      <style>{styleTag}</style>

      {/* Two-column layout: Tools + Interactive Panel */}
      <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>

        {/* LEFT: Tools */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{
            marginBottom: "32px", padding: "28px 32px", borderRadius: "14px",
            background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(129,140,248,0.04) 100%)",
            border: "1px solid rgba(99,102,241,0.12)",
            position: "relative", overflow: "hidden",
            ...fadeInUp
          }}>
            <div style={{ position: "absolute", top: "-20px", right: "40px", width: "120px", height: "120px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", animation: "orbFloat 6s ease-in-out infinite", pointerEvents: "none" }} />
            <h1 style={{ fontSize: "28px", fontWeight: 600, color: "#f0f0f3", marginBottom: "6px", position: "relative" }}>
              <TypingText text={`Bonjour, ${user?.name?.split(" ")[0] || "Client"}`} speed={50} delay={300} />
            </h1>
            <p style={{ fontSize: "14px", color: "#9ca3af", position: "relative", animation: "fadeInUp 0.6s ease-out 1.2s forwards", opacity: 0 }}>
              Votre espace de gestion NERVÜR
            </p>
            {/* Live clock */}
            <LiveClock />
          </div>

          {/* Tool Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {TOOLS.map((tool, index) => {
              const active = hasAccess(tool.id);
              const { Icon, color, gradient } = tool;
              const isHovered = hoveredCard === tool.id;
              return (
                <div key={tool.id}
                  onClick={() => active ? navigate(tool.path) : window.open("https://nervur.fr/contact", "_blank")}
                  onMouseEnter={() => setHoveredCard(tool.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    ...fadeInUp, animationDelay: `${index * 0.1}s`,
                    padding: "24px", paddingTop: "27px",
                    border: `1px solid ${isHovered && active ? `${color}50` : "#2a2d3a"}`,
                    borderRadius: "14px", background: "#1e2029",
                    cursor: "pointer", opacity: active ? 1 : 0.45,
                    display: "flex", flexDirection: "column",
                    transition: "all 0.3s ease",
                    position: "relative", overflow: "hidden",
                    transform: isHovered && active ? "translateY(-4px)" : "translateY(0)",
                    boxShadow: isHovered && active ? `0 12px 40px ${color}20, 0 4px 16px rgba(0,0,0,0.3)` : "0 2px 8px rgba(0,0,0,0.25)",
                  }}>
                  {/* Top accent */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: active ? gradient : "#2a2d3a", borderRadius: "14px 14px 0 0" }} />
                  {isHovered && active && <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: "14px", pointerEvents: "none", background: `linear-gradient(90deg, transparent, ${color}10, transparent)`, backgroundSize: "200% 100%", animation: "shimmer 2s linear infinite" }} />}

                  <div style={{
                    width: "48px", height: "48px", borderRadius: "12px", background: gradient,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "16px", boxShadow: active ? `0 4px 12px ${color}30` : "none",
                    transition: "transform 0.3s", transform: isHovered && active ? "scale(1.08)" : "scale(1)",
                  }}>
                    <Icon color="#fff" size={24} />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, color: active ? "#f0f0f3" : "#4b5563", margin: 0 }}>{tool.name}</h3>
                    <span style={{ fontSize: "10px", fontWeight: 500, color: active ? color : "#6b7280", padding: "2px 7px", borderRadius: "4px", background: active ? `${color}15` : "#2a2d3a" }}>{tool.subtitle}</span>
                    {active && <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "10px", color: "#22c55e", fontWeight: 500 }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#22c55e", animation: "statusPulse 2s infinite", display: "inline-block" }} />Actif
                    </span>}
                  </div>

                  <p style={{ fontSize: "13px", color: "#9ca3af", margin: "0 0 14px", lineHeight: 1.6 }}>{tool.desc}</p>

                  {active && <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "16px", padding: "6px 10px", borderRadius: "6px", background: "#17181f", border: "1px solid #2a2d3a" }}>{tool.stats}</div>}

                  <div style={{ marginTop: "auto" }}>
                    {active ? (
                      <span onMouseEnter={() => setHoveredBtn(tool.id)} onMouseLeave={() => setHoveredBtn(null)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "6px",
                          padding: "7px 16px", borderRadius: "8px",
                          background: hoveredBtn === tool.id ? `${color}25` : `${color}15`,
                          color, fontSize: "12px", fontWeight: 500,
                          border: `1px solid ${hoveredBtn === tool.id ? `${color}50` : `${color}30`}`,
                          transition: "all 0.3s",
                        }}>
                        Ouvrir <span style={{ transition: "transform 0.3s", transform: hoveredBtn === tool.id ? "translateX(4px)" : "translateX(0)", display: "inline-block" }}>&rarr;</span>
                      </span>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#6b7280" }}>Non souscrit</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tips */}
          <div style={{ marginTop: "24px", padding: "16px 20px", borderRadius: "12px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)", ...fadeInUp, animationDelay: "0.5s" }}>
            <div style={{ fontSize: "10px", fontWeight: 600, color: "#818CF8", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "6px" }}>Conseil du jour</div>
            <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0, lineHeight: 1.6 }}>{TIPS[tipIndex]}</p>
          </div>
        </div>

        {/* RIGHT: Interactive Panel */}
        <RightPanel hasAccess={hasAccess} />
      </div>
    </div>
  );
}
