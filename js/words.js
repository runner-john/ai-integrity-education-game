// 清莲引·词汇库
// 共120+词汇，分为4类：廉洁基础词、廉洁成语、腐败基础词、腐败成语

const WORDS = {
    // 🟢 廉洁基础词（绿色，加分）
    positiveBasic: [
        { word: '廉洁', score: 10, meaning: '清白高洁，不贪不占' },
        { word: '清廉', score: 10, meaning: '清正廉洁，公私分明' },
        { word: '公正', score: 10, meaning: '公平正直，不偏不倚' },
        { word: '清明', score: 10, meaning: '清正明察，政治清朗' },
        { word: '自律', score: 10, meaning: '自我约束，遵规守纪' },
        { word: '诚信', score: 10, meaning: '诚实守信，言行一致' },
        { word: '正直', score: 10, meaning: '坦荡刚正，不阿权贵' },
        { word: '奉公', score: 10, meaning: '奉行公事，不谋私利' },
        { word: '守法', score: 10, meaning: '遵守法律，依法行事' },
        { word: '克己', score: 10, meaning: '克制私欲，严于律己' },
        { word: '慎独', score: 10, meaning: '独处时仍守正道' },
        { word: '淡泊', score: 10, meaning: '不慕名利，心境恬淡' },
        { word: '清白', score: 10, meaning: '纯洁无瑕，身正影直' },
        { word: '忠诚', score: 10, meaning: '尽心竭力，忠贞不渝' },
        { word: '敬业', score: 10, meaning: '忠于职守，勤勉尽责' },
        { word: '勤俭', score: 10, meaning: '勤奋节俭，艰苦朴素' },
        { word: '务实', score: 10, meaning: '实事求是，不尚空谈' },
        { word: '为民', score: 10, meaning: '心系群众，服务人民' },
        { word: '担当', score: 10, meaning: '勇于负责，敢于作为' },
        { word: '清正', score: 10, meaning: '清廉公正，作风正派' }
    ],

    // 🟢 廉洁成语（绿色，加分，生僻成语）
    positiveIdiom: [
        { word: '两袖清风', score: 15, meaning: '为官清廉，毫无私产' },
        { word: '光明磊落', score: 15, meaning: '心地坦荡，胸怀坦白' },
        { word: '刚正不阿', score: 15, meaning: '刚强正直，不屈从于权势' },
        { word: '一身正气', score: 15, meaning: '浑身充满正义之气' },
        { word: '冰清玉洁', score: 15, meaning: '如冰玉般纯洁高尚' },
        { word: '出淤泥不染', score: 15, meaning: '在恶劣环境中保持清白' },
        { word: '洁身自好', score: 15, meaning: '保持自身清白，不随波逐流' },
        { word: '一尘不染', score: 15, meaning: '非常纯洁，不沾染丝毫污浊' },
        { word: '廉泉让水', score: 20, meaning: '比喻为官廉洁谦让' },
        { word: '悬壶济世', score: 15, meaning: '比喻医生为人服务，不图报酬' },
        { word: '饮水思源', score: 15, meaning: '不忘本，感恩报答' },
        { word: '不卑不亢', score: 15, meaning: '既不自卑也不傲慢' },
        { word: '高风亮节', score: 15, meaning: '品格高尚，节操坚贞' },
        { word: '德才兼备', score: 15, meaning: '既有品德又有才能' },
        { word: '志存高远', score: 15, meaning: '追求远大的理想和抱负' },
        { word: '厚德载物', score: 15, meaning: '以高尚品德承载万物' },
        { word: '清心寡欲', score: 15, meaning: '保持心地清净，减少私欲' },
        { word: '俭以养德', score: 15, meaning: '节俭可以培养良好品德' },
        { word: '宁静致远', score: 15, meaning: '心境宁静才能实现远大目标' },
        { word: '温良恭俭', score: 15, meaning: '温和善良、恭敬节俭' }
    ],

    // 🔴 腐败基础词（红色，减分）
    negativeBasic: [
        { word: '贪污', score: -10, meaning: '利用职权非法占有公物' },
        { word: '受贿', score: -10, meaning: '非法收受他人财物' },
        { word: '行贿', score: -10, meaning: '用财物贿赂他人' },
        { word: '腐败', score: -10, meaning: '思想行为堕落，作风败坏' },
        { word: '贪婪', score: -10, meaning: '贪得无厌，不知满足' },
        { word: '自私', score: -10, meaning: '只顾自己，不顾他人' },
        { word: '虚荣', score: -10, meaning: '追求表面上的荣耀' },
        { word: '冷漠', score: -10, meaning: '对人或事缺乏热情' },
        { word: '懈怠', score: -10, meaning: '松懈懒散，不努力' },
        { word: '奢靡', score: -10, meaning: '过分追求奢侈享受' },
        { word: '贿赂', score: -10, meaning: '用财物买通他人' },
        { word: '徇私', score: -10, meaning: '为了私情而做不公正的事' },
        { word: '枉法', score: -10, meaning: '歪曲和破坏法律' },
        { word: '舞弊', score: -10, meaning: '用欺骗方式做违法乱纪的事' },
        { word: '渎职', score: -10, meaning: '严重不负责任，损害公共利益' },
        { word: '侵吞', score: -10, meaning: '非法占有他人或公共财物' },
        { word: '挪用', score: -10, meaning: '擅自使用公款公物' },
        { word: '暴利', score: -10, meaning: '用不正当手段获取的巨额利润' },
        { word: '投机', score: -10, meaning: '利用时机谋取私利' },
        { word: '钻营', score: -10, meaning: '设法谋求个人私利' }
    ],

    // 🔴 腐败成语（红色，减分，生僻成语）
    negativeIdiom: [
        { word: '贪得无厌', score: -15, meaning: '贪心永远不满足' },
        { word: '以权谋私', score: -15, meaning: '利用权力为自己谋取私利' },
        { word: '徇私枉法', score: -15, meaning: '为了私情而歪曲法律' },
        { word: '贪赃枉法', score: -15, meaning: '贪污受贿，歪曲法律' },
        { word: '中饱私囊', score: -15, meaning: '利用职务便利贪污公款' },
        { word: '监守自盗', score: -15, meaning: '盗窃自己负责看管的财物' },
        { word: '假公济私', score: -15, meaning: '假借公家的名义谋取私利' },
        { word: '损公肥私', score: -15, meaning: '损害公家利益而使私人获利' },
        { word: '利欲熏心', score: -15, meaning: '被金钱和私利迷住心窍' },
        { word: '见利忘义', score: -15, meaning: '看到有利可图就忘记道义' },
        { word: '寡廉鲜耻', score: -15, meaning: '不知廉洁，不知羞耻' },
        { word: '贪污腐化', score: -15, meaning: '贪污受贿，生活腐化' },
        { word: '上行下效', score: -15, meaning: '上面的人怎么做，下面的人就效仿' },
        { word: '雁过拔毛', score: -15, meaning: '比喻地方官从上到下都要捞一把' },
        { word: '敲骨吸髓', score: -15, meaning: '比喻残酷压榨剥削' },
        { word: '欲壑难填', score: -15, meaning: '欲望像深沟一样很难填满' },
        { word: '贪污受贿', score: -15, meaning: '利用职权非法获取财物' },
        { word: '蜕化变质', score: -15, meaning: '思想行为变坏，品质败坏' },
        { word: '声色犬马', score: -15, meaning: '形容荒淫享乐的生活方式' },
        { word: '纸醉金迷', score: -15, meaning: '形容奢侈繁华的享乐生活' }
    ],

    // 🟡 稀有廉洁词（金边绿底，高分）
    rarePositive: [
        { word: '出淤泥而不染', score: 30, meaning: '在污浊环境中保持高洁操守' },
        { word: '濯清涟不妖', score: 30, meaning: '经得起诱惑而不张扬' },
        { word: '中通外直', score: 30, meaning: '内心通达，外形正直' },
        { word: '不蔓不枝', score: 30, meaning: '不攀附权贵，不结党营私' },
        { word: '香远益清', score: 30, meaning: '美德名声远播，更加清朗' },
        { word: '亭亭净植', score: 30, meaning: '端庄整洁地立身' },
        { word: '可远观而不可亵玩', score: 30, meaning: '保持尊严，不可轻慢' }
    ],

    // ⚪ 普通食物（白色，普通加分）
    neutral: [
        { word: '学习', score: 5, meaning: '获取知识技能' },
        { word: '思考', score: 5, meaning: '深入分析问题' },
        { word: '实践', score: 5, meaning: '将理论付诸行动' },
        { word: '反省', score: 5, meaning: '自我检查反思' },
        { word: '改进', score: 5, meaning: '改善提高' },
        { word: '努力', score: 5, meaning: '尽量使用力量' },
        { word: '坚持', score: 5, meaning: '坚决保持下去' },
        { word: '专注', score: 5, meaning: '专心注意集中' },
        { word: '耐心', score: 5, meaning: '心里不急躁' },
        { word: '细心', score: 5, meaning: '用心仔细' }
    ]
};

