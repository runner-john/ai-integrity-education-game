// 游戏内粒子特效系统
class GameParticles {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.particles = [];
        this.lotusParticles = [];
        this.floatingTexts = [];
        this.effects = [];
    }

    // 创建廉洁词粒子（青绿色向上绽放）
    emitCleanWordParticles(x, y) {
        const count = 35;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.4;
            const speed = 3 + Math.random() * 5;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 3,
                size: 2 + Math.random() * 3,
                color: Math.random() > 0.5 ? '#4ade80' : '#22d3ee',
                alpha: 1,
                life: 1,
                decay: 0.04 + Math.random() * 0.03,
                type: 'clean',
                glow: true,
                flicker: Math.random() * Math.PI * 2
            });
        }
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: -3 - Math.random() * 3,
                size: 3 + Math.random() * 3,
                color: '#10b981',
                alpha: 1,
                life: 1,
                decay: 0.04,
                type: 'petal',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3
            });
        }
    }

    // 创建稀有词粒子（金色向上飘升）
    emitRareWordParticles(x, y, text) {
        const count = 40;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = 4 + Math.random() * 6;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 4,
                size: 3 + Math.random() * 3,
                color: Math.random() > 0.5 ? '#fbbf24' : '#fcd34d',
                alpha: 1,
                life: 1,
                decay: 0.05 + Math.random() * 0.02,
                type: 'rare',
                glow: true,
                flicker: Math.random() * Math.PI * 2
            });
        }
        // 添加+分数文字（飘升数字）
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.floatingTexts.push({
                    x: x + (Math.random() - 0.5) * 20,
                    y: y,
                    text: '+30',
                    color: '#fbbf24',
                    alpha: 1,
                    vy: -3 - Math.random(),
                    life: 1,
                    decay: 0.035,
                    size: 18 + Math.random() * 6,
                    scale: 1.5
                });
            }, i * 50);
        }
        // 金色花瓣快速扩散
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: -4 - Math.random() * 2,
                size: 4 + Math.random() * 4,
                color: '#fbbf24',
                alpha: 1,
                life: 1,
                decay: 0.045,
                type: 'goldpetal',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.4
            });
        }
    }

    // 创建负面词粒子（暗红色下沉消散）
    emitNegativeWordParticles(x, y) {
        const count = 25;
        for (let i = 0; i < count; i++) {
            const angle = Math.PI / 2 + (Math.random() - 0.5) * 1.5;
            const speed = 2 + Math.random() * 4;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.abs(Math.sin(angle)) * speed + 2,
                size: 2 + Math.random() * 3,
                color: Math.random() > 0.5 ? '#dc2626' : '#991b1b',
                alpha: 0.9,
                life: 1,
                decay: 0.05 + Math.random() * 0.02,
                type: 'negative',
                shrink: 0.95
            });
        }
        // 增加向下拖尾效果
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 10,
                y: y,
                vx: (Math.random() - 0.5) * 2,
                vy: 3 + Math.random() * 3,
                size: 1 + Math.random() * 2,
                color: '#7f1d1d',
                alpha: 0.5,
                life: 1,
                decay: 0.08,
                type: 'negative_trail'
            });
        }
    }

    // 创建诱惑粒子（金色碎片炸裂 + 屏幕震动）
    emitTemptationParticles(x, y) {
        const count = 50;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 5 + Math.random() * 8;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 4,
                color: Math.random() > 0.3 ? '#fbbf24' : (Math.random() > 0.5 ? '#f59e0b' : '#fcd34d'),
                alpha: 1,
                life: 1,
                decay: 0.06 + Math.random() * 0.02,
                type: 'temptation',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.6,
                glow: true
            });
        }
        // 外圈爆炸粒子
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 / 20) * i;
            const speed = 8 + Math.random() * 4;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 1 + Math.random() * 2,
                color: '#ffffff',
                alpha: 1,
                life: 1,
                decay: 0.08,
                type: 'temptation_outer'
            });
        }
        // 触发强烈屏幕震动
        this.game.triggerScreenShake(12, 200);
    }

    // 创建莲花绽放动画
    emitLotusBloom(x, y, callback) {
        const petalCount = 12;
        const layerCount = 3;
        for (let layer = 0; layer < layerCount; layer++) {
            for (let i = 0; i < petalCount; i++) {
                const angle = (Math.PI * 2 / petalCount) * i + (layer * Math.PI / petalCount);
                const delay = layer * 100 + i * 20;
                setTimeout(() => {
                    this.lotusParticles.push({
                        x: x,
                        y: y,
                        targetX: x + Math.cos(angle) * (60 + layer * 20),
                        targetY: y + Math.sin(angle) * (60 + layer * 20),
                        progress: 0,
                        size: 15 + layer * 5,
                        color: layer === 0 ? '#4ade80' : (layer === 1 ? '#10b981' : '#059669'),
                        alpha: 1,
                        type: 'lotus_petal',
                        delay: 0
                    });
                }, delay);
            }
        }
        // 中心莲花
        setTimeout(() => {
            this.lotusParticles.push({
                x: x,
                y: y,
                size: 20,
                color: '#fbbf24',
                alpha: 0,
                type: 'lotus_center',
                progress: 0
            });
        }, 300);
        // 回调
        if (callback) {
            setTimeout(callback, 1500);
        }
    }

    // 创建通关莲花旋转聚合
    emitLotusConverge(x, y, callback) {
        const petalCount = 12;
        for (let i = 0; i < petalCount; i++) {
            const angle = (Math.PI * 2 / petalCount) * i;
            const startX = x + Math.cos(angle) * 200;
            const startY = y + Math.sin(angle) * 200;
            this.lotusParticles.push({
                x: startX,
                y: startY,
                targetX: x,
                targetY: y,
                progress: 0,
                size: 12,
                color: '#4ade80',
                alpha: 1,
                type: 'converge_petal',
                rotation: angle
            });
        }
        if (callback) {
            setTimeout(callback, 1200);
        }
    }

    // 创建失败莲花凋零
    emitLotusWither(x, y, callback) {
        const petalCount = 10;
        for (let i = 0; i < petalCount; i++) {
            const angle = (Math.PI * 2 / petalCount) * i;
            this.lotusParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * (0.5 + Math.random()),
                vy: 0.5 + Math.random(),
                size: 10 + Math.random() * 8,
                color: '#6b7280',
                alpha: 0.8,
                life: 1,
                decay: 0.008,
                type: 'wither_petal',
                rotation: angle,
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                gravity: 0.02
            });
        }
        if (callback) {
            setTimeout(callback, 2000);
        }
    }

    // 创建慎独技能传送特效
    emitTeleportEffect(snakeSegments, startX, endX, y) {
        // 青色光点从起点飞向终点
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            const delay = i * 25;
            setTimeout(() => {
                this.particles.push({
                    x: startX + (endX - startX) * (i / particleCount),
                    y: y + (Math.random() - 0.5) * 20,
                    vx: 0,
                    vy: 0,
                    size: 3 + Math.random() * 3,
                    color: '#4ade80',
                    alpha: 1,
                    life: 1,
                    decay: 0.05,
                    type: 'teleport',
                    targetX: endX,
                    progress: i / particleCount
                });
            }, delay);
        }
        // 莲花残影
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.particles.push({
                    x: startX + (endX - startX) * (i / 5),
                    y: y,
                    vx: 0,
                    vy: 0,
                    size: 15,
                    color: '#10b981',
                    alpha: 0.5,
                    life: 1,
                    decay: 0.03,
                    type: 'lotus_shadow'
                });
            }, i * 50);
        }
    }

    // 更新所有粒子
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            if (p.type === 'teleport') {
                p.progress += 0.15;
                p.x = p.x + (p.targetX - p.x) * 0.15;
                p.alpha *= 0.88;
            } else if (p.type === 'lotus_shadow') {
                p.alpha *= 0.92;
            } else if (p.type === 'petal' || p.type === 'goldpetal') {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.03;
                p.rotation += p.rotationSpeed;
                p.alpha *= (1 - p.decay);
                p.life -= p.decay;
            } else if (p.type === 'temptation') {
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.96;
                p.vy *= 0.96;
                p.rotation += p.rotationSpeed;
                p.alpha *= (1 - p.decay);
                p.life -= p.decay;
            } else if (p.type === 'temptation_outer') {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha *= (1 - p.decay);
                p.life -= p.decay;
            } else {
                p.x += p.vx;
                p.y += p.vy;
                if (p.gravity) p.vy += p.gravity;
                if (p.type === 'negative' || p.type === 'negative_trail') {
                    p.vy += 0.1;
                }
                if (p.shrink) p.size *= p.shrink;
                p.alpha *= (1 - p.decay);
                p.life -= p.decay;
            }
            
            if (p.alpha <= 0.01 || p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // 更新莲花粒子
        for (let i = this.lotusParticles.length - 1; i >= 0; i--) {
            const p = this.lotusParticles[i];
            
            if (p.type === 'lotus_petal' || p.type === 'converge_petal') {
                p.progress += 0.04;
                const ease = 1 - Math.pow(1 - p.progress, 3); // easeOutCubic
                p.x = p.x + (p.targetX - p.x) * 0.08;
                p.y = p.y + (p.targetY - p.y) * 0.08;
                if (p.progress > 0.8) {
                    p.alpha *= 0.9;
                }
            } else if (p.type === 'lotus_center') {
                p.progress += 0.03;
                p.alpha = Math.min(1, p.alpha + 0.05);
                p.size += 0.5;
            } else if (p.type === 'wither_petal') {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                p.rotation += p.rotationSpeed;
                p.alpha *= (1 - p.decay);
                p.life -= p.decay;
            }
            
            if ((p.type === 'lotus_petal' && p.progress >= 1) ||
                (p.type === 'lotus_center' && p.progress >= 1) ||
                (p.type === 'converge_petal' && p.progress >= 1) ||
                (p.life !== undefined && p.life <= 0)) {
                this.lotusParticles.splice(i, 1);
            }
        }

        // 更新浮动文字
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const t = this.floatingTexts[i];
            t.y += t.vy;
            t.alpha *= (1 - t.decay);
            t.life -= t.decay;
            if (t.alpha <= 0.01 || t.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    // 绘制所有粒子
    draw() {
        for (const p of this.particles) {
            this.ctx.save();
            let flickerAlpha = p.alpha;
            if (p.flicker !== undefined) {
                flickerAlpha = p.alpha * (0.6 + Math.sin(p.flicker + Date.now() * 0.015) * 0.4);
            }
            this.ctx.globalAlpha = flickerAlpha;
            
            if (p.type === 'petal' || p.type === 'goldpetal') {
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rotation);
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.fill();
            } else if (p.type === 'temptation') {
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rotation);
                if (p.glow) {
                    this.ctx.shadowColor = p.color;
                    this.ctx.shadowBlur = 8;
                }
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            } else if (p.type === 'temptation_outer') {
                this.ctx.shadowColor = p.color;
                this.ctx.shadowBlur = 15;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.fill();
            } else if (p.type === 'lotus_shadow') {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.fill();
            } else if (p.glow) {
                this.ctx.shadowColor = p.color;
                this.ctx.shadowBlur = 12;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.fill();
            } else {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.fill();
            }
            
            this.ctx.restore();
        }

        // 绘制莲花粒子
        for (const p of this.lotusParticles) {
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            
            if (p.type === 'lotus_petal' || p.type === 'converge_petal') {
                this.ctx.translate(p.x, p.y);
                if (p.rotation) this.ctx.rotate(p.rotation);
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.fill();
            } else if (p.type === 'lotus_center') {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.shadowColor = p.color;
                this.ctx.shadowBlur = 20;
                this.ctx.fill();
            } else if (p.type === 'wither_petal') {
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rotation);
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = p.alpha * 0.6;
                this.ctx.fill();
            }
            
            this.ctx.restore();
        }

        // 绘制浮动文字
        for (const t of this.floatingTexts) {
            this.ctx.save();
            this.ctx.globalAlpha = t.alpha;
            this.ctx.font = `bold ${t.size}px "Ma Shan Zheng", serif`;
            this.ctx.fillStyle = t.color;
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = t.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fillText(t.text, t.x, t.y);
            this.ctx.restore();
        }
    }

    // 是否还有活跃粒子
    hasActiveParticles() {
        return this.particles.length > 0 || 
               this.lotusParticles.length > 0 || 
               this.floatingTexts.length > 0;
    }

    // 清除所有粒子
    clear() {
        this.particles = [];
        this.lotusParticles = [];
        this.floatingTexts = [];
    }
}

// 红线呼吸效果类
class RedLineBreath {
    constructor(game) {
        this.game = game;
        this.brightness = 0.5;
        this.targetBrightness = 0.5;
        this.cycle = 0;
        this.pulseSpeed = 0.02;
    }

    update() {
        // 正常呼吸周期（2秒一个周期）
        this.cycle += this.pulseSpeed;
        const normalBreath = 0.5 + Math.sin(this.cycle) * 0.2;
        
        // 平滑过渡到目标亮度
        this.brightness += (this.targetBrightness - this.brightness) * 0.1;
        
        // 如果目标亮度接近正常值，逐渐恢复
        if (Math.abs(this.targetBrightness - normalBreath) < 0.1) {
            this.targetBrightness = normalBreath;
        }
    }

    // 触发越界反应
    triggerCrossEffect() {
        this.targetBrightness = 1.0; // 瞬间变亮
    }

    // 触发收缩效果
    triggerShrink() {
        this.targetBrightness = 0.8;
    }

    getBrightness() {
        return this.brightness;
    }
}
