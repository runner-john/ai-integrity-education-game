class IntegrityAssessment {
    constructor() {
        this.data = this.loadData();
        this.players = this.loadPlayers();
    }

    loadData() {
        const saved = localStorage.getItem('integrity_assessment');
        return saved ? JSON.parse(saved) : {
            currentPlayer: 'guest_' + Date.now(),
            sessions: {}
        };
    }

    loadPlayers() {
        const saved = localStorage.getItem('integrity_players');
        return saved ? JSON.parse(saved) : {};
    }

    saveData() {
        localStorage.setItem('integrity_assessment', JSON.stringify(this.data));
    }

    savePlayers() {
        localStorage.setItem('integrity_players', JSON.stringify(this.players));
    }

    setCurrentPlayer(playerId) {
        this.data.currentPlayer = playerId;
        if (!this.players[playerId]) {
            this.players[playerId] = {
                id: playerId,
                name: playerId,
                createdAt: new Date().toISOString(),
                gameHistory: [],
                dimensionScores: {
                    knowledge: 50,
                    intuition: 50,
                    decision: 50,
                    semantic: 50,
                    risk: 50
                },
                bestScores: {}
            };
        }
        this.saveData();
        this.savePlayers();
    }

    startSession(gameType) {
        const sessionId = 'session_' + Date.now();
        this.data.sessions[sessionId] = {
            id: sessionId,
            playerId: this.data.currentPlayer,
            gameType: gameType,
            startTime: new Date().toISOString(),
            endTime: null,
            metrics: {}
        };
        this.saveData();
        return sessionId;
    }

    recordMetric(sessionId, metric, value) {
        if (this.data.sessions[sessionId]) {
            this.data.sessions[sessionId].metrics[metric] = value;
            this.saveData();
        }
    }

    endSession(sessionId, scores) {
        if (this.data.sessions[sessionId]) {
            const session = this.data.sessions[sessionId];
            session.endTime = new Date().toISOString();
            session.scores = scores;
            
            const player = this.players[this.data.currentPlayer];
            if (player) {
                player.gameHistory.push(sessionId);
                
                this.updateDimensionScores(player, session.gameType, scores);
                this.savePlayers();
            }
            this.saveData();
        }
    }

    updateDimensionScores(player, gameType, scores) {
        const learningRate = 0.3;
        
        switch(gameType) {
            case 'snake':
                player.dimensionScores.risk = Math.round(
                    player.dimensionScores.risk * (1 - learningRate) + 
                    (100 - scores.riskLevel) * learningRate
                );
                player.dimensionScores.knowledge = Math.round(
                    player.dimensionScores.knowledge * (1 - learningRate) + 
                    scores.wordAccuracy * learningRate
                );
                break;
            case 'memory':
                player.dimensionScores.intuition = Math.round(
                    player.dimensionScores.intuition * (1 - learningRate) + 
                    scores.accuracy * learningRate
                );
                player.dimensionScores.semantic = Math.round(
                    player.dimensionScores.semantic * (1 - learningRate) + 
                    scores.pairingScore * learningRate
                );
                break;
            case 'decision':
                player.dimensionScores.decision = Math.round(
                    player.dimensionScores.decision * (1 - learningRate) + 
                    scores.integrityScore * learningRate
                );
                player.dimensionScores.knowledge = Math.round(
                    player.dimensionScores.knowledge * (1 - learningRate) + 
                    scores.questionScore * learningRate
                );
                break;
            case 'link':
                player.dimensionScores.semantic = Math.round(
                    player.dimensionScores.semantic * (1 - learningRate) + 
                    scores.matchAccuracy * learningRate
                );
                player.dimensionScores.intuition = Math.round(
                    player.dimensionScores.intuition * (1 - learningRate) + 
                    scores.speedScore * learningRate
                );
                break;
        }
    }

    getPlayerReport(playerId) {
        const player = this.players[playerId] || this.players[this.data.currentPlayer];
        if (!player) return null;

        const sessions = player.gameHistory.map(id => this.data.sessions[id]).filter(Boolean);
        
        const recentSessions = sessions.slice(-10);
        const avgScores = {
            knowledge: this.calculateAverage(recentSessions, 'knowledge'),
            intuition: this.calculateAverage(recentSessions, 'intuition'),
            decision: this.calculateAverage(recentSessions, 'decision'),
            semantic: this.calculateAverage(recentSessions, 'semantic'),
            risk: this.calculateAverage(recentSessions, 'risk')
        };

        return {
            player: player,
            currentScores: player.dimensionScores,
            averageScores: avgScores,
            totalGames: sessions.length,
            recentSessions: recentSessions.slice(-5).reverse()
        };
    }

    calculateAverage(sessions, dimension) {
        if (sessions.length === 0) return 50;
        let total = 0;
        let count = 0;
        sessions.forEach(session => {
            if (session.scores && session.scores[dimension] !== undefined) {
                total += session.scores[dimension];
                count++;
            }
        });
        return count > 0 ? Math.round(total / count) : 50;
    }

    getClassReport() {
        const allPlayers = Object.values(this.players);
        if (allPlayers.length === 0) return null;

        const avgDimensions = {
            knowledge: Math.round(allPlayers.reduce((sum, p) => sum + p.dimensionScores.knowledge, 0) / allPlayers.length),
            intuition: Math.round(allPlayers.reduce((sum, p) => sum + p.dimensionScores.intuition, 0) / allPlayers.length),
            decision: Math.round(allPlayers.reduce((sum, p) => sum + p.dimensionScores.decision, 0) / allPlayers.length),
            semantic: Math.round(allPlayers.reduce((sum, p) => sum + p.dimensionScores.semantic, 0) / allPlayers.length),
            risk: Math.round(allPlayers.reduce((sum, p) => sum + p.dimensionScores.risk, 0) / allPlayers.length)
        };

        const leaderboard = allPlayers
            .map(p => ({
                id: p.id,
                name: p.name,
                totalScore: Object.values(p.dimensionScores).reduce((a, b) => a + b, 0),
                gamesPlayed: p.gameHistory.length
            }))
            .sort((a, b) => b.totalScore - a.totalScore);

        return {
            totalPlayers: allPlayers.length,
            averageDimensions: avgDimensions,
            leaderboard: leaderboard,
            players: allPlayers
        };
    }

    exportPlayerPDF(playerId) {
        const report = this.getPlayerReport(playerId);
        if (!report) return null;

        const content = `
清莲引 - 廉洁素养成长档案
====================================

学生姓名: ${report.player.name}
档案编号: ${report.player.id}
创建时间: ${new Date(report.player.createdAt).toLocaleDateString()}
游戏次数: ${report.totalGames}

廉洁素养雷达图评分
------------------
  廉洁知识水平: ${report.currentScores.knowledge}/100
  廉洁直觉反应: ${report.currentScores.intuition}/100
  情境决策能力: ${report.currentScores.decision}/100
  语义辨别能力: ${report.currentScores.semantic}/100
  行为风险管控: ${report.currentScores.risk}/100

综合评分: ${Math.round(Object.values(report.currentScores).reduce((a, b) => a + b, 0) / 5)}/100

成长建议
--------
${this.generateSuggestions(report.currentScores)}

--
清莲引 AI智慧教育系统
生成时间: ${new Date().toLocaleString()}
        `;

        return content;
    }

    generateSuggestions(scores) {
        const suggestions = [];
        if (scores.knowledge < 60) {
            suggestions.push("• 建议加强廉洁知识学习，多参与廉洁诘问答题环节");
        }
        if (scores.intuition < 60) {
            suggestions.push("• 建议多玩廉腐配对记忆游戏，提升直觉反应速度");
        }
        if (scores.decision < 60) {
            suggestions.push("• 建议多体验情境决策模块，增强原则性判断");
        }
        if (scores.semantic < 60) {
            suggestions.push("• 建议多玩词义连连看，加深对廉洁词汇的理解");
        }
        if (scores.risk < 60) {
            suggestions.push("• 建议加强边界意识，在贪吃蛇游戏中注意避开风险区");
        }
        if (suggestions.length === 0) {
            suggestions.push("• 表现优秀！继续保持全面发展");
        }
        return suggestions.join('\n');
    }

    clearAllData() {
        localStorage.removeItem('integrity_assessment');
        localStorage.removeItem('integrity_players');
        this.data = {
            currentPlayer: 'guest_' + Date.now(),
            sessions: {}
        };
        this.players = {};
    }
}

const integrityAssessment = new IntegrityAssessment();
window.integrityAssessment = integrityAssessment;
