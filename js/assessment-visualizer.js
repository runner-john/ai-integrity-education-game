class AssessmentVisualizer {
    constructor() {
        this.radarChart = null;
        this.lineChart = null;
        this.profileChart = null;
    }

    parseMarkdown(text) {
        if (!text) return '';
        let html = text;
        html = html.replace(/```(\w+)?\n?([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>');
        html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
        html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
        html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^# (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
        html = html.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');
        html = html.replace(/(<li>[\s\S]*?<\/li>)+/g, '<ul>$&</ul>');
        html = html.replace(/\n{2,}/g, '</p><p>');
        html = html.replace(/\n/g, '<br>');
        html = '<p>' + html + '</p>';
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p>(<h[234]>)/g, '$1');
        html = html.replace(/(<\/h[234]>)<\/p>/g, '$1');
        html = html.replace(/<p>(<ul>)/g, '$1');
        html = html.replace(/(<\/ul>)<\/p>/g, '$1');
        html = html.replace(/<p>(<pre)/g, '$1');
        html = html.replace(/(<\/pre>)<\/p>/g, '$1');
        return html;
    }

    initProfileChart(canvasId, profileData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        if (this.profileChart) {
            this.profileChart.destroy();
        }

        this.profileChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['词汇认知', '记忆能力', '反应速度', '辨别准确度', '理解深度'],
                datasets: [{
                    label: '用户画像',
                    data: [
                        profileData.knowledge || 50,
                        profileData.memory || 50,
                        profileData.speed || 50,
                        profileData.accuracy || 50,
                        profileData.comprehension || 50
                    ],
                    borderColor: 'rgba(168, 85, 247, 1)',
                    backgroundColor: 'rgba(168, 85, 247, 0.2)',
                    pointBackgroundColor: 'rgba(168, 85, 247, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(168, 85, 247, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20,
                            font: { size: 12 }
                        },
                        pointLabels: {
                            font: {
                                size: 14,
                                family: "'Ma Shan Zheng', serif"
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff',
                            font: { size: 14 }
                        }
                    }
                }
            }
        });

        return this.profileChart;
    }

    initRadarChart(canvasId, playerData, classData = null) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        if (this.radarChart) {
            this.radarChart.destroy();
        }

        const datasets = [
            {
                label: '当前表现',
                data: [
                    playerData.knowledge,
                    playerData.intuition,
                    playerData.decision,
                    playerData.semantic,
                    playerData.risk
                ],
                borderColor: 'rgba(74, 222, 128, 1)',
                backgroundColor: 'rgba(74, 222, 128, 0.2)',
                pointBackgroundColor: 'rgba(74, 222, 128, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(74, 222, 128, 1)'
            }
        ];

        if (classData) {
            datasets.push({
                label: '班级平均',
                data: [
                    classData.knowledge,
                    classData.intuition,
                    classData.decision,
                    classData.semantic,
                    classData.risk
                ],
                borderColor: 'rgba(149, 117, 205, 1)',
                backgroundColor: 'rgba(149, 117, 205, 0.1)',
                pointBackgroundColor: 'rgba(149, 117, 205, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(149, 117, 205, 1)'
            });
        }

        this.radarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['廉洁知识', '直觉反应', '情境决策', '语义辨别', '风险管控'],
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20,
                            font: {
                                size: 12
                            }
                        },
                        pointLabels: {
                            font: {
                                size: 14,
                                family: "'Ma Shan Zheng', serif"
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff',
                            font: {
                                size: 14
                            }
                        }
                    }
                }
            }
        });

        return this.radarChart;
    }

    initTrendChart(canvasId, sessions) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        if (this.lineChart) {
            this.lineChart.destroy();
        }

        const labels = sessions.map((s, i) => `第${sessions.length - i}局`);
        const knowledgeData = sessions.map(s => s.scores?.knowledge || 50);
        const riskData = sessions.map(s => s.scores?.risk || 50);

        this.lineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '知识水平',
                        data: knowledgeData,
                        borderColor: 'rgba(74, 222, 128, 1)',
                        backgroundColor: 'rgba(74, 222, 128, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: '风险管控',
                        data: riskData,
                        borderColor: 'rgba(251, 191, 36, 1)',
                        backgroundColor: 'rgba(251, 191, 36, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff'
                        }
                    }
                }
            }
        });

        return this.lineChart;
    }

    showPlayerReportModal() {
        const report = integrityAssessment.getPlayerReport();
        if (!report) {
            showToast('暂无评估数据', 'warning');
            return;
        }

        // 先关闭游戏结束界面
        const overlay = document.getElementById('overlay');
        if (overlay && overlay.classList.contains('active')) {
            overlay.classList.remove('active');
        }

        const classReport = integrityAssessment.getClassReport();
        const classAvg = classReport?.averageDimensions || null;

        const modal = document.createElement('div');
        modal.className = 'game-modal';
        modal.id = 'assessment-report-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h2 class="modal-title">🪷 廉洁素养评估报告</h2>
                    <button class="modal-close" onclick="assessmentVisualizer.closeReportModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="report-header">
                        <div class="player-info">
                            <h3>${report.player.name}</h3>
                            <p>游戏次数: ${report.totalGames} | 综合评分: <strong>${Math.round(Object.values(report.currentScores).reduce((a,b)=>a+b,0)/5)}</strong></p>
                        </div>
                        <div class="report-actions">
                            <button class="btn btn-secondary" onclick="assessmentVisualizer.exportReport()">📄 导出档案</button>
                        </div>
                    </div>
                    
                    <div class="radar-section">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h4>📊 能力雷达图</h4>
                            <button class="btn btn-primary btn-small" onclick="assessmentVisualizer.showAIAnalysis()">🤖 AI评估分析</button>
                        </div>
                        <div class="chart-container">
                            <canvas id="radar-chart"></canvas>
                        </div>
                    </div>

                    <div class="dimensions-grid">
                        <div class="dimension-card knowledge">
                            <div class="dimension-icon">📚</div>
                            <div class="dimension-info">
                                <h5>廉洁知识</h5>
                                <div class="score-bar">
                                    <div class="score-fill" style="width: ${report.currentScores.knowledge}%"></div>
                                </div>
                                <span class="score-value">${report.currentScores.knowledge}</span>
                            </div>
                        </div>
                        <div class="dimension-card intuition">
                            <div class="dimension-icon">⚡</div>
                            <div class="dimension-info">
                                <h5>直觉反应</h5>
                                <div class="score-bar">
                                    <div class="score-fill" style="width: ${report.currentScores.intuition}%"></div>
                                </div>
                                <span class="score-value">${report.currentScores.intuition}</span>
                            </div>
                        </div>
                        <div class="dimension-card decision">
                            <div class="dimension-icon">🎯</div>
                            <div class="dimension-info">
                                <h5>情境决策</h5>
                                <div class="score-bar">
                                    <div class="score-fill" style="width: ${report.currentScores.decision}%"></div>
                                </div>
                                <span class="score-value">${report.currentScores.decision}</span>
                            </div>
                        </div>
                        <div class="dimension-card semantic">
                            <div class="dimension-icon">🔤</div>
                            <div class="dimension-info">
                                <h5>语义辨别</h5>
                                <div class="score-bar">
                                    <div class="score-fill" style="width: ${report.currentScores.semantic}%"></div>
                                </div>
                                <span class="score-value">${report.currentScores.semantic}</span>
                            </div>
                        </div>
                        <div class="dimension-card risk">
                            <div class="dimension-icon">🛡️</div>
                            <div class="dimension-info">
                                <h5>风险管控</h5>
                                <div class="score-bar">
                                    <div class="score-fill" style="width: ${report.currentScores.risk}%"></div>
                                </div>
                                <span class="score-value">${report.currentScores.risk}</span>
                            </div>
                        </div>
                    </div>

                    ${report.recentSessions.length > 0 ? `
                    <div class="trend-section">
                        <h4>📈 成长趋势</h4>
                        <div class="chart-container">
                            <canvas id="trend-chart"></canvas>
                        </div>
                    </div>
                    ` : ''}

                    <div class="suggestions-section">
                        <h4>💡 成长建议</h4>
                        <ul class="suggestions-list">
                            ${this.generateSuggestionsHTML(report.currentScores)}
                        </ul>
                    </div>

                    <div class="profile-section">
                        <h4>👤 用户画像分析</h4>
                        <div class="chart-container">
                            <canvas id="profile-chart"></canvas>
                        </div>
                        <div class="profile-level">
                            <span class="level-label">廉洁素养等级：</span>
                            <span class="level-value" id="profile-level">L3</span>
                        </div>
                        <div class="profile-summary" id="profile-summary"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('show');

        setTimeout(() => {
            this.initRadarChart('radar-chart', report.currentScores, classAvg);
            if (report.recentSessions.length > 0) {
                this.initTrendChart('trend-chart', report.recentSessions);
            }
            this.loadUserProfile();
        }, 100);
    }

    generateSuggestionsHTML(scores) {
        const suggestions = [];
        if (scores.knowledge < 60) {
            suggestions.push('<li>📚 建议加强廉洁知识学习，多参与"廉洁诘问"答题环节</li>');
        }
        if (scores.intuition < 60) {
            suggestions.push('<li>⚡ 建议多玩"廉腐配对"记忆游戏，提升直觉反应速度</li>');
        }
        if (scores.decision < 60) {
            suggestions.push('<li>🎯 建议多体验情境决策模块，增强原则性判断</li>');
        }
        if (scores.semantic < 60) {
            suggestions.push('<li>🔤 建议多玩"词义连连看"，加深对廉洁词汇的理解</li>');
        }
        if (scores.risk < 60) {
            suggestions.push('<li>🛡️ 建议加强边界意识，在贪吃蛇游戏中注意避开风险区</li>');
        }
        if (suggestions.length === 0) {
            suggestions.push('<li>🌟 表现优秀！继续保持全面发展</li>');
        }
        return suggestions.join('');
    }

    async loadUserProfile() {
        const memoryRecords = JSON.parse(localStorage.getItem('memoryGameRecords') || '[]');
        const linkRecords = JSON.parse(localStorage.getItem('linkGameRecords') || '[]');
        
        const result = await apiProxy.callAPI(
            '生成用户画像评估报告，分析词汇学习游戏数据',
            { data: { memoryRecords, linkRecords } }
        );

        if (result.success) {
            try {
                const profile = JSON.parse(result.data);
                this.initProfileChart('profile-chart', profile.scores);
                
                const levelElement = document.getElementById('profile-level');
                if (levelElement) {
                    levelElement.textContent = profile.level;
                }
                
                const summaryElement = document.getElementById('profile-summary');
                if (summaryElement) {
                    let summaryHTML = `<p><strong>${profile.summary}</strong></p>`;
                    summaryHTML += '<p><strong>各维度对比：</strong></p>';
                    summaryHTML += '<ul>';
                    for (const [key, value] of Object.entries(profile.comparison)) {
                        const labels = {
                            knowledge: '词汇认知',
                            memory: '记忆能力',
                            speed: '反应速度',
                            accuracy: '辨别准确度',
                            comprehension: '理解深度'
                        };
                        summaryHTML += `<li>${labels[key] || key}：${value}</li>`;
                    }
                    summaryHTML += '</ul>';
                    if (profile.suggestions && profile.suggestions.length > 0) {
                        summaryHTML += '<p><strong>学习建议：</strong>' + profile.suggestions.join('；') + '</p>';
                    }
                    summaryElement.innerHTML = summaryHTML;
                }
            } catch (error) {
                console.error('Failed to parse profile data:', error);
            }
        }
    }

    closeReportModal() {
        const modal = document.getElementById('assessment-report-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }

    exportReport() {
        const content = integrityAssessment.exportPlayerPDF();
        if (!content) {
            showToast('暂无数据可导出', 'warning');
            return;
        }

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `廉洁素养档案_${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('档案导出成功！', 'success');
    }

    async showAIAnalysis() {
        const report = integrityAssessment.getPlayerReport();
        if (!report) {
            showToast('暂无评估数据', 'warning');
            return;
        }

        const analysisModal = document.createElement('div');
        analysisModal.className = 'game-modal';
        analysisModal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2 class="modal-title">🤖 AI评估分析</h2>
                    <button class="modal-close" onclick="document.querySelector('.game-modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="ai-analysis-content" style="min-height: 200px;">
                        <div style="text-align: center; padding: 40px;">
                            <div class="typing-indicator" style="display: inline-flex; gap: 5px;">
                                <span class="typing-dot"></span>
                                <span class="typing-dot"></span>
                                <span class="typing-dot"></span>
                            </div>
                            <p style="color: #94a3b8; margin-top: 15px;">AI导师正在分析你的数据...</p>
                        </div>
                    </div>
                    <div style="margin-top: 20px; text-align: center;">
                        <button class="btn btn-secondary" onclick="document.querySelector('.game-modal').remove()">关闭</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(analysisModal);

        try {
            const totalScore = Object.values(report.currentScores).reduce((a,b)=>a+b,0);
            const avgScore = Math.round(totalScore / 5);
            const strongDims = [];
            const weakDims = [];
            const dimNames = { knowledge: '廉洁知识', intuition: '直觉反应', decision: '情境决策', semantic: '语义辨别', risk: '风险管控' };
            Object.entries(report.currentScores).forEach(([key, val]) => {
                if (val >= 70) strongDims.push({ name: dimNames[key], val });
                else if (val < 60) weakDims.push({ name: dimNames[key], val });
            });

            const result = await apiProxy.callAPI(
                `你是廉洁素养评估专家。请根据以下真实游戏数据，对玩家进行精准分析。

【游戏数据】
- 游戏次数：${report.totalGames}局
- 综合评分：${avgScore}/100
- 各维度得分：廉洁知识${report.currentScores.knowledge}分、直觉反应${report.currentScores.intuition}分、情境决策${report.currentScores.decision}分、语义辨别${report.currentScores.semantic}分、风险管控${report.currentScores.risk}分

【强弱项】
优势维度：${strongDims.length > 0 ? strongDims.map(d => d.name + '(' + d.val + '分)').join('、') : '无明显优势'}
弱势维度：${weakDims.length > 0 ? weakDims.map(d => d.name + '(' + d.val + '分)').join('、') : '无明显弱势'}

请按以下格式生成分析报告：

## 总体评价
（根据综合评分给出一句话总体评价，要具体指出数据表现）

## 数据解读
（基于具体分数解读，不要空洞的描述）
- 优势领域：${strongDims.length > 0 ? strongDims.map(d => d.name + '得分' + d.val + '分，说明' + (d.val >= 80 ? '表现优秀' : '表现良好')).join('；') : '暂无明显优势维度'}
- 弱势领域：${weakDims.length > 0 ? weakDims.map(d => d.name + '得分仅' + d.val + '分，需要重点加强').join('；') : '暂无明显弱势维度'}

## 针对性建议
（根据具体分数和强弱项，给出2-3条可操作的建议，要结合游戏中的实际表现）

【重要】要求：
1. 一定要引用具体的分数数据
2. 不要生成通用模板式内容
3. 建议要具体可操作
4. 控制在300字以内`,
                { max_tokens: 1024 }
            );

            const content = document.getElementById('ai-analysis-content');
            if (result.success) {
                content.innerHTML = `<div style="line-height:1.8;">${this.parseMarkdown(result.data)}</div>`;
            } else {
                content.innerHTML = '<p style="color: #ef4444;">分析失败，请稍后重试</p>';
            }
        } catch (error) {
            const content = document.getElementById('ai-analysis-content');
            content.innerHTML = '<p style="color: #ef4444;">分析失败：' + error.message + '</p>';
        }
    }

    sendMentorMessage() {
        const input = document.getElementById('mentor-question');
        const chatContainer = document.getElementById('mentor-chat');
        const question = input.value.trim();

        if (!question) return;

        chatContainer.innerHTML += `
            <div class="user-message">
                <div class="user-bubble">
                    <p>${question}</p>
                </div>
            </div>
        `;

        input.value = '';

        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'mentor-message loading';
        loadingMsg.innerHTML = `
            <div class="mentor-avatar">🤖</div>
            <div class="mentor-bubble">
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        chatContainer.appendChild(loadingMsg);

        this.getMentorResponse(question).then(response => {
            loadingMsg.remove();
            chatContainer.innerHTML += `
                <div class="mentor-message">
                    <div class="mentor-avatar">🤖</div>
                    <div class="mentor-bubble">
                        <p>${response}</p>
                    </div>
                </div>
            `;
            chatContainer.scrollTop = chatContainer.scrollHeight;
        });
    }

    async getMentorResponse(question) {
        if (!window.apiProxy || !apiProxy.useRealAPI) {
            return '请先在右上角"配置API"中设置有效的AI API Key。';
        }
        
        try {
            const report = integrityAssessment.getPlayerReport();
            const context = report ? `
                学生评估数据：
                - 综合评分：${Math.round(Object.values(report.currentScores).reduce((a,b)=>a+b,0)/5)}
                - 廉洁知识：${report.currentScores.knowledge}
                - 直觉反应：${report.currentScores.intuition}
                - 情境决策：${report.currentScores.decision}
                - 语义辨别：${report.currentScores.semantic}
                - 风险管控：${report.currentScores.risk}
            ` : '';
            
            const prompt = `作为廉洁素养导师，请${context ? '结合以下评估数据' : ''}回答问题：${context}\n\n问题：${question}\n\n请用中文友好回答，保持专业但亲切的语气。`;
            
            const result = await apiProxy.chat([
                { role: 'system', content: '你是一位专业的廉洁素养教育导师，擅长用通俗易懂的语言解答关于廉洁、自律、品德修养等方面的问题。你的回答应该引用经典文献，富有教育意义。' },
                { role: 'user', content: prompt }
            ]);
            
            return result?.choices?.[0]?.message?.content || '抱歉，AI暂时无法响应，请稍后重试。';
        } catch (error) {
            console.error('API call error:', error);
            return `API调用失败：${error.message}。请检查API Key是否正确。`;
        }
    }

    showAPIKeyModal() {
        const modal = document.createElement('div');
        modal.className = 'game-modal';
        modal.id = 'api-key-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 450px;">
                <div class="modal-header">
                    <h2 class="modal-title">🔑 AI API配置</h2>
                    <button class="modal-close" onclick="assessmentVisualizer.closeAPIKeyModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>API Key</label>
                        <input type="password" id="api-key-input" placeholder="请输入豆包API Key" value="${apiProxy.apiKey || ''}">
                    </div>
                    <div class="api-hint">
                        <p>获取方式：</p>
                        <ol>
                            <li>访问 <a href="https://console.bytedance.net/" target="_blank">豆包开放平台</a></li>
                            <li>注册账号并创建应用</li>
                            <li>获取API Key</li>
                        </ol>
                    </div>
                    <div class="form-group">
                        <button class="btn btn-primary" onclick="assessmentVisualizer.saveAPIKey()" style="width:100%;">保存配置</button>
                    </div>
                    ${apiProxy.useRealAPI ? '<p style="text-align:center;color:#4ade80;">已配置API Key</p>' : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('show');
    }

    closeAPIKeyModal() {
        const modal = document.getElementById('api-key-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }

    saveAPIKey() {
        const apiKey = document.getElementById('api-key-input').value.trim();
        if (!apiKey) {
            showToast('请输入API Key', 'warning');
            return;
        }
        
        apiProxy.setAPIKey(apiKey);
        this.closeAPIKeyModal();
        showToast('API Key配置成功！', 'success');
    }

    generateFallbackResponse(question) {
        const responses = {
            '廉洁': '廉洁是指不贪污、不收受不正当利益，保持清白正直的品德。它是中华民族的传统美德，也是现代社会每个人应有的行为准则。',
            '腐败': '腐败是指利用职务或权力谋取不正当利益的行为。腐败不仅损害公共利益，也会破坏社会公平正义，我们应当坚决抵制。',
            '学习': '学习廉洁知识是一个持续的过程。你可以多阅读经典文献，了解法律法规，通过实践不断提高自己的廉洁素养。',
            '建议': '根据你的评估结果，建议你继续保持优势，同时加强薄弱环节的学习。坚持每天练习，相信你会不断进步！',
            '风险': '风险管控能力是廉洁素养的重要组成部分。在生活中要时刻保持警惕，远离潜在的风险和诱惑。',
            '谢谢': '不客气！如果你还有其他问题，随时可以问我。祝你学习进步！'
        };

        for (const [key, response] of Object.entries(responses)) {
            if (question.includes(key)) {
                return response;
            }
        }

        return `这是一个很好的问题！关于廉洁素养，我可以告诉你：廉洁不仅是一种品德，更是一种生活态度。它体现在日常的每一个选择中，需要我们时刻保持清醒的头脑和坚定的意志。如果你有具体的问题，我很乐意为你解答！`;
    }

    showTeacherDashboard() {
        // 先关闭其他界面
        const overlay = document.getElementById('overlay');
        if (overlay && overlay.classList.contains('active')) {
            overlay.classList.remove('active');
        }
        const reportModal = document.getElementById('assessment-report-modal');
        if (reportModal && reportModal.classList.contains('show')) {
            reportModal.classList.remove('show');
        }

        const classReport = integrityAssessment.getClassReport();
        
        const modal = document.createElement('div');
        modal.className = 'game-modal';
        modal.id = 'teacher-dashboard-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1100px;">
                <div class="modal-header">
                    <h2 class="modal-title">👨‍🏫 教师端仪表盘</h2>
                    <button class="modal-close" onclick="assessmentVisualizer.closeTeacherDashboard()">&times;</button>
                </div>
                <div class="modal-body">
                    ${classReport ? `
                    <div class="dashboard-stats">
                        <div class="stat-card">
                            <div class="stat-value">${classReport.totalPlayers}</div>
                            <div class="stat-label">学生人数</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${Math.round(Object.values(classReport.averageDimensions).reduce((a,b)=>a+b,0)/5)}</div>
                            <div class="stat-label">班级平均分</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${classReport.players.reduce((sum,p)=>sum+p.gameHistory.length,0)}</div>
                            <div class="stat-label">总游戏次数</div>
                        </div>
                    </div>

                    <div class="dashboard-content">
                        <div class="dashboard-section">
                            <h4>📊 班级平均雷达图</h4>
                            <div class="chart-container">
                                <canvas id="class-radar-chart"></canvas>
                            </div>
                        </div>

                        <div class="dashboard-section">
                            <h4>🏆 排行榜</h4>
                            <div class="leaderboard">
                                ${classReport.leaderboard.slice(0,10).map((p,i)=>`
                                    <div class="leaderboard-item">
                                        <span class="rank ${i<3?'top':''}">${i+1}</span>
                                        <span class="name">${p.name}</span>
                                        <span class="score">${p.totalScore}</span>
                                        <span class="games">${p.gamesPlayed}局</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="students-list">
                        <h4>👥 学生列表</h4>
                        <div class="students-grid">
                            ${classReport.players.map(p=>`
                                <div class="student-card" onclick="assessmentVisualizer.showStudentDetail('${p.id}')">
                                    <div class="student-avatar">${p.name.charAt(0)}</div>
                                    <div class="student-name">${p.name}</div>
                                    <div class="student-score">${Math.round(Object.values(p.dimensionScores).reduce((a,b)=>a+b,0)/5)}</div>
                                    <div class="student-games">${p.gameHistory.length}局</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : `
                    <div class="empty-state">
                        <p>暂无学生数据</p>
                        <p class="subtext">开始游戏后数据将自动记录</p>
                    </div>
                    `}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('show');

        if (classReport) {
            setTimeout(() => {
                this.initRadarChart('class-radar-chart', classReport.averageDimensions);
            }, 100);
        }
    }

    showStudentDetail(playerId) {
        this.closeTeacherDashboard();
        setTimeout(() => {
            integrityAssessment.setCurrentPlayer(playerId);
            this.showPlayerReportModal();
        }, 300);
    }

    closeTeacherDashboard() {
        const modal = document.getElementById('teacher-dashboard-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }
}

const assessmentVisualizer = new AssessmentVisualizer();
window.assessmentVisualizer = assessmentVisualizer;
window.parseMarkdown = (text) => assessmentVisualizer.parseMarkdown(text);
