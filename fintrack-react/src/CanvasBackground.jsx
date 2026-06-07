import { useEffect, useRef } from "react";

/* ── Composant Canvas Particules (adapté du portfolio) ── */
export default function CanvasBackground({
  opacity = 0.12,
  colorA = "99,102,241",
  colorB = "59,130,246",
  className = "",
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H, particles = [];
    let mouseX = 0, mouseY = 0;
    let animId;

    const color1 = colorA;
    const color2 = colorB;

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
        this.r = Math.random() * 1.8 + 0.6;
        this.a = Math.random() * 0.45 + 0.15;
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
        ctx.fillStyle = `rgba(${this.c},${this.a * opacity})`;
        ctx.fill();
      }
    }

    function init() {
      resize();
      particles = [];
      for (let i = 0; i < 170; i++) particles.push(new Particle());
      mouseX = W / 2;
      mouseY = H / 2;
    }

    function drawConnections() {
      ctx.lineWidth = 0.8;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 140) {
            ctx.strokeStyle = `rgba(${color1},${0.18 * (1 - d / 140) * opacity})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
        const dx = particles[i].x - mouseX;
        const dy = particles[i].y - mouseY;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 220) {
          ctx.strokeStyle = `rgba(${color1},${0.3 * (1 - d / 220) * opacity})`;
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
  }, [opacity, colorA, colorB]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
