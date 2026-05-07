// 清莲引·成就系统
// 共24个成就，分为5大类

const ACHIEVEMENTS = {
    // 一、清廉坚守类（6个）
    清廉坚守: [
        {
            id: 'never_cross',
            name: '不蔓不枝',
            icon: '🪷',
            description: '零越界完成一局游戏',
            condition: (stats) => stats.crossCount === 0 && stats.gamesPlayed >= 1,
            rarity: 'legendary'
        },
        {
            id: 'integrity_guardian',
            name: '廉洁守护者',
            icon: '🛡️',
            description: '连续3局零越界',
            condition: (stats) => stats.consecutiveNoCross >= 3,
            rarity: 'epic'
        },
        {
            id: 'iron_will',
            name: '百折不挠',
            icon: '⚔️',
            description: '失败5次后仍坚持游戏',
            condition: (stats) => stats.totalGamesPlayed >= 5 && stats.wins > 0,
            rarity: 'rare'
        },
        {
            id: 'steadfast',
            name: '坚定立场',
            icon: '🏔️',
            description: '面对10次以上诱惑词未被吸引',
            condition: (stats) => stats.temptationResisted >= 10,
            rarity: 'epic'
        },
        {
            id: 'first_victory',
            name: '初战告捷',
            icon: '🎯',
            description: '首次赢得游戏',
            condition: (stats) => stats.wins >= 1,
            rarity: 'common'
        },
        {
            id: 'pure_heart',
            name: '纯洁心灵',
            icon: '💎',
            description: '廉洁值始终保持在80%以上',
            condition: (stats) => stats.highestIntegrity >= 80 && stats.gamesPlayed >= 1,
            rarity: 'rare'
        }
    ],

    // 二、智慧决策类（5个）
    智慧决策: [
        {
            id: 'risk_calculator',
            name: '风险精算师',
            icon: '📊',
            description: '风险评分从未超过30%',
            condition: (stats) => stats.maxRiskScore < 30 && stats.gamesPlayed >= 3,
            rarity: 'epic'
        },
        {
            id: 'balanced_path',
            name: '中庸之道',
            icon: '⚖️',
            description: '正负词摄入比例接近1:1',
            condition: (stats) => {
                const ratio = stats.positiveCollected / Math.max(1, stats.negativeCollected);
                return ratio >= 0.8 && ratio <= 1.2 && stats.totalWordsCollected >= 20;
            },
            rarity: 'rare'
        },
        {
            id: 'strategist',
            name: '战略家',
            icon: '🧠',
            description: '单局得分超过500分',
            condition: (stats) => stats.highestScore >= 500,
            rarity: 'rare'
        },
        {
            id: 'long_game',
            name: '持久战',
            icon: '⏰',
            description: '单局游戏时长超过5分钟',
            condition: (stats) => stats.maxGameDuration >= 300,
            rarity: 'common'
        },
        {
            id: 'calculated_gambler',
            name: '理性赌徒',
            icon: '🎰',
            description: '越界次数为0或1时获胜',
            condition: (stats) => stats.crossCount <= 1 && stats.gamesPlayed >= 1,
            rarity: 'rare'
        }
    ],

    // 三、莲境征服类（5个）
    莲境征服: [
        {
            id: 'lotus_heart',
            name: '初入莲境',
            icon: '🌸',
            description: '完成第一关莲心境',
            condition: (stats) => stats.maxLevelReached >= 1,
            rarity: 'common'
        },
        {
            id: 'lotus_bone',
            name: '再探莲骨',
            icon: '💮',
            description: '完成第二关莲骨境',
            condition: (stats) => stats.maxLevelReached >= 2,
            rarity: 'rare'
        },
        {
            id: 'lotus_bloom',
            name: '三境圆满',
            icon: '🏆',
            description: '完成全部三关',
            condition: (stats) => stats.maxLevelReached >= 3,
            rarity: 'legendary'
        },
        {
            id: 'speed_runner',
            name: '速通达人',
            icon: '⚡',
            description: '3分钟内完成任意一关',
            condition: (stats) => stats.fastestLevelTime <= 180,
            rarity: 'epic'
        },
        {
            id: 'level_master',
            name: '关卡大师',
            icon: '👑',
            description: '以满分廉洁值通过所有关卡',
            condition: (stats) => stats.perfectLevels >= 3,
            rarity: 'legendary'
        }
    ],

    // 四、贪婪抵抗类（4个）
    贪婪抵抗: [
        {
            id: 'rare_collector',
            name: '可远观焉',
            icon: '✨',
            description: '收集3个以上稀有词',
            condition: (stats) => stats.rareCollected >= 3,
            rarity: 'rare'
        },
        {
            id: 'money绝缘体',
            name: '金钱绝缘体',
            icon: '🚫',
            description: '从未触碰红色诱惑词',
            condition: (stats) => stats.temptationsHit === 0 && stats.gamesPlayed >= 1,
            rarity: 'epic'
        },
        {
            id: 'temptation_resist',
            name: '威武不屈',
            icon: '🦾',
            description: '抵抗诱惑词超过20次',
            condition: (stats) => stats.temptationResisted >= 20,
            rarity: 'rare'
        },
        {
            id: 'desire_conqueror',
            name: '欲望征服者',
            icon: '🔥',
            description: '连续10局未触碰诱惑词',
            condition: (stats) => stats.consecutiveTemptationResist >= 10,
            rarity: 'epic'
        }
    ],

    // 五、数据大师类（4个）
    数据大师: [
        {
            id: 'word_master',
            name: '词汇大师',
            icon: '📚',
            description: '收集超过100个词汇',
            condition: (stats) => stats.totalWordsCollected >= 100,
            rarity: 'epic'
        },
        {
            id: 'accumulation',
            name: '积少成多',
            icon: '📈',
            description: '累计得分超过2000分',
            condition: (stats) => stats.totalScore >= 2000,
            rarity: 'rare'
        },
        {
            id: 'played_enough',
            name: '持之以恒',
            icon: '🎮',
            description: '游戏次数超过20次',
            condition: (stats) => stats.totalGamesPlayed >= 20,
            rarity: 'common'
        },
        {
            id: 'cross_legend',
            name: '越界传说',
            icon: '📉',
            description: '累计越界次数超过50次（徽章会变色）',
            condition: (stats) => stats.totalCrossCount >= 50,
            rarity: 'common'
        }
    ]
};

