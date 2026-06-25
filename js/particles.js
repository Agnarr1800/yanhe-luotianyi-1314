/**
 * particles.js — Canvas 粒子系统
 * 星星 + 音符浮动，营造梦幻夜空氛围
 */
export default class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouseX = -1000;
    this.mouseY = -1000;
    this.animId = null;
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => { this.mouseX = e.clientX; this.mouseY = e.clientY; });
    this.createParticles();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    const count = Math.min(80, Math.floor(window.innerWidth / 12));
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 3 + 1,
        speedY: -(Math.random() * 0.3 + 0.1),
        speedX: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.6 + 0.2,
        type: Math.random() > 0.6 ? 'note' : 'star',
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
      });
    }
  }

  animate() {
    const { ctx, canvas, particles } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      p.twinkle += p.twinkleSpeed;
      const currentOpacity = p.opacity * (0.6 + 0.4 * Math.sin(p.twinkle));
      ctx.globalAlpha = currentOpacity;

      p.x += p.speedX;
      p.y += p.speedY;

      // 循环
      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;

      if (p.type === 'note') {
        this.drawNote(p.x, p.y, p.size * 2, ctx);
      } else {
        this.drawStar(p.x, p.y, p.size, ctx);
      }
    }

    ctx.globalAlpha = 1;
    this.animId = requestAnimationFrame(() => this.animate());
  }

  drawStar(x, y, size, ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    // 发光
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = size * 3;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  drawNote(x, y, size, ctx) {
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 6;
    // 简化音符：圆 + 竖线 + 旗
    const s = size / 2;
    ctx.beginPath();
    ctx.arc(x, y - s, s * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - 0.5, y - s, 1.5, s * 2);
    ctx.beginPath();
    ctx.ellipse(x + s * 0.3, y + s * 0.3, s * 0.5, s * 0.25, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}
