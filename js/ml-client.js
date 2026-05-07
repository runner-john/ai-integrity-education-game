/**
 * 清莲引·机器学习客户端
 * 负责与后端ML推理API通信，获取真实的机器学习分析结果
 */

const MLClient = (function() {
    // 配置
    const CONFIG = {
        API_URL: 'http://localhost:5000',  // ML API服务器地址
        TIMEOUT: 10000,                   // 请求超时时间(ms)
        RETRY_TIMES: 3,                   // 重试次数
        RETRY_DELAY: 1000                 // 重试延迟(ms)
    };

    // 状态
    let isConnected = false;
    let lastHealthCheck = null;

    /**
     * 发送API请求
     */
    async function fetchAPI(endpoint, data, retryCount = 0) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.success) {
                isConnected = true;
                return result.data;
            } else {
                throw new Error(result.error || 'API返回错误');
            }

        } catch (error) {
            console.warn(`ML API请求失败 (尝试 ${retryCount + 1}/${CONFIG.RETRY_TIMES}):`, error.message);

            if (retryCount < CONFIG.RETRY_TIMES - 1) {
                await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
                return fetchAPI(endpoint, data, retryCount + 1);
            }

            // 所有重试都失败，返回null
            return null;
        }
    }

    /**
     * 健康检查
     */
    async function healthCheck() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/api/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });

            if (response.ok) {
                const data = await response.json();
                isConnected = true;
                lastHealthCheck = new Date();
                return data;
            }
        } catch (error) {
            isConnected = false;
        }
        return null;
    }

    /**
     * 廉洁风险评估
     * @param {Object} gameData - 游戏数据
     * @returns {Object|null} - 风险评估结果
     */
    async function assessRisk(gameData) {
        const payload = {
            cross_count: gameData.crossCount || 0,
            negative_ratio: gameData.negativeRatio || 0,
            right_side_ratio: gameData.rightSideRatio || 0,
            temptation_resisted: gameData.temptationResisted || 0,
            rare_collected: gameData.rareCollected || 0
        };

        const result = await fetchAPI('/api/ml/risk-assessment', payload);

        if (result) {
            return {
                riskScore: result.risk_score,
                riskLevel: result.risk_level,
                behaviorPattern: result.behavior_pattern,
                confidence: result.confidence,
                riskFactors: result.risk_factors,
                advice: result.advice
            };
        }

        // API不可用时，使用本地备用计算
        return calculateLocalRisk(gameData);
    }

    /**
     * 本地备用风险计算（当ML API不可用时）
     */
    function calculateLocalRisk(gameData) {
        const { crossCount = 0, negativeRatio = 0, rightSideRatio = 0, 
                temptationResisted = 0, rareCollected = 0 } = gameData;

        let score = 0;
        
        // 越界次数 (最高40分)
        score += Math.min(40, crossCount * 15);
        
        // 负面词比例 (最高25分)
        score += negativeRatio * 25;
        
        // 右侧停留时间 (最高20分)
        score += rightSideRatio * 20;
        
        // 稀有词收集 (加分项，最多-10分)
        score -= Math.min(10, rareCollected * 2);
        
        // 抵抗诱惑 (加分项，最多-10分)
        score -= Math.min(10, temptationResisted);

        const riskScore = Math.min(100, Math.max(0, score));

        let riskLevel = 'low';
        if (riskScore >= 70) riskLevel = 'high';
        else if (riskScore >= 40) riskLevel = 'medium';

        let behaviorPattern = '边缘游走型';
        if (crossCount < 0.5 && rightSideRatio < 0.15) {
            behaviorPattern = '莲心稳固型';
        } else if (crossCount > 1.5 || rightSideRatio > 0.45) {
            behaviorPattern = '边界试探型';
        }

        return {
            riskScore,
            riskLevel,
            behaviorPattern,
            confidence: 75,
            riskFactors: [
                { name: '越界次数', value: crossCount, max: 5, weight: 0.45, 
                  level: crossCount >= 2 ? 'danger' : crossCount >= 1 ? 'warning' : 'success',
                  description: '穿越红线的次数' },
                { name: '负面词比例', value: negativeRatio * 100, max: 100, weight: 0.25,
                  level: negativeRatio >= 0.5 ? 'danger' : negativeRatio >= 0.3 ? 'warning' : 'success',
                  description: '负面词汇占总词汇的比例' },
                { name: '危险区时间', value: rightSideRatio * 100, max: 100, weight: 0.20,
                  level: rightSideRatio >= 0.5 ? 'danger' : rightSideRatio >= 0.3 ? 'warning' : 'success',
                  description: '在红线右侧停留的时间比例' },
                { name: '抵抗诱惑', value: temptationResisted, max: 15, weight: 0.10,
                  level: temptationResisted >= 8 ? 'success' : temptationResisted >= 4 ? 'warning' : 'danger',
                  description: '成功抵抗诱惑词的次数' }
            ],
            advice: generateLocalAdvice(riskScore, behaviorPattern, gameData),
            isLocalCalculation: true
        };
    }

    /**
     * 生成本地建议（当ML API不可用时）
     */
    function generateLocalAdvice(riskScore, pattern, gameData) {
        const advice = [];
        const { crossCount = 0, negativeRatio = 0 } = gameData;

        if (riskScore >= 70) {
            advice.push({ level: 'danger', icon: '🚨', text: '您的廉洁风险较高，需要高度警惕！' });
            advice.push({ level: 'warning', icon: '⚠️', text: '建议暂时远离高风险区域，专注于安全区的廉洁词收集。' });
        } else if (riskScore >= 40) {
            advice.push({ level: 'warning', icon: '⚠️', text: '您处于中等风险水平，需要适时警醒。' });
            advice.push({ level: 'info', icon: '💡', text: '建议减少在红线附近的徘徊时间，坚守底线。' });
        } else {
            advice.push({ level: 'success', icon: '✨', text: '您表现良好，继续保持！' });
            advice.push({ level: 'info', icon: '💡', text: '可以适当挑战高风险区域获取稀有词，但要注意分寸。' });
        }

        if (pattern === '莲心稳固型') {
            advice.push({ level: 'success', icon: '🪷', text: '您展现了卓越的廉洁定力，如莲花般出淤泥而不染。' });
        } else if (pattern === '边界试探型') {
            advice.push({ level: 'danger', icon: '🔥', text: '您需要警惕贪欲的侵蚀，"千里之堤，溃于蚁穴"。' });
        }

        if (crossCount > 1) {
            advice.push({ level: 'warning', icon: '⚠️', text: `您已越界 ${crossCount} 次，每次越界都在消耗您的廉洁底线。` });
        }

        return advice;
    }

    /**
     * 行为模式分析
     */
    async function analyzeBehavior(gameHistory) {
        const result = await fetchAPI('/api/ml/behavior-analysis', {
            game_history: gameHistory
        });

        if (result) {
            return {
                pattern: result.pattern,
                trend: result.trend,
                trendText: result.trend_text,
                statistics: result.statistics
            };
        }

        // 本地备用计算
        return analyzeBehaviorLocal(gameHistory);
    }

    /**
     * 本地行为分析（当ML API不可用时）
     */
    function analyzeBehaviorLocal(gameHistory) {
        if (!gameHistory || gameHistory.length === 0) {
            return {
                pattern: '数据不足',
                trend: 'stable',
                trendText: '还需要更多游戏数据来分析您的行为模式'
            };
        }

        const avgCross = gameHistory.reduce((sum, g) => sum + (g.crossCount || 0), 0) / gameHistory.length;
        const avgNegRatio = gameHistory.reduce((sum, g) => sum + (g.negativeRatio || 0), 0) / gameHistory.length;

        let pattern = '边缘游走型';
        if (avgCross < 0.5) pattern = '莲心稳固型';
        else if (avgCross > 1.5) pattern = '边界试探型';

        let trend = 'stable';
        let trendText = '您的行为模式保持稳定。';

        if (gameHistory.length >= 3) {
            const recent = gameHistory.slice(0, 3).reduce((sum, g) => sum + (g.crossCount || 0), 0) / 3;
            const older = gameHistory.slice(-3).reduce((sum, g) => sum + (g.crossCount || 0), 0) / 3;

            if (recent < older * 0.8) {
                trend = 'improving';
                trendText = '您的越界行为正在减少，继续保持！';
            } else if (recent > older * 1.2) {
                trend = 'worsening';
                trendText = '您的越界行为有所增加，需要警惕！';
            }
        }

        return {
            pattern,
            trend,
            trendText,
            statistics: {
                avg_cross: avgCross,
                avg_negative_ratio: avgNegRatio * 100,
                games_analyzed: gameHistory.length
            }
        };
    }

    /**
     * 获取游戏策略建议
     */
    async function getGameAdvice(currentState) {
        const result = await fetchAPI('/api/ml/game-advice', {
            current_state: currentState
        });

        if (result) {
            return result.advices;
        }

        // 本地备用建议
        return getLocalGameAdvice(currentState);
    }

    /**
     * 生成本地游戏建议（当ML API不可用时）
     */
    function getLocalGameAdvice(currentState) {
        const advices = [];
        const { riskScore = 50, level = 1, rareCollected = 0 } = currentState;

        if (riskScore >= 70) {
            advices.push({
                priority: 'high',
                icon: '🛑',
                title: '立即撤离危险区',
                content: '您目前处于高风险状态，建议立即返回安全区。'
            });
        } else if (riskScore >= 40) {
            advices.push({
                priority: 'medium',
                icon: '⚠️',
                title: '谨慎行事',
                content: '您目前处于中等风险，可以适当在红线附近试探，但不要深入。'
            });
        } else {
            advices.push({
                priority: 'low',
                icon: '✨',
                title: '状态良好',
                content: '您目前表现优秀，可以考虑适度挑战高风险区的稀有词。'
            });
        }

        if (level === 1) {
            advices.push({
                priority: 'low',
                icon: '🌸',
                title: '第一关策略',
                content: '第一关红线位置较宽松，是建立优势的好时机。'
            });
        } else if (level === 3) {
            advices.push({
                priority: 'high',
                icon: '🏆',
                title: '最终关策略',
                content: '最后一关难度最大，建议稳扎稳打，后期再考虑冒险。'
            });
        }

        return advices;
    }

    /**
     * 实时风险更新（用于游戏过程中的频繁更新）
     */
    function createRealtimeRiskTracker(gameInstance) {
        let updateInterval = null;
        let lastRiskScore = 0;

        const startTracking = (intervalMs = 2000) => {
            if (updateInterval) {
                clearInterval(updateInterval);
            }

            updateInterval = setInterval(async () => {
                if (!gameInstance.gameRunning || gameInstance.gameOver) {
                    return;
                }

                // 收集当前游戏数据
                const gameData = {
                    crossCount: gameInstance.crossCount,
                    negativeRatio: gameInstance.negativeWords.length / Math.max(1, gameInstance.collectedWords.length),
                    rightSideRatio: gameInstance.stepsInRightZone / Math.max(1, gameInstance.totalSteps),
                    temptationResisted: gameInstance.temptationResisted || 0,
                    rareCollected: gameInstance.rareCollected
                };

                // 获取风险评估
                const riskResult = await assessRisk(gameData);

                if (riskResult) {
                    lastRiskScore = riskResult.riskScore;

                    // 更新UI
                    updateRiskDisplay(riskResult);

                    // 检查是否需要警告
                    if (riskResult.riskScore >= 70 && lastRiskScore < 70) {
                        showHighRiskWarning(riskResult);
                    }
                }
            }, intervalMs);
        };

        const stopTracking = () => {
            if (updateInterval) {
                clearInterval(updateInterval);
                updateInterval = null;
            }
        };

        const updateRiskDisplay = (riskResult) => {
            // 更新风险评分显示
            const riskScoreEl = document.getElementById('riskScore');
            if (riskScoreEl) {
                riskScoreEl.textContent = `${riskResult.riskScore.toFixed(0)}%`;
                
                // 颜色变化
                if (riskResult.riskLevel === 'high') {
                    riskScoreEl.style.color = '#ef4444';
                    riskScoreEl.style.textShadow = '0 0 10px rgba(239, 68, 68, 0.5)';
                } else if (riskResult.riskLevel === 'medium') {
                    riskScoreEl.style.color = '#eab308';
                    riskScoreEl.style.textShadow = '0 0 10px rgba(234, 179, 8, 0.5)';
                } else {
                    riskScoreEl.style.color = '#22c55e';
                    riskScoreEl.style.textShadow = '0 0 10px rgba(34, 197, 94, 0.5)';
                }
            }

            // 更新行为模式显示
            const behaviorEl = document.getElementById('behaviorPattern');
            if (behaviorEl) {
                behaviorEl.textContent = riskResult.behaviorPattern;
            }
        };

        const showHighRiskWarning = (riskResult) => {
            if (riskResult && riskResult.advice && riskResult.advice.length > 0) {
                const warning = riskResult.advice.find(a => a.level === 'danger');
                if (warning) {
                    showToast(`${warning.icon} ${warning.text}`, 'warning');
                }
            }
        };

        return {
            startTracking,
            stopTracking,
            getLastRiskScore: () => lastRiskScore
        };
    }

    // 导出公开接口
    return {
        CONFIG,
        isConnected: () => isConnected,
        lastHealthCheck: () => lastHealthCheck,
        healthCheck,
        assessRisk,
        analyzeBehavior,
        getGameAdvice,
        createRealtimeRiskTracker
    };
})();

// 导出到全局
window.MLClient = MLClient;
