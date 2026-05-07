class AIAssistant {
    constructor() {
        this.apiKey = '';
        this.baseURL = 'https://api.chatanywhere.cn/v1';
    }

    async generateComment(report) {
        const prompt = `
            请根据以下廉洁素养评估数据，用简洁、鼓励、专业的语言生成一份AI评语：
            
            学生：${report.player.name}
            游戏次数：${report.totalGames}
            综合评分：${Math.round(Object.values(report.currentScores).reduce((a,b)=>a+b,0)/5)}
            
            各维度得分：
            - 廉洁知识：${report.currentScores.knowledge}分
            - 直觉反应：${report.currentScores.intuition}分
            - 情境决策：${report.currentScores.decision}分
            - 语义辨别：${report.currentScores.semantic}分
            - 风险管控：${report.currentScores.risk}分
            
            要求：
            1. 开头要有问候语和鼓励的话
            2. 分析各维度的优点和需要改进的地方
            3. 提供具体的改进建议
            4. 结尾要有激励的话
            5. 语言要亲切自然，符合教育场景
            6. 不要超过300字
        `;

        try {
            const result = await this.callAI(prompt);
            return result || this.generateFallbackComment(report);
        } catch (error) {
            console.log('AI API调用失败，使用备用评语:', error);
            return this.generateFallbackComment(report);
        }
    }

    async callAI(prompt) {
        if (!this.apiKey) {
            return null;
        }

        try {
            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 300
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0]?.message?.content || null;
        } catch (error) {
            console.log('AI API error:', error);
            return null;
        }
    }

    generateFallbackComment(report) {
        const scores = report.currentScores;
        const total = Math.round(Object.values(scores).reduce((a,b)=>a+b,0)/5);
        
        let strengths = [];
        let improvements = [];
        
        if (scores.knowledge >= 70) strengths.push('廉洁知识扎实');
        else improvements.push('建议加强廉洁知识学习');
        
        if (scores.intuition >= 70) strengths.push('直觉反应灵敏');
        else improvements.push('建议多练习快速判断能力');
        
        if (scores.decision >= 70) strengths.push('决策原则性强');
        else improvements.push('建议多体验情境决策');
        
        if (scores.semantic >= 70) strengths.push('语义辨别准确');
        else improvements.push('建议多玩词义连连看');
        
        if (scores.risk >= 70) strengths.push('风险管控得当');
        else improvements.push('建议注意行为边界');

        return `
            🌟 你好，${report.player.name}！
            
            本次评估综合得分为 ${total} 分，继续加油！
            
            ${strengths.length > 0 ? `✨ 你的优点：${strengths.join('、')}` : ''}
            
            ${improvements.length > 0 ? `📈 改进建议：${improvements.join('、')}` : ''}
            
            廉洁修养是一生的修行，保持这份初心，不断进步！💪
        `.trim();
    }

    generateLearningPath(report) {
        const scores = report.currentScores;
        const path = [];
        
        const weakDimensions = [
            { key: 'knowledge', name: '廉洁知识', game: '廉洁诘问', score: scores.knowledge },
            { key: 'intuition', name: '直觉反应', game: '廉腐配对记忆', score: scores.intuition },
            { key: 'decision', name: '情境决策', game: '龟甲占卜', score: scores.decision },
            { key: 'semantic', name: '语义辨别', game: '词义连连看', score: scores.semantic },
            { key: 'risk', name: '风险管控', game: '贪吃蛇主线', score: scores.risk }
        ].sort((a, b) => a.score - b.score);

        path.push({
            day: 1,
            focus: weakDimensions[0].name,
            activity: `重点练习「${weakDimensions[0].game}」，目标提升${weakDimensions[0].name}能力`,
            tips: this.getTipsForDimension(weakDimensions[0].key)
        });

        path.push({
            day: 2,
            focus: weakDimensions[1].name,
            activity: `练习「${weakDimensions[1].game}」，巩固${weakDimensions[1].name}能力`,
            tips: this.getTipsForDimension(weakDimensions[1].key)
        });

        path.push({
            day: 3,
            focus: '综合提升',
            activity: '进行一次完整的贪吃蛇游戏，综合运用所有能力',
            tips: '注意控制风险，多收集廉洁词'
        });

        path.push({
            day: 4,
            focus: weakDimensions[2].name,
            activity: `专项练习「${weakDimensions[2].game}」`,
            tips: this.getTipsForDimension(weakDimensions[2].key)
        });

        path.push({
            day: 5,
            focus: '复盘与评估',
            activity: '查看评估报告，对比一周前的进步',
            tips: '记录进步，制定下一周目标'
        });

        return path;
    }

    getTipsForDimension(dimension) {
        const tips = {
            knowledge: '多阅读廉洁相关的经典文献和法律法规',
            intuition: '培养快速判断能力，相信第一感觉',
            decision: '面对诱惑时，坚守内心的底线和原则',
            semantic: '深入理解每个词汇的深层含义和语境',
            risk: '时刻保持警惕，远离风险区域'
        };
        return tips[dimension] || '继续努力，不断进步';
    }

    async analyzeBehavior(gameData) {
        const prompt = `
            分析以下游戏行为数据，给出行为分析报告：
            
            游戏类型：${gameData.gameType}
            得分：${gameData.score}
            越界次数：${gameData.crossCount}
            收集廉洁词：${gameData.collectedWords || 0}
            风险评分：${gameData.riskScore}%
            
            请分析：
            1. 玩家的决策模式
            2. 风险偏好程度
            3. 改进建议
            4. 用不超过200字的简洁语言表达
        `;

        try {
            const result = await this.callAI(prompt);
            return result || this.generateFallbackAnalysis(gameData);
        } catch (error) {
            return this.generateFallbackAnalysis(gameData);
        }
    }

    generateFallbackAnalysis(gameData) {
        const isRisky = gameData.riskScore > 60;
        const isConservative = gameData.crossCount === 0;
        
        if (isRisky) {
            return `⚠️ 行为分析：你的风险偏好较高（风险评分${gameData.riskScore}%），越界${gameData.crossCount}次。建议在游戏中更加谨慎，注意边界意识，培养风险管控能力。`;
        } else if (isConservative) {
            return `🛡️ 行为分析：你的决策较为保守，没有越界记录。可以适当尝试在安全区域内探索，平衡稳健与进取。`;
        } else {
            return `⚖️ 行为分析：你的决策较为均衡，风险评分${gameData.riskScore}%。继续保持这种平衡，在安全的前提下追求更高得分。`;
        }
    }

    showLearningPathModal() {
        const report = integrityAssessment.getPlayerReport();
        if (!report) {
            showToast('暂无评估数据', 'warning');
            return;
        }

        const path = this.generateLearningPath(report);

        const modal = document.createElement('div');
        modal.className = 'game-modal';
        modal.id = 'learning-path-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2 class="modal-title">🧭 AI智能学习路径</h2>
                    <button class="modal-close" onclick="aiAssistant.closeLearningPathModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="path-intro">
                        <p>根据你的评估数据，为你推荐以下学习路径：</p>
                    </div>
                    <div class="learning-path">
                        ${path.map((item, index) => `
                            <div class="path-item">
                                <div class="path-day">第${item.day}天</div>
                                <div class="path-content">
                                    <h4>${item.focus}</h4>
                                    <p>${item.activity}</p>
                                    <span class="tip">💡 ${item.tips}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="path-summary">
                        <p>坚持每天练习，相信你会不断进步！🌟</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('show');
    }

    closeLearningPathModal() {
        const modal = document.getElementById('learning-path-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }
}

const aiAssistant = new AIAssistant();
