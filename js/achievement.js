class AchievementSystem {
    constructor() {
        this.achievements = this.loadAchievements();
    }

    loadAchievements() {
        const saved = localStorage.getItem('cleanGame_achievements');
        return saved ? JSON.parse(saved) : {
            // 基础成就
            firstWin: false,
            zeroCross: false,
            speedRun: false,
            wordCollector: false,
            
            // 莲境系列成就（5境）
            lotusStage1: false,   // 不蔓不枝 - 第1境通关
            lotusStage2: false,   // 可远观 - 第2境通关
            lotusStage3: false,   // 莲心稳固 - 第3境通关
            lotusStage4: false,   // 边缘行者 - 第4境通关
            lotusStage5: false,   // 绝地逢生 - 廉洁值低于20%仍通关
            lotusComplete: false, // 三境圆满/五境圆满 - 通关全部5境
            
            // 高级成就
            noNegativeWord: false,  // 全程未吃负面词
            rareWordMaster: false,   // 收集全部稀有词
            surviveCrisis: false,   // 第3次越界后逃脱
            
            // 统计
            playCount: 0,
            totalScore: 0,
            bestScore: 0,
            longestWin: 0,  // 最长通关记录
        };
    }

    save() {
        localStorage.setItem('cleanGame_achievements', JSON.stringify(this.achievements));
    }

    unlock(achievement) {
        if (!this.achievements[achievement]) {
            this.achievements[achievement] = true;
            this.save();
            return true;
        }
        return false;
    }

    checkAchievements(gameData) {
        const newAchievements = [];
        
        this.achievements.playCount++;
        this.achievements.totalScore += gameData.score;
        
        // 更新最高分
        if (gameData.score > this.achievements.bestScore) {
            this.achievements.bestScore = gameData.score;
        }
        
        // 通关记录
        if (gameData.won && gameData.level > this.achievements.longestWin) {
            this.achievements.longestWin = gameData.level;
        }

        // 1. 首次通关
        if (gameData.won) {
            if (this.unlock('firstWin')) {
                newAchievements.push('firstWin');
            }
        }

        // 2. 零越界通关
        if (gameData.crossCount === 0 && gameData.won) {
            if (this.unlock('zeroCross')) {
                newAchievements.push('zeroCross');
            }
        }

        // 3. 速通（60秒内通关）
        if (gameData.won && gameData.duration < 60) {
            if (this.unlock('speedRun')) {
                newAchievements.push('speedRun');
            }
        }

        // 4. 收集8个廉洁词
        if (gameData.collectedWords >= 8) {
            if (this.unlock('wordCollector')) {
                newAchievements.push('wordCollector');
            }
        }
        
        // 5. 莲境系列成就
        // 第1境通关 - 不蔓不枝
        if (gameData.level >= 1 && gameData.won) {
            if (this.unlock('lotusStage1')) {
                newAchievements.push('lotusStage1');
            }
        }
        
        // 第2境通关 - 可远观
        if (gameData.level >= 2 && gameData.won) {
            if (this.unlock('lotusStage2')) {
                newAchievements.push('lotusStage2');
            }
        }
        
        // 第3境通关 - 莲心稳固
        if (gameData.level >= 3 && gameData.won) {
            if (this.unlock('lotusStage3')) {
                newAchievements.push('lotusStage3');
            }
        }
        
        // 第4境通关 - 边缘行者
        if (gameData.level >= 4 && gameData.won) {
            if (this.unlock('lotusStage4')) {
                newAchievements.push('lotusStage4');
            }
        }
        
        // 绝地逢生 - 廉洁值低于20%仍通关
        if (gameData.won && gameData.integrityValue < 20 && gameData.integrityValue > 0) {
            if (this.unlock('lotusStage5')) {
                newAchievements.push('lotusStage5');
            }
        }
        
        // 五境圆满 - 通关全部5境
        if (gameData.level >= 5 && gameData.won) {
            if (this.unlock('lotusComplete')) {
                newAchievements.push('lotusComplete');
            }
        }
        
        // 6. 全程未吃负面词
        if (gameData.negativeEaten === 0 && gameData.won) {
            if (this.unlock('noNegativeWord')) {
                newAchievements.push('noNegativeWord');
            }
        }
        
        // 7. 收集全部稀有词
        if (gameData.rareCollected >= 6 && gameData.won) {
            if (this.unlock('rareWordMaster')) {
                newAchievements.push('rareWordMaster');
            }
        }
        
        // 8. 第3次越界后逃脱
        if (gameData.crossCount >= 3 && gameData.won) {
            if (this.unlock('surviveCrisis')) {
                newAchievements.push('surviveCrisis');
            }
        }

        this.save();

        return newAchievements;
    }

    getUnlocked() {
        return Object.entries(this.achievements)
            .filter(([key, value]) => value === true && !['playCount', 'totalScore', 'bestScore', 'longestWin'].includes(key))
            .map(([key]) => key);
    }

    getAll() {
        return [
            // 基础成就
            { id: 'firstWin', name: '初入莲境', desc: '首次通关第1境', icon: '🌱', tier: 'bronze' },
            { id: 'zeroCross', name: '零越界', desc: '通关且未触碰红线', icon: '🎯', tier: 'silver' },
            { id: 'speedRun', name: '疾如风', desc: '60秒内通关', icon: '⚡', tier: 'gold' },
            { id: 'wordCollector', name: '词云收集', desc: '收集8个廉洁词', icon: '📚', tier: 'bronze' },
            
            // 莲境系列
            { id: 'lotusStage1', name: '不蔓不枝', desc: '通关第1境', icon: '🪷', tier: 'bronze' },
            { id: 'lotusStage2', name: '可远观', desc: '通关第2境', icon: '🪷', tier: 'bronze' },
            { id: 'lotusStage3', name: '莲心稳固', desc: '通关第3境', icon: '🪷', tier: 'silver' },
            { id: 'lotusStage4', name: '边缘行者', desc: '通关第4境', icon: '🪷', tier: 'silver' },
            { id: 'lotusStage5', name: '绝地逢生', desc: '廉洁值低于20%仍通关', icon: '🪷', tier: 'gold' },
            { id: 'lotusComplete', name: '五境圆满', desc: '通关全部五境', icon: '🌸', tier: 'diamond' },
            
            // 高级成就
            { id: 'noNegativeWord', name: '洁身自好', desc: '全程未吃负面词通关', icon: '✨', tier: 'gold' },
            { id: 'rareWordMaster', name: '慧眼识珠', desc: '收集6个以上稀有词', icon: '💎', tier: 'silver' },
            { id: 'surviveCrisis', name: '悬崖勒马', desc: '第3次越界后逃脱并通关', icon: '🏔️', tier: 'gold' },
        ];
    }
    
    getProgress() {
        const allAchievements = this.getAll().filter(a => !['playCount', 'totalScore', 'bestScore', 'longestWin'].includes(a.id));
        const unlocked = this.getUnlocked().length;
        return {
            unlocked: unlocked,
            total: allAchievements.length,
            percentage: Math.round((unlocked / allAchievements.length) * 100)
        };
    }
}

class Leaderboard {
    constructor() {
        this.scores = this.loadScores();
    }

    loadScores() {
        const saved = localStorage.getItem('cleanGame_leaderboard');
        return saved ? JSON.parse(saved) : [];
    }

    save() {
        localStorage.setItem('cleanGame_leaderboard', JSON.stringify(this.scores));
    }

    addScore(playerName, score, won, duration, level) {
        this.scores.push({
            name: playerName || '匿名玩家',
            score,
            won,
            duration,
            level,
            date: new Date().toLocaleDateString('zh-CN')
        });

        this.scores.sort((a, b) => b.score - a.score);
        this.scores = this.scores.slice(0, 10);
        this.save();
    }

    getTop5() {
        return this.scores.slice(0, 5);
    }

    getRank(score) {
        const rank = this.scores.findIndex(s => s.score >= score) + 1;
        return rank > 0 ? rank : this.scores.length + 1;
    }
}

const achievementSystem = new AchievementSystem();
const leaderboard = new Leaderboard();
