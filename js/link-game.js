const LinkGame = {
    grid: [],
    gridSize: 4,
    selectedTile: null,
    score: 0,
    moves: 0,
    gameStarted: false,
    difficulty: 'easy',
    timeLeft: 60,
    timerInterval: null,
    combo: 0,
    errorCount: 0,
    behaviorData: {
        moves: 0,
        timeUsed: 0,
        accuracy: 0,
        errorCount: 0,
        antonymPairs: 0,
        synonymPairs: 0,
        interferenceClicks: 0,
        averageReactionTime: 0,
        hesitationCount: 0,
        reactionTimes: []
    },
    lastClickTime: 0,
    semanticCache: {},

    init() {
        this.setupEventListeners();
    },

    setupEventListeners() {
        const linkGameBtn = document.getElementById('linkGameBtn');
        if (linkGameBtn) {
            linkGameBtn.addEventListener('click', () => this.showDifficultySelect());
        }
    },

    showDifficultySelect() {
        const overlay = document.createElement('div');
        overlay.className = 'minigame-overlay';
        overlay.innerHTML = `
            <div class="minigame-content glass">
                <div class="minigame-header">
                    <h2>🔗 AI语义连连看</h2>
                    <button class="close-btn" id="closeLinkDifficulty">×</button>
                </div>
                <div class="minigame-instructions">
                    <p>🌱 连接语义关联的词汇进行消除，AI实时判定！</p>
                </div>
                <div class="difficulty-selector">
                    <button class="difficulty-btn easy" onclick="LinkGame.startGameWithDifficulty('easy')">
                        <div class="difficulty-icon">🌱</div>
                        <div class="difficulty-name">初级·辨析</div>
                        <div class="difficulty-info">4×4 · 8词 · 90秒</div>
                        <div class="difficulty-rules">仅同类型配对</div>
                    </button>
                    <button class="difficulty-btn medium" onclick="LinkGame.startGameWithDifficulty('medium')">
                        <div class="difficulty-icon">🌿</div>
                        <div class="difficulty-name">中级·关联</div>
                        <div class="difficulty-info">5×5 · 16词 · 120秒</div>
                        <div class="difficulty-rules">同类型+反义配对</div>
                    </button>
                    <button class="difficulty-btn hard" onclick="LinkGame.startGameWithDifficulty('hard')">
                        <div class="difficulty-icon">🌳</div>
                        <div class="difficulty-name">高级·思辨</div>
                        <div class="difficulty-info">6×6 · 24词 · 150秒</div>
                        <div class="difficulty-rules">含中性干扰词</div>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('closeLinkDifficulty').addEventListener('click', () => {
            overlay.remove();
        });
    },

    async startGameWithDifficulty(difficulty) {
        const dailyCount = apiProxy.getTodayLinkGameCount();
        if (dailyCount >= 10) {
            alert('今日游戏次数已达上限（10次），请明天再来！');
            return;
        }

        this.difficulty = difficulty;
        this.behaviorData = { 
            moves: 0, 
            timeUsed: 0, 
            accuracy: 0, 
            errorCount: 0,
            antonymPairs: 0,
            synonymPairs: 0,
            interferenceClicks: 0,
            averageReactionTime: 0,
            hesitationCount: 0,
            reactionTimes: []
        };
        this.combo = 0;
        this.errorCount = 0;
        this.semanticCache = {};
        this.lastClickTime = 0;

        document.querySelector('.minigame-overlay')?.remove();

        const config = this.getDifficultyConfig(difficulty);
        
        const overlay = document.createElement('div');
        overlay.className = 'minigame-overlay';
        overlay.innerHTML = `
            <div class="minigame-content glass link-game-content">
                <div class="minigame-header">
                    <h2>🔗 AI语义连连看</h2>
                    <button class="close-btn" id="closeLinkGame">×</button>
                </div>
                <div class="link-game-stats">
                    <span>得分: <strong id="linkScore">0</strong></span>
                    <span>步数: <strong id="linkMoves">0</strong></span>
                    <span>时间: <strong id="linkTime">${config.timeLimit}</strong>s</span>
                    <span>连击: <strong id="linkCombo">0</strong></span>
                    <span class="combo-effect" id="comboEffect"></span>
                </div>
                <div class="link-game-grid" id="linkGameGrid"></div>
                <div class="link-game-hint" id="linkGameHint">点击两个语义相关的词汇进行消除</div>
                <div class="minigame-controls">
                    <button class="btn btn-primary" id="restartLinkBtn">重新开始</button>
                    <button class="btn btn-secondary" id="hintLinkBtn">💡 提示</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('closeLinkGame').addEventListener('click', () => {
            this.stopTimer();
            overlay.remove();
        });

        document.getElementById('restartLinkBtn').addEventListener('click', () => {
            this.stopTimer();
            this.startGameWithDifficulty(this.difficulty);
        });

        document.getElementById('hintLinkBtn').addEventListener('click', () => {
            this.showHint();
        });

        await this.loadLayout();
    },

    getDifficultyConfig(difficulty) {
        const configs = {
            easy: { gridSize: 4, wordCount: 8, timeLimit: 90, multiplier: 1.0, allowAntonym: false, hasInterference: false },
            medium: { gridSize: 5, wordCount: 16, timeLimit: 120, multiplier: 1.5, allowAntonym: true, hasInterference: false },
            hard: { gridSize: 6, wordCount: 24, timeLimit: 150, multiplier: 2.0, allowAntonym: true, hasInterference: true }
        };
        return configs[difficulty] || configs.easy;
    },

    async loadLayout() {
        const config = this.getDifficultyConfig(this.difficulty);
        this.gridSize = config.gridSize;
        this.timeLeft = config.timeLimit;
        
        document.getElementById('linkTime').textContent = this.timeLeft;

        const result = await apiProxy.generateLinkGameLayout(this.difficulty);

        if (result.success) {
            this.grid = result.data.grid;
            this.renderGrid();
            this.startTimer();
            this.gameStarted = true;
        } else {
            this.generateMockLayout();
            this.renderGrid();
            this.startTimer();
            this.gameStarted = true;
        }
    },

    generateMockLayout() {
        const cleanWords = ['正直', '廉洁', '奉公', '清廉', '慎独', '守正', '克己', '公正', '无私', '诚信'];
        const corruptWords = ['贪婪', '腐败', '贿赂', '私欲', '徇私', '枉法', '贪腐', '放纵', '奢侈', '野心'];
        const neutralWords = ['勤奋', '聪明', '努力', '智慧', '坚持', '学习'];

        const config = this.getDifficultyConfig(this.difficulty);
        let cleanCount, corruptCount, neutralCount;

        if (this.difficulty === 'easy') {
            cleanCount = 4;
            corruptCount = 4;
            neutralCount = 0;
        } else if (this.difficulty === 'medium') {
            cleanCount = 8;
            corruptCount = 8;
            neutralCount = 0;
        } else {
            cleanCount = 12;
            corruptCount = 8;
            neutralCount = 4;
        }

        const words = [];
        const shuffledClean = [...cleanWords].sort(() => Math.random() - 0.5);
        const shuffledCorrupt = [...corruptWords].sort(() => Math.random() - 0.5);
        const shuffledNeutral = [...neutralWords].sort(() => Math.random() - 0.5);

        for (let i = 0; i < cleanCount; i++) {
            words.push({ word: shuffledClean[i % shuffledClean.length], type: 'clean' });
        }
        for (let i = 0; i < corruptCount; i++) {
            words.push({ word: shuffledCorrupt[i % shuffledCorrupt.length], type: 'corrupt' });
        }
        for (let i = 0; i < neutralCount; i++) {
            words.push({ word: shuffledNeutral[i % shuffledNeutral.length], type: 'neutral' });
        }

        const shuffled = words.sort(() => Math.random() - 0.5);
        
        this.grid = [];
        let idx = 0;
        for (let i = 0; i < this.gridSize; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                if (idx < shuffled.length) {
                    this.grid[i][j] = shuffled[idx++];
                } else {
                    this.grid[i][j] = null;
                }
            }
        }
    },

    renderGrid() {
        const grid = document.getElementById('linkGameGrid');
        grid.innerHTML = '';
        grid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;

        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const cell = this.grid[i][j];
                const tile = document.createElement('div');
                tile.className = `link-tile ${cell ? cell.type : 'empty'}`;
                tile.dataset.row = i;
                tile.dataset.col = j;
                
                if (cell) {
                    tile.innerHTML = `<span class="tile-word">${cell.word}</span>`;
                    tile.addEventListener('click', () => this.selectTile(i, j));
                }
                
                grid.appendChild(tile);
            }
        }
    },

    selectTile(row, col) {
        if (!this.gameStarted) return;
        
        const cell = this.grid[row][col];
        if (!cell) return;

        const tile = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        
        const now = Date.now();
        if (this.lastClickTime > 0) {
            const reactionTime = now - this.lastClickTime;
            this.behaviorData.reactionTimes.push(reactionTime);
            if (reactionTime > 3000) {
                this.behaviorData.hesitationCount++;
            }
        }
        this.lastClickTime = now;

        if (!this.selectedTile) {
            this.selectedTile = { row, col, word: cell.word, type: cell.type };
            tile.classList.add('selected');
            document.getElementById('linkGameHint').textContent = `已选择："${cell.word}"，再选一个词进行配对`;
        } else {
            if (this.selectedTile.row === row && this.selectedTile.col === col) {
                tile.classList.remove('selected');
                this.selectedTile = null;
                document.getElementById('linkGameHint').textContent = '点击两个语义相关的词汇进行消除';
                return;
            }

            this.moves++;
            this.behaviorData.moves++;
            document.getElementById('linkMoves').textContent = this.moves;

            this.attemptLink(this.selectedTile, { row, col, word: cell.word, type: cell.type });
            
            const prevSelected = document.querySelector(`[data-row="${this.selectedTile.row}"][data-col="${this.selectedTile.col}"]`);
            prevSelected.classList.remove('selected');
            this.selectedTile = null;
            document.getElementById('linkGameHint').textContent = '点击两个语义相关的词汇进行消除';
        }
    },

    async attemptLink(tile1, tile2) {
        const cacheKey = `${tile1.word}-${tile2.word}`;
        const reverseKey = `${tile2.word}-${tile1.word}`;
        
        let analysis = null;
        
        if (this.semanticCache[cacheKey]) {
            analysis = this.semanticCache[cacheKey];
        } else if (this.semanticCache[reverseKey]) {
            analysis = this.semanticCache[reverseKey];
        } else {
            const result = await apiProxy.analyzeSemanticRelation(tile1.word, tile2.word, this.difficulty);
            if (result.success) {
                analysis = result.data;
                this.semanticCache[cacheKey] = analysis;
            }
        }

        if (analysis) {
            if (analysis.valid) {
                this.handleValidLink(tile1, tile2, analysis);
            } else {
                this.handleInvalidLink(tile1, tile2, analysis);
            }
        } else {
            this.handleFallbackLink(tile1, tile2);
        }
    },

    handleFallbackLink(tile1, tile2) {
        const config = this.getDifficultyConfig(this.difficulty);
        
        let isValid = false;
        let relation = 'unrelated';
        
        if (tile1.type === 'neutral' || tile2.type === 'neutral') {
            isValid = false;
            relation = 'unrelated';
        } else if (tile1.type === tile2.type) {
            isValid = true;
            relation = 'synonym';
        } else if (config.allowAntonym && tile1.type !== tile2.type) {
            isValid = true;
            relation = 'antonym';
        }

        if (isValid) {
            this.handleValidLink(tile1, tile2, { 
                valid: true, 
                relation: relation,
                confidence: 0.8,
                explanation: relation === 'synonym' ? '两个词汇语义相近' : '两个词汇构成反义关系',
                score_bonus: 5
            });
        } else {
            this.handleInvalidLink(tile1, tile2, { 
                valid: false, 
                relation: 'unrelated',
                explanation: '这两个词汇无法配对消除'
            });
        }
    },

    handleValidLink(tile1, tile2, analysis) {
        this.grid[tile1.row][tile1.col] = null;
        this.grid[tile2.row][tile2.col] = null;

        const tileElement1 = document.querySelector(`[data-row="${tile1.row}"][data-col="${tile1.col}"]`);
        const tileElement2 = document.querySelector(`[data-row="${tile2.row}"][data-col="${tile2.col}"]`);
        
        tileElement1.classList.add('matched');
        tileElement2.classList.add('matched');

        if (analysis.relation === 'antonym') {
            this.behaviorData.antonymPairs++;
        } else {
            this.behaviorData.synonymPairs++;
        }

        setTimeout(() => {
            tileElement1.classList.add('empty');
            tileElement2.classList.add('empty');
            tileElement1.innerHTML = '';
            tileElement2.innerHTML = '';
        }, 400);

        this.combo++;
        document.getElementById('linkCombo').textContent = this.combo;

        if (this.combo >= 3) {
            this.showComboEffect();
        }

        const baseScore = 10;
        const confidenceBonus = Math.round(analysis.confidence * 10);
        const comboBonus = this.combo * 3;
        const relationBonus = analysis.relation === 'antonym' ? 10 : 5;
        
        const config = this.getDifficultyConfig(this.difficulty);
        const scoreGain = Math.round((baseScore + confidenceBonus + comboBonus + relationBonus) * config.multiplier);
        this.score += scoreGain;
        document.getElementById('linkScore').textContent = this.score;

        document.getElementById('linkGameHint').innerHTML = `✅ ${analysis.explanation} (+${scoreGain}分)`;

        if (this.checkWin()) {
            this.gameWon();
        }
    },

    handleInvalidLink(tile1, tile2, analysis) {
        this.errorCount++;
        this.behaviorData.errorCount++;
        
        if (tile1.type === 'neutral' || tile2.type === 'neutral') {
            this.behaviorData.interferenceClicks++;
        }
        
        this.combo = 0;
        document.getElementById('linkCombo').textContent = 0;

        const tileElement1 = document.querySelector(`[data-row="${tile1.row}"][data-col="${tile1.col}"]`);
        const tileElement2 = document.querySelector(`[data-row="${tile2.row}"][data-col="${tile2.col}"]`);
        
        tileElement1.classList.add('error');
        tileElement2.classList.add('error');
        
        setTimeout(() => {
            tileElement1.classList.remove('error');
            tileElement2.classList.remove('error');
        }, 500);

        document.getElementById('linkGameHint').innerHTML = `❌ ${analysis.explanation}`;
    },

    showComboEffect() {
        const effect = document.getElementById('comboEffect');
        effect.textContent = `🔥 清风连击 x${this.combo}!`;
        effect.classList.add('active');
        setTimeout(() => {
            effect.classList.remove('active');
            effect.textContent = '';
        }, 1500);
    },

    showHint() {
        const tiles = [];
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j]) {
                    tiles.push({ row: i, col: j, ...this.grid[i][j] });
                }
            }
        }

        for (let i = 0; i < tiles.length; i++) {
            for (let j = i + 1; j < tiles.length; j++) {
                const t1 = tiles[i];
                const t2 = tiles[j];
                const config = this.getDifficultyConfig(this.difficulty);
                
                if ((t1.type === t2.type) || (config.allowAntonym && t1.type !== t2.type && t1.type !== 'neutral' && t2.type !== 'neutral')) {
                    const tile1 = document.querySelector(`[data-row="${t1.row}"][data-col="${t1.col}"]`);
                    const tile2 = document.querySelector(`[data-row="${t2.row}"][data-col="${t2.col}"]`);
                    tile1.classList.add('hint');
                    tile2.classList.add('hint');
                    setTimeout(() => {
                        tile1.classList.remove('hint');
                        tile2.classList.remove('hint');
                    }, 2000);
                    document.getElementById('linkGameHint').textContent = '💡 提示：高亮的两个词可以配对';
                    return;
                }
            }
        }
        
        document.getElementById('linkGameHint').textContent = '💡 没有可配对的词汇了';
    },

    checkWin() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j]) return false;
            }
        }
        return true;
    },

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.behaviorData.timeUsed++;
            document.getElementById('linkTime').textContent = this.timeLeft;

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
    },

    gameWon() {
        this.stopTimer();
        
        const totalMoves = this.moves;
        const accuracy = totalMoves > 0 ? (totalMoves - this.errorCount) / totalMoves : 0;
        this.behaviorData.accuracy = accuracy;
        
        const avgReaction = this.behaviorData.reactionTimes.length > 0 
            ? this.behaviorData.reactionTimes.reduce((a, b) => a + b, 0) / this.behaviorData.reactionTimes.length 
            : 0;
        this.behaviorData.averageReactionTime = avgReaction;

        const config = this.getDifficultyConfig(this.difficulty);
        const timeLeftRatio = this.timeLeft / config.timeLimit;
        const timeBonus = timeLeftRatio > 0.5 ? 1.2 : 1.0;
        const finalScore = Math.round(this.score * timeBonus);

        apiProxy.saveLinkGameRecord({
            difficulty: this.difficulty,
            score: finalScore,
            moves: this.moves,
            accuracy: accuracy,
            timeUsed: config.timeLimit - this.timeLeft,
            errorCount: this.errorCount,
            behaviorData: this.behaviorData,
            completed: true
        });

        this.showResult(true, finalScore, accuracy);
    },

    gameLost() {
        this.stopTimer();
        
        const totalMoves = this.moves;
        const accuracy = totalMoves > 0 ? (totalMoves - this.errorCount) / totalMoves : 0;
        this.behaviorData.accuracy = accuracy;

        const avgReaction = this.behaviorData.reactionTimes.length > 0 
            ? this.behaviorData.reactionTimes.reduce((a, b) => a + b, 0) / this.behaviorData.reactionTimes.length 
            : 0;
        this.behaviorData.averageReactionTime = avgReaction;

        apiProxy.saveLinkGameRecord({
            difficulty: this.difficulty,
            score: this.score,
            moves: this.moves,
            accuracy: accuracy,
            timeUsed: this.getDifficultyConfig(this.difficulty).timeLimit,
            errorCount: this.errorCount,
            behaviorData: this.behaviorData,
            completed: false
        });

        this.showResult(false, this.score, accuracy);
    },

    async showResult(won, score, accuracy) {
        const result = await apiProxy.analyzeBehaviorData(this.behaviorData, 'link');

        let analysis = '';
        if (result.success) {
            try {
                const data = JSON.parse(result.data);
                analysis = `<p>${data.analysis}</p><p><strong>建议：</strong>${data.suggestions?.join('；') || data.suggestion}</p>`;
            } catch {
                analysis = `<p>${result.data}</p>`;
            }
        }

        const config = this.getDifficultyConfig(this.difficulty);
        const overlay = document.querySelector('.minigame-overlay');
        overlay.innerHTML = `
            <div class="minigame-content glass">
                <div class="minigame-header">
                    <h2>${won ? '🎉 恭喜通关！' : '⏰ 时间到！'}</h2>
                    <button class="close-btn" id="closeLinkResult">×</button>
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
                            <span class="stat-value">${config.multiplier}×</span>
                            <span class="stat-label">难度倍率</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${this.behaviorData.antonymPairs}</span>
                            <span class="stat-label">反义配对</span>
                        </div>
                    </div>
                    <div class="result-analysis">${analysis}</div>
                    <div class="result-actions">
                        <button class="btn btn-primary" onclick="LinkGame.startGameWithDifficulty('${this.difficulty}')">再来一局</button>
                        <button class="btn btn-secondary" onclick="document.querySelector('.minigame-overlay').remove()">返回</button>
                        <button class="btn btn-info" onclick="assessmentVisualizer.showPlayerReportModal()">查看评估报告</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('closeLinkResult').addEventListener('click', () => {
            overlay.remove();
        });
    }
};

// 确保LinkGame成为全局变量
window.LinkGame = LinkGame;