// 稀有腐败词（金边红底，高分减分）- 仅在右侧高风险区
const RARE_NEGATIVE = [
    { word: '买官卖官', score: -30, meaning: '官职成为交易商品' },
    { word: '权色交易', score: -30, meaning: '用权力换取美色' },
    { word: '权钱交易', score: -30, meaning: '用权力换取金钱' },
    { word: '贪污腐败', score: -30, meaning: '利用权力非法获取财富' },
    { word: '家族腐败', score: -30, meaning: '腐败行为波及家族成员' },
    { word: '塌方式腐败', score: -30, meaning: '系统性全面性的腐败' }
];

// 红色诱惑（$符号，高分减分）
const TEMPTATIONS = [
    { word: '$', score: -30, meaning: '金钱诱惑', penalty: 15 },
    { word: '¥', score: -30, meaning: '利益输送', penalty: 15 },
    { word: '◆', score: -30, meaning: '好处费', penalty: 15 }
];

// 词汇库统计
const WORDS_STATS = {
    totalPositive: WORDS.positiveBasic.length + WORDS.positiveIdiom.length + WORDS.rarePositive.length,
    totalNegative: WORDS.negativeBasic.length + WORDS.negativeIdiom.length + RARE_NEGATIVE.length,
    totalNeutral: WORDS.neutral.length,
    totalRare: WORDS.rarePositive.length + RARE_NEGATIVE.length
};

