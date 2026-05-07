class APIProxy {
    constructor() {
        this.apiKey = localStorage.getItem('ai_api_key') || '';
        this.useRealAPI = this.apiKey !== '';
        this.useBackendProxy = true;
        this.backendEndpoint = '/api/doubao';
        
        this.difficultyConfig = {
            easy: { pairs: 4, previewTime: 8000, timeLimit: 90, multiplier: 1.0 },
            medium: { pairs: 6, previewTime: 5000, timeLimit: 120, multiplier: 1.5 },
            hard: { pairs: 8, previewTime: 3000, timeLimit: 150, multiplier: 2.0 }
        };

        this.linkDifficultyConfig = {
            easy: { gridSize: 4, wordCount: 8, timeLimit: 60, multiplier: 1.0, ratio: 2 },
            medium: { gridSize: 6, wordCount: 18, timeLimit: 90, multiplier: 1.5, ratio: 1 },
            hard: { gridSize: 8, wordCount: 32, timeLimit: 120, multiplier: 2.0, ratio: 0.5 }
        };

        this.wordBank = {
            clean: ['正直', '自律', '奉公', '清廉', '慎独', '明德', '守正', '克己', '廉洁', '公正', '无私', '诚信', '勤俭', '淡泊', '明志'],
            corrupt: ['贪婪', '腐败', '贿赂', '私欲', '侥幸', '徇私', '枉法', '贪腐', '虚伪', '放纵', '偏私', '纵欲', '贪污', '奢靡', '野心']
        };

        this.memoryGameRecords = JSON.parse(localStorage.getItem('memoryGameRecords') || '[]');
        this.linkGameRecords = JSON.parse(localStorage.getItem('linkGameRecords') || '[]');

        this.conversationHistory = [];
        this.maxHistoryLength = 10;
        
        this.learningPath = this.initializeLearningPath();
        
        this.aiMentorSystemPrompt = `你是一位专业的廉洁素养导师，精通中华廉洁文化和现代廉政建设知识。你的任务是：

1. **素养评估师**: 分析玩家的游戏数据（雷达图、错误模式），指出词汇掌握、记忆与辨别维度的强弱项，分析认知偏差。

2. **个性化教学助手**: 针对玩家暴露的薄弱词汇提供即时讲解、辨析并出变式题巩固。例如，当玩家将"克己"与"自律"混淆时，需解析两词在廉洁语境下的差异。

3. **评估报告解读官**: 将生硬的分数和雷达图，转化为有同理心、有建设性的学习评语。

4. **廉洁知识咨询师**: 回答关于廉洁概念、典故、法规的开放式问题，动态生成新的廉洁情境题进行深度思辨。

5. **学习路径规划师**: 根据玩家的学习进度和薄弱点，推荐个性化的学习路径和练习计划。

请用中文回答，语气友好、专业且富有教育意义。结合RAG检索增强生成技术，根据玩家当前上下文提供精准答案。`;

        this.incorruptibleStories = [
            { title: '杨震拒金', story: '东汉杨震任东莱太守，路过昌邑时，县令王密深夜送金感谢。杨震拒收，王密说："暮夜无知者。"杨震答："天知，神知，我知，子知。何谓无知！"', lesson: '君子慎独，不因无人监督而放纵', tags: ['慎独', '自律', '正直'] },
            { title: '包拯铁面', story: '北宋包拯为官清廉，铁面无私。他在端州任知州时，离任时不带走一块端砚，留下"不持一砚归"的佳话。', lesson: '秉公执法，清正廉洁', tags: ['廉洁', '公正', '自律'] },
            { title: '于谦两袖清风', story: '明朝于谦为官清廉，每次进京奏事，从不携带礼品。有人劝他带些土特产，他作诗："清风两袖朝天去，免得闾阎话短长。"', lesson: '为官当清廉，不贪不占', tags: ['清廉', '自律', '淡泊'] },
            { title: '张伯行悬檄拒贿', story: '清代张伯行任江苏巡抚时，发布檄文："一丝一粒，我之名节；一厘一毫，民之脂膏。"严格拒绝贿赂。', lesson: '公私分明，坚守名节', tags: ['自律', '正直', '慎独'] },
            { title: '狄仁杰明察秋毫', story: '唐代狄仁杰为官清廉，断案如神。他不畏权贵，曾纠正多起冤案，被后人誉为"东方福尔摩斯"。', lesson: '明镜高悬，正直不阿', tags: ['公正', '正直', '明察'] },
            { title: '范仲淹先忧后乐', story: '北宋范仲淹推行新政，改革弊政。他提出"先天下之忧而忧，后天下之乐而乐"的名言，体现了他以天下为己任的情怀。', lesson: '心系百姓，先公后私', tags: ['奉公', '正直', '忧国忧民'] }
        ];

        this.ragKnowledgeBase = this.initializeRAGKnowledgeBase();
        
        this.cognitiveBiasPatterns = {
            '确认偏误': { description: '只关注支持自己已有观念的信息', detection: ['过度自信', '忽视反面例证'] },
            '可得性启发': { description: '用容易想到的例子来判断可能性', detection: ['高估常见风险', '低估罕见风险'] },
            '过度自信': { description: '对自己的判断和能力过于自信', detection: ['频繁越界', '风险低估'] },
            '即时满足偏差': { description: '偏好立即回报而非延迟满足', detection: ['冒险获取稀有词', '忽视长期后果'] },
            '光环效应': { description: '因某一项优点而高估整体表现', detection: ['单一维度高分', '忽视综合评估'] }
        };
    }

    initializeLearningPath() {
        return {
            stage: 1,
            modules: [
                { id: 'vocabulary_basic', name: '基础词汇认知', status: 'unlocked', progress: 0 },
                { id: 'vocabulary_advanced', name: '高级词汇辨析', status: 'locked', progress: 0, requires: ['vocabulary_basic'] },
                { id: 'semantic_relation', name: '语义关系理解', status: 'locked', progress: 0, requires: ['vocabulary_basic'] },
                { id: 'contextual_judgment', name: '情境判断决策', status: 'locked', progress: 0, requires: ['semantic_relation'] },
                { id: 'anti_corruption_wisdom', name: '廉政智慧传承', status: 'locked', progress: 0, requires: ['contextual_judgment'] }
            ],
            currentModule: 'vocabulary_basic',
            completedLessons: []
        };
    }

    initializeRAGKnowledgeBase() {
        return {
            concepts: {
                '廉洁': {
                    definition: '廉洁是指公职人员从事公务活动时必须保持的清白、公道、正派的品质和行为规范。',
                    examples: ['清正廉洁', '廉洁奉公', '廉洁自律'],
                    related: ['清廉', '清正', '公正', '自律'],
                   典故: ['包拯铁面', '于谦两袖清风']
                },
                '腐败': {
                    definition: '腐败是指公职人员利用职权谋取私利，损害公共利益的行为。',
                    examples: ['贪污受贿', '以权谋私', '徇私枉法'],
                    related: ['贪婪', '贿赂', '徇私'],
                    antonyms: ['廉洁', '清廉', '正直']
                },
                '慎独': {
                    definition: '慎独是指在无人监督的情况下，仍能坚守道德准则，不做任何违背良心的事。',
                    examples: ['无人知晓时仍守规矩', '独立工作时不谋私利'],
                    related: ['自律', '自律', '正直'],
                    importance: '慎独是廉洁修养的最高境界'
                },
                '克己': {
                    definition: '克己指主动克制自己的私欲，使其符合道德规范。',
                    examples: ['克制物质欲望', '控制贪婪冲动'],
                    related: ['自律', '节制', '淡泊'],
                   辨析: '克己更强调主动压制欲望，自律更强调日常行为规范'
                },
                '自律': {
                    definition: '自律是指自我约束，自觉遵守规则和道德准则。',
                    examples: ['严格要求自己', '遵守工作纪律'],
                    related: ['慎独', '克己', '自省'],
                   辨析: '自律是长期坚持的习惯，克己是面对诱惑时的主动选择'
                }
            },
            regulations: [
                { title: '中国共产党廉洁自律准则', content: '坚持公私分明，先公后私，克己奉公。' },
                { title: '八项规定精神', content: '改进工作作风，密切联系群众，坚持勤俭节约。' }
            ],
            qa_pairs: [
                { q: '什么是廉洁？', a: '廉洁是指公职人员从事公务活动时保持清白、公道、正派的品质，不贪污、不受贿、不以权谋私。' },
                { q: '为什么要慎独？', a: '慎独是儒家修身的重要方法，指在无人监督时仍能坚守道德准则。这是一种内在自律的体现，是廉洁修养的最高境界。' },
                { q: '如何培养廉洁品质？', a: '1.学习廉洁文化典故\n2.培养自律习惯\n3.学会克制私欲\n4.在日常生活中实践慎独精神' }
            ]
        };
    }

    retrieveRelevantKnowledge(query, topK = 3) {
        const results = [];
        const queryLower = query.toLowerCase();
        
        for (const [concept, data] of Object.entries(this.ragKnowledgeBase.concepts)) {
            let relevance = 0;
            
            if (queryLower.includes(concept)) relevance += 0.5;
            
            if (data.related && data.related.some(r => queryLower.includes(r))) relevance += 0.3;
            if (data.related && data.related.some(r => queryLower.includes(r))) relevance += 0.2;
            
            if (data.examples && data.examples.some(e => queryLower.includes(e))) relevance += 0.2;
            
            if (data.antonyms && data.antonyms.some(a => queryLower.includes(a))) relevance += 0.15;
            
            if (relevance > 0) {
                results.push({ concept, data, relevance });
            }
        }
        
        return results.sort((a, b) => b.relevance - a.relevance).slice(0, topK);
    }

    augmentPromptWithRAG(prompt) {
        const relevantKnowledge = this.retrieveRelevantKnowledge(prompt);
        
        if (relevantKnowledge.length === 0) return prompt;
        
        let augmentation = '\n\n【相关知识参考】\n';
        
        relevantKnowledge.forEach((item, index) => {
            augmentation += `\n${index + 1}. **${item.concept}**\n`;
            augmentation += `   定义：${item.data.definition}\n`;
            if (item.data.examples) {
                augmentation += `   例句：${item.data.examples.join('、')}\n`;
            }
            if (item.data.辨析) {
                augmentation += `   辨析：${item.data.辨析}\n`;
            }
            if (item.data.related) {
                augmentation += `   相关词：${item.data.related.join('、')}\n`;
            }
            if (item.data.importance) {
                augmentation += `   重要性：${item.data.importance}\n`;
            }
        });
        
        augmentation += '\n请结合上述知识，准确回答用户问题。';
        
        return prompt + augmentation;
    }

    addToConversation(role, content) {
        this.conversationHistory.push({ role, content, timestamp: Date.now() });
        
        if (this.conversationHistory.length > this.maxHistoryLength) {
            this.conversationHistory.shift();
        }
    }

    getConversationContext() {
        if (this.conversationHistory.length === 0) return '';
        
        let context = '\n\n【对话历史】\n';
        this.conversationHistory.slice(-5).forEach(msg => {
            const roleName = msg.role === 'user' ? '用户' : '导师';
            context += `${roleName}：${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}\n`;
        });
        
        return context;
    }

    updateLearningPath(moduleId, progress) {
        const module = this.learningPath.modules.find(m => m.id === moduleId);
        if (module) {
            module.progress = Math.min(100, module.progress + progress);
            
            if (module.progress >= 100) {
                this.learningPath.completedLessons.push(moduleId);
                
                this.learningPath.modules.forEach(m => {
                    if (m.status === 'locked' && m.requires && m.requires.includes(moduleId)) {
                        const allPrerequisitesMet = m.requires.every(reqId => 
                            this.learningPath.completedLessons.includes(reqId)
                        );
                        if (allPrerequisitesMet) {
                            m.status = 'unlocked';
                        }
                    }
                });
            }
        }
        
        this.saveLearningPath();
    }

    getRecommendedPath(currentScores) {
        const recommendations = [];
        
        if (currentScores.semantic < 70) {
            recommendations.push({
                priority: 1,
                module: 'vocabulary_basic',
                reason: '语义辨别能力待提升，建议从基础词汇认知开始',
                action: '建议先学习"基础词汇认知"模块'
            });
            recommendations.push({
                priority: 2,
                module: 'semantic_relation',
                reason: '理解词汇间的语义关系是提升辨别能力的关键',
                action: '完成基础后继续学习"语义关系理解"'
            });
        }
        
        if (currentScores.decision < 70) {
            recommendations.push({
                priority: 3,
                module: 'contextual_judgment',
                reason: '情境决策能力需要加强',
                action: '学习"情境判断决策"模块'
            });
        }
        
        if (currentScores.knowledge < 70) {
            recommendations.push({
                priority: 4,
                module: 'anti_corruption_wisdom',
                reason: '廉洁知识储备需要扩充',
                action: '学习"廉政智慧传承"模块'
            });
        }
        
        if (recommendations.length === 0) {
            recommendations.push({
                priority: 1,
                module: 'vocabulary_advanced',
                reason: '各项能力均衡，可进行进阶学习',
                action: '建议挑战"高级词汇辨析"模块'
            });
        }
        
        return recommendations;
    }

    detectCognitiveBias(gameData) {
        const detectedBiases = [];
        
        if (gameData.crossingCount > 2 && gameData.crossingCount < 5) {
            detectedBiases.push({
                type: '过度自信',
                description: '你似乎对越界风险有一定认知，但仍选择冒险。这可能表明对后果的低估。',
                suggestion: '记住：每一次越界都会累积廉洁风险值'
            });
        }
        
        if (gameData.rareWordAttempts > 3) {
            detectedBiases.push({
                type: '即时满足偏差',
                description: '你多次尝试获取高风险区域的稀有词汇。这反映了追求即时回报的心理倾向。',
                suggestion: '思考：短期高回报是否值得牺牲长期廉洁值？'
            });
        }
        
        if (gameData.negativeWordRatio > 0.3) {
            detectedBiases.push({
                type: '可得性启发',
                description: '你摄入的负面词汇比例较高，可能影响对廉洁概念的认知。',
                suggestion: '建议加强廉洁词汇的正面学习'
            });
        }
        
        return detectedBiases;
    }

    generateAdaptiveChallenge(playerLevel, weakPoints) {
        const challenges = [];
        
        if (weakPoints.includes('semantic')) {
            challenges.push({
                type: '词汇配对挑战',
                difficulty: playerLevel,
                description: '请在规定时间内正确配对更多词汇',
                reward: '语义辨别能力+5%'
            });
        }
        
        if (weakPoints.includes('decision')) {
            challenges.push({
                type: '情境决策测试',
                difficulty: playerLevel,
                description: '判断哪些情境属于廉洁行为',
                reward: '决策能力+5%'
            });
        }
        
        return challenges[Math.floor(Math.random() * challenges.length)];
    }

    setAPIKey(apiKey) {
        this.apiKey = apiKey;
        this.useRealAPI = apiKey !== '';
        localStorage.setItem('ai_api_key', apiKey);
    }

    saveLearningPath() {
        localStorage.setItem('learningPath', JSON.stringify(this.learningPath));
    }

    loadLearningPath() {
        const saved = localStorage.getItem('learningPath');
        if (saved) {
            this.learningPath = JSON.parse(saved);
        }
    }

    async callAPI(prompt, options = {}) {
        if (!this.useRealAPI) {
            return this.simulateAIResponse(prompt, options);
        }
        
        const augmentedPrompt = this.augmentPromptWithRAG(prompt);
        const contextPrompt = augmentedPrompt + this.getConversationContext();
        
        try {
            const response = await fetch(this.backendEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: this.aiMentorSystemPrompt + '\n\n' + contextPrompt,
                    options: {
                        temperature: options.temperature || 0.8,
                        max_tokens: options.max_tokens || 1024
                    }
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.warn('Backend proxy failed, falling back to direct API');
                return this.callDirectAPI(prompt, options);
            }
            
            const result = await response.json();
            this.addToConversation('user', prompt);
            this.addToConversation('assistant', result.data);
            return result;
        } catch (error) {
            console.warn('Backend proxy unavailable, falling back to direct API:', error);
            return this.callDirectAPI(prompt, options);
        }
    }

    async callDirectAPI(prompt, options = {}) {
        const augmentedPrompt = this.augmentPromptWithRAG(prompt);
        const contextPrompt = augmentedPrompt + this.getConversationContext();
        
        try {
            const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'ep-m-20260403190704-fk8mg',
                    messages: [
                        { role: 'system', content: this.aiMentorSystemPrompt },
                        { role: 'user', content: contextPrompt }
                    ],
                    temperature: options.temperature || 0.8,
                    max_tokens: options.max_tokens || 1024
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API error: ${response.status} - ${errorText}`);
            }
            
            const result = await response.json();
            const content = result.choices[0].message.content;
            this.addToConversation('user', prompt);
            this.addToConversation('assistant', content);
            return { success: true, data: content };
        } catch (error) {
            console.error('Direct API call failed:', error);
            return this.simulateAIResponse(prompt, options);
        }
    }

    simulateAIResponse(prompt, options = {}) {
        console.log('Simulating AI response for:', prompt.substring(0, 100) + '...');
        
        if (prompt.includes('生成配对组合') || prompt.includes('配对') || prompt.includes('记忆')) {
            return this.generateMemoryGamePairs(options.difficulty || 'easy');
        }
        
        if (prompt.includes('语义验证') || prompt.includes('配对关系') || prompt.includes('反义词')) {
            return this.validatePairing(prompt);
        }
        
        if (prompt.includes('行为分析') || prompt.includes('评语')) {
            return this.generateBehaviorAnalysis(options.data || {});
        }
        
        if (prompt.includes('词汇布局') || prompt.includes('连连看')) {
            return this.generateLinkGameLayout(options.difficulty || 'easy');
        }
        
        if (prompt.includes('语义判定') || prompt.includes('相似度')) {
            return this.analyzeSemanticRelation(prompt);
        }
        
        if (prompt.includes('用户画像') || prompt.includes('评估报告')) {
            return this.generateUserProfile(options.data || {});
        }
        
        return this.generateMentorResponse(prompt, options);
    }

    generateMentorResponse(prompt, options) {
        const lowerPrompt = prompt.toLowerCase();
        
        if (lowerPrompt.includes('分析') || lowerPrompt.includes('评估') || lowerPrompt.includes('雷达') || lowerPrompt.includes('分数')) {
            return this.generateAssessmentAnalysis(options.data || {});
        }
        
        if (lowerPrompt.includes('讲解') || lowerPrompt.includes('区别') || lowerPrompt.includes('差异') || lowerPrompt.includes('什么是')) {
            return this.generateVocabularyExplanation(prompt);
        }
        
        if (lowerPrompt.includes('典故') || lowerPrompt.includes('故事') || lowerPrompt.includes('案例')) {
            return this.generateStoryResponse();
        }
        
        if (lowerPrompt.includes('建议') || lowerPrompt.includes('学习') || lowerPrompt.includes('改进')) {
            return this.generateLearningSuggestion(options.data || {});
        }
        
        if (lowerPrompt.includes('廉洁') || lowerPrompt.includes('腐败') || lowerPrompt.includes('自律') || lowerPrompt.includes('克己')) {
            return this.generateKnowledgeResponse(prompt);
        }
        
        const generalResponses = [
            '你的问题很有深度！廉洁素养的培养是一个持续的过程。',
            '很好的思考！在廉洁修养中，每一个小选择都很重要。',
            '这是一个值得深思的问题。让我为你分析一下...',
            '廉洁修身，始于点滴。你的每一次正确选择都在积累正能量。',
            '正如古人所说："勿以善小而不为，勿以恶小而为之。"'
        ];
        
        return { 
            success: true, 
            data: generalResponses[Math.floor(Math.random() * generalResponses.length)] 
        };
    }

    generateAssessmentAnalysis(data) {
        const scores = data.currentScores || { knowledge: 75, intuition: 68, decision: 72, semantic: 65, risk: 78 };
        const weakPoints = [];
        const strongPoints = [];
        
        Object.entries(scores).forEach(([key, value]) => {
            const names = {
                knowledge: '廉洁知识',
                intuition: '直觉反应',
                decision: '情境决策',
                semantic: '语义辨别',
                risk: '风险管控'
            };
            if (value < 70) weakPoints.push(names[key]);
            else strongPoints.push(names[key]);
        });
        
        let analysis = '🎯 **你的素养评估分析**\n\n';
        analysis += '根据你的游戏数据，我来帮你分析一下：\n\n';
        
        if (strongPoints.length > 0) {
            analysis += '✅ **优势领域：**\n';
            analysis += strongPoints.map(p => `  - ${p}\n`).join('');
        }
        
        if (weakPoints.length > 0) {
            analysis += '\n⚠️ **待提升领域：**\n';
            analysis += weakPoints.map(p => `  - ${p}\n`).join('');
        }
        
        analysis += '\n💡 **改进建议：**\n';
        if (scores.semantic < 70) {
            analysis += '  - 建议多玩"词义连连看"游戏，加强词汇辨析能力\n';
        }
        if (scores.intuition < 70) {
            analysis += '  - 建议多练习"廉腐配对"记忆游戏，提升反应速度\n';
        }
        if (scores.decision < 70) {
            analysis += '  - 建议多体验情境决策模块，增强原则性判断\n';
        }
        
        return { success: true, data: analysis };
    }

    generateVocabularyExplanation(prompt) {
        const vocabMap = {
            '克己': {
                explanation: '克己指克制自己的欲望和私心，是儒家修身的重要方法。',
                example: '克己复礼：克制自己，使言行符合礼的规范。',
                contrast: '与"自律"相近，但更强调对欲望的主动克制'
            },
            '自律': {
                explanation: '自律指自我约束、自我管理的能力。',
                example: '自律是成功的基石，也是廉洁的前提。',
                contrast: '与"克己"相近，但更强调日常行为的自我管理'
            },
            '廉洁': {
                explanation: '廉洁指清正廉洁，不贪污、不收受不正当利益。',
                example: '为官者当以廉洁为本，才能赢得民心。',
                contrast: '与"清廉"同义，但"廉洁"更强调行为操守'
            },
            '清廉': {
                explanation: '清廉指清白廉洁，品行端正。',
                example: '清廉如水，是为官者的基本要求。',
                contrast: '与"廉洁"同义，但"清廉"更强调品行清白'
            },
            '贪婪': {
                explanation: '贪婪指对财物、权力等过度的、不正当的欲望。',
                example: '贪婪是腐败的根源，必须时刻警惕。',
                contrast: '与"私欲"相近，但更强调占有欲'
            },
            '私欲': {
                explanation: '私欲指个人的不正当欲望。',
                example: '克制私欲是廉洁修身的关键。',
                contrast: '与"贪婪"相近，但更强调个人欲望'
            }
        };
        
        for (const [word, info] of Object.entries(vocabMap)) {
            if (prompt.includes(word)) {
                let response = `📚 **${word}** 的讲解\n\n`;
                response += `**释义：** ${info.explanation}\n\n`;
                response += `**举例：** ${info.example}\n\n`;
                response += `**辨析：** ${info.contrast}\n\n`;
                response += '💡 这个词在廉洁语境中非常重要，建议多加理解和记忆。';
                return { success: true, data: response };
            }
        }
        
        return { success: true, data: '这个词汇我来为你解释一下。廉洁相关的词汇往往蕴含着深刻的道德内涵，需要结合具体语境来理解。如果你有具体的词汇想了解，可以告诉我。' };
    }

    generateStoryResponse() {
        const story = this.incorruptibleStories[Math.floor(Math.random() * this.incorruptibleStories.length)];
        
        let response = `📖 **${story.title}**\n\n`;
        response += `**故事内容：** ${story.story}\n\n`;
        response += `**启示：** ${story.lesson}\n\n`;
        response += '💡 这些古代廉吏的故事告诉我们，廉洁是中华民族的传统美德，值得我们代代传承。';
        
        return { success: true, data: response };
    }

    generateLearningSuggestion(data) {
        const suggestions = [
            '📚 建议每天花10分钟学习一个廉洁典故，日积月累必有收获。',
            '🎮 多玩"词义连连看"游戏，加深对廉洁词汇的理解和记忆。',
            '💭 每天反思一次：今天我在哪些小事上做到了自律？',
            '📝 可以尝试写廉洁日记，记录自己的感悟和体会。',
            '🤝 和朋友一起学习，互相监督，共同进步。',
            '🎯 设定小目标，比如连续7天不触碰游戏中的风险区域。'
        ];
        
        let response = '💡 **个性化学习建议**\n\n';
        response += '根据你的游戏表现，为你推荐以下学习方法：\n\n';
        
        const shuffled = [...suggestions].sort(() => Math.random() - 0.5);
        response += shuffled.slice(0, 3).map((s, i) => `${i + 1}. ${s}\n`).join('');
        
        return { success: true, data: response };
    }

    generateKnowledgeResponse(prompt) {
        const knowledgeBase = [
            { keywords: ['廉洁', '清正'], content: '廉洁是指品行端正，不贪污、不收受不正当利益。它是为官者的基本操守，也是每个公民应该遵守的道德准则。' },
            { keywords: ['腐败', '贪污'], content: '腐败是指利用职权谋取私利的行为，严重损害公共利益。腐败不仅会受到法律的制裁，也会损害个人的名誉和前途。' },
            { keywords: ['自律', '修身'], content: '自律是自我约束的能力，是廉洁的基础。正如古人所说："吾日三省吾身"，只有不断自我反省，才能保持清正廉洁。' },
            { keywords: ['慎独', '独处'], content: '慎独是指在独处时也能保持谨慎，不做违背道德的事。这是一种很高的道德境界，需要长期的修养和坚持。' },
            { keywords: ['奉公', '为公'], content: '奉公指全心全意为公众服务，不计个人得失。这是公职人员的职责所在，也是人民群众的殷切期望。' }
        ];
        
        for (const item of knowledgeBase) {
            if (item.keywords.some(k => prompt.includes(k))) {
                return { success: true, data: `📖 **知识讲解**\n\n${item.content}\n\n💡 希望这些知识能帮助你更好地理解廉洁的内涵。` };
            }
        }
        
        return { success: true, data: '廉洁是一个深刻的话题，涉及道德、法律、文化等多个层面。如果你有具体的问题，我很乐意为你解答！' };
    }

    getTodayMemoryGameCount() {
        const today = new Date().toDateString();
        return this.memoryGameRecords.filter(r => r.date === today).length;
    }

    saveMemoryGameRecord(record) {
        this.memoryGameRecords.push({
            ...record,
            date: new Date().toDateString(),
            timestamp: Date.now()
        });
        localStorage.setItem('memoryGameRecords', JSON.stringify(this.memoryGameRecords));
    }

    getTodayLinkGameCount() {
        const today = new Date().toDateString();
        return this.linkGameRecords.filter(r => r.date === today).length;
    }

    saveLinkGameRecord(record) {
        this.linkGameRecords.push({
            ...record,
            date: new Date().toDateString(),
            timestamp: Date.now()
        });
        localStorage.setItem('linkGameRecords', JSON.stringify(this.linkGameRecords));
    }

    async generateMemoryGamePairs(difficulty) {
        const config = this.difficultyConfig[difficulty];
        const cleanWords = [...this.wordBank.clean].sort(() => Math.random() - 0.5);
        const corruptWords = [...this.wordBank.corrupt].sort(() => Math.random() - 0.5);
        
        const pairs = [];
        const usedCorrupt = new Set();
        
        for (let i = 0; i < config.pairs; i++) {
            let corruptIndex = Math.floor(Math.random() * corruptWords.length);
            while (usedCorrupt.has(corruptIndex)) {
                corruptIndex = Math.floor(Math.random() * corruptWords.length);
            }
            usedCorrupt.add(corruptIndex);
            
            pairs.push({
                clean: cleanWords[i],
                corrupt: corruptWords[corruptIndex],
                id: i + 1
            });
        }

        const result = {
            success: true,
            data: JSON.stringify({
                pairs,
                config,
                message: `已生成${config.pairs}组配对，预览时间${config.previewTime / 1000}秒，限时${config.timeLimit}秒`
            })
        };
        
        return result;
    }

    async validatePairing(prompt) {
        const match = prompt.match(/["'（（]([^"')）]+)["'））].*["'（（]([^"')）]+)["'））]/);
        if (match) {
            const [, word1, word2] = match;
            const isAntonym = this.isAntonymPair(word1, word2);
            
            return {
                success: true,
                data: JSON.stringify({
                    isValid: isAntonym,
                    score: isAntonym ? 0.95 + Math.random() * 0.05 : 0.3 + Math.random() * 0.4,
                    explanation: isAntonym 
                        ? `${word1}与${word2}是反义词关系，配对正确！`
                        : `${word1}与${word2}不是典型反义词，但语义相关度为中等`,
                    suggestion: isAntonym ? '继续保持！' : '建议回顾词汇表，加强反义词记忆'
                })
            };
        }
        
        return {
            success: true,
            data: JSON.stringify({
                isValid: true,
                score: 0.85,
                explanation: '配对合理',
                suggestion: '继续加油！'
            })
        };
    }

    isAntonymPair(word1, word2) {
        const antonymPairs = [
            ['正直', '虚伪'], ['自律', '放纵'], ['廉洁', '腐败'], ['奉公', '徇私'],
            ['清廉', '贪污'], ['慎独', '纵欲'], ['守正', '偏私'], ['克己', '贪婪'],
            ['公正', '偏私'], ['无私', '自私'], ['诚信', '虚伪'], ['勤俭', '奢靡']
        ];
        
        return antonymPairs.some(pair => 
            (pair[0] === word1 && pair[1] === word2) || 
            (pair[0] === word2 && pair[1] === word1)
        );
    }

    async generateBehaviorAnalysis(gameData) {
        const { moves, timeUsed, pairs, accuracy, hoverTimes, flipOrder } = gameData;
        const avgTimePerCard = timeUsed / (moves * 2);
        const efficiency = pairs / moves;
        
        let analysis = '';
        let suggestions = [];
        
        if (efficiency > 0.8) {
            analysis += '你的记忆效率很高！';
            suggestions.push('尝试更高难度挑战自己');
        } else if (efficiency > 0.5) {
            analysis += '你的记忆表现良好，继续保持！';
            suggestions.push('可以尝试减少翻牌次数');
        } else {
            analysis += '建议加强记忆训练，可以多进行联想记忆';
            suggestions.push('增加复习频率，使用记忆技巧');
        }
        
        if (avgTimePerCard > 2000) {
            analysis += ' 反应速度稍慢，建议多练习';
            suggestions.push('通过限时练习提高反应速度');
        }
        
        const report = {
            performanceLevel: efficiency > 0.8 ? '优秀' : (efficiency > 0.5 ? '良好' : '需要提升'),
            analysis,
            suggestions,
            metrics: {
                moves,
                accuracy,
                efficiency: (efficiency * 100).toFixed(1) + '%',
                avgTimePerCard: avgTimePerCard.toFixed(0) + 'ms'
            }
        };
        
        return { success: true, data: JSON.stringify(report) };
    }

    async generateLinkGameLayout(difficulty) {
        const config = this.linkDifficultyConfig[difficulty];
        const cleanWords = [...this.wordBank.clean].sort(() => Math.random() - 0.5);
        const corruptWords = [...this.wordBank.corrupt].sort(() => Math.random() - 0.5);
        
        const cleanCount = Math.round(config.wordCount * (config.ratio / (config.ratio + 1)));
        const corruptCount = config.wordCount - cleanCount;
        
        const words = [
            ...cleanWords.slice(0, cleanCount).map(w => ({ word: w, type: 'clean' })),
            ...corruptWords.slice(0, corruptCount).map(w => ({ word: w, type: 'corrupt' }))
        ];
        
        const doubledWords = [...words, ...words].sort(() => Math.random() - 0.5);
        
        const grid = [];
        for (let i = 0; i < config.gridSize; i++) {
            const row = [];
            for (let j = 0; j < config.gridSize; j++) {
                const index = i * config.gridSize + j;
                row.push(index < doubledWords.length ? doubledWords[index] : null);
            }
            grid.push(row);
        }

        return {
            success: true,
            data: JSON.stringify({
                grid,
                config,
                cleanCount,
                corruptCount,
                message: `已生成${config.gridSize}×${config.gridSize}布局，含${cleanCount}个廉洁词，${corruptCount}个腐败词`
            })
        };
    }

    async analyzeSemanticRelation(word1, word2, difficulty = 'easy') {
        const cleanWords = this.wordBank.clean;
        const corruptWords = this.wordBank.corrupt;
        const neutralWords = ['勤奋', '聪明', '努力', '智慧', '坚持', '学习', '认真', '负责', '创新'];
        
        const word1IsClean = cleanWords.includes(word1);
        const word1IsCorrupt = corruptWords.includes(word1);
        const word1IsNeutral = neutralWords.includes(word1) || (!word1IsClean && !word1IsCorrupt);
        
        const word2IsClean = cleanWords.includes(word2);
        const word2IsCorrupt = corruptWords.includes(word2);
        const word2IsNeutral = neutralWords.includes(word2) || (!word2IsClean && !word2IsCorrupt);
        
        const word1Type = word1IsClean ? 'clean' : (word1IsCorrupt ? 'corrupt' : 'neutral');
        const word2Type = word2IsClean ? 'clean' : (word2IsCorrupt ? 'corrupt' : 'neutral');
        
        let result = this.analyzeSemanticRelationLocal(word1, word2, word1Type, word2Type, difficulty);
        
        if (this.useRealAPI) {
            try {
                const response = await this.callAPI(
                    `分析词汇语义关系：词汇A="${word1}"(类型:${word1Type})，词汇B="${word2}"(类型:${word2Type})。请判断它们的语义关系，可以是synonym(近义)、antonym(反义)、related(相关)或unrelated(无关)，并给出置信度和解释。难度等级:${difficulty}`,
                    { max_tokens: 256 }
                );
                
                if (response.success) {
                    try {
                        const aiResult = JSON.parse(response.data);
                        result = { ...result, ...aiResult };
                    } catch {
                        result.explanation = response.data;
                    }
                }
            } catch (error) {
                console.log('AI语义分析失败，使用本地判定');
            }
        }
        
        return {
            success: true,
            data: result
        };
    }
    
    analyzeSemanticRelationLocal(word1, word2, word1Type, word2Type, difficulty) {
        const config = this.getLinkDifficultyConfig(difficulty);
        
        const antonymPairs = [
            ['正直', '虚伪'], ['自律', '放纵'], ['廉洁', '腐败'], ['奉公', '徇私'],
            ['清廉', '贪污'], ['慎独', '纵欲'], ['守正', '偏私'], ['克己', '贪婪'],
            ['公正', '偏私'], ['无私', '自私'], ['诚信', '虚伪'], ['勤俭', '奢靡'],
            ['淡泊', '贪婪'], ['明志', '野心'], ['守正', '枉法'], ['廉洁', '贿赂']
        ];
        
        const synonymGroups = [
            ['正直', '公正', '廉洁', '清廉', '守正'],
            ['贪婪', '腐败', '贪污', '贿赂'],
            ['自律', '克己', '慎独'],
            ['徇私', '枉法', '偏私'],
            ['无私', '奉公'],
            ['诚信', '守信'],
            ['勤俭', '节俭'],
            ['放纵', '纵欲'],
            ['奢靡', '奢侈']
        ];
        
        const isAntonym = antonymPairs.some(pair => 
            (pair[0] === word1 && pair[1] === word2) || 
            (pair[0] === word2 && pair[1] === word1)
        );
        
        const isSynonym = synonymGroups.some(group => 
            group.includes(word1) && group.includes(word2)
        );
        
        const isSameType = word1Type === word2Type;
        
        let relation = 'unrelated';
        let valid = false;
        let confidence = 0.3;
        let explanation = '';
        let scoreBonus = 0;
        
        if (word1Type === 'neutral' || word2Type === 'neutral') {
            relation = 'unrelated';
            valid = false;
            confidence = 0.95;
            explanation = `"${word1}"和"${word2}"中包含中性词，它们不属于廉洁或腐败阵营，不能配对消除。`;
        } else if (isAntonym) {
            relation = 'antonym';
            valid = config.allowAntonym;
            confidence = 0.9 + Math.random() * 0.1;
            if (valid) {
                explanation = `"${word1}"与"${word2}"构成反义关系，前者代表廉洁品质，后者代表腐败行为，成功配对！`;
                scoreBonus = 10;
            } else {
                explanation = `"${word1}"与"${word2}"虽然是反义词，但当前难度只允许同类型配对。`;
            }
        } else if (isSynonym) {
            relation = 'synonym';
            valid = true;
            confidence = 0.85 + Math.random() * 0.15;
            explanation = `"${word1}"与"${word2}"语义相近，同属${word1Type === 'clean' ? '廉洁' : '腐败'}语义场，可以连接！`;
            scoreBonus = 5;
        } else if (isSameType) {
            relation = 'related';
            valid = true;
            confidence = 0.6 + Math.random() * 0.3;
            explanation = `"${word1}"与"${word2}"同属${word1Type === 'clean' ? '廉洁' : '腐败'}语义场，具有一定关联，可以连接。`;
            scoreBonus = 3;
        } else {
            relation = 'unrelated';
            valid = config.allowAntonym;
            confidence = 0.4 + Math.random() * 0.3;
            if (valid) {
                explanation = `"${word1}"与"${word2}"虽然语义距离较远，但跨类型配对成功！`;
                scoreBonus = 8;
            } else {
                explanation = `"${word1}"与"${word2}"分属不同语义场，当前难度不允许跨类型配对。`;
            }
        }
        
        return {
            relation,
            valid,
            confidence: Math.round(confidence * 100) / 100,
            explanation,
            score_bonus: scoreBonus,
            word1Type,
            word2Type
        };
    }
    
    getLinkDifficultyConfig(difficulty) {
        const configs = {
            easy: { gridSize: 4, wordCount: 8, timeLimit: 90, multiplier: 1.0, allowAntonym: false, hasInterference: false },
            medium: { gridSize: 5, wordCount: 16, timeLimit: 120, multiplier: 1.5, allowAntonym: true, hasInterference: false },
            hard: { gridSize: 6, wordCount: 24, timeLimit: 150, multiplier: 2.0, allowAntonym: true, hasInterference: true }
        };
        return configs[difficulty] || configs.easy;
    }
    
    async generateLinkGameLayout(difficulty) {
        const config = this.getLinkDifficultyConfig(difficulty);
        
        if (this.useRealAPI) {
            try {
                const response = await this.callAPI(
                    `生成${difficulty}难度的AI语义连连看词汇布局。要求：${config.wordCount}个词汇，包含廉洁词、腐败词${config.hasInterference ? '和中性干扰词' : ''}，确保两两之间有明确的语义关联。返回格式：JSON对象，包含grid数组和config对象。`,
                    { max_tokens: 1024 }
                );
                
                if (response.success) {
                    return { success: true, data: JSON.parse(response.data) };
                }
            } catch (error) {
                console.log('AI生成布局失败，使用本地生成');
            }
        }
        
        return { success: false };
    }

    async generateUserProfile(data) {
        const { memoryRecords = [], linkRecords = [] } = data;
        
        let totalMemoryScore = 0, totalLinkScore = 0;
        let totalMemoryAccuracy = 0, totalLinkAccuracy = 0;
        let avgReactionTime = 0;
        
        if (memoryRecords.length > 0) {
            totalMemoryScore = memoryRecords.reduce((sum, r) => sum + r.score, 0) / memoryRecords.length;
            totalMemoryAccuracy = memoryRecords.reduce((sum, r) => sum + (r.accuracy || 0), 0) / memoryRecords.length;
        }
        
        if (linkRecords.length > 0) {
            totalLinkScore = linkRecords.reduce((sum, r) => sum + r.score, 0) / linkRecords.length;
            totalLinkAccuracy = linkRecords.reduce((sum, r) => sum + (r.accuracy || 0), 0) / linkRecords.length;
            avgReactionTime = linkRecords.reduce((sum, r) => sum + (r.avgTime || 0), 0) / linkRecords.length;
        }
        
        const knowledge = Math.min(100, Math.round((totalMemoryAccuracy + totalLinkAccuracy) / 2));
        const memory = Math.min(100, Math.round(totalMemoryScore * 0.8 + 20));
        const speed = Math.min(100, Math.max(20, 100 - avgReactionTime / 100));
        const accuracy = Math.min(100, Math.round((totalMemoryAccuracy * 0.4 + totalLinkAccuracy * 0.6)));
        const comprehension = Math.min(100, Math.round((knowledge + accuracy) / 2));
        
        const level = knowledge >= 80 ? 'L5' : knowledge >= 60 ? 'L4' : knowledge >= 40 ? 'L3' : knowledge >= 20 ? 'L2' : 'L1';
        
        const suggestions = [];
        if (knowledge < 60) suggestions.push('建议加强词汇学习，多进行配对练习');
        if (memory < 60) suggestions.push('通过重复练习增强记忆能力');
        if (speed < 60) suggestions.push('进行限时训练提高反应速度');
        if (accuracy < 60) suggestions.push('注意区分相似词汇，提高辨别能力');
        
        const report = {
            scores: { knowledge, memory, speed, accuracy, comprehension },
            level,
            comparison: {
                knowledge: knowledge >= 70 ? '高于平均' : knowledge >= 50 ? '平均水平' : '需要提升',
                memory: memory >= 70 ? '高于平均' : memory >= 50 ? '平均水平' : '需要提升',
                speed: speed >= 70 ? '高于平均' : speed >= 50 ? '平均水平' : '需要提升',
                accuracy: accuracy >= 70 ? '高于平均' : accuracy >= 50 ? '平均水平' : '需要提升',
                comprehension: comprehension >= 70 ? '高于平均' : comprehension >= 50 ? '平均水平' : '需要提升'
            },
            suggestions: suggestions.slice(0, 3),
            summary: `综合评估：你的廉洁素养等级为${level}，${level >= 'L4' ? '表现优秀！' : level >= 'L3' ? '表现良好，继续努力！' : '需要加强学习。'}`
        };
        
        return { success: true, data: JSON.stringify(report) };
    }

    calculateScore(baseScore, difficulty, timeUsed, accuracy, combo) {
        const config = this.difficultyConfig[difficulty] || this.difficultyConfig.easy;
        const timeLimit = config.timeLimit;
        
        const timeRatio = Math.max(0.5, timeLimit / timeUsed);
        const speedCoeff = Math.min(1.5, 0.8 + timeRatio * 0.2);
        const accuracyCoeff = accuracy >= 0.5 ? (0.8 + accuracy * 0.4) : (0.5 + accuracy);
        const comboBonus = Math.min(10, combo * 5);
        
        return Math.round(baseScore * config.multiplier * speedCoeff * accuracyCoeff + comboBonus);
    }
    
    async analyzeBehaviorData(behaviorData, gameType) {
        try {
            if (gameType === 'link') {
                const { moves, timeUsed, accuracy, errorCount, antonymPairs, synonymPairs, interferenceClicks, averageReactionTime, hesitationCount } = behaviorData;
                
                let analysis = '';
                
                if (accuracy >= 0.8) {
                    analysis += '🎯 你在词汇语义辨别方面表现出色！';
                } else if (accuracy >= 0.6) {
                    analysis += '👍 你的词汇辨别能力不错，继续加油！';
                } else {
                    analysis += '📚 建议多学习廉洁词汇的语义关系。';
                }
                
                if (interferenceClicks > moves * 0.3) {
                    analysis += ' 注意减少误触次数。';
                }
                
                if (antonymPairs > synonymPairs) {
                    analysis += ' 你更擅长辨别反义词关系。';
                } else if (synonymPairs > antonymPairs) {
                    analysis += ' 你更擅长辨别近义词关系。';
                }
                
                return {
                    success: true,
                    data: {
                        analysis,
                        suggestions: [
                            '继续练习可以提升词汇辨别能力',
                            '注意观察词汇之间的语义关系',
                            '保持专注，减少误触'
                        ]
                    }
                };
            } else if (gameType === 'memory') {
                const { moves, timeUsed, accuracy, hoverTimes, flipOrder } = behaviorData;
                
                let analysis = '';
                
                if (accuracy >= 0.8) {
                    analysis += '🧠 你的记忆力很棒！';
                } else if (accuracy >= 0.6) {
                    analysis += '💪 记忆力不错，再接再厉！';
                } else {
                    analysis += '📖 建议多进行记忆训练。';
                }
                
                const efficiency = moves / (this.difficultyConfig.easy.pairs * 2);
                if (efficiency <= 1.5) {
                    analysis += ' 配对效率很高！';
                }
                
                return {
                    success: true,
                    data: {
                        analysis,
                        suggestions: [
                            '可以尝试更高难度挑战',
                            '注意记忆卡片位置的技巧',
                            '保持冷静，不要急于翻牌'
                        ]
                    }
                };
            }
            
            return {
                success: true,
                data: {
                    analysis: '游戏数据分析完成',
                    suggestions: ['继续加油！']
                }
            };
        } catch (error) {
            console.error('分析行为数据失败:', error);
            return {
                success: false,
                error: '分析失败'
            };
        }
    }
}

const apiProxy = new APIProxy();