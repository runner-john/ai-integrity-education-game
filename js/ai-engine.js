const AIEngine = (function() {
    const { AC_KEYWORDS, calculateCosineSimilarity, getTFIDFVector } = CleanGameUtils;

    class ACAutomaton {
        constructor() {
            this.root = { children: {}, isEnd: false, value: null };
        }

        insert(keyword, value) {
            let node = this.root;
            for (const char of keyword) {
                if (!node.children[char]) {
                    node.children[char] = { children: {}, isEnd: false, value: null };
                }
                node = node.children[char];
            }
            node.isEnd = true;
            node.value = value;
        }

        search(text) {
            const results = new Set();
            for (let i = 0; i < text.length; i++) {
                let node = this.root;
                for (let j = i; j < text.length; j++) {
                    const char = text[j];
                    if (!node.children[char]) break;
                    node = node.children[char];
                    if (node.isEnd) {
                        results.add(node.value);
                    }
                }
            }
            return Array.from(results);
        }
    }

    class Engine {
        constructor() {
            this.acAutomaton = new ACAutomaton();
            this.initACAutomaton();
            this.historyData = this.loadHistoryData();
            this.documentFrequency = this.buildDocumentFrequency();
            this.systemPrompt = `你是一位饱读诗书、睿智深刻的廉洁教育导师，来自"时光照相馆·清风书院"。你擅长用典故、寓言和算法隐喻来解读人的选择。你的语言风格优雅、有力，能直击人心。在生成评语时，必须紧密围绕玩家在"贪吃蛇·边界与选择"游戏中的具体行为，借"红线""边界""贪吃蛇"等元素进行教育。`;
        }

        initACAutomaton() {
            for (const [keyword, response] of Object.entries(AC_KEYWORDS)) {
                this.acAutomaton.insert(keyword, response);
            }
        }

        loadHistoryData() {
            try {
                const stored = localStorage.getItem('cleanGameHistory');
                return stored ? JSON.parse(stored) : [];
            } catch {
                return [];
            }
        }

        saveToHistory(input, response) {
            this.historyData.push({ input, response, timestamp: Date.now() });
            if (this.historyData.length > 100) {
                this.historyData = this.historyData.slice(-100);
            }
            localStorage.setItem('cleanGameHistory', JSON.stringify(this.historyData));
            this.documentFrequency = this.buildDocumentFrequency();
        }

        buildDocumentFrequency() {
            const df = {};
            for (const item of this.historyData) {
                const words = new Set(item.input.toLowerCase().split(/\s+/));
                for (const word of words) {
                    df[word] = (df[word] || 0) + 1;
                }
            }
            return df;
        }

        async query(input, gameData = null) {
            const level1Result = this.level1ACMatch(input);
            if (level1Result.length > 0) {
                const response = level1Result[Math.floor(Math.random() * level1Result.length)];
                this.saveToHistory(input, response);
                return { response, level: 1, source: 'AC自动机' };
            }

            const level2Result = this.level2TFIDFMatch(input);
            if (level2Result) {
                this.saveToHistory(input, level2Result);
                return { response: level2Result, level: 2, source: 'TF-IDF匹配' };
            }

            const level3Result = await this.level3APICall(input, gameData);
            if (level3Result) {
                this.saveToHistory(input, level3Result);
                return { response: level3Result, level: 3, source: 'AI大模型' };
            }

            return { 
                response: '感谢您的提问。廉洁修身，久久为功。', 
                level: 0, 
                source: '默认回复' 
            };
        }

        level1ACMatch(input) {
            return this.acAutomaton.search(input);
        }

        level2TFIDFMatch(input) {
            if (this.historyData.length === 0) return null;

            const queryVector = getTFIDFVector(
                input, 
                this.documentFrequency, 
                this.historyData.length
            );

            let bestMatch = null;
            let highestSimilarity = 0;

            for (const item of this.historyData) {
                const docVector = getTFIDFVector(
                    item.input, 
                    this.documentFrequency, 
                    this.historyData.length
                );
                const similarity = calculateCosineSimilarity(queryVector, docVector);
                
                if (similarity > 0.35 && similarity > highestSimilarity) {
                    highestSimilarity = similarity;
                    bestMatch = item.response;
                }
            }

            return bestMatch;
        }

        async level3APICall(input, gameData = null) {
            try {
                const prompt = this.generateConsultationPrompt(input, gameData);

                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt })
                });

                if (response.ok) {
                    const data = await response.json();
                    return data.reply || '感谢您的提问，让我们共同坚守廉洁底线。';
                }
            } catch (error) {
                console.warn('API调用失败，使用本地回复');
            }

            return this.generateLocalResponse(input, gameData);
        }

        generateLocalResponse(input, gameData) {
            const responses = [
                '《周易》云："天行健，君子以自强不息；地势坤，君子以厚德载物。"廉洁修身，贵在坚持。',
                '正如《爱莲说》所赞："出淤泥而不染，濯清涟而不妖。"愿君如莲，坚守本心。',
                '《论语》有云："其身正，不令而行；其身不正，虽令不从。"为官者当以身作则。',
                '古人云："当官之法，惟有三事：曰清、曰慎、曰勤。"此三者，缺一不可。',
                '《道德经》曰："知足不辱，知止不殆，可以长久。"知足常乐，知止不贪。'
            ];

            if (gameData && gameData.boundaryCrossed) {
                return '《左传》云："人谁无过？过而能改，善莫大焉。"一次越界不可怕，重要的是吸取教训，重新出发。' + responses[Math.floor(Math.random() * responses.length)];
            }

            if (gameData && gameData.cleanWords.length > 3) {
                return '《大学》云："格物、致知、诚意、正心、修身、齐家、治国、平天下。"您已收集诸多廉洁词汇，愿知行合一。';
            }

            return responses[Math.floor(Math.random() * responses.length)];
        }

        generateAIPrompt(gameData) {
            const { 
                score, 
                crossCount, 
                collectedWords, 
                negativeWords, 
                endReason, 
                isWordCloudFull,
                mapSize,
                integrityZero 
            } = gameData;

            if (integrityZero) {
                return this.generateIntegrityZeroPrompt(gameData);
            }

            if (crossCount > 0) {
                return this.generateBoundaryCrossedPrompt(gameData);
            }

            return this.generateSafeEndPrompt(gameData);
        }

        generateBoundaryCrossedPrompt(gameData) {
            const { score, crossCount, collectedWords, negativeWords, mapSize } = gameData;
            
            let prompt = `${this.systemPrompt}

玩家在"边界与选择"廉洁主题游戏中因触碰【红线】而失败。
- 最终得分：${score}
- 越界次数：${crossCount}
- 收集到的廉洁词：${collectedWords.length > 0 ? collectedWords.join('、') : '无'}
- 吃到的负面词汇：${negativeWords.length > 0 ? negativeWords.join('、') : '无'}
- 地图大小：${mapSize || '中'}

他本已集齐了部分廉洁词，却依然抵挡不住红线另一侧的诱惑，最终蛇身崩解。

请你生成一段300字以内的评语，要求：
1. 用"红线"作为核心隐喻，直指纪律与底线的不可逾越性。
2. 将收集到的廉洁词作为他曾拥有的坚守，负面词汇作为腐蚀的过程，形成强烈对比。
3. 引用一句经典（如《周易》《增广贤文》或古代廉吏名言）并自然融入。
4. 结尾以严厉但饱含希望的语调，劝其"重新开始，守住边界"。`;

            return prompt;
        }

        generateSafeEndPrompt(gameData) {
            const { score, collectedWords, negativeWords, endReason, isWordCloudFull, mapSize } = gameData;
            
            let prompt = `${this.systemPrompt}

玩家在"边界与选择"廉洁主题游戏中安全结束（未触碰红线），但因${endReason}而终止。
- 最终得分：${score}
- 收集到的廉洁词：${collectedWords.length > 0 ? collectedWords.join('、') : '无'}
- 是否集满词云：${isWordCloudFull ? '是' : '否'}
- 吃到的负面词汇：${negativeWords.length > 0 ? negativeWords.join('、') : '无'}
- 地图大小：${mapSize || '中'}

他始终没有越过那道红色虚线，但却因${endReason}停下了脚步。

请你生成一段300字以内的评语，要求：
1. 肯定其守住红线的定力，将收集到的廉洁词比作内心的一道道防线。
2. 针对${endReason}进行哲理延伸：如"撞墙"喻示规则不可违，"自噬"喻示欲望的自我反噬，"负面词汇"是路上的陷阱但未被击倒。
3. 若词云已满，特别祝贺并引用周敦颐《爱莲说》中与莲花相关的品质。
4. 用温润、鼓舞的语气，鼓励他在人生中继续做"清风代码"的书写者。`;

            return prompt;
        }

        generateIntegrityZeroPrompt(gameData) {
            const { score, negativeWords, collectedWords } = gameData;
            
            let prompt = `${this.systemPrompt}

玩家在游戏中"廉洁值"归零，信仰失守。
- 得分：${score}
- 累积触及负面词汇：${negativeWords.length > 0 ? negativeWords.join('、') : '无'} 的次数过多
- 曾收集廉洁词：${collectedWords.length > 0 ? collectedWords.join('、') : '无'} 但未能坚守

请用300字以内，以"廉者，政之本也"开篇，将廉洁值比作内心的一盏灯，负面词汇是一次次吹来的阴风，最终灯灭。引用于谦"粉身碎骨浑不怕，要留清白在人间"或类似诗句，对其进行灵魂拷问，并点出"游戏可重来，人生无重至"。`;

            return prompt;
        }

        generateConsultationPrompt(userMessage, gameData) {
            const gameDataStr = gameData ? JSON.stringify({
                得分: gameData.score,
                越界次数: gameData.crossCount,
                收集词: gameData.collectedWords,
                地图大小: gameData.mapSize || '中'
            }) : '暂无游戏数据';

            return `${this.systemPrompt}

系统：你是一名廉洁导师，正在与刚玩完"贪吃蛇·边界与选择"游戏的玩家对话。玩家的游戏数据如下：${gameDataStr}。请用亲切而深邃的语气回答玩家的问题。必须时刻将"红线""边界""贪吃蛇""代码"这些元素融入对话，鼓励玩家分享感悟。

玩家：${userMessage}`;
        }

        async generateGameComment(gameData) {
            const prompt = this.generateAIPrompt(gameData);

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt })
                });

                if (response.ok) {
                    const data = await response.json();
                    return data.reply;
                }
            } catch (error) {
                console.warn('API调用失败，使用本地评语');
            }

            return this.generateLocalComment(gameData);
        }

        generateLocalComment(gameData) {
            const { score, crossCount, collectedWords, negativeWords, endReason, isWordCloudFull, integrityZero } = gameData;

            if (integrityZero) {
                return `廉者，政之本也。您内心的廉洁之灯，被${negativeWords.length > 0 ? negativeWords.join('、') : '贪欲'}的阴风一次次吹袭，终至熄灭。于谦有诗云："粉身碎骨浑不怕，要留清白在人间。"您曾拥有${collectedWords.length > 0 ? collectedWords.join('、') : '廉洁信念'}，却未能坚守。游戏可重来，人生无重至。愿您以此为戒，重新点亮心中的那盏灯。`;
            }

            if (crossCount > 0) {
                return `《左传》有言："人谁无过？过而能改，善莫大焉。"游戏中您曾越过红线${crossCount}次，正如人生之路，诱惑常在。您曾收集${collectedWords.length > 0 ? collectedWords.join('、') : '廉洁信念'}，却被${negativeWords.length > 0 ? negativeWords.join('、') : '贪念'}所动摇。《论语》云："过则勿惮改。"愿以此为戒，坚守本心，方能行稳致远。重新开始，守住边界！`;
            }

            if (isWordCloudFull) {
                return `《爱莲说》赞曰："出淤泥而不染，濯清涟而不妖。"您在游戏中始终严守红线，集满廉洁词云，如莲花般出尘不染。您收集了${collectedWords.join('、')}，每一词都是内心的防线。正如《官箴》所云："当官之法，惟有三事：曰清、曰慎、曰勤。"愿君秉持此心，砥砺前行，继续做"清风代码"的书写者！`;
            }

            if (score > 50) {
                return `《爱莲说》赞曰："出淤泥而不染，濯清涟而不妖。"您在游戏中始终严守红线，得分优异，收集廉洁词${collectedWords.length}个。正如《官箴》所云："当官之法，惟有三事：曰清、曰慎、曰勤。"愿君秉持此心，砥砺前行。`;
            }

            return `《道德经》云："知足不辱，知止不殆。"您在游戏中保持了廉洁操守，未越红线。人生如棋，一步错步步错，坚守底线，方得始终。愿您常思廉洁之道，修身养性，继续做"清风代码"的书写者。`;
        }
    }

    return new Engine();
})();