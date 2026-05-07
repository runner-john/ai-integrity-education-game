class PDFExporter {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    async exportReport(report) {
        this.canvas.width = 800;
        this.canvas.height = 1100;
        
        await this.drawReport(report);
        
        const link = document.createElement('a');
        link.download = `廉洁素养报告_${report.player.name}_${Date.now()}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
        
        showToast('报告导出成功！', 'success');
    }

    async drawReport(report) {
        const ctx = this.ctx;
        
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 32px "ZCOOL XiaoWei", serif';
        ctx.textAlign = 'center';
        ctx.fillText('🪷 廉洁素养评估报告', this.canvas.width / 2, 60);
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px "ZCOOL XiaoWei", serif';
        ctx.fillText(`生成时间：${new Date().toLocaleString('zh-CN')}`, this.canvas.width / 2, 100);
        
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50, 120);
        ctx.lineTo(this.canvas.width - 50, 120);
        ctx.stroke();
        
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 20px "ZCOOL XiaoWei", serif';
        ctx.textAlign = 'left';
        ctx.fillText(`学生姓名：${report.player.name}`, 60, 160);
        ctx.fillText(`档案编号：${report.player.id}`, 60, 190);
        ctx.fillText(`创建时间：${new Date(report.player.createdAt).toLocaleDateString()}`, 60, 220);
        ctx.fillText(`游戏次数：${report.totalGames}`, 60, 250);
        
        const totalScore = Math.round(Object.values(report.currentScores).reduce((a, b) => a + b, 0) / 5);
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 24px "ZCOOL XiaoWei", serif';
        ctx.fillText(`综合评分：${totalScore}分`, 60, 290);
        
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.3)';
        ctx.beginPath();
        ctx.moveTo(50, 320);
        ctx.lineTo(this.canvas.width - 50, 320);
        ctx.stroke();
        
        await this.drawRadarChart(report.currentScores, 400, 350, 150);
        
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 20px "ZCOOL XiaoWei", serif';
        ctx.textAlign = 'left';
        ctx.fillText('详细得分:', 60, 560);
        
        const dimensions = [
            { key: 'knowledge', name: '廉洁知识', icon: '📚', color: '#4ade80' },
            { key: 'intuition', name: '直觉反应', icon: '⚡', color: '#fbbf24' },
            { key: 'decision', name: '情境决策', icon: '🎯', color: '#8b5cf6' },
            { key: 'semantic', name: '语义辨别', icon: '🔤', color: '#22d3ee' },
            { key: 'risk', name: '风险管控', icon: '🛡️', color: '#ef4444' }
        ];
        
        let y = 600;
        dimensions.forEach((dim, index) => {
            const score = report.currentScores[dim.key];
            
            ctx.fillStyle = dim.color;
            ctx.font = 'bold 18px "ZCOOL XiaoWei", serif';
            ctx.fillText(`${dim.icon} ${dim.name}`, 60, y);
            
            ctx.fillStyle = '#e2e8f0';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`${score}`, this.canvas.width - 60, y);
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(60, y + 15, this.canvas.width - 120, 15);
            
            ctx.fillStyle = dim.color;
            ctx.fillRect(60, y + 15, (this.canvas.width - 120) * (score / 100), 15);
            
            y += 60;
        });
        
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.3)';
        ctx.beginPath();
        ctx.moveTo(50, y + 20);
        ctx.lineTo(this.canvas.width - 50, y + 20);
        ctx.stroke();
        
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 20px "ZCOOL XiaoWei", serif';
        ctx.textAlign = 'left';
        ctx.fillText('💡 成长建议:', 60, y + 60);
        
        const suggestions = this.generateSuggestions(report.currentScores);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '16px "ZCOOL XiaoWei", serif';
        
        suggestions.forEach((suggestion, index) => {
            ctx.fillText(`  ${suggestion}`, 60, y + 90 + index * 35);
        });
        
        ctx.fillStyle = '#64748b';
        ctx.font = '14px "ZCOOL XiaoWei", serif';
        ctx.textAlign = 'center';
        ctx.fillText('清莲引 · AI智慧教育系统', this.canvas.width / 2, this.canvas.height - 30);
        ctx.fillText('廉洁素养从心开始', this.canvas.width / 2, this.canvas.height - 10);
    }

    async drawRadarChart(scores, centerX, centerY, radius) {
        const ctx = this.ctx;
        const dimensions = ['knowledge', 'intuition', 'decision', 'semantic', 'risk'];
        const labels = ['廉洁知识', '直觉反应', '情境决策', '语义辨别', '风险管控'];
        const angleStep = (Math.PI * 2) / dimensions.length;
        
        for (let level = 5; level >= 1; level--) {
            const levelRadius = (radius / 5) * level;
            ctx.beginPath();
            for (let i = 0; i < dimensions.length; i++) {
                const angle = i * angleStep - Math.PI / 2;
                const x = centerX + Math.cos(angle) * levelRadius;
                const y = centerY + Math.sin(angle) * levelRadius;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.strokeStyle = 'rgba(74, 222, 128, 0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        for (let i = 0; i < dimensions.length; i++) {
            const angle = i * angleStep - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
            ctx.strokeStyle = 'rgba(74, 222, 128, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        ctx.beginPath();
        for (let i = 0; i < dimensions.length; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const score = scores[dimensions[i]];
            const pointRadius = (radius / 100) * score;
            const x = centerX + Math.cos(angle) * pointRadius;
            const y = centerY + Math.sin(angle) * pointRadius;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(74, 222, 128, 0.3)';
        ctx.fill();
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        for (let i = 0; i < dimensions.length; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const score = scores[dimensions[i]];
            const pointRadius = (radius / 100) * score;
            const x = centerX + Math.cos(angle) * pointRadius;
            const y = centerY + Math.sin(angle) * pointRadius;
            
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#4ade80';
            ctx.fill();
        }
        
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '14px "ZCOOL XiaoWei", serif';
        ctx.textAlign = 'center';
        
        for (let i = 0; i < dimensions.length; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const labelRadius = radius + 30;
            const x = centerX + Math.cos(angle) * labelRadius;
            const y = centerY + Math.sin(angle) * labelRadius;
            
            ctx.fillText(labels[i], x, y);
        }
        
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 16px "ZCOOL XiaoWei", serif';
        ctx.fillText('能力雷达图', centerX, centerY + radius + 70);
    }

    generateSuggestions(scores) {
        const suggestions = [];
        if (scores.knowledge < 60) {
            suggestions.push('建议加强廉洁知识学习，多参与廉洁诘问答题环节');
        }
        if (scores.intuition < 60) {
            suggestions.push('建议多玩廉腐配对记忆游戏，提升直觉反应速度');
        }
        if (scores.decision < 60) {
            suggestions.push('建议多体验情境决策模块，增强原则性判断');
        }
        if (scores.semantic < 60) {
            suggestions.push('建议多玩词义连连看，加深对廉洁词汇的理解');
        }
        if (scores.risk < 60) {
            suggestions.push('建议加强边界意识，在贪吃蛇游戏中注意避开风险区');
        }
        if (suggestions.length === 0) {
            suggestions.push('表现优秀！继续保持全面发展');
        }
        return suggestions;
    }
}

const pdfExporter = new PDFExporter();
