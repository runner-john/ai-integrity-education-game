const MemoryGame = {
    currentCards: [],
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 4,
    moves: 0,
    gameStarted: false,
    difficulty: 'easy',
    previewPhase: true,
    previewTimer: null,
    timeLeft: 90,
    timerInterval: null,
    hoverTimes: {},
    flipOrder: [],
    behaviorData: {
        moves: 0,
        timeUsed: 0,
        accuracy: 0,
        hoverTimes: {},
        flipOrder: []
    },

    init() {
        this.setupEventListeners();
    },

    setupEventListeners() {
        const memoryGameBtn = document.getElementById('memoryGameBtn');
        if (memoryGameBtn) {
            memoryGameBtn.addEventListener('click', () => this.showDifficultySelect());
        }
    },

    showDifficultySelect() {
        const overlay = document.createElement('div');
        overlay.className = 'minigame-overlay';
        overlay.innerHTML = `
            <div class="minigame-content glass">
                <div class="minigame-header">
                    <h2>🪷 廉腐配对记忆游戏</h2>
                    <button class="close-btn" id="closeMemoryDifficulty">×</button>
                </div>
                <div class="minigame-instructions">
                    <p>选择游戏难度，难度越高配对越多，时间越紧张！</p>
                </div>
                <div class="difficulty-selector">
                    <button class="difficulty-btn easy" onclick="MemoryGame.startGameWithDifficulty('easy')">
                        <div class="difficulty-icon">🌱</div>
                        <div class="difficulty-name">初级</div>
                        <div class="difficulty-info">4对卡片 · 8秒预览 · 90秒限时</div>
                    </button>
                    <button class="difficulty-btn medium" onclick="MemoryGame.startGameWithDifficulty('medium')">
                        <div class="difficulty-icon">🌿</div>
                        <div class="difficulty-name">中级</div>
                        <div class="difficulty-info">6对卡片 · 5秒预览 · 120秒限时</div>
                    </button>
                    <button class="difficulty-btn hard" onclick="MemoryGame.startGameWithDifficulty('hard')">
                        <div class="difficulty-icon">🌳</div>
                        <div class="difficulty-name">高级</div>
                        <div class="difficulty-info">8对卡片 · 3秒预览 · 150秒限时</div>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('closeMemoryDifficulty').addEventListener('click', () => {
            overlay.remove();
        });
    },

    async startGameWithDifficulty(difficulty) {
        const dailyCount = apiProxy.getTodayMemoryGameCount();
        if (dailyCount >= 10) {
            alert('今日游戏次数已达上限（10次），请明天再来！');
            return;
        }

        this.difficulty = difficulty;
        this.behaviorData = { moves: 0, timeUsed: 0, accuracy: 0, hoverTimes: {}, flipOrder: [] };
        this.hoverTimes = {};
        this.flipOrder = [];

        document.querySelector('.minigame-overlay').remove();

        const overlay = document.createElement('div');
        overlay.className = 'minigame-overlay';
        overlay.innerHTML = `
            <div class="minigame-content glass">
                <div class="minigame-header">
                    <h2>🪷 廉腐配对记忆游戏</h2>
                    <button class="close-btn" id="closeMemoryGame">×</button>
                </div>
                <div class="memory-game-stats">
                    <span>步数: <strong id="memoryMoves">0</strong></span>
                    <span>已配对: <strong id="memoryPairs">0</strong>/<span id="memoryTotalPairs">4</span></span>
                    <span>时间: <strong id="memoryTime">90</strong>s</span>
                    <span>连击: <strong id="memoryCombo">0</strong></span>
                </div>
                <div class="memory-game-info" id="memoryGameInfo">
                    <p class="preview-message">🎯 记住卡片位置，即将开始！</p>
                </div>
                <div class="memory-game-grid" id="memoryGameGrid"></div>
                <div class="minigame-controls">
                    <button class="btn btn-primary" id="restartMemoryBtn">重新开始</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('closeMemoryGame').addEventListener('click', () => {
            this.stopTimer();
            overlay.remove();
        });

        document.getElementById('restartMemoryBtn').addEventListener('click', () => {
            this.stopTimer();
            this.startGameWithDifficulty(this.difficulty);
        });

        await this.loadPairs();
    },

    async loadPairs() {
        try {
            const result = await apiProxy.callAPI(
                `生成${this.difficulty}难度的廉洁词汇与负面词汇配对组合，要求生成有效的反义词配对`,
                { difficulty: this.difficulty }
            );

            if (result.success) {
                const data = JSON.parse(result.data);
                this.totalPairs = data.config.pairs;
                this.timeLeft = data.config.timeLimit;
                
                document.getElementById('memoryTotalPairs').textContent = this.totalPairs;
                document.getElementById('memoryTime').textContent = this.timeLeft;

                this.createCards(data.pairs);
                this.startPreview(data.config.previewTime);
            } else {
                console.error('API调用失败:', result);
                this.loadFallbackPairs();
            }
        } catch (error) {
            console.error('加载配对失败:', error);
            this.loadFallbackPairs();
        }
    },

    loadFallbackPairs() {
        const config = apiProxy.difficultyConfig[this.difficulty];
        const cleanWords = ['正直', '自律', '奉公', '清廉', '慎独', '明德', '守正', '克己'];
        const corruptWords = ['贪婪', '腐败', '贿赂', '私欲', '侥幸', '徇私', '枉法', '贪腐'];
        
        const pairs = [];
        for (let i = 0; i < config.pairs; i++) {
            pairs.push({
                clean: cleanWords[i % cleanWords.length],
                corrupt: corruptWords[i % corruptWords.length],
                id: i + 1
            });
        }

        this.totalPairs = config.pairs;
        this.timeLeft = config.timeLimit;
        
        document.getElementById('memoryTotalPairs').textContent = this.totalPairs;
        document.getElementById('memoryTime').textContent = this.timeLeft;

        this.createCards(pairs);
        this.startPreview(config.previewTime);
    },

    createCards(pairs) {
        this.currentCards = [];
        
        pairs.forEach((pair, index) => {
            this.currentCards.push({
                id: `clean-${index}`,
                word: pair.clean,
                type: 'clean',
                pairId: index,
                isFlipped: false,
                isMatched: false
            });
            this.currentCards.push({
                id: `corrupt-${index}`,
                word: pair.corrupt,
                type: 'corrupt',
                pairId: index,
                isFlipped: false,
                isMatched: false
            });
        });

        this.currentCards.sort(() => Math.random() - 0.5);
        this.renderGrid();
    },

    renderGrid() {
        const grid = document.getElementById('memoryGameGrid');
        grid.innerHTML = '';
        
        const gridCols = Math.ceil(Math.sqrt(this.currentCards.length));
        grid.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;

        this.currentCards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = `memory-card ${card.type} ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`;
            cardElement.dataset.index = index;
            
            cardElement.innerHTML = `
                <div class="card-inner">
                    <div class="card-back">
                        <span class="card-icon">?</span>
                    </div>
                    <div class="card-front">
                        <span class="card-word">${card.word}</span>
                    </div>
                </div>
            `;

            cardElement.addEventListener('mouseenter', () => {
                if (!this.previewPhase && !card.isFlipped && !card.isMatched) {
                    const now = Date.now();
                    this.hoverTimes[card.id] = (this.hoverTimes[card.id] || 0) + now;
                }
            });

            cardElement.addEventListener('mouseleave', () => {
                if (!this.previewPhase && this.hoverTimes[card.id]) {
                    const duration = Date.now() - this.hoverTimes[card.id];
                    this.behaviorData.hoverTimes[card.id] = (this.behaviorData.hoverTimes[card.id] || 0) + duration;
                }
            });

            cardElement.addEventListener('click', () => {
                if (this.previewPhase || card.isFlipped || card.isMatched) return;
                this.flipCard(index);
            });

            grid.appendChild(cardElement);
        });
    },

    startPreview(previewTime) {
        this.previewPhase = true;
        
        this.currentCards.forEach((card, index) => {
            card.isFlipped = true;
        });
        
        const cards = document.querySelectorAll('.memory-card');
        cards.forEach(card => card.classList.add('flipped'));

        document.getElementById('memoryGameInfo').innerHTML = `<p class="preview-message">⏱️ 记忆时间：${previewTime / 1000}秒</p>`;

        this.previewTimer = setTimeout(() => {
            this.previewPhase = false;
            
            this.currentCards.forEach((card, index) => {
                card.isFlipped = false;
            });
            
            const cards = document.querySelectorAll('.memory-card');
            cards.forEach(card => card.classList.remove('flipped'));

            document.getElementById('memoryGameInfo').innerHTML = '<p>开始配对！点击两张卡片进行配对</p>';
            this.startTimer();
            this.gameStarted = true;
        }, previewTime);
    },

    flipCard(index) {
        if (this.flippedCards.length >= 2) return;

        const card = this.currentCards[index];
        card.isFlipped = true;
        
        const cardElement = document.querySelector(`[data-index="${index}"]`);
        cardElement.classList.add('flipped');

        this.flipOrder.push({ word: card.word, time: Date.now() });
        this.behaviorData.flipOrder.push(card.word);

        this.flippedCards.push({ card, index });

        if (this.flippedCards.length === 2) {
            this.moves++;
            this.behaviorData.moves++;
            document.getElementById('memoryMoves').textContent = this.moves;
            this.checkMatch();
        }
    },

    async checkMatch() {
        const [card1, card2] = this.flippedCards;
        
        if (card1.card.pairId === card2.card.pairId && card1.card.type !== card2.card.type) {
            await this.validateAndMatch(card1, card2);
        } else {
            await this.handleMismatch(card1, card2);
        }
    },

    async validateAndMatch(card1, card2) {
        const result = await apiProxy.callAPI(
            `验证词汇配对："${card1.card.word}"与"${card2.card.word}"是否为反义词关系，请给出语义分析`,
            { data: { word1: card1.card.word, word2: card2.card.word } }
        );

        if (result.success) {
            const validation = JSON.parse(result.data);
            
            card1.card.isMatched = true;
            card2.card.isMatched = true;
            
            const cardElement1 = document.querySelector(`[data-index="${card1.index}"]`);
            const cardElement2 = document.querySelector(`[data-index="${card2.index}"]`);
            
            cardElement1.classList.add('matched');
            cardElement2.classList.add('matched');

            this.matchedPairs++;
            document.getElementById('memoryPairs').textContent = this.matchedPairs;

            const combo = this.matchedPairs;
            document.getElementById('memoryCombo').textContent = combo;

            if (this.matchedPairs === this.totalPairs) {
                this.gameWon();
            }
        }

        this.flippedCards = [];
    },

    async handleMismatch(card1, card2) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        card1.card.isFlipped = false;
        card2.card.isFlipped = false;

        const cardElement1 = document.querySelector(`[data-index="${card1.index}"]`);
        const cardElement2 = document.querySelector(`[data-index="${card2.index}"]`);

        cardElement1.classList.remove('flipped');
        cardElement2.classList.remove('flipped');

        document.getElementById('memoryCombo').textContent = 0;

        this.flippedCards = [];
    },

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            document.getElementById('memoryTime').textContent = this.timeLeft;
            this.behaviorData.timeUsed++;

            if (this.timeLeft <= 0) {
                this.gameLost();
            }
        }, 1000);
    },

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        if (this.previewTimer) {
            clearTimeout(this.previewTimer);
            this.previewTimer = null;
        }
    },

    gameWon() {
        this.stopTimer();
        
        const accuracy = this.matchedPairs / this.totalPairs;
        this.behaviorData.accuracy = accuracy;
        
        const config = apiProxy.difficultyConfig[this.difficulty];
        const baseScore = this.matchedPairs * 20;
        const timeRatio = config.timeLimit / (config.timeLimit - this.timeLeft);
        const speedCoeff = Math.min(1.5, 0.8 + timeRatio * 0.2);
        const accuracyCoeff = accuracy >= 0.5 ? (0.8 + accuracy * 0.4) : (0.5 + accuracy);
        const comboBonus = Math.min(20, this.matchedPairs * 5);
        
        const finalScore = Math.round(baseScore * config.multiplier * speedCoeff * accuracyCoeff + comboBonus);

        apiProxy.saveMemoryGameRecord({
            difficulty: this.difficulty,
            score: finalScore,
            moves: this.moves,
            accuracy: accuracy,
            timeUsed: config.timeLimit - this.timeLeft,
            behaviorData: this.behaviorData
        });

        this.showResult(true, finalScore, accuracy);
    },

    gameLost() {
        this.stopTimer();
        
        const accuracy = this.matchedPairs / this.totalPairs;
        this.behaviorData.accuracy = accuracy;

        apiProxy.saveMemoryGameRecord({
            difficulty: this.difficulty,
            score: 0,
            moves: this.moves,
            accuracy: accuracy,
            timeUsed: apiProxy.difficultyConfig[this.difficulty].timeLimit,
            behaviorData: this.behaviorData,
            completed: false
        });

        this.showResult(false, 0, accuracy);
    },

    async showResult(won, score, accuracy) {
        const result = await apiProxy.callAPI(
            `分析记忆游戏行为数据并生成评语：步数${this.moves}，准确率${accuracy}，用时${apiProxy.difficultyConfig[this.difficulty].timeLimit - this.timeLeft}秒`,
            { data: this.behaviorData }
        );

        let analysis = '';
        if (result.success) {
            try {
                const data = JSON.parse(result.data);
                analysis = `<p>${data.analysis}</p><p><strong>建议：</strong>${data.suggestions.join('；')}</p>`;
            } catch {
                analysis = `<p>${result.data}</p>`;
            }
        }

        const overlay = document.querySelector('.minigame-overlay');
        overlay.innerHTML = `
            <div class="minigame-content glass">
                <div class="minigame-header">
                    <h2>${won ? '🎉 恭喜通关！' : '⏰ 时间到！'}</h2>
                    <button class="close-btn" id="closeMemoryResult">×</button>
                </div>
                <div class="game-result">
                    <div class="result-score">
                        <div class="score-value">${score}</div>
                        <div class="score-label">得分</div>
                    </div>
                    <div class="result-stats">
                        <div class="stat-item">
                            <span class="stat-value">${this.moves}</span>
                            <span class="stat-label">步数</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${(accuracy * 100).toFixed(0)}%</span>
                            <span class="stat-label">准确率</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${apiProxy.difficultyConfig[this.difficulty].multiplier}×</span>
                            <span class="stat-label">难度倍率</span>
                        </div>
                    </div>
                    <div class="result-analysis">${analysis}</div>
                    <div class="result-actions">
                        <button class="btn btn-primary" onclick="MemoryGame.startGameWithDifficulty('${this.difficulty}')">再来一局</button>
                        <button class="btn btn-secondary" onclick="document.querySelector('.minigame-overlay').remove()">返回</button>
                        <button class="btn btn-info" onclick="assessmentVisualizer.showPlayerReportModal()">查看评估报告</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('closeMemoryResult').addEventListener('click', () => {
            overlay.remove();
        });
    }
};

// 确保MemoryGame成为全局变量
window.MemoryGame = MemoryGame;