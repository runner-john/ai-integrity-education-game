const express = require('express');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 豆包AI Python后端地址
const DOUBAO_BACKEND_URL = 'http://localhost:5001';

const promptTemplates = {
  integrityZero: `作为廉洁教育导师，请为以下情况生成300字以内的评语：
- 廉洁值归零，信仰失守
- 累积负面词：{negativeWords}
- 曾收集廉洁词：{collectedWords}

要求：
1. 以"廉者，政之本也"开篇
2. 将廉洁值比作内心一盏灯
3. 负面词汇是一次次吹来的阴风
4. 引用"粉身碎骨浑不怕，要留清白在人间"
5. 最后点出"游戏可重来，人生无重至"`,

  fail: `作为廉洁教育导师，请为以下游戏结局生成评语（300字以内）：
- 结束原因：{endReason}
- 得分：{score}
- 越界次数：{crossCount}
- 收集廉洁词：{collectedWords}
- 吃到负面词：{negativeWords}

要求：
1. 用"红线"作为核心隐喻
2. 将收集的廉洁词比作曾经的坚守
3. 将负面词比作腐化过程
4. 引用一句经典
5. 以严厉但饱含希望的语调结尾，劝人"重新开始，守住边界"`,

  win: `作为廉洁教育导师，请为通关玩家生成赞美评语（300字以内）：
- 集满8个廉洁词：{collectedWords}
- 得分：{score}
- 成功解锁莲花特效

要求：
1. 赞美玩家守住底线
2. 将收集的廉洁词比作一道道防线
3. 引用周敦颐《爱莲说》
4. 鼓励玩家在人生中继续做"清风代码"的书写者`
};

const defaultComments = {
  integrityZero: [
    '廉者，政之本也。廉洁值如内心一盏灯，负面词汇是一次次吹来的阴风。游戏可重来，人生无重至！',
    '粉身碎骨浑不怕，要留清白在人间。愿您以此为戒，廉洁修身，重新开始！',
    '廉者，政之本也。希望这次游戏能让您更深刻理解廉洁的重要性！'
  ],
  fail: [
    '红线不可逾越，纪律底线不可触碰。愿您迷途知返，重新开始！',
    '您曾收集了一些廉洁词，说明您心中有坚守。希望这次教训能让您更坚定！',
    '《论语》云："过则勿惮改。"及时反省，迷途知返，善莫大焉！'
  ],
  win: [
    '恭喜通关！出淤泥而不染，濯清涟而不妖。您用实际行动诠释了什么是真正的廉洁！',
    '太棒了！您集满了8个廉洁词，解锁了莲花特效。这是对您坚守底线的最好奖赏！',
    '恭喜！正如《爱莲说》所赞："出淤泥而不染，濯清涟而不妖。"愿您在人生路上也能坚守本心！'
  ]
};

const defaultReplies = [
  '《论语》云："君子喻于义，小人喻于利。"愿君坚守道义，淡泊名利。',
  '正如《爱莲说》所赞："出淤泥而不染，濯清涟而不妖。"坚守本心，方得始终。',
  '《道德经》曰："知足不辱，知止不殆，可以长久。"廉洁修身，贵在知足。',
  '《官箴》有言："当官之法，惟有三事：曰清、曰慎、曰勤。"愿君以此自勉。',
  '《周易》云："天行健，君子以自强不息；地势坤，君子以厚德载物。"廉洁之路，砥砺前行。',
  '记住：红线不可逾越，纪律底线不可触碰！游戏中的教训，希望能让您更明白人生的边界！',
  '很遗憾AI导师暂时无法回复，但请记住：廉洁修身，是一生的修行！'
];

