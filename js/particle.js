class ParallaxEffect {
    constructor() {
        this.sections = document.querySelectorAll('.parallax-section');
        this.heroCanvas = document.getElementById('particleCanvas');
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.handleScroll());
        this.handleScroll();
    }

    handleScroll() {
        const scrollY = window.scrollY;

        this.sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + scrollY;
            const relativeScroll = scrollY - sectionTop;

            const bg = section.querySelector('.parallax-bg');
            if (bg) {
                const speed = 0.3;
                bg.style.transform = `translateY(${relativeScroll * speed}px)`;
            }

            const content = section.querySelector('.parallax-content');
            if (content) {
                const contentSpeed = 0.1;
                content.style.transform = `translateY(${relativeScroll * contentSpeed}px)`;
                content.style.opacity = Math.max(0, Math.min(1, 1 - (rect.top / 400)));
            }
        });

        if (this.heroCanvas) {
            const heroSection = document.querySelector('.hero');
            if (heroSection) {
                const heroRect = heroSection.getBoundingClientRect();
                const heroOpacity = Math.max(0, Math.min(1, 1 - (heroRect.bottom / 600)));
                this.heroCanvas.style.opacity = heroOpacity * 0.6;
            }
        }
    }
}

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 50;
        this.mouseX = 0;
        this.mouseY = 0;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });

        this.init();
        this.animate();
    }

    resize() {
        const hero = document.querySelector('.hero');
        if (hero) {
            this.canvas.width = hero.offsetWidth;
            this.canvas.height = hero.offsetHeight;
        }
    }

    init() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            baseX: 0,
            baseY: 0,
            size: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.2 - 0.15,
            opacity: Math.random() * 0.4 + 0.2,
            hue: 150 + Math.random() * 20
        };
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((p, index) => {
            p.baseX += p.speedX;
            p.baseY += p.speedY;

            if (p.baseX < 0) p.baseX = this.canvas.width;
            if (p.baseX > this.canvas.width) p.baseX = 0;
            if (p.baseY < 0) p.baseY = this.canvas.height;
            if (p.baseY > this.canvas.height) {
                this.particles[index] = this.createParticle();
                this.particles[index].baseY = 0;
            }

            const dx = this.mouseX - p.x;
            const dy = this.mouseY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 100) {
                p.x = p.baseX + (dx / dist) * (100 - dist) * 0.05;
                p.y = p.baseY + (dy / dist) * (100 - dist) * 0.05;
            } else {
                p.x += (p.baseX - p.x) * 0.05;
                p.y += (p.baseY - p.y) * 0.05;
            }

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${p.hue}, 50%, 55%, ${p.opacity})`;
            this.ctx.fill();
        });

        this.drawConnections();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(45, 138, 110, ${0.12 * (1 - distance / 100)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ParallaxEffect();
    new ParticleSystem('particleCanvas');
});