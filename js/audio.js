class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.initialized = false;
        this.setupUserInteractionListener();
        console.log('AudioSystem initialized, waiting for user interaction...');
    }

    setupUserInteractionListener() {
        const initOnInteraction = () => {
            this.init();
            document.removeEventListener('click', initOnInteraction);
            document.removeEventListener('keydown', initOnInteraction);
            document.removeEventListener('touchstart', initOnInteraction);
        };
        document.addEventListener('click', initOnInteraction, { once: true });
        document.addEventListener('keydown', initOnInteraction, { once: true });
        document.addEventListener('touchstart', initOnInteraction, { once: true });
    }

    init() {
        if (this.initialized) return;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('Audio system initialized');
        } catch (e) {
            console.log('Web Audio API not supported:', e);
        }
    }

    ensureInitialized() {
        if (!this.audioContext) {
            this.init();
            return;
        }
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(() => {});
        }
        
        if (this.audioContext.state !== 'running') {
            this.audioContext.close().catch(() => {});
            this.audioContext = null;
            this.initialized = false;
            this.init();
        }
    }

    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled) return;
        
        // 确保AudioContext已初始化并处于运行状态
        this.ensureInitialized();
        
        if (!this.audioContext) {
            console.log('Audio context not available');
            return;
        }

        try {
            const ctx = this.audioContext;
            
            // 如果context已关闭，重新创建
            if (ctx.state === 'closed') {
                ctx = new (window.AudioContext || window.webkitAudioContext)();
                this.audioContext = ctx;
            }
            
            // 确保在运行状态
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            gainNode.gain.setValueAtTime(volume, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration);
        } catch (e) {
            console.log('Audio play error:', e);
        }
    }

    playEat() {
        this.ensureInitialized();
        this.playTone(523, 0.1, 'sine', 0.2);
        setTimeout(() => this.playTone(659, 0.1, 'sine', 0.15), 50);
    }

    playEatClean() {
        this.ensureInitialized();
        this.playTone(392, 0.15, 'sine', 0.25);
        setTimeout(() => this.playTone(523, 0.15, 'sine', 0.2), 100);
        setTimeout(() => this.playTone(659, 0.15, 'sine', 0.15), 200);
    }

    playEatNegative() {
        this.ensureInitialized();
        this.playTone(200, 0.2, 'sawtooth', 0.2);
        setTimeout(() => this.playTone(150, 0.3, 'sawtooth', 0.15), 100);
    }

    playCrossBoundary() {
        this.ensureInitialized();
        this.playTone(300, 0.15, 'square', 0.2);
        setTimeout(() => this.playTone(250, 0.15, 'square', 0.15), 100);
        setTimeout(() => this.playTone(200, 0.3, 'square', 0.1), 200);
    }

    playWin() {
        this.ensureInitialized();
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.3, 'sine', 0.2), i * 150);
        });
    }

    playLose() {
        this.ensureInitialized();
        this.playTone(400, 0.2, 'sine', 0.2);
        setTimeout(() => this.playTone(300, 0.3, 'sine', 0.15), 200);
        setTimeout(() => this.playTone(200, 0.5, 'sine', 0.1), 400);
    }

    playClick() {
        this.ensureInitialized();
        this.playTone(800, 0.05, 'sine', 0.1);
    }

    playRareWord() {
        this.ensureInitialized();
        this.playTone(523, 0.1, 'sine', 0.3);
        setTimeout(() => this.playTone(659, 0.15, 'sine', 0.25), 80);
        setTimeout(() => this.playTone(784, 0.2, 'sine', 0.2), 160);
        setTimeout(() => this.playTone(880, 0.25, 'sine', 0.15), 240);
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

const gameAudio = new AudioSystem();