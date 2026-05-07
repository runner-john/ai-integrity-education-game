const EmotionAnalyzerModule = (function() {
    let model = null;
    const labelMap = { 0: 'negative', 1: 'neutral', 2: 'positive' };
    let charToIndex = {};
    const maxLength = 50;

    function initCharMap() {
        const basicChars = 'abcdefghijklmnopqrstuvwxyz0123456789，。！？、；：（）[]{}《》+-*/=<>@#$%^&*\\n\\t ';
        const chineseChars = '的一是了我不人在他有这个上们来到时大地为子中你说生国年着那和要她出也得里后自以会家可下而过天去能对小多然于心学么之都好看起发当没成只如事把还用第样道想作种开美总从无情己面最女但现前些所同日手又行意动方期它头经长儿回位分爱老因很给名法间斯知世什两次使身者被高已亲其进此话常与活正感';
        
        let index = 1;
        charToIndex = {};
        for (const char of basicChars) {
            charToIndex[char] = index++;
        }
        for (const char of chineseChars) {
            if (!charToIndex[char]) {
                charToIndex[char] = index++;
            }
        }
        return index;
    }

    const vocabSize = initCharMap();

    async function loadModel() {
        try {
            model = await tf.loadLayersModel('ml-models/emotion/model.json');
            console.log('情感分析模型加载成功');
        } catch (error) {
            console.warn('加载预训练模型失败，使用简单规则判断');
            model = null;
        }
    }

    function textToSequence(text) {
        const sequence = [];
        const lowerText = text.toLowerCase();
        
        for (let i = 0; i < maxLength && i < lowerText.length; i++) {
            const char = lowerText[i];
            sequence.push(charToIndex[char] || 0);
        }
        
        while (sequence.length < maxLength) {
            sequence.push(0);
        }
        
        return sequence;
    }

    async function predict(text) {
        if (!model) {
            return simplePredict(text);
        }

        try {
            const sequence = textToSequence(text);
            const tensor = tf.tensor2d([sequence]);
            const prediction = model.predict(tensor);
            const result = await prediction.data();
            const labelIndex = result.indexOf(Math.max(...result));
            const confidence = result[labelIndex];
            
            tf.dispose([tensor, prediction]);
            
            return {
                emotion: labelMap[labelIndex],
                confidence: parseFloat(confidence.toFixed(4))
            };
        } catch (error) {
            console.warn('情感预测失败，使用简单规则');
            return simplePredict(text);
        }
    }

    function simplePredict(text) {
        const positiveWords = ['好', '棒', '赞', '优秀', '坚持', '坚守', '廉洁', '自律', '清明', '公正', '守法', '奉公', '无私', '知足', '慎独'];
        const negativeWords = ['坏', '糟', '差', '后悔', '难过', '伤心', '失望', '贪', '腐', '贿', '错', '失败', '越界'];
        
        let positiveCount = 0;
        let negativeCount = 0;
        
        for (const word of positiveWords) {
            if (text.includes(word)) positiveCount++;
        }
        for (const word of negativeWords) {
            if (text.includes(word)) negativeCount++;
        }
        
        if (positiveCount > negativeCount + 1) {
            return { emotion: 'positive', confidence: 0.75 };
        } else if (negativeCount > positiveCount + 1) {
            return { emotion: 'negative', confidence: 0.75 };
        } else {
            return { emotion: 'neutral', confidence: 0.6 };
        }
    }

    function getEmotionResponse(emotion, baseResponse) {
        if (emotion === 'negative') {
            return `我感受到您此刻可能有些困惑或失落。${baseResponse} 请记住，每个人都会遇到挑战，重要的是保持内心的坚定，正如《周易》所云："天行健，君子以自强不息。"`;
        } else if (emotion === 'positive') {
            return `${baseResponse} 您积极向上的态度令人赞赏！正如《论语》所言："君子坦荡荡。"愿您继续保持这份清正之心。`;
        }
        return baseResponse;
    }

    return {
        loadModel,
        predict,
        getEmotionResponse
    };
})();