// 稀有度配置
const RARITY_CONFIG = {
    common: { color: '#9ca3af', glow: 'rgba(156, 163, 175, 0.3)', name: '普通' },
    rare: { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)', name: '稀有' },
    epic: { color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.5)', name: '史诗' },
    legendary: { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)', name: '传说' }
};

// 获取所有成就
function getAllAchievements() {
    const achievements = [];
    for (const category in ACHIEVEMENTS) {
        ACHIEVEMENTS[category].forEach(achievement => {
            achievements.push({
                ...achievement,
                category: category
            });
        });
    }
    return achievements;
}

// 获取成就总数
function getTotalAchievements() {
    let count = 0;
    for (const category in ACHIEVEMENTS) {
        count += ACHIEVEMENTS[category].length;
    }
    return count;
}

// 获取某类别的成就
function getAchievementsByCategory(category) {
    return ACHIEVEMENTS[category] || [];
}

// 获取成就的稀有度配置
function getRarityConfig(rarity) {
    return RARITY_CONFIG[rarity] || RARITY_CONFIG.common;
}

// 检查成就是否解锁
function isAchievementUnlocked(achievementId, unlockedAchievements) {
    return unlockedAchievements.includes(achievementId);
}

// 获取未解锁成就
function getLockedAchievements(unlockedAchievements) {
    const all = getAllAchievements();
    return all.filter(a => !isAchievementUnlocked(a.id, unlockedAchievements));
}

// 获取已解锁成就
function getUnlockedAchievementsList(unlockedAchievements) {
    const all = getAllAchievements();
    return all.filter(a => isAchievementUnlocked(a.id, unlockedAchievements));
}

// 检查所有成就的解锁状态
function checkAchievements(stats) {
    const newlyUnlocked = [];
    const all = getAllAchievements();
    
    for (const achievement of all) {
        // 如果已经解锁，跳过
        if (stats.unlockedAchievements.includes(achievement.id)) {
            continue;
        }
        
        // 检查是否满足解锁条件
        if (achievement.condition(stats)) {
            newlyUnlocked.push(achievement);
        }
    }
    
    return newlyUnlocked;
}

// 解锁成就
function unlockAchievement(achievement, archives) {
    if (!archives.achievements.includes(achievement.id)) {
        archives.achievements.push(achievement.id);
        return true; // 新解锁
    }
    return false; // 已存在
}

// 生成成就提示HTML
function generateAchievementHTML(achievement, isUnlocked) {
    const config = getRarityConfig(achievement.rarity);
    const unlockedStyle = isUnlocked ? '' : 'opacity: 0.4; filter: grayscale(100%);';
    
    return `
        <div class="achievement-item ${achievement.rarity}" style="${unlockedStyle}">
            <div class="achievement-icon" style="box-shadow: 0 0 ${isUnlocked ? '15px' : '0'} ${config.glow};">
                ${achievement.icon}
            </div>
            <div class="achievement-info">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
                <div class="achievement-rarity" style="color: ${config.color};">${config.name}</div>
            </div>
        </div>
    `;
}

// 生成成就展示HTML
function generateAchievementsDisplayHTML(unlockedAchievements) {
    let html = '<div class="achievements-container">';
    
    for (const category in ACHIEVEMENTS) {
        html += `<div class="achievement-category">`;
        html += `<h3>${category}</h3>`;
        html += `<div class="achievement-grid">`;
        
        ACHIEVEMENTS[category].forEach(achievement => {
            const isUnlocked = isAchievementUnlocked(achievement.id, unlockedAchievements);
            html += generateAchievementHTML(achievement, isUnlocked);
        });
        
        html += '</div></div>';
    }
    
    html += '</div>';
    return html;
}

// 统计已解锁成就数
function countUnlockedAchievements(unlockedAchievements) {
    return unlockedAchievements.length;
}

// 获取成就解锁进度
function getAchievementProgress(unlockedAchievements) {
    const total = getTotalAchievements();
    const unlocked = countUnlockedAchievements(unlockedAchievements);
    return {
        unlocked: unlocked,
        total: total,
        percentage: Math.round((unlocked / total) * 100)
    };
}

// 导出所有数据
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ACHIEVEMENTS,
        RARITY_CONFIG,
        getAllAchievements,
        getTotalAchievements,
        getAchievementsByCategory,
        getRarityConfig,
        isAchievementUnlocked,
        getLockedAchievements,
        getUnlockedAchievementsList,
        checkAchievements,
        unlockAchievement,
        generateAchievementHTML,
        generateAchievementsDisplayHTML,
        countUnlockedAchievements,
        getAchievementProgress
    };
}
