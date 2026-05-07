const ARCHIVE_KEY = 'qinglianyin_archives';

const DEFAULT_ARCHIVES = {
    highestScore: 0,
    totalGamesPlayed: 0,
    totalCrossCount: 0,
    achievements: [],
    recentGames: [],
    riskProfile: {
        avgCross: 0,
        avgIntegrity: 100,
        pattern: '未知'
    }
};

const ACHIEVEMENTS = {
    '不蔓不枝': { desc: '零越界完成一局', icon: '🪷' },
    '可远观': { desc: '收集3个以上稀有词', icon: '✨' },
    '莲心稳固': { desc: '连续3局平均越界<0.5次', icon: '💎' },
    '边缘行者': { desc: '越界2次内获得胜利', icon: '⚡' },
    '绝地逢生': { desc: '廉洁值<20%时获得胜利', icon: '🔥' },
    '初入莲境': { desc: '完成第一关', icon: '🌸' },
    '再探莲骨': { desc: '完成第二关', icon: '💮' },
    '莲叶田田': { desc: '完成第三关', icon: '🌿' },
    '莲茎挺拔': { desc: '完成第四关', icon: '🌱' },
    '五境圆满': { desc: '完成全部五关', icon: '🏆' }
};

function loadArchives() {
    try {
        const raw = localStorage.getItem(ARCHIVE_KEY);
        if (!raw) return { ...DEFAULT_ARCHIVES };
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_ARCHIVES, ...parsed };
    } catch {
        return { ...DEFAULT_ARCHIVES };
    }
}

function saveArchives(archives) {
    try {
        localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archives));
    } catch (e) {
        console.error('保存档案失败:', e);
    }
}

function updateArchiveAfterGame(gameData) {
    const arch = loadArchives();
    
    arch.totalGamesPlayed++;
    arch.highestScore = Math.max(arch.highestScore, gameData.score);
    arch.totalCrossCount += gameData.crossCount;
    
    // 成就检测
    const newAchievements = [];
    if (gameData.crossCount === 0 && gameData.result === '胜利') {
        if (!arch.achievements.includes('不蔓不枝')) newAchievements.push('不蔓不枝');
    }
    if (gameData.rareCollected >= 3) {
        if (!arch.achievements.includes('可远观')) newAchievements.push('可远观');
    }
    if (gameData.level >= 1 && gameData.result === '胜利') {
        if (!arch.achievements.includes('初入莲境')) newAchievements.push('初入莲境');
    }
    if (gameData.level >= 2 && gameData.result === '胜利') {
        if (!arch.achievements.includes('再探莲骨')) newAchievements.push('再探莲骨');
    }
    if (gameData.level >= 3 && gameData.result === '胜利') {
        if (!arch.achievements.includes('莲叶田田')) newAchievements.push('莲叶田田');
    }
    if (gameData.level >= 4 && gameData.result === '胜利') {
        if (!arch.achievements.includes('莲茎挺拔')) newAchievements.push('莲茎挺拔');
    }
    if (gameData.level >= 5 && gameData.result === '胜利') {
        if (!arch.achievements.includes('五境圆满')) newAchievements.push('五境圆满');
    }
    if (gameData.crossCount <= 2 && gameData.result === '胜利') {
        if (!arch.achievements.includes('边缘行者')) newAchievements.push('边缘行者');
    }
    if (gameData.integrityValue < 20 && gameData.result === '胜利') {
        if (!arch.achievements.includes('绝地逢生')) newAchievements.push('绝地逢生');
    }
    
    arch.achievements = [...new Set([...arch.achievements, ...newAchievements])];
    
    // 记录本次游戏
    arch.recentGames.unshift({
        date: new Date().toLocaleString('zh-CN'),
        score: gameData.score,
        cross: gameData.crossCount,
        level: gameData.level,
        result: gameData.result,
        risk: gameData.riskScore
    });
    if (arch.recentGames.length > 10) arch.recentGames.pop();
    
    // 更新长期画像
    const totalGames = arch.totalGamesPlayed;
    arch.riskProfile.avgCross = arch.totalCrossCount / totalGames;
    
    let avgIntegrity = 0;
    let integrityCount = 0;
    arch.recentGames.forEach(g => {
        if (gameData.integrityValue !== undefined) {
            avgIntegrity += gameData.integrityValue;
            integrityCount++;
        }
    });
    if (integrityCount > 0) {
        arch.riskProfile.avgIntegrity = avgIntegrity / integrityCount;
    }
    
    // 模式推断
    if (arch.riskProfile.avgCross > 1.5) {
        arch.riskProfile.pattern = '边界试探型';
    } else if (arch.riskProfile.avgCross > 0.5) {
        arch.riskProfile.pattern = '边缘游走型';
    } else {
        arch.riskProfile.pattern = '莲心稳固型';
    }
    
    // 检测莲心稳固成就
    if (arch.recentGames.length >= 3) {
        const recentCrosses = arch.recentGames.slice(0, 3).map(g => g.cross);
        const avgRecent = recentCrosses.reduce((a, b) => a + b, 0) / 3;
        if (avgRecent < 0.5 && !arch.achievements.includes('莲心稳固')) {
            arch.achievements.push('莲心稳固');
        }
    }
    
    saveArchives(arch);
    
    return { archives: arch, newAchievements };
}

