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

const fadeInUpClass = "opacity-0 [animation:fadeInUp_0.5s_ease-out_forwards]";

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
  return <span>{displayed}{showCursor && <span className="[animation:blink_1s_infinite] text-[#635BFF]">|</span>}</span>;
}

// ═══════════════════════════════════════════
// ANIMATED COUNTER
// ═══════════════════════════════════════════
function AnimatedCounter({ value, duration = 1500, suffix = "", color = "#0A2540" }) {
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
  return <span className="font-semibold" style={{ color }}>{Number.isInteger(numVal) ? Math.round(count) : count.toFixed(1)}{suffix}</span>;
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
    <div className="relative rounded-[14px] p-px">
      <div className="absolute -inset-px rounded-[15px] overflow-hidden z-0">
        <div className="absolute -inset-1/2 [animation:rotateGradient_4s_linear_infinite] opacity-40"
          style={{ background: `conic-gradient(from 0deg, ${color}, transparent 30%, transparent 70%, ${color})` }} />
      </div>
      <div className="relative z-[1]">{children}</div>
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
    <div className="absolute top-7 right-8 text-right opacity-0 [animation:fadeInUp_0.6s_ease-out_1.5s_forwards]">
      <div className="text-[22px] font-semibold text-[#0A2540] tabular-nums tracking-wide">{clock}</div>
      <div className="text-xs text-gray-500 capitalize mt-0.5">{fmt}</div>
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
    <div className="rounded-[14px] relative bg-white border border-[#E3E8EE] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden"
      style={{ height: height + "px" }}>
      <div className="absolute top-3.5 left-4 z-[2] text-[10px] font-semibold text-gray-500 tracking-wide uppercase">
        Aurora NERVÜR
      </div>
      <canvas ref={canvasRef} width={width} height={height}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }}
        onMouseLeave={() => { mouseRef.current = { x: width / 2, y: height / 2 }; }}
        className="w-full h-full cursor-crosshair"
      />
    </div>
  );
}

// Keep ParticleNetwork for reference but use Aurora
const PARTICLE_COLORS = ["#ef4444", "#8b5cf6", "#10b981", "#06b6d4", "#f59e0b", "#635BFF"];

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
      className="absolute top-0 right-0 rounded-[14px] cursor-crosshair"
      style={{ width, height }}
    />
  );
}

