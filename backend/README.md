# 🪷 清莲引·机器学习系统说明

## 📋 系统概述

清莲引项目现已集成完整的机器学习系统，包括：
- 真实训练的逻辑回归模型
- K-Means行为聚类
- 实时风险评估
- 个性化建议生成

---

## 🚀 快速开始

### 1. 安装Python依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 训练机器学习模型（可选）

```bash
cd backend/models
python integrity_ml_trainer.py
```

这将：
- 生成1000条模拟玩家行为数据
- 训练逻辑回归、随机森林、朴素贝叶斯模型
- 训练K-Means聚类模型
- 保存模型到 `../ml/` 目录
- 打印模型评估结果和特征重要性

### 3. 启动ML推理API服务器

```bash
cd backend
python ml_api_server.py
```

服务器将在 `http://localhost:5000` 启动

### 4. 启动游戏服务器

```bash
cd ..
npm start
```

游戏将运行在 `http://localhost:3000`

---

## 📊 API端点

### 健康检查
```
GET /api/health
```

响应：
```json
{
  "status": "ok",
  "timestamp": "2025-05-01T10:00:00",
  "models_loaded": true
}
```

### 廉洁风险评估
```
POST /api/ml/risk-assessment
```

请求体：
```json
{
  "cross_count": 2,
  "negative_ratio": 0.3,
  "right_side_ratio": 0.4,
  "temptation_resisted": 5,
  "rare_collected": 3
}
```

响应：
```json
{
  "success": true,
  "data": {
    "risk_score": 65.5,
    "risk_level": "medium",
    "behavior_pattern": "边缘游走型",
    "confidence": 89.2,
    "risk_factors": [...],
    "advice": [...],
    "timestamp": "2025-05-01T10:00:00"
  }
}
```

### 行为模式分析
```
POST /api/ml/behavior-analysis
```

请求体：
```json
{
  "game_history": [
    {"cross_count": 1, "negative_ratio": 0.3, "right_side_ratio": 0.4},
    {"cross_count": 0, "negative_ratio": 0.1, "right_side_ratio": 0.2}
  ]
}
```

响应：
```json
{
  "success": true,
  "data": {
    "pattern": "莲心稳固型",
    "trend": "improving",
    "trend_text": "您的越界行为正在减少，继续保持！",
    "statistics": {
      "avg_cross": 0.5,
      "avg_negative_ratio": 20.0,
      "games_analyzed": 2
    }
  }
}
```

### 游戏策略建议
```
POST /api/ml/game-advice
```

请求体：
```json
{
  "current_state": {
    "risk_score": 65,
    "level": 2,
    "rare_collected": 2
  }
}
```

响应：
```json
{
  "success": true,
  "data": {
    "advices": [
      {
        "priority": "high",
        "icon": "🛑",
        "title": "立即撤离危险区",
        "content": "您目前处于高风险状态..."
      }
    ]
  }
}
```

---

## 🎮 前端集成

### ML客户端使用

```javascript
// 获取ML客户端实例
const mlClient = window.MLClient;

// 检查连接状态
console.log('ML API连接:', mlClient.isConnected());

// 进行风险评估
const riskResult = await mlClient.assessRisk({
  crossCount: 2,
  negativeRatio: 0.3,
  rightSideRatio: 0.4,
  temptationResisted: 5,
  rareCollected: 3
});

console.log('风险评分:', riskResult.riskScore);
console.log('行为模式:', riskResult.behaviorPattern);

// 创建实时追踪器
const tracker = mlClient.createRealtimeRiskTracker(gameInstance);
tracker.startTracking(3000); // 每3秒更新
```

### AI导师使用

```javascript
// 初始化AI导师
EnhancedAIMentor.init();

// 启动AI导师
EnhancedAIMentor.start(gameInstance);

// 处理游戏事件
EnhancedAIMentor.onGameEvent('crossLine', gameInstance);

// 获取对话回复
const response = await EnhancedAIMentor.chat('我现在的风险如何？');
console.log(response.text);
```

---

## 🤖 模型说明

### 逻辑回归模型

**用途**：廉洁风险评分预测

**特征**：
- 越界次数（权重0.45）
- 负面词比例（权重0.25）
- 右侧停留时间（权重0.20）
- 抵抗诱惑次数（权重0.10）

**输出**：0-100的风险评分

### K-Means聚类

**用途**：玩家行为模式分类

**聚类中心**：
1. **莲心稳固型**：越界少，右侧时间短
2. **边缘游走型**：中等越界和右侧时间
3. **边界试探型**：越界多，右侧时间长

### 随机森林模型

**用途**：风险等级分类（低/中/高）

**输出**：风险等级和置信度

---

## 🔧 备用机制

当ML API服务器不可用时：

1. **前端自动降级**：使用 `ml-client.js` 中的本地备用计算
2. **固定公式**：基于规则的风险评分
3. **本地建议生成**：预设的建议模板

无需担心服务中断，游戏仍可正常运行！

---

## 📁 文件结构

```
backend/
├── ml_api_server.py          # ML推理API服务器
├── requirements.txt          # Python依赖
└── models/
    └── integrity_ml_trainer.py  # 模型训练脚本

ml/
├── trained_models.pkl        # 训练好的模型（二进制）
└── model_weights.json        # 模型权重（JSON格式）

js/
├── ml-client.js              # ML客户端
└── enhanced-ai-mentor.js     # 增强AI导师
```

---

## ⚙️ 配置

### 修改API地址

如果ML API服务器不在本地，修改 `js/ml-client.js` 中的：

```javascript
const CONFIG = {
    API_URL: 'http://your-server:5000',  // 修改这里
    TIMEOUT: 10000,
    RETRY_TIMES: 3
};
```

### 调整更新频率

```javascript
// 实时追踪器默认3秒更新一次
const tracker = mlClient.createRealtimeRiskTracker(gameInstance);
tracker.startTracking(5000);  // 改为5秒
```

---

## 🎯 答辩亮点

1. **真实的机器学习**：不是固定公式，而是真实训练的模型
2. **多模型集成**：逻辑回归+随机森林+K-Means
3. **实时推理**：游戏过程中实时风险评估
4. **个性化建议**：基于玩家行为数据的定制建议
5. **优雅降级**：API不可用时自动切换到本地计算

---

## ❓ 常见问题

**Q: ML API必须启动吗？**
A: 不必须。前端有本地备用计算，API不可用时游戏仍可正常运行。

**Q: 需要GPU吗？**
A: 不需要。使用CPU推理，速度很快。

**Q: 如何更新模型？**
A: 重新运行 `python integrity_ml_trainer.py` 即可更新模型。

---

*🪷 码上廉洁 · 数"智"清风*