// 获取随机廉洁基础词
function getRandomPositiveBasic() {
    return WORDS.positiveBasic[Math.floor(Math.random() * WORDS.positiveBasic.length)];
}

// 获取随机廉洁成语
function getRandomPositiveIdiom() {
    return WORDS.positiveIdiom[Math.floor(Math.random() * WORDS.positiveIdiom.length)];
}

// 获取随机腐败基础词
function getRandomNegativeBasic() {
    return WORDS.negativeBasic[Math.floor(Math.random() * WORDS.negativeBasic.length)];
}

// 获取随机腐败成语
function getRandomNegativeIdiom() {
    return WORDS.negativeIdiom[Math.floor(Math.random() * WORDS.negativeIdiom.length)];
}

// 获取随机稀有廉洁词
function getRandomRarePositive() {
    return WORDS.rarePositive[Math.floor(Math.random() * WORDS.rarePositive.length)];
}

// 获取随机稀有腐败词
function getRandomRareNegative() {
    return RARE_NEGATIVE[Math.floor(Math.random() * RARE_NEGATIVE.length)];
}

// 获取随机普通词
function getRandomNeutral() {
    return WORDS.neutral[Math.floor(Math.random() * WORDS.neutral.length)];
}

// 获取随机红色诱惑
function getRandomTemptation() {
    return TEMPTATIONS[Math.floor(Math.random() * TEMPTATIONS.length)];
}

// 根据类型获取随机词汇
function getRandomWord(type) {
    switch(type) {
        case 'positive': return getRandomPositiveBasic();
        case 'positiveIdiom': return getRandomPositiveIdiom();
        case 'negative': return getRandomNegativeBasic();
        case 'negativeIdiom': return getRandomNegativeIdiom();
        case 'rarePositive': return getRandomRarePositive();
        case 'rareNegative': return getRandomRareNegative();
        case 'neutral': return getRandomNeutral();
        case 'temptation': return getRandomTemptation();
        default: return getRandomPositiveBasic();
    }
}

// 判断词汇是否为廉洁词
function isPositiveWord(word) {
    return WORDS.positiveBasic.some(w => w.word === word) ||
           WORDS.positiveIdiom.some(w => w.word === word) ||
           WORDS.rarePositive.some(w => w.word === word) ||
           WORDS.neutral.some(w => w.word === word);
}

// 判断词汇是否为腐败词
function isNegativeWord(word) {
    return WORDS.negativeBasic.some(w => w.word === word) ||
           WORDS.negativeIdiom.some(w => w.word === word) ||
           RARE_NEGATIVE.some(w => w.word === word);
}

// 判断词汇是否为稀有词
function isRareWord(word) {
    return WORDS.rarePositive.some(w => w.word === word) ||
           RARE_NEGATIVE.some(w => w.word === word);
}

// 判断词汇是否为诱惑词
function isTemptationWord(word) {
    return TEMPTATIONS.some(w => w.word === word);
}

// 获取词汇释义
function getWordMeaning(word) {
    const allWords = [
        ...WORDS.positiveBasic,
        ...WORDS.positiveIdiom,
        ...WORDS.negativeBasic,
        ...WORDS.negativeIdiom,
        ...WORDS.rarePositive,
        ...WORDS.neutral,
        ...RARE_NEGATIVE,
        ...TEMPTATIONS
    ];
    const found = allWords.find(w => w.word === word);
    return found ? found.meaning : '暂无释义';
}


// 导出所有数据并设置全局兼容
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        WORDS,
        RARE_NEGATIVE,
        TEMPTATIONS,
        WORDS_STATS,
        getRandomPositiveBasic,
        getRandomPositiveIdiom,
        getRandomNegativeBasic,
        getRandomNegativeIdiom,
        getRandomRarePositive,
        getRandomRareNegative,
        getRandomNeutral,
        getRandomTemptation,
        getRandomWord,
        isPositiveWord,
        isNegativeWord,
        isRareWord,
        isTemptationWord,
        getWordMeaning
    };
}

// 设置全局兼容（让game.js可以继续使用CLEAN_WORDS和NEGATIVE_WORDS）
// 这些数组包含纯文本字符串，与原有utils.js兼容
const CLEAN_WORDS = [
    ...WORDS.positiveBasic.map(w => w.word),
    ...WORDS.positiveIdiom.map(w => w.word),
    ...WORDS.rarePositive.map(w => w.word),
    ...WORDS.neutral.map(w => w.word)
];

const NEGATIVE_WORDS = [
    ...WORDS.negativeBasic.map(w => w.word),
    ...WORDS.negativeIdiom.map(w => w.word),
    ...RARE_NEGATIVE.map(w => w.word)
];