// ═══════════════════════════════════════════
// LIVE ACTIVITY TICKER
// ═══════════════════════════════════════════
const ACTIVITY_ITEMS = [
  { icon: "🛡", text: "Nouvel avis 5 étoiles détecté", tool: "Sentinel", color: "#ef4444", time: "Il y a 2 min" },
  { icon: "🔒", text: "Scan conformité RGPD terminé", tool: "Vault", color: "#06b6d4", time: "Il y a 3h" },
  { icon: "🛡", text: "Réponse IA publiée automatiquement", tool: "Sentinel", color: "#ef4444", time: "Il y a 5h" },
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
    <div className="px-5 py-4 rounded-xl bg-white border border-[#E3E8EE] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden relative min-h-[70px]">
      <div className="text-[10px] font-semibold text-gray-500 tracking-wide mb-3 uppercase flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 [animation:statusPulse_2s_infinite] inline-block" />
        Activité en direct
      </div>
      {ACTIVITY_ITEMS.map((item, i) => (
        <div key={i} className={`${i === visibleIdx ? "flex" : "hidden"} items-center gap-3 [animation:fadeInUp_0.4s_ease-out]`}>
          <span className="text-xl">{item.icon}</span>
          <div className="flex-1">
            <div className="text-[13px] text-gray-700 font-medium">{item.text}</div>
            <div className="text-[11px] text-gray-500 mt-0.5 flex gap-2">
              <span className="font-medium" style={{ color: item.color }}>{item.tool}</span>
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
  // Phantom et Pulse retirés — code conservé, réactivable
  {
    id: "vault", name: "Vault", subtitle: "Agent Juridique IA",
    desc: "Agent Juridique IA — Conformité & Protection juridique. Scan RGPD, documents légaux et veille juridique.",
    color: "#06b6d4", gradient: "linear-gradient(135deg, #06b6d4, #22d3ee)",
    Icon: ShieldCheckIcon, path: "/app/vault", stats: "RGPD • Générateur • Registre • Veille"
  },
];

const TIPS = [
  "Répondez aux avis dans les 24h pour améliorer votre score.",
  "Lancez un scan Vault chaque mois pour vérifier votre conformité RGPD.",
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
    <div className="holo-container h-[280px] rounded-[14px] relative bg-[linear-gradient(180deg,#1a1b25_0%,#1e2029_50%,#1a1b25_100%)] border border-[#E3E8EE] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden flex items-center justify-center cursor-pointer [perspective:600px]">
      <style>{holoStyles}</style>

      {/* Scan line effect */}
      <div className="absolute left-0 right-0 h-px bg-[linear-gradient(90deg,transparent,rgba(129,140,248,0.3),transparent)] [animation:scanLine_3s_linear_infinite] pointer-events-none z-[3]" />

      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(129,140,248,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,0.5) 1px, transparent 1px)",
          backgroundSize: "30px 30px"
        }} />

      {/* Label */}
      <div className="absolute top-3 left-3.5 z-[4]">
        <div className="text-[10px] font-semibold text-[rgba(129,140,248,0.5)] tracking-[2px] uppercase">NERVÜR</div>
      </div>

      {/* Central floating element */}
      <div className="[animation:holoFloat_4s_ease-in-out_infinite] relative [perspective:400px] [transform-style:preserve-3d]">
        {/* Glow behind */}
        <div className="holo-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.25)_0%,rgba(129,140,248,0.1)_40%,transparent_70%)] [animation:holoPulse_3s_ease-in-out_infinite] transition-opacity duration-500" />

        {/* Ring 1 — Red (Sentinel) */}
        <div className="holo-ring absolute top-1/2 left-1/2 w-[140px] h-[140px] -mt-[70px] -ml-[70px] border-[1.5px] border-[rgba(239,68,68,0.3)] rounded-full [animation:holoRing1_8s_linear_infinite]">
          <div className="absolute -top-[3px] left-1/2 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
        </div>

        {/* Ring 2 — Cyan (Vault) */}
        <div className="holo-ring absolute top-1/2 left-1/2 w-[110px] h-[110px] -mt-[55px] -ml-[55px] border-[1.5px] border-[rgba(6,182,212,0.3)] rounded-full [animation:holoRing2_6s_linear_infinite]">
          <div className="absolute -bottom-[3px] left-1/2 w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]" />
        </div>

        {/* Ring 3 — Green (Nexus) */}
        <div className="holo-ring absolute top-1/2 left-1/2 w-[170px] h-[170px] -mt-[85px] -ml-[85px] border border-[rgba(16,185,129,0.2)] rounded-full [animation:holoRing3_10s_linear_infinite]">
          <div className="absolute top-1/2 -right-[3px] w-[5px] h-[5px] rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
        </div>

        {/* Core — 3D Cube with N */}
        <div className="holo-core w-[60px] h-[60px] relative z-[2] [transform-style:preserve-3d] [animation:holoSpin_12s_linear_infinite]">
          {/* Front face */}
          <div className="absolute w-[60px] h-[60px] bg-[linear-gradient(135deg,#6366f1,#818CF8)] flex items-center justify-center [transform:translateZ(30px)] [backface-visibility:hidden]">
            <span className="text-[28px] font-extrabold text-white font-['Helvetica_Neue',sans-serif]">N</span>
          </div>
          {/* Back face */}
          <div className="absolute w-[60px] h-[60px] bg-[linear-gradient(135deg,#4f46e5,#6366f1)] flex items-center justify-center [transform:rotateY(180deg)_translateZ(30px)] [backface-visibility:hidden]">
            <span className="text-[28px] font-extrabold text-white font-['Helvetica_Neue',sans-serif]">N</span>
          </div>
          {/* Right face */}
          <div className="absolute w-[60px] h-[60px] bg-[linear-gradient(180deg,#7c3aed,#6366f1)] flex items-center justify-center [transform:rotateY(90deg)_translateZ(30px)] [backface-visibility:hidden]">
            <span className="text-[28px] font-extrabold text-white font-['Helvetica_Neue',sans-serif]">N</span>
          </div>
          {/* Left face */}
          <div className="absolute w-[60px] h-[60px] bg-[linear-gradient(180deg,#818CF8,#4f46e5)] flex items-center justify-center [transform:rotateY(-90deg)_translateZ(30px)] [backface-visibility:hidden]">
            <span className="text-[28px] font-extrabold text-white font-['Helvetica_Neue',sans-serif]">N</span>
          </div>
          {/* Top face */}
          <div className="absolute w-[60px] h-[60px] bg-[linear-gradient(135deg,#a78bfa,#818CF8)] [transform:rotateX(90deg)_translateZ(30px)]" />
          {/* Bottom face */}
          <div className="absolute w-[60px] h-[60px] bg-[linear-gradient(135deg,#4338ca,#4f46e5)] [transform:rotateX(-90deg)_translateZ(30px)]" />
        </div>
      </div>

      {/* Bottom stats bar */}
      <div className="absolute bottom-3 left-3.5 right-3.5 flex justify-between z-[4]">
        {[
          { label: "SEN", color: "#ef4444" },
          { label: "PHA", color: "#8b5cf6" },
          { label: "NEX", color: "#10b981" },
          { label: "VAU", color: "#06b6d4" },
        ].map((t, i) => (
          <div key={i} className="text-center">
            <div className="w-6 h-0.5 rounded-sm mb-1 opacity-60" style={{ background: t.color }} />
            <div className="text-[8px] tracking-wide opacity-50" style={{ color: t.color }}>{t.label}</div>
          </div>
        ))}
      </div>

      {/* Corner decorations */}
      <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[rgba(129,140,248,0.2)]" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[rgba(129,140,248,0.2)]" />
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
        ctx.fillStyle = "rgba(0,0,0,0.15)";
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
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
    draw();

    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [width, height]);

  return (
    <div className="rounded-[14px] relative overflow-hidden border border-[#E3E8EE] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
      style={{ height: height + "px" }}>
      <div className="absolute top-3 left-3.5 z-[2]">
        <div className="text-[10px] font-semibold text-white/40 tracking-wide uppercase">NERVÜR Universe</div>
        <div className="text-[9px] text-white/20 mt-0.5">Survolez pour attirer • Cliquez pour repousser</div>
      </div>
      <canvas ref={canvasRef} width={width} height={height}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          mouseRef.current = { ...mouseRef.current, x: e.clientX - rect.left, y: e.clientY - rect.top };
        }}
        onMouseDown={() => { mouseRef.current.down = true; }}
        onMouseUp={() => { mouseRef.current.down = false; }}
        onMouseLeave={() => { mouseRef.current = { x: -1000, y: -1000, down: false }; }}
        className="w-full h-full cursor-grab"
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
            const checklist = await get("/api/vault/checklist");
            const registre = await get("/api/vault/registre");
            const total = checklist?.items?.length || 0;
            const done = checklist?.items?.filter(i => i.done)?.length || 0;
            data.conformiteScore = total > 0 ? Math.round((done / total) * 100) : "—";
            data.registreCount = registre?.length || 0;
          } catch(e) {}
        }
        data.tools = [hasAccess("sentinel"), hasAccess("vault")].filter(Boolean).length;
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
  if (hasAccess("vault")) {
    activities.push({ icon: "🔒", text: "Conformité juridique surveillée", tool: "Vault", color: "#06b6d4" });
  }
  if (activities.length === 0) {
    activities.push({ icon: "👋", text: "Souscrivez à un outil pour commencer", tool: "NERVÜR", color: "#635BFF" });
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
    <div className="w-full lg:w-[300px] shrink-0 flex flex-col gap-4 opacity-0 [animation:slideInRight_0.6s_ease-out_0.3s_forwards]">
      {/* Quick overview card */}
      <div className="p-5 rounded-[14px] bg-[linear-gradient(135deg,rgba(99,102,241,0.08)_0%,rgba(129,140,248,0.04)_100%)] border border-[rgba(99,102,241,0.15)] relative overflow-hidden">
        <div className="text-[10px] font-semibold text-[#635BFF] tracking-[1.5px] uppercase mb-3">NERVUR</div>
        <div className="text-[13px] text-[#9ca3af] leading-[1.7]">
          Votre espace de gestion centralise. Accedez a vos outils, suivez vos statistiques et gerez votre presence en ligne.
        </div>
        <div className="mt-4 flex gap-2 flex-wrap">
          {[
            { label: "SEN", color: "#ef4444" },
            { label: "VAU", color: "#06b6d4" },
          ].map((t, i) => (
            <div key={i} className="px-2.5 py-1 rounded text-[9px] font-semibold tracking-wide"
              style={{ background: `${t.color}15`, border: `1px solid ${t.color}30`, color: t.color }}>
              {t.label}
            </div>
          ))}
        </div>
      </div>

      {/* Live Activity — dynamic */}
      <div className="px-5 py-4 rounded-xl bg-white border border-[#E3E8EE] shadow-[0_2px_8px_rgba(0,0,0,0.06)] min-h-[70px] opacity-0 [animation:fadeInUp_0.5s_ease-out_0.5s_forwards]">
        <div className="text-[10px] font-semibold text-gray-500 tracking-wide mb-3 uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 [animation:statusPulse_2s_infinite] inline-block" />
          Vos outils
        </div>
        {activities.map((item, i) => (
          <div key={i} className={`${i === visibleIdx % activities.length ? "flex" : "hidden"} items-center gap-3 [animation:fadeInUp_0.4s_ease-out]`}>
            <span className="text-xl">{item.icon}</span>
            <div className="flex-1">
              <div className="text-[13px] text-gray-700 font-medium">{item.text}</div>
              <span className="text-[11px] font-medium" style={{ color: item.color }}>{item.tool}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats — real data */}
      <div className="px-5 py-4 rounded-xl bg-white border border-[#E3E8EE] shadow-[0_2px_8px_rgba(0,0,0,0.06)] opacity-0 [animation:fadeInUp_0.5s_ease-out_0.6s_forwards]">
        <div className="text-[10px] font-semibold text-gray-500 tracking-wide mb-3.5 uppercase">
          Résumé rapide
        </div>
        {[
          { label: "Outils actifs", value: stats ? `${stats.tools}/2` : "—", color: "#22c55e" },
          ...(hasAccess("sentinel") ? [
            { label: "Score réputation", value: stats?.score || "—", color: "#ef4444" },
            { label: "Total avis", value: stats?.reviews ?? "—", color: "#ef4444" },
          ] : []),
          ...(hasAccess("vault") ? [
            { label: "Score conformité", value: stats?.conformiteScore != null ? `${stats.conformiteScore}%` : "—", color: "#06b6d4" },
            { label: "Traitements registre", value: stats?.registreCount ?? "—", color: "#06b6d4" },
          ] : []),
        ].map((stat, i) => (
          <div key={i} className={`flex justify-between items-center py-2 ${i < 3 ? "border-b border-[#E3E8EE]" : ""}`}>
            <span className="text-xs text-[#9ca3af]">{stat.label}</span>
            <span className="text-[13px] font-semibold" style={{ color: stat.color }}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Contact / Support */}
      {!contactOpen ? (
        <button onClick={() => setContactOpen(true)}
          className="flex items-center gap-2.5 px-5 py-3.5 rounded-xl w-full bg-[linear-gradient(135deg,rgba(99,102,241,0.1),rgba(129,140,248,0.05))] border border-[rgba(99,102,241,0.15)] cursor-pointer font-[inherit] text-left transition-all duration-300 opacity-0 [animation:fadeInUp_0.5s_ease-out_0.7s_forwards]">
          <span className="text-xl">💬</span>
          <div>
            <div className="text-[13px] text-[#635BFF] font-medium">Besoin d'aide ?</div>
            <div className="text-[11px] text-gray-500">Envoyez-nous un message</div>
          </div>
        </button>
      ) : (
        <div className="px-5 py-[18px] rounded-xl bg-white border border-[#E3E8EE] shadow-[0_2px_8px_rgba(0,0,0,0.06)] [animation:fadeInScale_0.3s_ease-out]">
          {contactSent ? (
            <div className="text-center py-5">
              <div className="text-[28px] mb-2">✅</div>
              <div className="text-sm text-green-500 font-medium">Message envoyé !</div>
              <div className="text-xs text-gray-500 mt-1">Nous vous répondrons sous 24h</div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-3.5">
                <span className="text-[13px] font-semibold text-[#0A2540]">Contactez-nous</span>
                <button onClick={() => setContactOpen(false)} className="bg-transparent border-none text-gray-500 cursor-pointer text-base font-[inherit]">✕</button>
              </div>
              <input value={contactForm.subject} onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))}
                placeholder="Sujet"
                className="w-full px-3 py-2.5 bg-white border border-[#E3E8EE] rounded-lg text-[#425466] text-[13px] font-[inherit] outline-none box-border mb-2.5 focus:border-indigo-500"
              />
              <textarea value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Votre message..."
                rows={4}
                className="w-full px-3 py-2.5 bg-white border border-[#E3E8EE] rounded-lg text-[#425466] text-[13px] font-[inherit] outline-none box-border mb-3 resize-y focus:border-indigo-500"
              />
              <button onClick={handleContact}
                className="w-full py-2.5 bg-[linear-gradient(135deg,#6366f1,#818CF8)] text-white border-none rounded-lg text-[13px] font-medium cursor-pointer font-[inherit]">
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
    <div className="relative">
      <style>{styleTag}</style>

      {/* Two-column layout: Tools + Interactive Panel */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

        {/* LEFT: Tools */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className={`mb-5 sm:mb-8 px-4 sm:px-8 py-5 sm:py-7 rounded-[14px] bg-[linear-gradient(135deg,rgba(99,102,241,0.08)_0%,rgba(129,140,248,0.04)_100%)] border border-[rgba(99,102,241,0.12)] relative overflow-hidden ${fadeInUpClass}`}>
            <div className="absolute -top-5 right-10 w-[120px] h-[120px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.15)_0%,transparent_70%)] [animation:orbFloat_6s_ease-in-out_infinite] pointer-events-none" />
            <h1 className="text-xl sm:text-[28px] font-semibold text-[#0A2540] mb-1.5 relative">
              <TypingText text={`Bonjour, ${user?.name?.split(" ")[0] || "Client"}`} speed={50} delay={300} />
            </h1>
            <p className="text-sm text-[#9ca3af] relative opacity-0 [animation:fadeInUp_0.6s_ease-out_1.2s_forwards]">
              Votre espace de gestion NERVÜR
            </p>
            {/* Live clock */}
            <LiveClock />
          </div>

          {/* Tool Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-4">
            {TOOLS.map((tool, index) => {
              const active = hasAccess(tool.id);
              const { Icon, color, gradient } = tool;
              const isHovered = hoveredCard === tool.id;
              return (
                <div key={tool.id}
                  onClick={() => active ? navigate(tool.path) : window.open("https://nervur.fr/contact", "_blank")}
                  onMouseEnter={() => setHoveredCard(tool.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="opacity-0 [animation:fadeInUp_0.5s_ease-out_forwards] pt-[27px] p-5 sm:p-6 rounded-[14px] bg-white cursor-pointer flex flex-col transition-all duration-300 relative overflow-hidden min-w-0"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    border: `1px solid ${isHovered && active ? `${color}50` : "#E3E8EE"}`,
                    opacity: active ? undefined : 0.45,
                    transform: isHovered && active ? "translateY(-4px)" : "translateY(0)",
                    boxShadow: isHovered && active ? `0 12px 40px ${color}20, 0 4px 16px rgba(0,0,0,0.08)` : "0 2px 12px rgba(0,0,0,0.08)",
                  }}>
                  {/* Top accent */}
                  <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[14px]" style={{ background: active ? gradient : "#E3E8EE" }} />
                  {isHovered && active && <div className="absolute inset-0 rounded-[14px] pointer-events-none [background-size:200%_100%] [animation:shimmer_2s_linear_infinite]" style={{ background: `linear-gradient(90deg, transparent, ${color}10, transparent)` }} />}

                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300"
                    style={{
                      background: gradient,
                      boxShadow: active ? `0 4px 12px ${color}30` : "none",
                      transform: isHovered && active ? "scale(1.08)" : "scale(1)",
                    }}>
                    <Icon color="#fff" size={24} />
                  </div>

                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3 className="text-base font-semibold m-0" style={{ color: active ? "#0A2540" : "#6B7C93" }}>{tool.name}</h3>
                    <span className="text-[10px] font-medium px-[7px] py-0.5 rounded"
                      style={{ color: active ? color : "#6B7C93", background: active ? `${color}15` : "#E3E8EE" }}>{tool.subtitle}</span>
                    {active && <span className="inline-flex items-center gap-[3px] text-[10px] text-green-500 font-medium">
                      <span className="w-[5px] h-[5px] rounded-full bg-green-500 [animation:statusPulse_2s_infinite] inline-block" />Actif
                    </span>}
                  </div>

                  <p className="text-[13px] text-[#9ca3af] m-0 mb-3.5 leading-relaxed">{tool.desc}</p>

                  {active && <div className="text-[11px] text-gray-500 mb-4 px-2.5 py-1.5 rounded-md bg-white border border-[#E3E8EE]">{tool.stats}</div>}

                  <div className="mt-auto">
                    {active ? (
                      <span onMouseEnter={() => setHoveredBtn(tool.id)} onMouseLeave={() => setHoveredBtn(null)}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-[13px] font-semibold transition-all duration-300"
                        style={{
                          background: hoveredBtn === tool.id ? `${color}30` : `${color}20`,
                          color,
                          border: `1px solid ${hoveredBtn === tool.id ? `${color}60` : `${color}40`}`,
                          boxShadow: hoveredBtn === tool.id ? `0 4px 12px ${color}25` : "none",
                        }}>
                        Ouvrir <span className="inline-block transition-transform duration-300" style={{ transform: hoveredBtn === tool.id ? "translateX(4px)" : "translateX(0)" }}>&rarr;</span>
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">Non souscrit</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tips */}
          <div className={`mt-6 px-5 py-4 rounded-xl bg-[rgba(99,102,241,0.06)] border border-[rgba(99,102,241,0.12)] ${fadeInUpClass}`} style={{ animationDelay: "0.5s" }}>
            <div className="text-[10px] font-semibold text-[#635BFF] tracking-[0.5px] uppercase mb-1.5">Conseil du jour</div>
            <p className="text-[13px] text-[#9ca3af] m-0 leading-relaxed">{TIPS[tipIndex]}</p>
          </div>
        </div>

        {/* RIGHT: Interactive Panel — hidden on mobile/tablet */}
        <div className="hidden lg:block">
          <RightPanel hasAccess={hasAccess} />
        </div>
      </div>
    </div>
  );
}
