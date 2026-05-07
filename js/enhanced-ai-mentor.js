/**
 * 清莲引·增强AI导师系统
 * 基于机器学习的实时智能导师，为玩家提供个性化指导
 */

const EnhancedAIMentor = (function() {
    // 状态
    let isActive = false;
    let lastAdvice = null;
    let adviceHistory = [];
    let realTimeTracker = null;
    let mlClient = null;

    // AI导师性格配置
    const PERSONALITY = {
        // 不同风险等级对应的导师语气
        tones: {
            low: {
                style: 'encouraging',
                emoji: '✨',
                messages: [
                    '表现不错，继续保持！',
                    '您的廉洁之心如莲花般纯洁。',
                    '稳扎稳打，步步为营。'
                ]
            },
            medium: {
                style: 'warning',
                emoji: '⚠️',
                messages: [
                    '需要警惕了，红线近在咫尺。',
                    '一念之差，可能万劫不复。',
                    '守住初心，方得始终。'
                ]
            },
            high: {
                style: 'urgent',
                emoji: '🚨',
                messages: [
                    '危险！立即返回安全区！',
                    '贪欲如火，不遏则燎原！',
                    '悬崖勒马，回头是岸！'
                ]
            }
        },
        
        // 事件触发的特殊提示
        eventPrompts: {
            onCrossLine: [
                '越界了！每一次侥幸都在消耗您的廉洁底线。',
                '红线不可逾越，这是纪律的底线！',
                '《大学》云："货悖而入者，亦悖而出。"'
            ],
            onEatNegative: [
                '负面词侵蚀了您的廉洁之心！',
                '腐败如同毒药，入口即伤！',
                '《论语》："小人喻于利。"'
            ],
            onEatRare: [
                '稀有词到手！但高收益伴随高风险。',
                '诱惑总是诱人的，但守住底线更难。',
                '《孟子》："富贵不能淫。"'
            ],
            onUseSkill: [
                '慎独技能已激活——知止而后有定。',
                '悬崖勒马，回头是岸。',
                '《中庸》："君子素其位而行。"'
            ],
            onLowIntegrity: [
                '廉洁值告急！再这样下去会信仰失守！',
                '廉政信仰如同生命，不可动摇！',
                '《论语》："自古皆有死，民无信不立。"'
            ]
        }
    };

    /**
     * 初始化AI导师
     */
    function init() {
        // 获取ML客户端实例
        if (window.MLClient) {
            mlClient = window.MLClient;
        }

        // 创建实时风险追踪器
        if (mlClient) {
            realTimeTracker = mlClient.createRealtimeRiskTracker(window.gameInstance);
        }

        console.log('🤖 增强AI导师系统已初始化');
    }

    /**
     * 启动AI导师
     */
    function start(gameInstance) {
        if (isActive) return;
        
        isActive = true;
        init();

        // 如果有ML追踪器，启动它
        if (realTimeTracker && gameInstance) {
            // 替换为实际的游戏实例
            realTimeTracker = mlClient.createRealtimeRiskTracker(gameInstance);
            realTimeTracker.startTracking(3000); // 每3秒更新一次
        }

        // 启动主动建议
        startProactiveAdvice(gameInstance);

        console.log('🤖 AI导师已激活');
    }

    /**
     * 停止AI导师
     */
    function stop() {
        isActive = false;

        if (realTimeTracker) {
            realTimeTracker.stopTracking();
        }

        console.log('🤖 AI导师已停用');
    }

    /**
     * 启动主动建议系统
     */
    function startProactiveAdvice(gameInstance) {
        // 每10秒检查一次并给出建议
        setInterval(() => {
            if (!isActive || !gameInstance || !gameInstance.gameRunning) return;

            const gameData = collectGameData(gameInstance);
            
            // 获取ML风险评估
            if (mlClient) {
                mlClient.assessRisk(gameData).then(result => {
                    if (result) {
                        const tone = PERSONALITY.tones[result.riskLevel];
                        const message = getRandomMessage(tone.messages);
                        
                        // 根据风险等级决定是否显示建议
                        if (result.riskLevel === 'high' || result.riskLevel === 'medium') {
                            showMentorAdvice(message, result.riskLevel);
                        }
                    }
                });
            }
        }, 10000);
    }

    /**
     * 收集游戏数据
     */
    function collectGameData(gameInstance) {
        return {
            crossCount: gameInstance.crossCount || 0,
            negativeRatio: gameInstance.negativeWords.length / Math.max(1, gameInstance.collectedWords.length),
            rightSideRatio: gameInstance.stepsInRightZone / Math.max(1, gameInstance.totalSteps),
            temptationResisted: gameInstance.temptationResisted || 0,
            rareCollected: gameInstance.rareCollected || 0
        };
    }

    /**
     * 获取随机消息
     */
    function getRandomMessage(messages) {
        return messages[Math.floor(Math.random() * messages.length)];
    }

    /**
     * 显示导师建议
     */
    function showMentorAdvice(message, level = 'low') {
        const advice = {
            timestamp: new Date(),
            message,
            level
        };

        adviceHistory.push(advice);
        if (adviceHistory.length > 50) {
            adviceHistory.shift();
        }

        lastAdvice = advice;

        // 显示到界面
        showAdviceToast(message, level);

        // 如果有AI面板，也更新面板内容
        updateAIPanelAdvice(advice);

        return advice;
    }

    /**
     * 显示建议气泡
     */
    function showAdviceToast(message, level) {
        // 创建临时提示
        const toast = document.createElement('div');
        toast.className = `mentor-advice mentor-advice-${level}`;
        toast.innerHTML = `
            <div class="mentor-avatar">🤖</div>
            <div class="mentor-message">
                <div class="mentor-label">AI导师提示</div>
                <div class="mentor-text">${message}</div>
            </div>
        `;

        document.body.appendChild(toast);

        // 2秒后自动移除
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    /**
     * 更新AI面板建议
     */
    function updateAIPanelAdvice(advice) {
        const chatContainer = document.getElementById('chatContainer');
        if (!chatContainer) return;

        // 添加系统消息
        const systemMsg = document.createElement('div');
        systemMsg.className = `chat-message system ${advice.level}`;
        const parsedMessage = window.parseMarkdown ? window.parseMarkdown(advice.message) : advice.message;
        systemMsg.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="message-text">${parsedMessage}</div>
                <div class="message-time">${formatTime(advice.timestamp)}</div>
            </div>
        `;

        chatContainer.appendChild(systemMsg);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    /**
     * 格式化时间
     */
    function formatTime(date) {
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }

    /**
     * 处理游戏事件
     */
    function onGameEvent(eventType, gameInstance) {
        if (!isActive) return;

        let prompts = [];

        switch (eventType) {
            case 'crossLine':
                prompts = PERSONALITY.eventPrompts.onCrossLine;
                break;
            case 'eatNegative':
                prompts = PERSONALITY.eventPrompts.onEatNegative;
                break;
            case 'eatRare':
                prompts = PERSONALITY.eventPrompts.onEatRare;
                break;
            case 'useSkill':
                prompts = PERSONALITY.eventPrompts.onUseSkill;
                break;
            case 'lowIntegrity':
                prompts = PERSONALITY.eventPrompts.onLowIntegrity;
                break;
        }

        if (prompts.length > 0) {
            const message = getRandomMessage(prompts);
            showMentorAdvice(message, eventType === 'lowIntegrity' || eventType === 'crossLine' ? 'high' : 'medium');
        }
    }

    /**
     * 获取游戏策略建议
     */
    async function getGameAdvice(currentState) {
        if (mlClient) {
            const advices = await mlClient.getGameAdvice(currentState);
            return advices;
        }
        return [];
    }

    /**
     * 获取行为分析
     */
    async function getBehaviorAnalysis(gameHistory) {
        if (mlClient) {
            const analysis = await mlClient.analyzeBehavior(gameHistory);
            return analysis;
        }
        return null;
    }

    /**
     * 获取导师历史建议
     */
    function getAdviceHistory() {
        return adviceHistory;
    }

    /**
     * 获取最后一条建议
     */
    function getLastAdvice() {
        return lastAdvice;
    }

    /**
     * 对话交互
     */
    async function chat(message) {
        // 收集当前游戏状态
        const gameInstance = window.gameInstance;
        const gameData = gameInstance ? collectGameData(gameInstance) : null;

        // 获取ML风险评估
        let riskInfo = null;
        if (mlClient && gameData) {
            riskInfo = await mlClient.assessRisk(gameData);
        }

        // 生成回复
        const response = generateAIResponse(message, riskInfo);

        // 添加到历史
        adviceHistory.push({
            timestamp: new Date(),
            type: 'chat',
            question: message,
            answer: response
        });

        return response;
    }

    /**
     * 生成AI回复
     */
    function generateAIResponse(question, riskInfo) {
        // 简单的关键词匹配
        const lowerQuestion = question.toLowerCase();
        
        let response = '';
        let category = '';

        // 风险相关
        if (lowerQuestion.includes('风险') || lowerQuestion.includes('危险')) {
            category = 'risk';
            if (riskInfo) {
                if (riskInfo.riskLevel === 'high') {
                    response = `您当前的风险评分为 ${riskInfo.riskScore.toFixed(0)}/100，处于高风险状态。建议立即返回安全区，停止越界行为。`;
                } else if (riskInfo.riskLevel === 'medium') {
                    response = `您当前风险评分为 ${riskInfo.riskScore.toFixed(0)}/100，处于中等风险。需要提高警惕，减少在红线附近的活动。`;
                } else {
                    response = `您当前风险评分为 ${riskInfo.riskScore.toFixed(0)}/100，处于低风险状态。继续保持！`;
                }
            } else {
                response = '请先进行游戏，我才能评估您的风险状态。';
            }
        }
        // 建议相关
        else if (lowerQuestion.includes('建议') || lowerQuestion.includes('怎么办')) {
            category = 'advice';
            if (riskInfo && riskInfo.advice) {
                const mainAdvice = riskInfo.advice.find(a => a.level !== 'info') || riskInfo.advice[0];
                if (mainAdvice) {
                    response = `${mainAdvice.icon} ${mainAdvice.text}`;
                }
            } else {
                response = '建议您专注于收集安全区的廉洁词汇，保持低风险状态。';
            }
        }
        // 典故相关
        else if (lowerQuestion.includes('典故') || lowerQuestion.includes('故事')) {
            category = 'story';
            const stories = [
                '《爱莲说》："出淤泥而不染，濯清涟而不妖。"这正是您在游戏中应该追求的境界。',
                '《道德经》："知足不辱，知止不殆。"告诉我们懂得知足和停止，就不会受到侮辱和危险。',
                '《中庸》："君子素其位而行。"君子应该在各自的位置上做好自己的本分。',
                '《论语》："过则勿惮改。"犯了错误不要害怕改正，这才是真正的君子之道。'
            ];
            response = stories[Math.floor(Math.random() * stories.length)];
        }
        // 鼓励相关
        else if (lowerQuestion.includes('加油') || lowerQuestion.includes('鼓励')) {
            category = 'encourage';
            const encouragements = [
                '您一定可以的！坚守底线，就是最大的胜利！',
                '每一次选择都在塑造您的品格，继续加油！',
                '廉洁之路虽然艰难，但您并不孤单，我一直在这里陪伴您！'
            ];
            response = encouragements[Math.floor(Math.random() * encouragements.length)];
        }
        // 默认回复
        else {
            category = 'default';
            const defaults = [
                '我理解您的问题。请问还有什么关于廉洁方面的问题吗？',
                '这个问题很有深度。让我为您提供一些思考的角度...',
                '感谢您的提问！我会尽力为您提供有价值的指导。'
            ];
            response = defaults[Math.floor(Math.random() * defaults.length)];
        }

        return {
            text: response,
            category: category,
            riskInfo: riskInfo
        };
    }

    /**
     * 创建雷达图数据
     */
    function createRadarChartData(riskFactors) {
        return {
            labels: riskFactors.map(f => f.name),
            datasets: [{
                label: '风险因素',
                data: riskFactors.map(f => (f.value / f.max) * 100),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
            }]
        };
    }

    // 导出公开接口
    return {
        init,
        start,
        stop,
        isActive: () => isActive,
        onGameEvent,
        getGameAdvice,
        getBehaviorAnalysis,
        getAdviceHistory,
        getLastAdvice,
        chat,
        createRadarChartData
    };
})();

// 导出到全局
window.EnhancedAIMentor = EnhancedAIMentor;
