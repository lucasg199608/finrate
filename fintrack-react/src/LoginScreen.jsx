import { useState, useEffect, useRef } from "react";
import { login, register } from "./auth.js";

/* ── Animations CSS ── */
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes bulbGlow {
    0%, 100% {
      box-shadow: 0 4px 20px rgba(99,102,241,0.35);
    }
    50% {
      box-shadow: 0 4px 25px rgba(99,102,241,0.5);
    }
  }
`;
if (typeof document !== "undefined") {
  document.head.appendChild(styleSheet);
}

/* ── Canvas Particules (style portfolio) ── */
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H, particles = [];
    let mouseX = 0, mouseY = 0;
    let animId;

    const color1 = "0,255,163";   // vert néon portfolio
    const color2 = "123,110,255"; // violet portfolio

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.r = Math.random() * 1.5 + 0.5;
        this.a = Math.random() * 0.4 + 0.1;
        this.c = Math.random() < 0.5 ? color1 : color2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.c},${this.a})`;
        ctx.fill();
      }
    }

    function init() {
      resize();
      particles = [];
      for (let i = 0; i < 120; i++) particles.push(new Particle());
      mouseX = W / 2;
      mouseY = H / 2;
    }

    function drawConnections() {
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.strokeStyle = `rgba(${color1},${0.08 * (1 - d / 120)})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
        const dx = particles[i].x - mouseX;
        const dy = particles[i].y - mouseY;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 180) {
          ctx.strokeStyle = `rgba(${color1},${0.18 * (1 - d / 180)})`;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouseX, mouseY);
          ctx.stroke();
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, W, H);
      drawConnections();
      particles.forEach(p => { p.update(); p.draw(); });
      animId = requestAnimationFrame(animate);
    }

    const onResize = () => resize();
    const onMouseMove = (e) => { mouseX = e.clientX; mouseY = e.clientY; };

    window.addEventListener("resize", onResize);
    document.addEventListener("mousemove", onMouseMove);

    init();
    animate();

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

const C = {
  sidebar: "#0B1829",
  sidebarText: "#7A95AF",
  bg: "#EEF2F8",
  card: "#FFFFFF",
  border: "#E4E9F2",
  text: "#1A2637",
  muted: "#64748B",
  faint: "#F4F7FB",
  indigo: "#6366F1",
  blue: "#3B82F6",
  green: "#10B981",
  red: "#EF4444",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 10,
  fontSize: 14,
  color: "#fff",
  background: "rgba(255,255,255,0.05)",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 800,
  color: "rgba(255,255,255,0.5)",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
};

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    const res = mode === "login"
      ? login(email.trim(), password.trim())
      : register(email.trim(), password.trim());
    setLoading(false);
    if (res.success) {
      onLogin();
    } else {
      setError(res.error);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050508",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <ParticleCanvas />
      <div
        style={{
          width: 420,
          maxWidth: "90vw",
          background: "rgba(255,255,255,0.06)",
          borderRadius: 20,
          padding: "40px 36px",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05) inset",
          backdropFilter: "blur(28px) saturate(1.2)",
          WebkitBackdropFilter: "blur(28px) saturate(1.2)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Glow subtil en haut de la card */}
        <div style={{
          position: "absolute",
          top: 0, left: "10%", right: "10%",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
          borderRadius: "20px 20px 0 0",
        }} />
        {/* Logo / Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${C.indigo}, ${C.blue})`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              boxShadow: `0 8px 24px ${C.indigo}40`,
            }}
          >
            <span style={{ color: "#fff", fontSize: 22, fontWeight: 900 }}>FT</span>
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.5px",
              marginBottom: 4,
            }}
          >
            FinTrack
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: 0 }}>
            {mode === "login"
              ? "Connectez-vous à votre espace personnel"
              : "Créez votre compte FinTrack"}
          </p>
        </div>

        {/* Onglets */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 24,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 10,
            padding: 4,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {["login", "register"].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError("");
              }}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 8,
                border: "none",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                background: mode === m ? "rgba(255,255,255,0.12)" : "transparent",
                color: mode === m ? "#A5B4FC" : "rgba(255,255,255,0.45)",
                boxShadow:
                  mode === m ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              {m === "login" ? "Connexion" : "Créer un compte"}
            </button>
          ))}
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              style={inputStyle}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Mot de passe</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {showPassword ? "Cacher" : "Voir"}
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                background: "#FEF2F2",
                border: `1px solid ${C.red}30`,
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 12,
                color: C.red,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: 10,
              background: "linear-gradient(135deg, #6366F1 0%, #818CF8 100%)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 800,
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
              animation: "fadeInUp 0.6s ease-out, bulbGlow 3s ease-in-out infinite",
              animationDelay: "0s, 0.6s",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(99,102,241,0.6)";
                e.currentTarget.style.animation = "none";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,102,241,0.35)";
              e.currentTarget.style.animation = "bulbGlow 3s ease-in-out infinite";
            }}
          >
            {loading
              ? "Chargement…"
              : mode === "login"
                ? "Se connecter"
                : "Créer mon compte"}
          </button>
        </form>

        {/* Pied */}
        <p
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "rgba(255,255,255,0.4)",
            marginTop: 20,
          }}
        >
          {mode === "login"
            ? "Pas encore de compte ? Cliquez sur Créer un compte ci-dessus."
            : "Déjà un compte ? Cliquez sur Connexion ci-dessus."}
        </p>
      </div>
    </div>
  );
}