function renderArchives() {
    const arch = loadArchives();
    
    // 更新统计数据
    const statsEl = document.getElementById('archiveStats');
    if (statsEl) {
        statsEl.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${arch.highestScore}</div>
                <div class="stat-label">最高分数</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${arch.totalGamesPlayed}</div>
                <div class="stat-label">总游玩次数</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${arch.totalCrossCount}</div>
                <div class="stat-label">累计越界</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${arch.achievements.length}</div>
                <div class="stat-label">已获成就</div>
            </div>
        `;
    }
    
    // 更新成就徽章
    const achievementsEl = document.getElementById('archiveAchievements');
    if (achievementsEl) {
        achievementsEl.innerHTML = arch.achievements.map(name => {
            const ach = ACHIEVEMENTS[name] || { icon: '⭐', desc: name };
            return `
                <div class="achievement-badge">
                    <span class="achievement-icon">${ach.icon}</span>
                    <div class="achievement-name">${name}</div>
                    <div class="achievement-desc">${ach.desc}</div>
                </div>
            `;
        }).join('') || '<div class="no-achievements">暂无成就，继续努力！</div>';
    }
    
    // 更新风险画像
    const riskEl = document.getElementById('archiveRisk');
    if (riskEl) {
        riskEl.innerHTML = `
            <div class="risk-pattern">
                <span class="risk-label">你的类型：</span>
                <span class="risk-name">${arch.riskProfile.pattern}</span>
            </div>
            <div class="risk-stats">
                <p>平均越界 <strong>${arch.riskProfile.avgCross.toFixed(1)}</strong> 次/局</p>
                <p>平均廉洁值 <strong>${Math.round(arch.riskProfile.avgIntegrity)}%</strong></p>
            </div>
            <div class="risk-comment">
                ${getRiskComment(arch.riskProfile.pattern)}
            </div>
        `;
    }
    
    // 更新近期游戏记录
    const recentEl = document.getElementById('archiveRecent');
    if (recentEl) {
        if (arch.recentGames.length === 0) {
            recentEl.innerHTML = '<tr><td colspan="5" class="empty-table">还没有游戏记录</td></tr>';
        } else {
            recentEl.innerHTML = arch.recentGames.map(game => `
                <tr class="${game.result.includes('越界') || game.result.includes('腐败') ? 'danger-row' : ''}">
                    <td>${game.date}</td>
                    <td>${game.score}</td>
                    <td>${game.cross}</td>
                    <td>${['莲心', '莲骨', '莲叶', '莲茎', '莲华'][game.level - 1] || '莲心'}</td>
                    <td>${game.result}</td>
                </tr>
            `).join('');
        }
    }
}

function getRiskComment(pattern) {
    switch (pattern) {
        case '莲心稳固型':
            return '✨ 定力超群！你如莲花般中通外直，不蔓不枝，内心的红线坚不可摧。';
        case '边缘游走型':
            return '⚠️ 偶尔试探边界，但整体可控。记住：一念之差，可能越陷越深。';
        case '边界试探型':
            return '🚨 需要警惕！你频繁挑战底线，如履薄冰，需时刻警醒。';
        default:
            return '还需要更多数据来分析你的模式，继续游戏吧！';
    }
}

// 导出
window.CleanGameArchives = {
    loadArchives,
    saveArchives,
    updateArchiveAfterGame,
    renderArchives,
    ACHIEVEMENTS
};