async function callPythonBackend(endpoint, data) {
  try {
    const response = await fetch(`${DOUBAO_BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    return await response.json();
  } catch (error) {
    console.error('调用Python后端失败:', error);
    return { success: false, error: String(error) };
  }
}

app.post('/api/ai-comment', async (req, res) => {
  const gameData = req.body;
  const { gameWon, integrityZero } = gameData;

  try {
    let prompt = '';
    
    if (gameWon) {
      prompt = promptTemplates.win
        .replace('{collectedWords}', gameData.collectedWords.join('、'))
        .replace('{score}', gameData.score);
    } else if (integrityZero) {
      prompt = promptTemplates.integrityZero
        .replace('{negativeWords}', (gameData.negativeWords || []).join('、'))
        .replace('{collectedWords}', (gameData.collectedWords || []).join('、'));
    } else {
      prompt = promptTemplates.fail
        .replace('{endReason}', gameData.endReason || '')
        .replace('{score}', gameData.score)
        .replace('{crossCount}', gameData.crossCount || 0)
        .replace('{collectedWords}', (gameData.collectedWords || []).join('、'))
        .replace('{negativeWords}', (gameData.negativeWords || []).join('、'));
    }

    console.log('===== 调用豆包AI Python后端 =====');
    console.log('Prompt:', prompt);
    
    const result = await callPythonBackend('/api/ai-comment', { prompt });
    
    if (result.success) {
      console.log('===== 豆包AI 评语 =====');
      console.log(result.comment);
      return res.status(200).json({ comment: result.comment });
    } else {
      throw new Error(result.error || 'Python后端调用失败');
    }
  } catch (error) {
    console.error('API调用失败:', error);
  }

  const comments = gameWon ? defaultComments.win : 
                    integrityZero ? defaultComments.integrityZero : 
                    defaultComments.fail;
  res.status(200).json({ comment: comments[Math.floor(Math.random() * comments.length)] });
});

app.post('/api/chat', async (req, res) => {
  const { message, gameData } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: '缺少message参数' });
  }

  try {
    const systemPrompt = `你是一位饱读诗书、睿智深刻的廉洁教育导师，来自"时光照相馆·清风书院"。你擅长用典故、寓言和算法隐喻来解读人的选择。

玩家游戏数据：
- 得分：${gameData?.score || 0}
- 越界次数：${gameData?.crossCount || 0}
- 收集廉洁词：${(gameData?.collectedWords || []).join('、')}
- 负面词：${(gameData?.negativeWords || []).join('、')}
- 地图大小：${gameData?.mapSize || '标准'}
- 廉洁值：${gameData?.integrityValue || 100}%

请用亲切而深邃的语气回答玩家，时刻将"红线"、"边界"、"贪吃蛇"、"代码"这些元素融入对话。`;

    console.log('===== 调用豆包AI Python后端 =====');
    console.log('System:', systemPrompt);
    console.log('User:', message);

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    const result = await callPythonBackend('/api/chat', { messages });
    
    if (result.success) {
      console.log('===== AI回复 =====');
      console.log(result.content);
      return res.status(200).json({
        response: result.content,
        apiCall: {
          provider: '火山引擎豆包AI (Python后端)',
          model: 'Doubao-Seed-2.0-lite',
          status: 200,
          timestamp: new Date().toISOString(),
          requestId: 'N/A',
          usage: null
        }
      });
    } else {
      throw new Error(result.error || 'Python后端调用失败');
    }
  } catch (error) {
    console.error('API调用失败:', error);
    
    res.status(200).json({
      response: defaultReplies[Math.floor(Math.random() * defaultReplies.length)],
      apiCall: {
        provider: '火山引擎豆包AI',
        model: 'Doubao-Seed-2.0-lite',
        status: 429,
        timestamp: new Date().toISOString(),
        requestId: 'N/A',
        usage: null,
        message: 'API调用失败，使用本地回复'
      }
    });
    return;
  }
});

app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`Frontend Server: http://localhost:${PORT}`);
  console.log(`Doubao AI Backend: http://localhost:5001`);
  console.log('='.repeat(60));
  console.log('Make sure Doubao AI Python backend is running!');
  console.log('='.repeat(60));
});