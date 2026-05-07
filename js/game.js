// 全局Game类定义
class Game {
    constructor() {
        console.log('Game构造函数开始执行...');
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 保存工具引用
        this.CLEAN_WORDS = CleanGameUtils.CLEAN_WORDS;
        this.NEGATIVE_WORDS = CleanGameUtils.NEGATIVE_WORDS;
        this.AC_KEYWORDS = CleanGameUtils.AC_KEYWORDS;
        this.WORD_MEANINGS = CleanGameUtils.WORD_MEANINGS;
        this.showToast = CleanGameUtils.showToast;
        
        this.cellSize = 25; // 减小单元格尺寸，适配小地图
        this.mapSizes = {
            small: { width: 400, height: 400, name: '小池荷影', wordRate: 1, temptationRate: 0.02 },
            medium: { width: 600, height: 400, name: '中塘清涟', wordRate: 2, temptationRate: 0.015 },
            large: { width: 800, height: 500, name: '大湖逐波', wordRate: 3, temptationRate: 0.01 }
        };
        this.currentMapSize = 'medium';
        this.canvasWidth = this.mapSizes.medium.width;
        this.canvasHeight = this.mapSizes.medium.height;
        this.redLineX = Math.floor(this.canvasWidth * 0.5);
        this.redLineGap = { y: 5, height: 3 };

        this.snake = [];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.food = null;
        this.words = [];
        this.redTemptation = null;
        this.rareWords = [];

        this.score = 0;
        this.crossCount = 0;
        this.collectedWords = [];
        this.negativeWords = [];
        this.integrityValue = 100;
        this.beyondRedLine = false;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.gameWon = false;
        this.startTime = null;
        this.endReason = '';
        this.lotusUnlocked = false;
        
        // === 词汇学习卡片相关 ===
        this.pendingWord = null;  // 待处理的词汇
        this.pendingWordType = null;  // 词汇类型：'clean' | 'negative' | 'rare'
        
        // === 粒子系统 ===
        this.particles = null;  // 粒子系统实例
        this.redLineBreath = null;  // 红线呼吸效果
        this.screenShake = { intensity: 0, duration: 0, startTime: 0 };
        
        // === 移动模式数据（新增修复） ===
        this.movePatternData = {
            boundaryApproaches: 0,
            redZoneVisits: 0
        };
            
            // === 五重莲境系统 ===
            this.currentLevel = 1;
            this.MAX_LEVEL = 5;
            this.rareCollected = 0;
            this.levelNames = ['莲心初醒', '莲骨渐成', '莲叶田田', '莲茎挺拔', '莲华绽放'];
            this.levelConfigs = {
                1: { redLinePos: 0.78, description: '莲心·认识红线', color: '#4ade80', hasQuiz: false, hasEvent: false, speedMultiplier: 1.0, aiEnabled: false },
                2: { redLinePos: 0.6, description: '莲骨·学会拒绝', color: '#22c55e', hasQuiz: true, hasEvent: true, speedMultiplier: 1.1, aiEnabled: true },
                3: { redLinePos: 0.5, description: '莲叶·对抗心魔', color: '#16a34a', hasQuiz: true, hasEvent: true, speedMultiplier: 1.2, aiEnabled: true },
                4: { redLinePos: 0.4, description: '莲茎·抵制诱惑', color: '#15803d', hasQuiz: true, hasEvent: true, speedMultiplier: 1.3, aiEnabled: true },
                5: { redLinePos: 0.3, description: '莲华·终极考验', color: '#166534', hasQuiz: true, hasEvent: true, speedMultiplier: 1.5, aiEnabled: true }
            };
            this.isLevelTransitioning = false;
            
            // === 随机事件系统 ===
            this.activeEvents = [];
            this.eventTimers = {};
            this.levelEvents = {
                1: ['廉政风暴'],
                2: ['廉政风暴', '糖衣炮弹'],
                3: ['廉政风暴', '糖衣炮弹', '双倍积分'],
                4: ['廉政风暴', '糖衣炮弹', '双倍积分', '迷雾笼罩'],
                5: ['廉政风暴', '糖衣炮弹', '双倍积分', '迷雾笼罩', '心魔暴走']
            };
            this.eventConfigs = {
                '廉政风暴': { duration: 10000, effect: 'negative_clear', description: '所有负面词消失10秒' },
                '糖衣炮弹': { duration: 8000, effect: 'words_toggle', description: '3个绿色词暂时变红' },
                '双倍积分': { duration: 30000, effect: 'double_points', description: '所有词分数翻倍30秒' },
                '迷雾笼罩': { duration: 10000, effect: 'hide_redline', description: '红线暂时消失10秒' },
                '心魔暴走': { duration: 8000, effect: 'ai_crazy', description: 'AI进入疯狂型8秒' }
            };
            
            // === 廉洁修行支线任务系统 ===
            this.branchTasks = [];
            this.completedTasks = [];
            this.taskConfigs = {
                'no_negative': { name: '洁身自好', type: '基础', description: '不吃任何负面词通关', reward: 50 },
                'rare_word_streak': { name: '慧眼识珠', type: '进阶', description: '连续5次比AI先吃到稀有词', reward: 80 },
                'right_zone_survival': { name: '深入虎穴', type: '挑战', description: '在红线右侧停留超过30秒并安全返回', reward: 100 },
                'speed_run': { name: '雷厉风行', type: '进阶', description: '30秒内收集3个廉洁词', reward: 60 },
                'zero_cross': { name: '守身如玉', type: '基础', description: '全程零越界通关', reward: 70 },
                'ai_dodger': { name: '凌波微步', type: '挑战', description: '连续躲避AI撞击5次', reward: 90 }
            };
            this.rareWordStreak = 0;
            this.maxRareWordStreak = 0;
            this.rightZoneStartTime = null;
            this.maxRightZoneTime = 0;
            this.aiDodgeCount = 0;
            
            // === 微教育模块 ===
            this.quizQuestions = [
                { question: '东汉杨震拒绝贿赂的典故是？', options: ['四知', '三顾', '一诺'], answer: 0, explanation: '杨震说："天知，神知，我知，子知，何谓无知！"' },
                { question: '《爱莲说》的作者是？', options: ['周敦颐', '范仲淹', '欧阳修'], answer: 0, explanation: '周敦颐通过莲花赞美了廉洁高尚的品格' },
                { question: '"粉骨碎身浑不怕"出自哪首诗？', options: ['石灰吟', '爱莲说', '陋室铭'], answer: 0, explanation: '于谦的《石灰吟》表达了坚贞不屈的意志' },
                { question: '羊续悬鱼的故事体现了什么品质？', options: ['廉洁自律', '勇敢无畏', '聪明机智'], answer: 0, explanation: '羊续把下属送的鱼挂起来，表明拒绝贿赂的决心' },
                { question: '"君子慎独"出自哪部经典？', options: ['中庸', '论语', '大学'], answer: 0, explanation: '《中庸》强调在无人监督时也要保持品德' },
                { question: '子罕辞玉中，子罕认为什么是宝？', options: ['不贪', '美玉', '名声'], answer: 0, explanation: '子罕说："我以不贪为宝，尔以玉为宝"' },
                { question: '一钱太守说的是谁？', options: ['刘宠', '包拯', '海瑞'], answer: 0, explanation: '刘宠离任时只接受百姓一文钱，被称为一钱太守' },
                { question: '包拯的故乡在今天的哪个省？', options: ['安徽', '河南', '山东'], answer: 0, explanation: '包拯是安徽合肥人，以清正廉洁著称' },
                { question: '"公生明，廉生威"是谁说的？', options: ['包拯', '海瑞', '于谦'], answer: 0, explanation: '这句话强调公正和廉洁的重要性' },
                { question: '海瑞是哪个朝代的人？', options: ['明朝', '宋朝', '元朝'], answer: 0, explanation: '海瑞是明朝著名的清官' },
                { question: '"两袖清风"形容的是谁？', options: ['于谦', '包拯', '狄青'], answer: 0, explanation: '于谦每次入京从不带任何馈赠，只带两袖清风' },
                { question: '《石灰吟》的作者是？', options: ['于谦', '文天祥', '岳飞'], answer: 0, explanation: '明代于谦以石灰自喻，表达粉骨碎身浑不怕的精神' },
                { question: '"出淤泥而不染"比喻什么品质？', options: ['廉洁自律', '勤奋好学', '英勇无畏'], answer: 0, explanation: '莲花从淤泥中长出却不沾染污浊，象征廉洁高尚' },
                { question: '周敦颐是什么朝代的哲学家？', options: ['宋代', '唐代', '明代'], answer: 0, explanation: '周敦颐是北宋理学家，《爱莲说》的作者' },
                { question: '"鞠躬尽瘁，死而后已"出自哪个典故？', options: ['诸葛亮', '周瑜', '曹操'], answer: 0, explanation: '诸葛亮在《后出师表》中表达为国效忠的决心' },
                { question: '"鞠躬尽瘁"常与哪个词搭配形容廉洁品质？', options: ['勤政', '享乐', '敛财'], answer: 0, explanation: '鞠躬尽瘁形容勤勉工作，为民服务' },
                { question: '"一身正气"可以形容以下哪位历史人物？', options: ['文天祥', '和珅', '秦桧'], answer: 0, explanation: '文天祥《正气歌》展现了其一身正气的品格' },
                { question: '"先天下之忧而忧，后天下之乐而乐"出自谁之口？', options: ['范仲淹', '欧阳修', '韩愈'], answer: 0, explanation: '范仲淹在《岳阳楼记》中表达忧国忧民的情怀' },
                { question: '范仲淹是哪个朝代的政治家？', options: ['宋代', '唐代', '明代'], answer: 0, explanation: '范仲淹是北宋著名的政治家、文学家' },
                { question: '"苟利国家生死以，岂因祸福避趋之"是谁的名言？', options: ['林则徐', '曾国藩', '李鸿章'], answer: 0, explanation: '林则徐表达为国家利益不惜牺牲个人的精神' },
                { question: '林则徐以销毁鸦片闻名，他的精神品质是？', options: ['刚正不阿', '阿谀奉承', '贪生怕死'], answer: 0, explanation: '林则徐虎门销烟展现了刚正不阿的品格' },
                { question: '"以史为鉴，可以知兴替"出自哪里？', options: ['《旧唐书》', '《三国演义》', '《本草纲目》'], answer: 0, explanation: '《旧唐书·魏徵传》中唐太宗的话语' },
                { question: '唐太宗认为"以铜为镜，可以知兴替"的下一句是？', options: ['以古为镜', '以人为镜', '以史为镜'], answer: 1, explanation: '唐太宗说："以铜为镜，可以正衣冠；以人为镜，可以知得失"' },
                { question: '魏徵是哪个朝代的谏臣？', options: ['唐代', '宋代', '明代'], answer: 0, explanation: '魏徵是唐太宗时期的著名谏臣' },
                { question: '"良药苦口利于病，忠言逆耳利于行"告诉我们要？', options: ['虚心接受批评', '听不进不同意见', '固执己见'], answer: 0, explanation: '这句话提醒我们要善于接受批评和建议' },
                { question: '"富贵不能淫，贫贱不能移，威武不能屈"出自？', options: ['《孟子》', '《论语》', '《大学》'], answer: 0, explanation: '孟子的话表达了大丈夫的高尚气节' },
                { question: '包拯在戏曲中通常以什么颜色面具出现？', options: ['黑色', '白色', '红色'], answer: 0, explanation: '包拯以黑脸著称，象征铁面无私' },
                { question: '"铁面无私"形容谁在戏曲中经常出现？', options: ['包拯', '刘备', '诸葛亮'], answer: 0, explanation: '包拯因公正无私被称颂为铁面御史' },
                { question: '狄青是哪个朝代的将领？', options: ['宋代', '唐代', '明代'], answer: 0, explanation: '狄青是北宋名将，以勇武著称' },
                { question: '"当官之法，惟有三事"指的是哪三事？', options: ['清、慎、勤', '忠、孝、义', '礼、义、廉'], answer: 0, explanation: '《官箴》曰："当官之法，惟有三事：曰清、曰慎、曰勤"' },
                { question: '《官箴》中的"三事"不包括以下哪一项？', options: ['贪', '清', '慎'], answer: 0, explanation: '"曰清、曰慎、曰勤"，不包括贪' },
                { question: '"清风两袖朝天去"下一句是？', options: ['免得闾阎话短长', '留取丹心照汗青', '一片冰心在玉壶'], answer: 0, explanation: '于谦《入京》全句：清风两袖朝天去，免得闾阎话短长' },
                { question: '于谦的别号是？', options: ['少保', '太师', '学士'], answer: 0, explanation: '于谦官至少保，人称于少保' },
                { question: '"要留清白在人间"出自于谦的哪首诗？', options: ['石灰吟', '咏煤炭', '北风吹'], answer: 0, explanation: '《石灰吟》：粉骨碎身浑不怕，要留清白在人间' },
                { question: '"莫见乎隐，莫显乎微"强调的是什么？', options: ['慎独', '享乐', '贪婪'], answer: 0, explanation: '《中庸》语，意为在隐蔽处更要谨慎' },
                { question: '"君子必慎其独也"强调在无人监督时要？', options: ['坚守道德', '放纵自己', '随波逐流'], answer: 0, explanation: '强调即使独处也要保持高尚品德' },
                { question: '"克己复礼为仁"出自哪部经典？', options: ['《论语》', '《孟子》', '《中庸》'], answer: 0, explanation: '颜渊问仁，孔子回答：克己复礼为仁' },
                { question: '"非淡泊无以明志"的下一句是？', options: ['非宁静无以致远', '非勤奋无以成材', '非仁义无以立身'], answer: 0, explanation: '诸葛亮《诫子书》：非淡泊无以明志，非宁静无以致远' },
                { question: '诸葛亮《诫子书》中的"静以修身"上一句是？', options: ['俭以养德', '勤以补拙', '廉以养德'], answer: 0, explanation: '《诫子书》：夫君子之行，静以修身，俭以养德' },
                { question: '"静以修身，俭以养德"出自？', options: ['《诫子书》', '《出师表》', '《隆中对》'], answer: 0, explanation: '诸葛亮写给儿子诸葛瞻的《诫子书》' },
                { question: '"非宁静无以致远"中"致远"的意思是？', options: ['达到远大目标', '走向远方', '躲避现实'], answer: 0, explanation: '致远意为达到远大目标，成就一番事业' },
                { question: '"君子坦荡荡"的下一句是？', options: ['小人长戚戚', '君子喻于义', '小人喻于利'], answer: 0, explanation: '《论语》：君子坦荡荡，小人长戚戚' },
                { question: '"君子喻于义，小人喻于利"出自？', options: ['《论语》', '《孟子》', '《大学》'], answer: 0, explanation: '《论语》中孔子的话，区分君子与小人的不同' },
                { question: '"守正不阿"的意思是？', options: ['坚守正义不屈从', '守株待兔', '阿谀奉承'], answer: 0, explanation: '坚持正道，不屈服于权势压力' },
                { question: '"出淤泥而不染"比喻什么样的品格？', options: ['洁身自好', '同流合污', '随波逐流'], answer: 0, explanation: '莲花从淤泥中长出却不被污染，象征高尚品格' },
                { question: '"浊者自浊，清者自清"说明什么道理？', options: ['品性好坏由自己决定', '环境决定一切', '命运天注定'], answer: 0, explanation: '强调个人的品德取决于自己的选择' },
                { question: '"壁立千仞，无欲则刚"出自哪里？', options: ['《林则徐》', '《出师表》', '《满江红》'], answer: 0, explanation: '林则徐书此联于府衙，表达了无私欲则刚强的精神' },
                { question: '"无欲则刚"的上一句是？', options: ['壁立千仞', '心静如水', '德高望重'], answer: 0, explanation: '林则徐联：海纳百川有容乃大，壁立千仞无欲则刚' },
                { question: '"海纳百川，有容乃大"是谁的名言？', options: ['林则徐', '曾国藩', '左宗棠'], answer: 0, explanation: '林则徐此联表达宽容大度的胸怀' },
                { question: '以下哪位历史人物以"拒礼"闻名？', options: ['羊续', '曹操', '刘邦'], answer: 0, explanation: '羊续悬鱼拒礼，成为廉洁典范' },
                { question: '中央八项规定精神是在哪一年提出的？', options: ['2012年', '2010年', '2015年'], answer: 0, explanation: '2012年12月4日，中央政治局审议通过八项规定' },
                { question: '"老虎苍蝇一起打"是谁提出的反腐败口号？', options: ['习近平总书记', '温家宝总理', '李克强总理'], answer: 0, explanation: '习近平总书记在反腐败斗争中提出"老虎苍蝇一起打"' },
                { question: '《中华人民共和国监察法》在哪一年正式施行？', options: ['2018年', '2016年', '2020年'], answer: 0, explanation: '监察法于2018年3月20日通过并施行' },
                { question: '"不敢腐、不能腐、不想腐"是什么机制？', options: ['反腐败机制', '人事制度', '财政制度'], answer: 0, explanation: '这是党中央提出的反腐败三不机制' },
                { question: '"四个意识"不包括以下哪一项？', options: ['享乐意识', '政治意识', '核心意识'], answer: 0, explanation: '四个意识是政治意识、大局意识、核心意识、看齐意识' },
                { question: '"两个维护"指的是什么？', options: ['维护核心、维护权威', '维护安全、维护稳定', '维护团结、维护统一'], answer: 0, explanation: '两个维护是维护习近平总书记核心地位和党中央权威' },
                { question: '"不忘初心、牢记使命"主题教育是什么时候开展的？', options: ['2019年', '2018年', '2020年'], answer: 0, explanation: '2019年开展不忘初心、牢记使命主题教育' },
                { question: '监督执纪"四种形态"中让红红脸、出出汗成为常态属于第几种？', options: ['第一种', '第二种', '第三种'], answer: 0, explanation: '第一种形态是经常开展批评和自我批评，让红红脸、出出汗成为常态' },
                { question: '国企人员廉洁从业要求做到公私分明、克己奉公和？', options: ['崇廉拒腐', '贪污腐化', '以权谋私'], answer: 0, explanation: '国企廉洁从业要求公私分明、克己奉公、崇廉拒腐' },
                { question: '习近平总书记说的"当官发财两条道"，下一句是？', options: ['当官就不要发财', '发财就不要当官', '当官才能发财'], answer: 0, explanation: '习近平总书记强调当官就不要发财，要走正道' },
                { question: '《中国共产党廉洁自律准则》共多少条？', options: ['8条', '10条', '6条'], answer: 0, explanation: '准则共8条，规范党员廉洁自律' },
                { question: '党员受到警告处分一年内，不得在党内提升职务和向党外组织推荐担任什么职务？', options: ['高于其原任职务', '等于其原任职务', '所有职务'], answer: 0, explanation: '受警告处分一年内不得担任高于原任职务的职务' },
                { question: '对党员的纪律处分种类不包括？', options: ['开除学籍', '警告、严重警告', '撤销党内职务、留党察看、开除党籍'], answer: 0, explanation: '纪律处分有警告、严重警告、撤销党内职务、留党察看、开除党籍' },
                { question: '党的纪律处分工作应当坚持党要管党、全面从严治党和什么原则？', options: ['纪严于法、纪在法前', '法律优先', '法不责众'], answer: 0, explanation: '党的纪律处分坚持纪严于法、纪在法前，实现纪法分开' },
                { question: '"猎狐行动"是针对什么的专项行动？', options: ['境外追逃追赃', '扫黑除恶', '打击非法集资'], answer: 0, explanation: '猎狐行动是公安部开展的境外追逃专项行动' },
                { question: '监察委员会是行使什么职能的专责机关？', options: ['国家监察', '纪律检查', '行政监督'], answer: 0, explanation: '监察委员会是行使国家监察职能的专责机关' },
                { question: '国家监察委员会由全国人民代表大会产生，对谁负责？', options: ['全国人大及其常委会', '国务院', '中央纪委'], answer: 0, explanation: '国家监察委员会对全国人大及其常委会负责' },
                { question: '党的六大纪律不包括？', options: ['廉洁纪律', '外事纪律', '家庭纪律'], answer: 0, explanation: '党的六大纪律是政治纪律、组织纪律、廉洁纪律、群众纪律、工作纪律、生活纪律' },
                { question: '三重一大制度不包括？', options: ['重大资金使用', '重大决策', '重要人事任免'], answer: 0, explanation: '三重一大是重大决策、重要人事任免、重大项目安排和大额资金使用' },
                { question: '中央纪委国家监委合署办公，实现了什么统一？', options: ['党内监督和国家监察', '党政合一', '上下级监督'], answer: 0, explanation: '纪委监委合署办公，实现了党内监督和国家监察的有机统一' },
                { question: '"打虎拍蝇"中的"打虎"指的是什么？', options: ['查处高级领导干部腐败', '查处基层腐败', '查处境外腐败'], answer: 0, explanation: '打虎指查处高级领导干部腐败案件' },
                { question: '"拍蝇"指的是什么？', options: ['查处群众身边的腐败', '拍摄苍蝇', '打击黑恶势力'], answer: 0, explanation: '拍蝇指查处群众身边的腐败问题和苍蝇式腐败' },
                { question: '廉洁风险防控的核心是什么？', options: ['预防为主', '惩治为主', '追责为主'], answer: 0, explanation: '廉洁风险防控以预防为主，关口前移' },
                { question: '什么是"一岗双责"？', options: ['一个岗位两份责任', '一个岗位一个责任', '两个岗位一份责任'], answer: 0, explanation: '一岗双责指一个岗位既要履行岗位职责，又要履行廉政责任' },
                { question: '"三重一大"决策制度要求对重大事项决策、重要人事任免、重大项目安排和大额资金使用进行什么？', options: ['集体讨论决定', '一把手决定', '上级批准'], answer: 0, explanation: '三重一大事项必须经过集体讨论决定' },
                { question: '党风廉政建设责任制中，各级领导班子和领导干部应当承担什么责任？', options: ['主体责任', '次要责任', '间接责任'], answer: 0, explanation: '领导班子承担主体责任，主要负责人是第一责任人' },
                { question: '监督执纪"四种形态"的运用，主体是哪个部门？', options: ['纪检监察机关', '组织部', '宣传部'], answer: 0, explanation: '监督执纪四种形态由纪检监察机关运用' },
                { question: '廉洁谈话制度不包括以下哪种谈话？', options: ['非正式谈话', '任职谈话', '警示谈话'], answer: 0, explanation: '廉洁谈话包括任职谈话、警示谈话、诫勉谈话等' },
                { question: '党员领导干部操办婚丧喜庆事宜，应当实行什么制度？', options: ['报告制度', '审批制度', '备案制度'], answer: 0, explanation: '党员领导干部操办婚丧喜庆事宜要实行报告制度' },
                { question: '严禁违反规定选拔任用干部，严禁借什么名义弄虚作假？', options: ['组织之名', '工作之名', '学习之名'], answer: 0, explanation: '严禁借组织之名弄虚作假，严禁用人不正之风' },
                { question: '严禁用公款或接受管理服务对象的馈赠进行什么活动？', options: ['公务以外的娱乐', '正常工作', '业务往来'], answer: 0, explanation: '严禁用公款进行高消费娱乐活动或接受馈赠' },
                { question: '公务活动中收受礼品、礼金、有价证券等应当怎么处理？', options: ['一律登记上交', '归个人所有', '留作他用'], answer: 0, explanation: '公务活动中收受的礼品礼金一律登记上交' },
                { question: '因公出国（境）应当坚持什么原则？', options: ['务实高效、精简节约', '奢华大方', '多多益善'], answer: 0, explanation: '因公出国（境）坚持务实高效、精简节约的原则' },
                { question: '领导干部离职或退休后几年内，不得从事与原任职务相关的营利性活动？', options: ['三年', '五年', '一年'], answer: 0, explanation: '领导干部离职或退休后三年内不得从事与原任职务相关的营利性活动' },
                { question: '廉洁风险等级分为哪三级？', options: ['高、中、低', '重、中、轻', '大、中、小'], answer: 0, explanation: '廉洁风险分为高、中、低三个等级' },
                { question: '对企业领导人员实行什么监督？', options: ['三重一监督', '财务监督', '舆论监督'], answer: 0, explanation: '对企业领导人员实行三重一监督制度' },
                { question: '企业生产经营活动中的"红包"、礼金应当怎么处理？', options: ['一律拒收或登记上交', '留作部门经费', '私下收取'], answer: 0, explanation: '企业生产经营中的红包礼金一律拒收或登记上交' }
            ];
            this.classicStories = {
                '慎独': { title: '慎独', source: '《中庸》', story: '道也者，不可须臾离也；可离，非道也。是故君子戒慎乎其所不睹，恐惧乎其所不闻。莫见乎隐，莫显乎微，故君子慎其独也。', meaning: '即使在独处时也要保持谨慎，坚守道德准则。' },
                '克己': { title: '克己复礼', source: '《论语》', story: '颜渊问仁。子曰："克己复礼为仁。一日克己复礼，天下归仁焉。"', meaning: '克制自己的私欲，使言行符合礼的规范。' },
                '守正': { title: '守正不阿', source: '《汉书》', story: '君子独处守正，不挠众枉，强御不能夺其志。', meaning: '坚持正道，不屈服于权势，不随波逐流。' },
                '明德': { title: '明明德', source: '《大学》', story: '大学之道，在明明德，在亲民，在止于至善。', meaning: '弘扬光明正大的品德，使民众受到教化。' },
                '八项规定': { title: '八项规定精神', source: '中共中央', story: '2012年12月4日，中央政治局审议通过关于改进工作作风、密切联系群众的八项规定，包括：改进调查研究、精简会议活动、精简文件简报、改进警卫工作、改进新闻报道、严格文稿发表、厉行勤俭节约。', meaning: '新时代党员干部的行为准则，作风建设永远在路上。' },
                '老虎苍蝇一起打': { title: '反腐败斗争', source: '习近平总书记', story: '"老虎"、"苍蝇"一起打，彰显了党中央反腐败无禁区、全覆盖、零容忍的坚定决心。不管涉及什么人，不论权力大小、职位高低，只要触犯党纪国法，都要严惩不贷。', meaning: '反腐败必须既打大老虎，也拍小苍蝇，绝不姑息。' },
                '监察法': { title: '监察法', source: '全国人大', story: '《中华人民共和国监察法》于2018年3月20日施行，实现对所有行使公权力的公职人员监察全覆盖，构建了不敢腐、不能腐、不想腐的长效机制。', meaning: '用法治思维和法治方式反对腐败，推进国家治理体系现代化。' },
                '四个意识': { title: '四个意识', source: '党中央', story: '增强政治意识、大局意识、核心意识、看齐意识。这四个意识是新时代党员干部必须具备的政治品质，核心是要做到忠诚、干净、担当。', meaning: '在思想上政治上行动上同党中央保持高度一致。' },
                '廉洁从业': { title: '国企人员廉洁从业', source: '国资委', story: '国有企业领导人员应当忠实履行职责，不得谋求非法利益。廉洁从业是国企人员的底线要求，要做到公私分明、克己奉公、崇廉拒腐。', meaning: '国企人员要以廉洁为荣，以贪腐为耻。' },
                '家风建设': { title: '廉洁家风', source: '习近平总书记', story: '"家风正，则民风淳；家风好，则政风清。"良好的家风是抵御腐败的重要防线，党员干部要把家风建设摆在重要位置，严格管好家属和子女。', meaning: '家风正则政风清，廉洁家风是最好的护身符。' },
                '监督执纪': { title: '监督执纪四种形态', source: '中央纪委', story: '监督执纪四种形态：经常开展批评和自我批评、约谈函询，让"红红脸、出出汗"成为常态；党纪轻处分、组织调整成为大多数；重处分、重大职务调整成为少数；严重违纪涉嫌违法立案审查成为极少数。', meaning: '抓早抓小、防微杜渐，让纪律成为带电的高压线。' },
                '不敢腐': { title: '反腐败三不机制', source: '党中央', story: '不敢腐、不能腐、不想腐的反腐败体制机制。不敢腐是前提，要保持惩治腐败高压态势；不能腐是关键，要强化制度建设和监督；不想腐是根本，要加强思想教育。', meaning: '构建不敢腐、不能腐、不想腐的有效机制，从根本上遏制腐败。' },
                '初心使命': { title: '不忘初心、牢记使命', source: '习近平总书记', story: '"一切向前走，都不能忘记走过的路；走得再远、走到再光辉的未来，也不能忘记走过的过去，不能忘记为什么出发。"党员干部要始终牢记为人民谋幸福、为民族谋复兴的初心使命。', meaning: '初心易得，始终难守。要时刻检视自己，不忘初心使命。' },
                '两个维护': { title: '两个维护', source: '党中央', story: '坚决维护习近平总书记党中央的核心、全党的核心地位，坚决维护党中央权威和集中统一领导。这是党的政治建设的首要任务，是最根本的政治纪律和政治规矩。', meaning: '核心意识要落实到行动上，坚决做到两个维护。' },
                '政治生态': { title: '净化政治生态', source: '党中央', story: '政治生态是党风、政风、社会风气的综合体现。净化政治生态要严明党的政治纪律和政治规矩，发展积极健康的党内政治文化，弘扬忠诚老实、公道正派、实事求是、清正廉洁的价值观。', meaning: '营造风清气正的政治生态是全面从严治党的重要目标。' }
            };
            this.warningQuotes = [
                '一念之差，满盘皆输',
                '千里之堤，溃于蚁穴',
                '勿以恶小而为之',
                '警钟长鸣，防微杜渐',
                '手莫伸，伸手必被捉',
                '蝇贪虽小，其害如虎',
                '廉贪一念间，荣辱两重天',
                '祸从贪念起，福从廉洁来',
                '心不动于微利之诱，目不眩于五色之惑',
                '当官发财两条道，当官就不要发财',
                '打虎拍蝇猎狐，反腐败永远在路上',
                '手握戒尺，心存敬畏',
                '权为民所用，情为民所系，利为民所谋',
                '公款姓公，一分一厘不可乱花',
                '公权为民，一丝一毫不可私用',
                '廉洁从业，是对家人最好的回报',
                '莫让贪欲蒙蔽双眼，莫让权力失去约束',
                '一身正气冲天地，两袖清风拂乾坤',
                '吃人家的嘴软，拿人家的手短',
                '人心不足蛇吞象，贪心不足吞太阳'
            ];

            this.achievementTips = [
                '💡 提示：零越界通关可解锁"不蔓不枝"成就',
                '💡 提示：收集3个稀有词可解锁"可远观焉"成就',
                '💡 提示：连续3局零越界可解锁"廉洁守护者"成就',
                '💡 提示：抵抗10次诱惑词可解锁"坚定立场"成就',
                '💡 提示：廉洁值保持80%以上可解锁"纯洁心灵"成就',
                '💡 提示：单局得分超过500可解锁"战略家"成就',
                '💡 提示：3分钟内通关可解锁"速通达人"成就',
                '💡 提示：从未触碰红色诱惑词可解锁"金钱绝缘体"成就',
                '💡 提示：完成全部三关可解锁传说成就"三境圆满"',
                '💡 提示：累计得分2000可解锁"积少成多"成就',
                '💡 提示：以满分廉洁值通过所有关卡可解锁"关卡大师"成就',
                '💡 提示：收集超过100个词汇可解锁"词汇大师"成就'
            ];

            this.currentTipIndex = 0;

            this.animationId = null;
            this.lastTime = 0;
            this.baseSpeed = 220;
            this.speed = 220;
            this.currentSpeedKey = 'normal';  // 当前速度档位
            this.currentMapSize = 'medium';   // 当前地图大小
            this.speedSettings = {
                slow: { ms: 320, name: '慢', emoji: '🐢' },
                normal: { ms: 220, name: '普通', emoji: '🐍' },
                fast: { ms: 140, name: '快', emoji: '🦊' },
                extreme: { ms: 80, name: '极速', emoji: '⚡' }
            };

            // === 机器学习数据收集系统 ===
            this.moveHistory = [];           // 移动历史（最近20步）
            this.rightSideTime = 0;          // 在右侧区域的总时间
            this.totalGameTime = 0;          // 总游戏时间
            this.negativeEaten = 0;          // 吃到负面词数量
            this.positiveEaten = 0;          // 吃到正面词数量
            this.stepsInRightZone = 0;       // 在右侧区域的步数
            this.totalSteps = 0;             // 总步数
            this.lastUpdateTime = null;      // 上次更新时间
            this.riskScore = 0;              // 廉洁风险评分

            // === AI贪欲蛇：多模式智能决策系统 ===
            this.aiSnake = [];
            this.aiSnakeDirection = { x: -1, y: 0 };
            this.aiSnakeTimer = null;
            this.aiSnakeEnabled = true;
            this.playerRewardPenalty = 0;  // AI吃稀有词后的玩家收益惩罚（0-20%）
            
            // AI蛇人格系统：谨慎型/贪婪型/疯狂型
            this.aiPersonality = 'cautious';  // 'cautious' | 'greedy' | 'crazy'
            this.aiPersonalityConfig = {
                cautious: {
                    name: '谨慎型',
                    description: '只在红线边缘活动，绝不深闯，只捡安全区的词',
                    color: '#3b82f6',
                    colorName: 'blue'
                },
                greedy: {
                    name: '贪婪型',
                    description: '直线冲刺高价值词，频繁穿越红线，会故意挡玩家路',
                    color: '#f59e0b',
                    colorName: 'yellow'
                },
                crazy: {
                    name: '疯狂型',
                    description: '无视红线，横冲直撞，会主动撞击玩家',
                    color: '#ef4444',
                    colorName: 'red'
                }
            };
            this.aiModeSwitchCounter = 0;
            this.aiRedLineAwareness = 0.5;  // AI对红线的认知程度（0-1）
            this.aiPlayerAwareness = 0.3;  // AI对玩家的预判意识（0-1）
            
            // AI视野系统
            this.aiVisionRange = {
                near: 3,   // 近程：优先抢玩家附近的词
                medium: 8, // 中程：优先找稀有成语
                far: 15    // 远程：随机巡逻
            };
            this.aiCurrentTarget = null;
            this.aiRiskValue = 0;
            this.aiDecisionLog = [];

            // === 慎独技能 ===
            this.skillCount = 3;  // 初始3次技能
            this.skillActive = false;
            this.skillCooldown = 0;
            
            // === 学习/速通双模式 ===
            this.learningMode = true;  // 默认开启学习模式（显示卡片）
            this.recordedWords = [];   // 记录吃到的所有词汇（用于速通模式结算）
            
            // === 安全区自动巡航 ===
            this.autoCruise = false;
            this.autoCruiseTimer = null;
            this.lastKeyPressTime = Date.now();
            this.cruiseSpeedMultiplier = 0.5;
            
            // === 安全区容错机制 ===
            this.safeZoneTolerance = true;
            this.safeZoneWidth = 0.7;  // 左侧70%为安全区
            
            // === 左侧安全区词监控 ===
            this.leftSideSupplyTimer = null;
            this.isLeftSideEmpty = false;

            // === 新增：动态红线与安全区系统 ===
            this.initialRedLineX = Math.floor(this.canvasWidth * 0.5);  // 初始红线位置
            this.redLineShrinkTimer = null;
            this.redLineShrinkInterval = 15000;  // 每15秒向左收缩一格（优化后）
            this.negativeDensityIncreaseRate = 0.002;  // 负面词密度随时间线性增长（加快）
            
            // === 新增：越界代价递增系统（修正：第1/2次惩罚相同） ===
            this.crossEffects = [
                { penalty: { score: 30, integrity: 15 }, shortenSnake: 1, confuse: false, description: '越界惩罚' },
                { penalty: { score: 30, integrity: 15 }, shortenSnake: 1, confuse: true, confuseDuration: 3000, description: '糖衣炮弹' },
                { penalty: { score: 0, integrity: 0 }, endGame: true, description: '游戏结束' }
            ];
            
            // === 新增：高风险区机制（修正：每秒扣2点） ===
            this.highRiskDrainTimer = null;
            this.highRiskDrainInterval = 1000;  // 每1秒扣2点廉洁值
            this.highRiskDrainAmount = 2;  // 每次扣2点
            this.lastHighRiskCheck = null;
            
            // === 新增：稀有词公开竞争与倒计时（优化：8秒） ===
            this.rareWordCountdownTimer = null;
            this.rareWordTimeoutDuration = 8000;  // 8秒倒计时（优化后）
            this.rareWordTransformTimer = null;
            
            // === 新增：AI围猎与让路 ===
            this.circlingMode = false;
            this.aiDefensePatrol = false;
            this.aiDefensePosition = null;
            
            // === 新增：随机事件系统 ===
            this.randomEventTimer = null;
            this.randomEventInterval = 30000;  // 每30秒一次事件
            this.currentRandomEvent = null;
            this.randomEventPool = [
                { name: '廉政风暴', effect: 'clear_negatives', duration: 10000, description: '所有负面词暂时消失！' },
                { name: '糖衣炮弹', effect: 'disguised_negative', duration: 8000, description: '安全区出现伪装成廉洁词的负面词！' },
                { name: '迷雾降临', effect: 'hide_redline', duration: 10000, description: '红线暂时不可见！' },
                { name: '双倍积分', effect: 'double_points', duration: 20000, description: '所有词得分翻倍！' },
                { name: '终极诱惑', effect: 'temptation_surge', duration: 15000, description: '大量金色诱惑点出现！' }
            ];
            this.eventMultiplier = 1;  // 当前事件得分乘数
            
            // === 新增：腐败因子黏附机制 ===
            this.corruptionParticles = 0;  // 身上黏附的腐败因子数量
            this.corruptionParticleVisual = [];  // 可视化粒子位置
            
            // === 新增：AI动态生成词汇 ===
            this.dynamicWordPool = null;
            this.usingDynamicWords = false;
            
            // === AI动态难度调节系统 ===
            this.aiDifficultyAdjustTimer = null;
            this.aiAdjustInterval = 8000; // 每8秒运行一次AI动态调节（优化后）
            this.currentRiskScore = 0; // 当前风险评分 0-100
            this.aiSupplyStrategy = {
                safe_zone_ratio: 1.0,
                rare_word_incentive: false,
                negative_word_density: 0.3
            }; // 豆包API返回的供给策略
            this.lastCrossPosition = null; // 最后一次越界位置
            
            // === 成就系统 ===
            this.achievements = [];
            this.achievementCheck = {
                lotusUnscathed: false,    // 莲华·不染（零越界胜利）
                edgeWalker: false,        // 边缘行者（越界2次内胜利）
                lastStand: false          // 绝地逢生（廉洁值<20%时胜利）
            };

            this.initCanvas();
            this.generateRedLineWithGap();
            this.spawnFood();
            this.spawnWords();
            this.spawnRedTemptation();
            
            // 初始化粒子系统
            this.particles = new GameParticles(this);
            this.redLineBreath = new RedLineBreath(this);
            
            // 初始化屏幕震动
            this.screenShake = { intensity: 0, duration: 0, startTime: 0 };
            
            this.render();
            this.setupEventListeners();
            this.setupMapSelector();
            this.updateWordCloud();
            this.generateBranchTasks();  // 初始化支线任务
            
            // === AI蛇独立化：页面加载时自动启动 ===
            this.initAISnake();
            this.startAISnakeIndependent();
        }

        // 触发屏幕震动效果
        triggerScreenShake(intensity, duration) {
            this.screenShake = {
                intensity: intensity,
                duration: duration,
                startTime: performance.now()
            };
        }

        // 获取当前屏幕震动偏移
        getScreenShakeOffset() {
            if (this.screenShake.intensity <= 0) return { x: 0, y: 0 };
            
            const elapsed = performance.now() - this.screenShake.startTime;
            if (elapsed > this.screenShake.duration) {
                this.screenShake.intensity = 0;
                return { x: 0, y: 0 };
            }
            
            const progress = elapsed / this.screenShake.duration;
            const currentIntensity = this.screenShake.intensity * (1 - progress);
            
            return {
                x: (Math.random() - 0.5) * 2 * currentIntensity,
                y: (Math.random() - 0.5) * 2 * currentIntensity
            };
        }

        initCanvas() {
            this.canvas.width = this.canvasWidth;
            this.canvas.height = this.canvasHeight;
        }

        // === 词汇学习卡片相关方法 ===
        showWordCard(wordText, wordType) {
            const overlay = document.getElementById('wordCardOverlay');
            const card = document.getElementById('wordCard');
            const cardType = document.getElementById('wordCardType');
            const cardWord = document.getElementById('wordCardWord');
            const cardMeaning = document.getElementById('wordCardMeaning');
            const cardQuote = document.getElementById('wordCardQuote');
            
            if (!overlay || !card) return;
            
            // 设置卡片样式
            card.className = 'word-card glass ' + wordType;
            
            // 设置卡片标题
            if (wordType === 'clean') {
                cardType.textContent = '🪷 廉洁词汇';
            } else if (wordType === 'negative') {
                cardType.textContent = '⚠️ 警示词汇';
            } else if (wordType === 'rare') {
                cardType.textContent = '✨ 稀有词汇';
            }
            
            // 设置词汇
            cardWord.textContent = wordText;
            
            // 设置释义
            let meaning = '';
            if (this.WORD_MEANINGS && this.WORD_MEANINGS[wordText]) {
                meaning = this.WORD_MEANINGS[wordText];
            } else if (wordType === 'clean') {
                meaning = '廉洁自律，坚守正道。';
            } else if (wordType === 'negative') {
                meaning = '贪腐行为，警示教训。';
            } else {
                meaning = '珍贵的廉洁文化词汇。';
            }
            cardMeaning.textContent = meaning;
            
            // 设置引用
            let quote = '';
            if (this.AC_KEYWORDS) {
                // 查找匹配的引用
                for (let key in this.AC_KEYWORDS) {
                    if (wordText.includes(key) || key.includes(wordText)) {
                        quote = this.AC_KEYWORDS[key];
                        break;
                    }
                }
            }
            if (!quote) {
                if (wordType === 'clean') {
                    quote = '"清正在德，廉洁在志。" —— 廉洁文化名言';
                } else if (wordType === 'negative') {
                    quote = '"多行不义必自毙。" —— 《左传》';
                } else {
                    quote = '"出淤泥而不染，濯清涟而不妖。" —— 周敦颐《爱莲说》';
                }
            }
            cardQuote.textContent = quote;
            
            // 显示卡片
            overlay.classList.add('show');
            
            // 绑定关闭事件
            const closeBtn = document.getElementById('wordCardClose');
            if (closeBtn) {
                closeBtn.onclick = () => this.closeWordCard();
            }
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    this.closeWordCard();
                }
            };
            
            // 2秒后自动关闭
            setTimeout(() => {
                if (overlay.classList.contains('show')) {
                    this.closeWordCard();
                }
            }, 2500);
        }
        
        closeWordCard() {
            const overlay = document.getElementById('wordCardOverlay');
            if (!overlay) return;
            
            overlay.classList.remove('show');
            
            // 处理待处理的词汇
            if (this.pendingWord && this.pendingWordType) {
                this.processPendingWord();
            }
            
            // 更新UI和重新渲染
            this.updateUI();
            this.render();
            
            // 恢复游戏循环
            this.gamePaused = false;
            if (this.gameRunning && !this.gameOver && !this.gameWon) {
                this.lastTime = performance.now();
                this.gameLoop();
            }
        }
        
        processPendingWord() {
            if (!this.pendingWord || !this.pendingWordType) return;
            
            const word = this.pendingWord;
            const wordType = this.pendingWordType;
            
            if (wordType === 'clean') {
                this.positiveEaten++;
                this.handleCleanWord(word.text);
                this.spawnWords();
            } else if (wordType === 'negative') {
                this.negativeEaten++;
                this.handleNegativeWord(word.text);
                if (this.snake.length > 1) {
                    this.snake.pop();
                }
                this.spawnWords();
            } else if (wordType === 'rare') {
                const reward = Math.floor(30 * (1 - this.playerRewardPenalty));
                this.score += reward;
                this.collectedWords.push(word.text);
                this.rareCollected++;
                
                // 每吃到一个稀有词，充能1次慎独技能
                this.skillCount++;
                this.showToast(`稀有词：${word.text}！+${reward}分，慎独技能+1`, 'success');
                
                // 触发稀有词金色粒子特效
                if (this.particles && word) {
                    const x = word.x * this.cellSize + this.cellSize / 2;
                    const y = word.y * this.cellSize + this.cellSize / 2;
                    this.particles.emitRareWordParticles(x, y, word.text);
                }
                
                // 触发典故卡片
                this.showStoryCard(word.text);
                
                // 更新任务进度
                this.updateRareWordStreak(true);
                
                this.spawnRareWord();
                this.updateUI();
                this.updateWordCloud();
            }
            
            // 清空待处理词汇
            this.pendingWord = null;
            this.pendingWordType = null;
        }

        setupEventListeners() {
            console.log('开始绑定游戏事件监听器...');
            
            // 开始按钮
            const startBtn = document.getElementById('startBtn');
            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    console.log('game.js中的开始按钮被点击！');
                    this.start();
                });
                console.log('开始按钮事件绑定成功');
            } else {
                console.error('找不到startBtn元素！');
            }
            
            // 暂停按钮
            const pauseBtn = document.getElementById('pauseBtn');
            if (pauseBtn) {
                pauseBtn.addEventListener('click', () => this.togglePause());
            }
            
            // 重置按钮
            const mapBtn = document.getElementById('mapBtn');
            if (mapBtn) {
                mapBtn.addEventListener('click', () => this.restart());
            }
            
            // 技能按钮
            const skillBtn = document.getElementById('skillBtn');
            if (skillBtn) {
                skillBtn.addEventListener('click', () => this.useSkill());
            }
            
            // 重新开始按钮（游戏结束时用）
            const restartBtn = document.getElementById('restartBtn');
            if (restartBtn) {
                restartBtn.addEventListener('click', () => {
                    console.log('game.js中的重新开始按钮被点击！');
                    this.closeOverlay();
                    this.restart();
                });
                console.log('重新开始按钮事件绑定成功');
            }

            document.addEventListener('keydown', (e) => this.handleKeyDown(e));
            
            // 添加新的地图和速度选择器
            this.setupNewSpeedControl();
            this.setupNewMapControl();
            
            // 添加导航链接点击事件
            this.setupNavLinks();
        }
        
        setupNewSpeedControl() {
            const speedButtons = document.querySelectorAll('.game-bottom-bar .speed-btn');
            
            speedButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const speedKey = btn.dataset.speed;
                    this.setSpeed(speedKey);
                    
                    // 更新按钮状态
                    speedButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    this.showToast(`速度已调整为${this.speedSettings[speedKey].name}`, 'info');
                });
            });
        }
        
        setupNewMapControl() {
            const mapButtons = document.querySelectorAll('.game-bottom-bar .map-btn');
            
            mapButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const sizeKey = btn.dataset.size;
                    this.setMapSize(sizeKey);
                    
                    // 更新按钮状态
                    mapButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    this.showToast(`地图已切换为${this.mapSizes[sizeKey].name}模式`, 'success');
                });
            });
        }
        
        setupNavLinks() {
            const navLinks = document.querySelectorAll('.nav-link');
            
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    // 移除所有active类
                    navLinks.forEach(l => l.classList.remove('active'));
                    // 添加active类到当前链接
                    link.classList.add('active');
                });
            });
        }

        setupSpeedControl() {
            const speedButtons = document.querySelectorAll('.speed-btn');
            const speedDisplay = document.querySelector('.speed-display');
            
            speedButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const speedKey = btn.dataset.speed;
                    this.setSpeed(speedKey);
                    
                    // 更新按钮状态
                    speedButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // 更新显示
                    const setting = this.speedSettings[speedKey];
                    speedDisplay.textContent = `当前速度：${setting.name} (${setting.ms}ms)`;
                });
            });
        }

        setSpeed(speedKey) {
            const setting = this.speedSettings[speedKey];
            this.baseSpeed = setting.ms;
            this.currentSpeedKey = speedKey;
            
            // 更新当前游戏速度（保持地图难度系数）
            const currentMapSize = this.currentMapSize;
            const sizes = this.mapSizes[currentMapSize];
            const mapDifficultyMultiplier = 1 + (sizes.temptationRate * 8);
            this.speed = Math.floor(this.baseSpeed * mapDifficultyMultiplier);
            
            this.showToast(`速度已调整为${setting.name}`, 'info');
        }

        setupMapSelector() {
            // 暂时禁用旧版地图选择器（已改为简单按钮选择）
            const mapBtn = document.getElementById('mapBtn');
            const mapSelector = document.getElementById('mapSelector');
            
            // 如果元素不存在就直接返回，避免错误
            if (!mapBtn || !mapSelector) {
                console.log('地图选择器元素不存在，跳过setupMapSelector');
                return;
            }
            
            const mapOptions = document.querySelectorAll('.map-option');
            const confirmBtn = document.getElementById('confirmMapBtn');

            mapBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                mapSelector.classList.toggle('active');
            });

            mapOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    mapOptions.forEach(o => o.classList.remove('selected'));
                    option.classList.add('selected');
                });
            });

            if (confirmBtn) {
                confirmBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const selected = document.querySelector('.map-option.selected');
                    if (selected) {
                        const size = selected.dataset.size;
                        this.setMapSize(size);
                        mapSelector.classList.remove('active');
                        this.showToast(`地图已切换为${this.mapSizes[size].name}模式`, 'success');
                    }
                });
            }

            document.addEventListener('click', (e) => {
                if (!mapSelector.contains(e.target) && !mapBtn.contains(e.target)) {
                    mapSelector.classList.remove('active');
                }
            });
        }

        setMapSize(size) {
            this.currentMapSize = size;
            this.canvasWidth = this.mapSizes[size].width;
            this.canvasHeight = this.mapSizes[size].height;

            this.snake = [
                { x: 5, y: Math.floor(this.canvasHeight / this.cellSize / 2) },
                { x: 4, y: Math.floor(this.canvasHeight / this.cellSize / 2) },
                { x: 3, y: Math.floor(this.canvasHeight / this.cellSize / 2) }
            ];
            this.direction = { x: 1, y: 0 };
            this.nextDirection = { x: 1, y: 0 };
            this.score = 0;
            this.crossCount = 0;
            this.collectedWords = [];
            this.negativeWords = [];
            this.integrityValue = 100;
            this.gameOver = false;
            this.gameWon = false;
            this.gamePaused = false;
            this.endReason = '';
            this.lotusUnlocked = false;
            this.words = [];
            this.redTemptation = null;

            this.initCanvas();
            this.generateRedLineWithGap();
            this.spawnFood();
            this.spawnWords();
            this.spawnRedTemptation();
            this.render();
            this.updateUI();
            this.updateWordCloud();

            // 地图难度影响速度，基础速度乘以难度系数
            const sizes = this.mapSizes[size];
            const mapDifficultyMultiplier = 1 + (sizes.temptationRate * 8);
            this.speed = Math.floor(this.baseSpeed * mapDifficultyMultiplier);
        }

        renderBackground() {
            this.ctx.fillStyle = '#1a2632';
            this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            this.drawGrid();
            this.drawRedLine();
        }

        handleKeyDown(e) {
            if (!this.gameRunning || this.isLevelTransitioning) return;
            
            // 空格键暂停/继续
            if (e.key === ' ') {
                e.preventDefault();
                this.togglePause();
                return;
            }
            
            if (this.gamePaused) return;

            this.lastKeyPressTime = Date.now();
            this.autoCruise = false;

            const keyMap = {
                ArrowUp: { x: 0, y: -1 },
                ArrowDown: { x: 0, y: 1 },
                ArrowLeft: { x: -1, y: 0 },
                ArrowRight: { x: 1, y: 0 },
                w: { x: 0, y: -1 },
                s: { x: 0, y: 1 },
                a: { x: -1, y: 0 },
                d: { x: 1, y: 0 },
                W: { x: 0, y: -1 },
                S: { x: 0, y: 1 },
                A: { x: -1, y: 0 },
                D: { x: 1, y: 0 }
            };

            const newDirection = keyMap[e.key];
            if (newDirection) {
                e.preventDefault();
                if (newDirection.x !== -this.direction.x || newDirection.y !== -this.direction.y) {
                    this.nextDirection = newDirection;
                }
            }
        }

        start() {
            console.log('🎮 ===== start()函数开始 =====');
            try {
                console.log('1️⃣ 调用this.reset()...');
                this.reset();
                console.log('2️⃣ reset执行完毕');

                this.gameRunning = false;
                this.countdownPhase = true;
                this.countdownNumber = 3;

                console.log('3️⃣ 调用this.updateUI()...');
                this.updateUI();
                console.log('4️⃣ updateUI执行完毕');

                // 初始化ML模型
                this.initMLModels();

                console.log('5️⃣ 调用this.startCountdown()...');
                this.startCountdown();
                console.log('6️⃣ startCountdown执行完毕');

                console.log('✅ ===== start()函数成功结束 =====');
            } catch (error) {
                console.error('❌ start()函数出错：', error);
                alert('start方法错误：' + error.message);
            }
        }

        // 初始化ML模型
        async initMLModels() {
            if (window.mlEngine && !window.mlEngine.isTraining) {
                // 先生成一些训练数据并训练
                const { X, y } = window.mlEngine.generateTrainingData(300);
                await window.mlEngine.trainAllModels(X, y);
                console.log('✅ ML模型训练完成');
            }
        }

        startCountdown() {
            // 显示开局莲花绽放动画
            this.showLotusBloomAnimation(() => {
                // 动画完成后开始倒计时
                this.startCountdownPhase();
            });
        }
        
        startCountdownPhase() {
            this.renderCountdown();
            const countdownInterval = setInterval(() => {
                this.countdownNumber--;
                if (this.countdownNumber <= 0) {
                    clearInterval(countdownInterval);
                    this.countdownPhase = false;
                    this.gameRunning = true;
                    this.startTime = Date.now();
                    this.lastUpdateTime = Date.now();
                    this.lastTime = performance.now();
                    this.initAISnake();
                    this.startAISnakeTimer();
                    
                    // 启动廉洁素养评估会话
                    if (window.integrityAssessment) {
                        window.integrityAssessment.setCurrentPlayer('学习者');
                        this.assessmentSessionId = window.integrityAssessment.startSession('snake');
                    }
                    
                    // === 启动所有新功能的定时器 ===
                    this.startDynamicRedLineSystem();
                    this.startHighRiskDrainSystem();
                    this.startRandomEventSystem();
                    this.startRareWordCountdownSystem();
                    this.startAIDifficultyAdjustment(); // 启动AI动态难度调节引擎
                    
                    this.gameLoop();
                } else {
                    this.renderCountdown();
                }
            }, 1000);
        }
        
        // 显示开局莲花绽放动画
        showLotusBloomAnimation(callback) {
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const lotusPhase = { progress: 0 };
            const animationDuration = 2000;
            const startTime = performance.now();
            
            const animate = () => {
                const elapsed = performance.now() - startTime;
                lotusPhase.progress = Math.min(1, elapsed / animationDuration);
                
                // 清除画布
                this.ctx.fillStyle = '#1a2632';
                this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
                
                // 绘制正在绽放的莲花
                this.drawLotusBloomEffect(centerX, centerY, lotusPhase.progress);
                
                // 显示关卡信息
                if (lotusPhase.progress > 0.7) {
                    const textAlpha = (lotusPhase.progress - 0.7) / 0.3;
                    this.ctx.save();
                    this.ctx.globalAlpha = textAlpha;
                    this.ctx.fillStyle = '#4ade80';
                    this.ctx.font = 'bold 28px "Noto Serif SC", serif';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(`第${this.currentLevel}境 · ${this.levelNames[this.currentLevel - 1]}`, centerX, centerY + 100);
                    this.ctx.restore();
                }
                
                if (lotusPhase.progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // 动画完成，清除并执行回调
                    if (callback) callback();
                }
            };
            
            requestAnimationFrame(animate);
        }
        
        // 绘制莲花绽放效果
        drawLotusBloomEffect(x, y, progress) {
            const petalCount = 12;
            const layers = 3;
            
            for (let layer = 0; layer < layers; layer++) {
                const layerProgress = Math.min(1, Math.max(0, (progress - layer * 0.15) / 0.5));
                const easeProgress = 1 - Math.pow(1 - layerProgress, 3); // easeOutCubic
                
                const baseAngle = (layer - 1) * (Math.PI / 6);
                const petalLength = (40 + layer * 15) * easeProgress;
                const petalWidth = (15 + layer * 5) * easeProgress;
                
                for (let i = 0; i < petalCount; i++) {
                    const angle = baseAngle + (Math.PI * 2 / petalCount) * i;
                    const petalX = x + Math.cos(angle) * petalLength * 0.3;
                    const petalY = y + Math.sin(angle) * petalLength * 0.3;
                    
                    this.ctx.save();
                    this.ctx.translate(petalX, petalY);
                    this.ctx.rotate(angle + Math.PI / 2);
                    
                    // 莲花瓣颜色渐变
                    const colors = ['#4ade80', '#10b981', '#059669'];
                    this.ctx.fillStyle = colors[layer];
                    this.ctx.globalAlpha = easeProgress * 0.8;
                    
                    this.ctx.beginPath();
                    this.ctx.ellipse(0, 0, petalWidth * easeProgress, petalLength * easeProgress, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    this.ctx.restore();
                }
            }
            
            // 莲花中心
            if (progress > 0.3) {
                const centerProgress = Math.min(1, (progress - 0.3) / 0.4);
                this.ctx.save();
                this.ctx.globalAlpha = centerProgress;
                this.ctx.fillStyle = '#fbbf24';
                this.ctx.shadowColor = '#fbbf24';
                this.ctx.shadowBlur = 20 * centerProgress;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 15 * centerProgress, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        }

        renderCountdown() {
            this.render();
            const ctx = this.canvas.getContext('2d');
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 120px "Noto Serif SC", serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.countdownNumber, centerX, centerY);

            ctx.fillStyle = '#8a9aaa';
            ctx.font = '24px "Noto Serif SC", serif';
            ctx.fillText('准备开始', centerX, centerY + 80);
        }

        reset() {
            console.log('🔄 ===== reset()函数开始 =====');
            try {
                // 确保音效系统已初始化
                if (window.gameAudio && window.gameAudio.ensureInitialized) {
                    window.gameAudio.ensureInitialized();
                }
                
                this.snake = [
                    { x: 5, y: Math.floor(this.canvasHeight / this.cellSize / 2) },
                    { x: 4, y: Math.floor(this.canvasHeight / this.cellSize / 2) },
                    { x: 3, y: Math.floor(this.canvasHeight / this.cellSize / 2) }
                ];
                this.direction = { x: 1, y: 0 };
                this.nextDirection = { x: 1, y: 0 };
                this.score = 0;
                this.crossCount = 0;
                this.collectedWords = [];
                this.negativeWords = [];
                this.integrityValue = 100;
                this.beyondRedLine = false;
                this.gameOver = false;
                this.gameWon = false;
                this.gamePaused = false;
                this.endReason = '';
                this.lotusUnlocked = false;
                this.countdownPhase = false;
                this.words = [];
                this.rareWords = [];
                
                // 重置莲境三关
                this.currentLevel = 1;
                this.rareCollected = 0;
                this.isLevelTransitioning = false;
                this.redLineX = Math.floor(this.canvasWidth * 0.5);

                // === 重置机器学习数据 ===
                this.moveHistory = [];
                this.rightSideTime = 0;
                this.totalGameTime = 0;
                this.negativeEaten = 0;
                this.positiveEaten = 0;
                this.stepsInRightZone = 0;
                this.totalSteps = 0;
                this.lastUpdateTime = null;
                this.riskScore = 0;

                // === 重置AI蛇 ===
                this.initAISnake();
                this.playerRewardPenalty = 0;

                // === 重置技能系统 ===
                this.skillCount = 3;
                this.skillActive = false;
                
                // === 重置安全区容错机制 ===
                this.safeZoneTolerance = true;
                this.safeZoneWidth = 0.7;
                
                // === 重置左侧供给监控 ===
                this.isLeftSideEmpty = false;
                if (this.leftSideSupplyTimer) {
                    clearTimeout(this.leftSideSupplyTimer);
                }
                
                // === 重置新功能属性 ===
                // 动态红线与安全区
                this.redLineX = Math.floor(this.canvasWidth * 0.5); // 重置红线位置
                if (this.redLineShrinkTimer) {
                    clearInterval(this.redLineShrinkTimer);
                }
                this.initialRedLineX = this.redLineX;
                
                // 高风险区机制
                if (this.highRiskDrainTimer) {
                    clearInterval(this.highRiskDrainTimer);
                }
                this.lastHighRiskCheck = null;
                
                // 稀有词倒计时
                if (this.rareWordCountdownTimer) {
                    clearInterval(this.rareWordCountdownTimer);
                }
                if (this.rareWordTransformTimer) {
                    clearTimeout(this.rareWordTransformTimer);
                }
                
                // 随机事件系统
                if (this.randomEventTimer) {
                    clearInterval(this.randomEventTimer);
                }
                this.currentRandomEvent = null;
                this.eventMultiplier = 1;
                this.redLineHidden = false;
                
                // 腐败因子
                this.corruptionParticles = 0;
                this.corruptionParticleVisual = [];
                
                // AI围猎模式
                this.circlingMode = false;
                this.aiDefensePatrol = false;
                this.aiDefensePosition = null;
                
                // === 重置AI动态难度调节系统 ===
                if (this.aiDifficultyAdjustTimer) {
                    clearInterval(this.aiDifficultyAdjustTimer);
                }
                this.currentRiskScore = 0;
                this.aiSupplyStrategy = {
                    safe_zone_ratio: 1.0,
                    rare_word_incentive: false,
                    negative_word_density: 0.3
                };
                this.lastCrossPosition = null;

                // === 重置成就系统 ===
                this.achievementCheck = {
                    // 基础成就
                    lotusUnscathed: false,
                    edgeWalker: false,
                    lastStand: false,
                    // 速度难度成就
                    turtle: false,
                    steady: false,
                    swift: false,
                    flash: false,
                    flashPerfect: false,
                    // 地图难度成就
                    smallMap: false,
                    mediumMap: false,
                    largeMap: false,
                    brave: false,
                    // 完美成就
                    pure: false,
                    perfectionist: false,
                    master: false,
                    // 高分成就
                    highScore: false,
                    excellentScore: false,
                    // 首次通关
                    firstWin: false
                };

                this.generateRedLineWithGap();

                this.spawnFood();
                this.spawnWords();
                this.spawnRedTemptation();

                this.updateUI();
                this.updateWordCloud();
                this.closeOverlay();
                
                console.log('✅ ===== reset()函数成功结束 =====');
            } catch (error) {
                console.error('❌ reset()函数出错：', error);
                alert('reset方法错误：' + error.message);
            }
        }

        generateRedLineWithGap() {
            const minLineX = Math.floor((this.canvasWidth * 0.3) / this.cellSize);
            const maxLineX = Math.floor((this.canvasWidth * 0.7) / this.cellSize);
            const lineX = Math.floor(Math.random() * (maxLineX - minLineX)) + minLineX;

            const gapY = Math.floor(Math.random() * (this.canvasHeight / this.cellSize - 8)) + 2;
            const gapHeight = 3;

            this.redLineX = lineX * this.cellSize;
            this.redLineGap = { y: gapY, height: gapHeight };
        }

        restart() {
            this.reset();
            this.gameRunning = true;
            this.startTime = Date.now();
            this.gameLoop();
        }

        togglePause() {
            this.gamePaused = !this.gamePaused;
            
            // 更新按钮文字
            const pauseBtn = document.getElementById('pauseBtn');
            if (pauseBtn) {
                pauseBtn.textContent = this.gamePaused ? '继续' : '暂停';
                pauseBtn.classList.toggle('btn-secondary', !this.gamePaused);
                pauseBtn.classList.toggle('btn-warning', this.gamePaused);
            }
            
            // 如果是暂停，显示暂停遮罩
            if (this.gamePaused) {
                this.showPauseOverlay();
            } else {
                this.hidePauseOverlay();
            }
            
            if (!this.gamePaused && this.gameRunning && !this.gameOver && !this.gameWon) {
                this.lastTime = performance.now();
                this.gameLoop();
            }
        }
        
        showPauseOverlay() {
            let overlay = document.getElementById('pauseOverlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'pauseOverlay';
                overlay.className = 'pause-overlay';
                overlay.innerHTML = `
                    <div class="pause-content glass">
                        <h2>⏸️ 游戏暂停</h2>
                        <p>按空格键或点击"继续"按钮恢复游戏</p>
                        <button class="btn btn-primary" onclick="window.game.togglePause()">继续游戏</button>
                    </div>
                `;
                document.querySelector('.game-container').appendChild(overlay);
            }
            overlay.style.display = 'flex';
        }
        
        hidePauseOverlay() {
            const overlay = document.getElementById('pauseOverlay');
            if (overlay) {
                overlay.style.display = 'none';
            }
        }

        gameLoop(currentTime = 0) {
            if (!this.gameRunning || this.gamePaused || this.gameOver || this.gameWon) return;

            const deltaTime = currentTime - this.lastTime;
            if (deltaTime >= this.speed) {
                this.update();
                this.render();
                this.lastTime = currentTime;
            }

            this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
        }

        update() {
            // 检查是否需要进入自动巡航模式
            this.checkAutoCruise();

            // 如果处于迷惑状态，随机改变方向
            if (this.confused && Math.random() > 0.7) {
                const directions = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
                this.direction = directions[Math.floor(Math.random() * directions.length)];
            } else {
                this.direction = { ...this.nextDirection };
            }

            const head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };

            const currentlyBeyond = head.x * this.cellSize > this.redLineX;
            if (!this.beyondRedLine && currentlyBeyond) {
                this.handleCrossBoundary();
            }
            this.beyondRedLine = currentlyBeyond;

            // 一碰边界就死的规则
            if (this.checkWallCollision(head)) {
                this.endReason = '撞墙';
                this.gameOver = true;
                this.showGameOver();
                return;
            }

            if (this.checkSelfCollision(head)) {
                this.endReason = '自噬';
                this.gameOver = true;
                this.showGameOver();
                return;
            }

            // 检测玩家是否撞到AI蛇身体
            if (this.aiSnake && this.aiSnake.length > 0) {
                const hitAI = this.aiSnake.some((segment, index) => {
                    return index > 0 && segment.x === head.x && segment.y === head.y;
                });
                if (hitAI) {
                    const aiLength = this.aiSnake.length;
                    let penalty = 15;
                    let confuseTime = 1000;
                    let message = '撞到AI心魔！';

                    if (aiLength >= 10) {
                        penalty = 25;
                        confuseTime = 2000;
                        message = '💀 AI心魔已壮大！你受到严重迷惑！';
                    } else if (aiLength >= 6) {
                        penalty = 20;
                        confuseTime = 1500;
                        message = '⚠️ AI心魔正在成长！廉洁值大幅下降！';
                    }

                    this.showToast(message, 'danger');
                    this.integrityValue = Math.max(0, this.integrityValue - penalty);
                    this.confused = true;
                    setTimeout(() => { this.confused = false; }, confuseTime);
                    this.updateUI();
                    return;
                }
            }

            this.snake.unshift(head);

            let ateSomething = false;
            if (this.checkFoodCollision(head)) {
                const reward = Math.floor(10 * (1 - this.playerRewardPenalty));
                this.score += reward;
                this.spawnFood();
                gameAudio.playEat();
                ateSomething = true;
            } else if (this.checkWordCollision(head)) {
                ateSomething = true;
            } else if (this.checkRareWordCollision(head)) {
                ateSomething = true;
            } else if (this.checkRedTemptationCollision(head)) {
                this.handleRedTemptation();
                return;
            }

            if (!ateSomething) {
                this.snake.pop();
            }

            if (this.crossCount >= 3) {
                this.endReason = '三次越界';
                this.gameOver = true;
                this.showGameOver();
                return;
            }

            if (this.integrityValue <= 0) {
                this.endReason = '廉洁值归零';
                this.gameOver = true;
                this.showIntegrityZero();
                return;
            }

            this.checkWinCondition();
            this.updateBehaviorData(head);
            this.updateUI();
            
            // 检查左侧安全区供给
            this.checkLeftSideSupply();
        }

        checkAutoCruise() {
            const now = Date.now();
            const timeSinceLastInput = now - this.lastKeyPressTime;
            
            if (timeSinceLastInput > 3000 && !this.autoCruise && this.gameRunning && !this.gamePaused) {
                const head = this.snake[0];
                const safeZoneBoundary = Math.floor(this.canvasWidth * this.safeZoneWidth / this.cellSize);
                
                if (head.x < safeZoneBoundary) {
                    this.autoCruise = true;
                    this.startAutoCruise();
                    this.showToast('进入安全区自动巡航模式', 'info');
                }
            }
        }
        
        startAutoCruise() {
            this.autoCruiseTimer = setInterval(() => {
                if (!this.gameRunning || this.gamePaused || !this.autoCruise) {
                    clearInterval(this.autoCruiseTimer);
                    return;
                }
                
                const head = this.snake[0];
                const maxX = Math.floor(this.canvasWidth / this.cellSize) - 1;
                const maxY = Math.floor(this.canvasHeight / this.cellSize) - 1;
                
                if (this.direction.x === 0 && this.direction.y === -1 && head.y === 0) {
                    this.nextDirection = { x: 1, y: 0 };
                } else if (this.direction.x === 1 && this.direction.y === 0 && head.x >= maxX * 0.6) {
                    this.nextDirection = { x: 0, y: 1 };
                } else if (this.direction.x === 0 && this.direction.y === 1 && head.y >= maxY) {
                    this.nextDirection = { x: -1, y: 0 };
                } else if (this.direction.x === -1 && this.direction.y === 0 && head.x === 0) {
                    this.nextDirection = { x: 0, y: -1 };
                }
            }, this.speed * this.cruiseSpeedMultiplier);
        }
        
        handleSafeZoneCollision(head) {
            this.score = Math.max(0, this.score - 5);
            this.showToast('安全区撞墙！-5分', 'warning');
            
            const maxX = Math.floor(this.canvasWidth / this.cellSize) - 1;
            const maxY = Math.floor(this.canvasHeight / this.cellSize) - 1;
            
            let newDirection;
            let fixedHead;
            
            if (head.x < 0) {
                fixedHead = { x: 0, y: this.snake[0].y };
                newDirection = { x: 1, y: 0 };
            } else if (head.x > maxX) {
                fixedHead = { x: maxX, y: this.snake[0].y };
                newDirection = { x: -1, y: 0 };
            } else if (head.y < 0) {
                fixedHead = { x: this.snake[0].x, y: 0 };
                newDirection = { x: 0, y: 1 };
            } else if (head.y > maxY) {
                fixedHead = { x: this.snake[0].x, y: maxY };
                newDirection = { x: 0, y: -1 };
            }
            
            this.nextDirection = newDirection;
            this.direction = newDirection;
            this.snake[0] = fixedHead;
            
            this.updateUI();
        }

        checkWinCondition() {
            if (this.collectedWords.length >= 8 && !this.gameWon) {
                if (this.currentLevel < this.MAX_LEVEL) {
                    this.nextLevel();
                } else {
                    this.gameWon = true;
                    this.lotusUnlocked = true;
                    this.endReason = '五境圆满';
                    this.showGameWon();
                }
            }
        }

        nextLevel() {
            // 暂停游戏
            const wasRunning = this.gameRunning;
            this.gameRunning = false;
            this.isLevelTransitioning = true;
            
            // 显示通关莲花旋转聚合动画
            this.showLevelCompleteAnimation(() => {
                // 动画完成后进入下一关
                this.proceedToNextLevel(wasRunning);
            });
        }
        
        proceedToNextLevel(wasRunning) {
            // 根据当前关卡决定是否触发小游戏
            const levelToPass = this.currentLevel;
            this.triggerMiniGameForLevel(levelToPass, () => {
                this.currentLevel++;
                
                // 保存当前游戏状态
                const savedScore = this.score;
                const savedCrossCount = this.crossCount;
                const savedIntegrity = this.integrityValue;
                const savedSnakeLength = this.snake.length;
                
                // 重置词云，但保留分数等数据
                this.collectedWords = [];
                
                // 根据关卡配置设置红线位置
                const mapW = this.canvasWidth;
                const levelConfig = this.levelConfigs[this.currentLevel];
                this.redLineX = Math.floor(mapW * levelConfig.redLinePos);
                
                // 更新游戏速度
                this.speed = Math.floor(this.baseSpeed * levelConfig.speedMultiplier);
                
                // 重新生成地图内容
                this.words = [];
                this.rareWords = [];
                this.spawnWords();
                this.spawnRedTemptation();
                this.generateRedLineWithGap();
                
                // 重置蛇的位置，但保留长度
                const newSnake = [];
                const startY = Math.floor(this.canvasHeight / this.cellSize / 2);
                for (let i = 0; i < savedSnakeLength; i++) {
                    newSnake.push({ x: 5 - i, y: startY });
                }
                this.snake = newSnake;
                this.direction = { x: 1, y: 0 };
                this.nextDirection = { x: 1, y: 0 };
                
                this.isLevelTransitioning = false;
                if (wasRunning) {
                    this.gameRunning = true;
                    this.lastTime = performance.now();
                    this.gameLoop();
                }
            });
        }
        
        // 显示关卡通关动画
        showLevelCompleteAnimation(callback) {
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const lotusPhase = { progress: 0 };
            const animationDuration = 2500;
            const startTime = performance.now();
            
            const animate = () => {
                const elapsed = performance.now() - startTime;
                lotusPhase.progress = Math.min(1, elapsed / animationDuration);
                
                // 清除画布
                this.ctx.fillStyle = '#1a2632';
                this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
                
                // 绘制正在旋转聚合的莲花
                this.drawLotusConvergeEffect(centerX, centerY, lotusPhase.progress);
                
                // 显示进度信息
                if (lotusPhase.progress > 0.5) {
                    const textAlpha = (lotusPhase.progress - 0.5) / 0.5;
                    this.ctx.save();
                    this.ctx.globalAlpha = textAlpha;
                    this.ctx.fillStyle = '#4ade80';
                    this.ctx.font = 'bold 24px "Noto Serif SC", serif';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(`第${this.currentLevel}境完成`, centerX, centerY + 80);
                    this.ctx.fillStyle = '#fbbf24';
                    this.ctx.font = '20px "Noto Serif SC", serif';
                    this.ctx.fillText('即将进入下一境...', centerX, centerY + 120);
                    this.ctx.restore();
                }
                
                if (lotusPhase.progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    if (callback) callback();
                }
            };
            
            requestAnimationFrame(animate);
        }
        
        // 绘制莲花旋转聚合效果
        drawLotusConvergeEffect(x, y, progress) {
            const petalCount = 12;
            const totalRotation = progress * Math.PI * 4; // 旋转4圈
            const convergeProgress = Math.min(1, progress * 1.2);
            
            for (let i = 0; i < petalCount; i++) {
                const baseAngle = (Math.PI * 2 / petalCount) * i;
                const rotation = baseAngle + totalRotation;
                
                // 从外向内聚合
                const startRadius = 150 * (1 - convergeProgress);
                const endRadius = 20 * convergeProgress;
                const radius = startRadius + (endRadius - startRadius) * convergeProgress;
                
                const petalX = x + Math.cos(rotation) * radius;
                const petalY = y + Math.sin(rotation) * radius;
                
                const petalLength = 25 * (1 - convergeProgress * 0.5);
                const petalWidth = 10 * (1 - convergeProgress * 0.5);
                
                this.ctx.save();
                this.ctx.translate(petalX, petalY);
                this.ctx.rotate(rotation + Math.PI / 2);
                this.ctx.globalAlpha = 0.7 + convergeProgress * 0.3;
                
                // 颜色渐变：从绿色到金色
                const r = Math.floor(74 + (251 - 74) * convergeProgress);
                const g = Math.floor(222 + (191 - 222) * convergeProgress);
                const b = Math.floor(128 + (36 - 128) * convergeProgress);
                this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, petalWidth, petalLength, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.restore();
            }
            
            // 中心发光
            if (progress > 0.5) {
                const glowProgress = (progress - 0.5) / 0.5;
                this.ctx.save();
                this.ctx.globalAlpha = glowProgress;
                this.ctx.fillStyle = '#fbbf24';
                this.ctx.shadowColor = '#fbbf24';
                this.ctx.shadowBlur = 30 * glowProgress;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 15 + 10 * glowProgress, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        }
        
        triggerMiniGameForLevel(level, callback) {
            let gameTriggered = false;
            
            switch (level) {
                case 1:
                    // 第一关通关后触发廉洁诘问
                    this.showQuiz(() => {
                        callback();
                    });
                    gameTriggered = true;
                    break;
                case 2:
                    // 第二关通关后触发廉腐配对
                    if (window.MemoryGame) {
                        MemoryGame.showGame();
                        // 等待小游戏关闭
                        const checkGameClosed = setInterval(() => {
                            const overlay = document.querySelector('.minigame-overlay');
                            if (!overlay) {
                                clearInterval(checkGameClosed);
                                callback();
                            }
                        }, 500);
                        gameTriggered = true;
                    }
                    break;
                case 3:
                    // 第三关通关后触发词义连连看
                    if (window.LinkGame) {
                        LinkGame.showGame();
                        // 等待小游戏关闭
                        const checkGameClosed = setInterval(() => {
                            const overlay = document.querySelector('.minigame-overlay');
                            if (!overlay) {
                                clearInterval(checkGameClosed);
                                callback();
                            }
                        }, 500);
                        gameTriggered = true;
                    }
                    break;
                case 4:
                    // 第四关通关后触发廉洁情境决策（暂时跳过）
                    this.showToast('即将进入终极考验！', 'info');
                    setTimeout(() => {
                        callback();
                    }, 1500);
                    gameTriggered = true;
                    break;
            }
            
            if (!gameTriggered) {
                callback();
            }
        }
        
        triggerRandomEvent() {
            if (!this.gameRunning || this.gameOver || this.gameWon) return;
            
            const availableEvents = this.levelEvents[this.currentLevel];
            const eventName = availableEvents[Math.floor(Math.random() * availableEvents.length)];
            this.startEvent(eventName);
        }
        
        startEvent(eventName) {
            if (this.activeEvents.includes(eventName)) return;
            
            const config = this.eventConfigs[eventName];
            this.activeEvents.push(eventName);
            
            this.showToast(`✨ ${eventName}！${config.description}`, 'info');
            
            // 应用事件效果
            switch (config.effect) {
                case 'negative_clear':
                    this.words = this.words.filter(w => w.type !== 'negative');
                    break;
                case 'words_toggle':
                    this.toggleWordsColor();
                    break;
                case 'double_points':
                    this.doublePointsActive = true;
                    break;
                case 'hide_redline':
                    this.hideRedLine = true;
                    break;
                case 'ai_crazy':
                    if (this.aiSnakeEnabled) {
                        this.aiPersonality = 'crazy';
                    }
                    break;
            }
            
            // 设置事件结束定时器
            this.eventTimers[eventName] = setTimeout(() => {
                this.endEvent(eventName);
            }, config.duration);
        }
        
        endEvent(eventName) {
            const config = this.eventConfigs[eventName];
            
            // 恢复事件效果
            switch (config.effect) {
                case 'words_toggle':
                    this.toggleWordsColor();
                    break;
                case 'double_points':
                    this.doublePointsActive = false;
                    break;
                case 'hide_redline':
                    this.hideRedLine = false;
                    break;
                case 'ai_crazy':
                    if (this.aiSnakeEnabled) {
                        this.aiPersonality = 'cautious';
                    }
                    break;
            }
            
            this.activeEvents = this.activeEvents.filter(e => e !== eventName);
            delete this.eventTimers[eventName];
            
            this.showToast(`🌙 ${eventName} 结束`, 'info');
        }
        
        clearAllEvents() {
            Object.keys(this.eventTimers).forEach(eventName => {
                clearTimeout(this.eventTimers[eventName]);
                this.endEvent(eventName);
            });
            this.activeEvents = [];
            this.eventTimers = {};
        }
        
        toggleWordsColor() {
            const positiveWords = this.words.filter(w => w.type === 'positive');
            const toggleCount = Math.min(3, positiveWords.length);
            
            for (let i = 0; i < toggleCount; i++) {
                const word = positiveWords[i];
                word.type = word.type === 'positive' ? 'negative' : 'positive';
                word.originalType = word.type;
            }
        }
        
        // === 支线任务系统 ===
        generateBranchTasks() {
            const allTasks = Object.keys(this.taskConfigs);
            const shuffled = allTasks.sort(() => Math.random() - 0.5);
            this.branchTasks = shuffled.slice(0, 3);
            
            this.updateTasksDisplay();
        }
        
        updateTasksDisplay() {
            const tasksList = document.getElementById('tasksList');
            if (!tasksList) return;
            
            let html = '';
            this.branchTasks.forEach(taskId => {
                const task = this.taskConfigs[taskId];
                const completed = this.completedTasks.includes(taskId);
                html += `
                    <div class="task-item ${completed ? 'completed' : ''}">
                        <span class="task-icon">${completed ? '✓' : '○'}</span>
                        <span class="task-name">${task.name}</span>
                        <span class="task-type">${task.type}</span>
                        <span class="task-reward">+${task.reward}分</span>
                    </div>
                `;
            });
            tasksList.innerHTML = html;
        }
        
        checkTaskCompletion(taskId) {
            if (this.completedTasks.includes(taskId)) return;
            
            const task = this.taskConfigs[taskId];
            this.completedTasks.push(taskId);
            
            this.score += task.reward;
            this.showToast(`🎉 完成任务「${task.name}」！+${task.reward}分`, 'success');
            
            this.updateTasksDisplay();
            this.updateUI();
        }
        
        updateRareWordStreak(playerAte = true) {
            if (playerAte) {
                this.rareWordStreak++;
                this.maxRareWordStreak = Math.max(this.maxRareWordStreak, this.rareWordStreak);
                
                if (this.rareWordStreak >= 5) {
                    this.checkTaskCompletion('rare_word_streak');
                }
            } else {
                this.rareWordStreak = 0;
            }
        }
        
        updateRightZoneTime() {
            if (this.beyondRedLine) {
                if (!this.rightZoneStartTime) {
                    this.rightZoneStartTime = Date.now();
                }
                const elapsed = (Date.now() - this.rightZoneStartTime) / 1000;
                this.maxRightZoneTime = Math.max(this.maxRightZoneTime, elapsed);
                
                if (elapsed >= 30) {
                    this.checkTaskCompletion('right_zone_survival');
                }
            } else {
                this.rightZoneStartTime = null;
            }
        }
        
        checkFinalTasks() {
            if (this.negativeWords.length === 0) {
                this.checkTaskCompletion('no_negative');
            }
            
            if (this.crossCount === 0) {
                this.checkTaskCompletion('zero_cross');
            }
            
            if (this.aiDodgeCount >= 5) {
                this.checkTaskCompletion('ai_dodger');
            }
        }
        
        // === 微教育模块 ===
        async generateAIQuestion() {
            try {
                const response = await fetch('http://localhost:5001/api/ai-generate-question', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        topic: '廉洁、廉政、品德、历史典故',
                        difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)]
                    })
                });
                const data = await response.json();
                if (data.success && data.data) {
                    return data.data;
                }
            } catch (e) {
                console.log('AI题目生成失败，使用静态题库:', e);
            }
            return null;
        }

        async showQuiz(callback) {
            let quiz = null;
            const useAI = Math.random() < 0.3;

            if (useAI) {
                quiz = await this.generateAIQuestion();
            }

            if (!quiz) {
                quiz = this.quizQuestions[Math.floor(Math.random() * this.quizQuestions.length)];
            }
            
            const overlay = document.createElement('div');
            overlay.className = 'quiz-overlay';
            overlay.innerHTML = `
                <div class="quiz-content glass">
                    <div class="quiz-header">🪷 廉洁诘问</div>
                    <div class="quiz-question">${quiz.question}</div>
                    <div class="quiz-options">
                        ${quiz.options.map((opt, i) => `
                            <button class="quiz-option" data-index="${i}">${opt}</button>
                        `).join('')}
                    </div>
                    <div class="quiz-timer">⏱️ 10秒</div>
                </div>
            `;
            document.body.appendChild(overlay);
            
            let timer = 10;
            const timerInterval = setInterval(() => {
                timer--;
                const timerEl = overlay.querySelector('.quiz-timer');
                if (timerEl) {
                    timerEl.textContent = `⏱️ ${timer}秒`;
                    if (timer <= 3) {
                        timerEl.style.color = '#ef4444';
                    }
                }
                
                if (timer <= 0) {
                    clearInterval(timerInterval);
                    this.showQuizResult(overlay, quiz, -1, callback);
                }
            }, 1000);
            
            const options = overlay.querySelectorAll('.quiz-option');
            options.forEach((opt, i) => {
                opt.addEventListener('click', () => {
                    clearInterval(timerInterval);
                    this.showQuizResult(overlay, quiz, i, callback);
                });
            });
        }
        
        showQuizResult(overlay, quiz, selectedIndex, callback) {
            const isCorrect = selectedIndex === quiz.answer;
            const content = overlay.querySelector('.quiz-content');
            
            if (isCorrect) {
                this.score += 20;
                this.showToast('✅ 回答正确！+20分', 'success');
            } else {
                this.score = Math.max(0, this.score - 10);
                this.showToast('❌ 回答错误！-10分', 'danger');
            }
            
            content.innerHTML = `
                <div class="quiz-result ${isCorrect ? 'correct' : 'wrong'}">
                    <div class="result-icon">${isCorrect ? '✅' : '❌'}</div>
                    <div class="result-text">${isCorrect ? '回答正确！' : '回答错误！'}</div>
                    ${quiz.explanation ? `<div class="result-explanation">${quiz.explanation}</div>` : ''}
                </div>
                <button class="btn btn-primary" id="continue-btn">继续游戏</button>
            `;
            
            this.updateUI();
            
            document.getElementById('continue-btn').addEventListener('click', () => {
                overlay.remove();
                if (callback && typeof callback === 'function') {
                    callback();
                }
            });
        }
        
        showStoryCard(word) {
            const story = this.classicStories[word];
            if (!story) return;
            
            const card = document.createElement('div');
            card.className = 'story-card-popup';
            card.innerHTML = `
                <div class="story-card-header">
                    <span class="story-title">📜 ${story.title}</span>
                    <span class="story-source">${story.source}</span>
                </div>
                <div class="story-card-content">${story.story}</div>
                <div class="story-card-meaning">💡 ${story.meaning}</div>
            `;
            document.body.appendChild(card);
            
            setTimeout(() => {
                card.remove();
            }, 5000);
        }
        
        showWarningQuote() {
            const quote = this.warningQuotes[Math.floor(Math.random() * this.warningQuotes.length)];
            
            const warning = document.createElement('div');
            warning.className = 'warning-quote';
            warning.textContent = quote;
            document.body.appendChild(warning);
            
            setTimeout(() => {
                warning.remove();
            }, 3000);
        }

        updateLevelDisplay() {
            const levelEl = document.getElementById('levelDisplay');
            if (levelEl) {
                levelEl.textContent = `第${this.currentLevel}境 · ${this.levelNames[this.currentLevel - 1]}`;
            }
        }

        showLevelTransition() {
            // 暂停游戏
            const wasRunning = this.gameRunning;
            this.gameRunning = false;
            this.isLevelTransitioning = true;
            
            const overlay = document.createElement('div');
            overlay.className = 'level-transition';
            overlay.innerHTML = `
                <div class="level-content">
                    <div class="level-name">第${this.currentLevel}境 · ${this.levelNames[this.currentLevel - 1]}</div>
                    <div class="level-desc">${this.getLevelDescription()}</div>
                    <div class="level-hint">准备好后继续</div>
                </div>
            `;
            document.body.appendChild(overlay);
            
            // 等待2.5秒后继续
            setTimeout(() => {
                overlay.classList.add('fade-out');
                setTimeout(() => {
                    overlay.remove();
                    this.isLevelTransitioning = false;
                    // 恢复游戏运行
                    if (wasRunning) {
                        this.gameRunning = true;
                        this.lastTime = performance.now();
                        this.gameLoop();
                    }
                }, 500);
            }, 2500);
        }

        getLevelDescription() {
            const descs = [
                '初识廉洁，红线宽裕，诱惑初现。',
                '诱惑渐增，边界收紧，考验定力。',
                '终极考验，一念清浊，莲华绽放！'
            ];
            return descs[this.currentLevel - 1];
        }

        checkBoundary(headX) {
            return headX * this.cellSize > this.redLineX;
        }

        handleBoundaryCross() {
            this.crossCount++;
            this.score = Math.max(0, this.score - 50);
            this.integrityValue = Math.max(0, this.integrityValue - 20);
            this.showToast('越过红线！纪律底线不可逾越！', 'danger');
            gameAudio.playCrossBoundary();

            if (this.snake.length > 1) {
                this.snake.pop();
                this.snake.pop();
            }

            this.render();
            this.updateUI();

            if (this.snake.length <= 1 || this.crossCount >= 3) {
                this.endReason = '触碰红线';
                this.gameOver = true;
                this.showGameOver();
            }
        }

        checkWallCollision(head) {
            const maxX = Math.floor(this.canvasWidth / this.cellSize) - 1;
            const maxY = Math.floor(this.canvasHeight / this.cellSize) - 1;
            
            // 检查是否撞到左右边界
            if (head.x < 0 || head.x > maxX) {
                // 安全区撞墙仅扣5分并重置位置，不致死
                if (head.x * this.cellSize <= this.redLineX) {
                    this.score = Math.max(0, this.score - 5);
                    this.showToast('安全区撞墙！-5分', 'warning');
                    // 重置蛇头位置到安全区边缘
                    if (head.x < 0) {
                        this.snake[0].x = 0;
                    } else {
                        this.snake[0].x = maxX;
                    }
                    this.updateUI();
                    return false; // 不致死
                }
                return true; // 高风险区撞墙致死
            }
            
            // 上下边界撞墙致死
            if (head.y < 0 || head.y > maxY) {
                return true;
            }
            
            return false;
        }

        checkSelfCollision(head) {
            return this.snake.some((segment, index) => index > 0 && segment.x === head.x && segment.y === head.y);
        }

        checkFoodCollision(head) {
            return this.food && head.x === this.food.x && head.y === this.food.y;
        }

        checkWordCollision(head) {
            const wordIndex = this.words.findIndex(w => w.x === head.x && w.y === head.y);
            if (wordIndex !== -1) {
                const word = this.words[wordIndex];
                // 先移除词汇，避免重复碰撞
                this.words.splice(wordIndex, 1);
                
                // 记录词汇（用于速通模式结算）
                this.recordedWords.push({ text: word.text, type: word.isClean ? 'clean' : 'negative', time: Date.now() });
                
                if (this.learningMode) {
                    // 学习模式：显示学习卡片
                    this.pendingWord = word;
                    this.pendingWordType = word.isClean ? 'clean' : 'negative';
                    this.gamePaused = true;
                    this.showWordCard(word.text, this.pendingWordType);
                } else {
                    // 速通模式：直接处理词汇
                    this.processWordDirectly(word);
                }
                return true;
            }
            return false;
        }
        
        processWordDirectly(word) {
            if (word.isClean) {
                this.positiveEaten++;
                this.handleCleanWord(word.text);
                this.spawnWords();
            } else {
                this.negativeEaten++;
                this.handleNegativeWord(word.text);
                if (this.snake.length > 1) {
                    this.snake.pop();
                }
                this.spawnWords();
            }
            this.updateUI();
            this.render();
        }

        checkRareWordCollision(head) {
            const rareIndex = this.rareWords.findIndex(w => w.x === head.x && w.y === head.y);
            if (rareIndex !== -1) {
                const word = this.rareWords[rareIndex];
                // 先移除词汇，避免重复碰撞
                this.rareWords.splice(rareIndex, 1);
                
                // 记录稀有词（用于速通模式结算）
                this.recordedWords.push({ text: word.text, type: 'rare', time: Date.now() });
                
                if (this.learningMode) {
                    // 学习模式：显示学习卡片
                    this.pendingWord = word;
                    this.pendingWordType = 'rare';
                    this.gamePaused = true;
                    this.showWordCard(word.text, 'rare');
                } else {
                    // 速通模式：直接处理稀有词
                    this.processRareWordDirectly(word);
                }
                return true;
            }
            return false;
        }
        
        processRareWordDirectly(word) {
            const reward = Math.floor(30 * (1 - this.playerRewardPenalty));
            this.score += reward;
            this.collectedWords.push(word.text);
            this.rareCollected++;
            this.skillCount++;
            this.showToast(`稀有词：${word.text}！+${reward}分，慎独技能+1`, 'success');
            this.updateWordCloud();
            this.updateRareWordStreak(true);
            this.spawnRareWord();
            this.updateUI();
            this.render();
        }

        checkRedTemptationCollision(head) {
            return this.redTemptation && head.x === this.redTemptation.x && head.y === this.redTemptation.y;
        }

        handleRedTemptation() {
            this.showToast('触碰诱惑！扣分惩罚！', 'danger');
            this.score = Math.max(0, this.score - 30);
            this.integrityValue = Math.max(0, this.integrityValue - 15);
            
            // 触发诱惑金色炸裂粒子特效
            if (this.particles && this.redTemptation) {
                const x = this.redTemptation.x * this.cellSize + this.cellSize / 2;
                const y = this.redTemptation.y * this.cellSize + this.cellSize / 2;
                this.particles.emitTemptationParticles(x, y);
            }
            
            if (this.snake.length > 1) {
                this.snake.pop();
            }
            this.spawnRedTemptation();

            this.render();
            this.updateUI();

            if (this.snake.length <= 1) {
                this.endReason = '触碰诱惑';
                this.gameOver = true;
                this.showGameOver();
            }
        }

        handleCleanWord(word) {
            if (!this.collectedWords.includes(word)) {
                this.collectedWords.push(word);
                const baseReward = Math.floor(20 * (1 - this.playerRewardPenalty));
                const reward = baseReward * this.eventMultiplier;
                this.score += reward;
                this.integrityValue = Math.min(100, this.integrityValue + 5);
                this.showToast(`+${word}！+${reward}分`, 'success');
                gameAudio.playEatClean();
                this.updateWordCloud();
                
                // 清除腐败因子
                this.clearCorruptionParticles(1);
                
                // 触发廉洁词粒子特效
                if (this.particles && this.snake.length > 0) {
                    const head = this.snake[0];
                    const x = head.x * this.cellSize + this.cellSize / 2;
                    const y = head.y * this.cellSize + this.cellSize / 2;
                    this.particles.emitCleanWordParticles(x, y);
                }
            }
        }

        handleNegativeWord(word) {
            const penalty = 15 * this.eventMultiplier;
            this.score = Math.max(0, this.score - penalty);
            this.integrityValue = Math.max(0, this.integrityValue - 10);
            this.negativeWords.push(word);
            this.showToast(`-${word}！-${penalty}分 蛇身缩短！`, 'warning');
            gameAudio.playEatNegative();
            
            // 触发负面词粒子特效
            if (this.particles && this.snake.length > 0) {
                const head = this.snake[0];
                const x = head.x * this.cellSize + this.cellSize / 2;
                const y = head.y * this.cellSize + this.cellSize / 2;
                this.particles.emitNegativeWordParticles(x, y);
            }
            
            // 增加腐败因子
            this.addCorruptionParticle();
            
            if (this.snake.length > 1) {
                this.snake.pop();
            }
            
            this.render();
            this.updateUI();

            if (this.snake.length <= 1) {
                this.endReason = '贪腐侵蚀';
                this.gameOver = true;
                this.showGameOver();
            }
        }

        spawnFood() {
            const redLineCellX = this.redLineX / this.cellSize;
            let newFood;
            let attempts = 0;
            do {
                const onRightSide = Math.random() > 0.5;
                let x;

                if (onRightSide) {
                    x = redLineCellX + 1 + Math.floor(Math.random() * ((this.canvasWidth / this.cellSize) - redLineCellX - 2));
                } else {
                    x = 1 + Math.floor(Math.random() * (redLineCellX - 2));
                }

                newFood = {
                    x,
                    y: 1 + Math.floor(Math.random() * (this.canvasHeight / this.cellSize - 2))
                };
                attempts++;
            } while (this.isOccupied(newFood) && attempts < 30);

            this.food = newFood;
        }

        spawnWords() {
            const cleanCount = 8;
            
            // 负面词密度随关卡增长
            let negativeCount;
            if (this.currentLevel === 1) {
                negativeCount = 1; // 第1境：只有1个负面词（新手友好）
            } else if (this.currentLevel >= 2 && this.currentLevel <= 3) {
                negativeCount = 3; // 第2-3境：2-3个
            } else {
                negativeCount = 4; // 第4-5境：3-4个
            }

            const currentCleanCount = this.words.filter(w => w.isClean).length;
            const currentNegativeCount = this.words.filter(w => !w.isClean).length;

            for (let i = currentCleanCount; i < cleanCount; i++) {
                this.spawnSingleWord(true, true);  // 廉洁词优先在安全区
            }
            for (let i = currentNegativeCount; i < negativeCount; i++) {
                this.spawnSingleWord(false, false);  // 负面词可以在两侧
            }

            const rareCount = this.rareWords.length;
            for (let i = rareCount; i < 2; i++) {
                this.spawnRareWord();
            }
        }

        spawnRareWord() {
            const RARE_WORDS = [
                '慎独', '克己', '守正', '明德',
                '两袖清风', '一尘不染', '冰清玉洁', '浩然正气',
                '清正廉明', '大公无私', '刚正不阿', '铁面无私',
                '廉洁奉公', '公而忘私', '奉公守法', '公正廉洁'
            ];
            const text = RARE_WORDS[Math.floor(Math.random() * RARE_WORDS.length)];

            const redLineCellX = Math.floor(this.redLineX / this.cellSize);
            const maxCellX = Math.floor(this.canvasWidth / this.cellSize) - 2;
            const maxCellY = Math.floor(this.canvasHeight / this.cellSize) - 2;

            let newWord;
            let attempts = 0;
            do {
                // 稀有词仅在右侧高风险区刷新
                const x = redLineCellX + 1 + Math.floor(Math.random() * Math.max(1, maxCellX - redLineCellX - 1));
                const y = 1 + Math.floor(Math.random() * maxCellY);

                newWord = {
                    x,
                    y,
                    text,
                    isRare: true,
                    onRightSide: true
                };
                attempts++;
            } while (this.isOccupied(newWord) && attempts < 50);

            if (attempts < 50) {
                this.rareWords.push(newWord);
            }
        }

        spawnSingleWord(isClean, preferLeft = false, nearPosition = null) {
            const wordList = isClean ? this.CLEAN_WORDS : this.NEGATIVE_WORDS;
            const text = wordList[Math.floor(Math.random() * wordList.length)];

            const redLineCellX = Math.floor(this.redLineX / this.cellSize);
            const maxCellX = Math.floor(this.canvasWidth / this.cellSize) - 2;
            const maxCellY = Math.floor(this.canvasHeight / this.cellSize) - 2;

            let newWord;
            let attempts = 0;
            do {
                let x, y;
                if (nearPosition) {
                    // 如果指定了附近位置，在该位置附近生成
                    const offsetRange = 3;
                    x = Math.max(1, Math.min(maxCellX, nearPosition.x + Math.floor((Math.random() - 0.5) * offsetRange)));
                    y = Math.max(1, Math.min(maxCellY, nearPosition.y + Math.floor((Math.random() - 0.5) * offsetRange)));
                } else if (preferLeft && isClean) {
                    // 廉洁词：80%概率在安全区，20%在风险区（增加一点挑战性）
                    const useLeft = Math.random() > 0.2;
                    if (useLeft) {
                        x = 1 + Math.floor(Math.random() * (redLineCellX - 2));
                    } else {
                        x = redLineCellX + 1 + Math.floor(Math.random() * Math.max(1, maxCellX - redLineCellX - 1));
                    }
                } else if (!isClean) {
                    // 负面词：60%概率在风险区，40%在安全区
                    const useRight = Math.random() > 0.4;
                    if (useRight) {
                        x = redLineCellX + 1 + Math.floor(Math.random() * Math.max(1, maxCellX - redLineCellX - 1));
                    } else {
                        x = 1 + Math.floor(Math.random() * (redLineCellX - 2));
                    }
                } else {
                    x = 1 + Math.floor(Math.random() * maxCellX);
                    y = 1 + Math.floor(Math.random() * maxCellY);
                }
                
                // 如果nearPosition为空，需要设置y
                if (!nearPosition) {
                    y = 1 + Math.floor(Math.random() * maxCellY);
                }

                newWord = {
                    x,
                    y,
                    text,
                    isClean,
                    onRightSide: x * this.cellSize > this.redLineX
                };
                attempts++;
            } while (this.isOccupied(newWord) && attempts < 100);

            if (attempts < 100) {
                this.words.push(newWord);
            }
        }

        checkLeftSideSupply() {
            const redLineCellX = Math.floor(this.redLineX / this.cellSize);
            const leftPositiveCount = this.words.filter(w => w.isClean && w.x < redLineCellX).length;

            // 左侧安全区没有绿色词了
            if (leftPositiveCount === 0 && !this.isLeftSideEmpty) {
                this.isLeftSideEmpty = true;
                
                // 8秒后刷新一个绿色词到左侧
                setTimeout(() => {
                    if (this.gameRunning && !this.gameOver && !this.gameWon) {
                        this.spawnSingleWord(true, true);
                        showToast('🌸 新的廉洁词已在安全区出现——耐心守候，亦可抵达。', 'info');
                        this.isLeftSideEmpty = false;
                    }
                }, 8000);
            }
        }

        spawnRedTemptation() {
            let newTemptation;
            let attempts = 0;
            do {
                newTemptation = {
                    x: Math.floor(Math.random() * ((this.canvasWidth - this.redLineX) / this.cellSize - 1)) + Math.floor(this.redLineX / this.cellSize) + 1,
                    y: Math.floor(Math.random() * (this.canvasHeight / this.cellSize - 2)) + 1
                };
                attempts++;
            } while (this.isOccupied(newTemptation) && attempts < 20);

            if (attempts < 20) {
                this.redTemptation = newTemptation;
            }
        }

        isOccupied(pos) {
            return (
                this.snake.some(s => s.x === pos.x && s.y === pos.y) ||
                (this.food && this.food.x === pos.x && this.food.y === pos.y) ||
                this.words.some(w => w.x === pos.x && w.y === pos.y) ||
                this.rareWords.some(w => w.x === pos.x && w.y === pos.y) ||
                (this.redTemptation && this.redTemptation.x === pos.x && this.redTemptation.y === pos.y)
            );
        }

        render() {
            // 应用屏幕震动效果
            const shake = this.getScreenShakeOffset();
            this.ctx.save();
            this.ctx.translate(shake.x, shake.y);
            
            this.ctx.fillStyle = '#1a2632';
            this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

            this.drawGrid();
            this.drawRightZone();
            this.drawRedLine();
            this.drawRareWords();
            this.drawFood();
            this.drawWords();
            this.drawRedTemptation();
            this.drawSnake();
            this.drawAISnake();
            this.drawIntegrityBar();
            
            // 绘制粒子效果
            if (this.particles) {
                this.particles.update();
                this.particles.draw();
            }
            
            // 更新红线呼吸效果
            if (this.redLineBreath) {
                this.redLineBreath.update();
            }
            
            // 恢复画布变换
            this.ctx.restore();
            
            // 左侧无词时显示提示
            if (this.isLeftSideEmpty && this.gameRunning) {
                this.drawLeftSideEmptyHint();
            }

            if (this.lotusUnlocked && this.gameWon) {
                this.drawLotusEffect();
            }
        }

        drawGrid() {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            this.ctx.lineWidth = 1;

            for (let x = 0; x <= this.canvasWidth; x += this.cellSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, this.canvasHeight);
                this.ctx.stroke();
            }

            for (let y = 0; y <= this.canvasHeight; y += this.cellSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.canvasWidth, y);
                this.ctx.stroke();
            }
        }

        drawRightZone() {
            this.ctx.fillStyle = 'rgba(180, 120, 30, 0.06)';
            this.ctx.fillRect(this.redLineX, 0, this.canvasWidth - this.redLineX, this.canvasHeight);

            for (let i = 0; i < 15; i++) {
                const px = this.redLineX + 20 + Math.random() * (this.canvasWidth - this.redLineX - 40);
                const py = Math.random() * this.canvasHeight;
                this.ctx.fillStyle = `rgba(251, 191, 36, ${0.1 + Math.random() * 0.15})`;
                this.ctx.beginPath();
                this.ctx.arc(px, py, 2 + Math.random() * 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        drawRedLine() {
            // 如果红线被隐藏（迷雾事件），不绘制
            if (this.redLineHidden) {
                return;
            }
            
            const gradient = this.ctx.createLinearGradient(this.redLineX, 0, this.redLineX, this.canvasHeight);
            gradient.addColorStop(0, '#ef4444');
            gradient.addColorStop(0.5, '#dc2626');
            gradient.addColorStop(1, '#b91c1c');

            // 获取呼吸亮度
            const brightness = this.redLineBreath ? this.redLineBreath.getBrightness() : 0.5;
            const glowIntensity = 15 + brightness * 10;
            
            this.ctx.fillStyle = gradient;

            const gapY = this.redLineGap.y * this.cellSize;
            const gapHeight = this.redLineGap.height * this.cellSize;

            this.ctx.fillRect(this.redLineX, 0, 4, gapY);
            this.ctx.fillRect(this.redLineX, gapY + gapHeight, 4, this.canvasHeight - gapY - gapHeight);

            // 应用呼吸效果的发光
            this.ctx.shadowColor = '#ef4444';
            this.ctx.shadowBlur = glowIntensity;
            this.ctx.fillRect(this.redLineX, 0, 4, gapY);
            this.ctx.fillRect(this.redLineX, gapY + gapHeight, 4, this.canvasHeight - gapY - gapHeight);
            this.ctx.shadowBlur = 0;

            this.ctx.fillStyle = '#ef4444';
            this.ctx.font = '12px serif';
            this.ctx.fillText('高风险区', this.redLineX + 8, gapY + gapHeight / 2 + 4);
        }

        drawRareWords() {
            const now = Date.now();
            
            this.rareWords.forEach(word => {
                const x = word.x * this.cellSize;
                const y = word.y * this.cellSize;

                // 计算剩余时间百分比
                if (!word.spawnTime) {
                    word.spawnTime = now;
                }
                const elapsed = now - word.spawnTime;
                const remainingPercent = Math.max(0, 1 - (elapsed / this.rareWordTimeoutDuration));
                
                // 根据剩余时间选择颜色
                let borderColor = '#fbbf24';
                if (remainingPercent < 0.3) {
                    borderColor = '#ef4444';
                } else if (remainingPercent < 0.6) {
                    borderColor = '#f97316';
                }

                this.ctx.strokeStyle = borderColor;
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);

                this.ctx.fillStyle = '#047857';
                this.ctx.fillRect(x + 4, y + 4, this.cellSize - 8, this.cellSize - 8);

                this.ctx.fillStyle = '#f0fdf4';
                
                // 根据词的长度调整字体大小（适配25px单元格）
                const textLength = word.text.length;
                let fontSize;
                if (textLength <= 2) {
                    fontSize = 12;
                } else if (textLength <= 4) {
                    fontSize = 10;
                } else if (textLength <= 6) {
                    fontSize = 8;
                } else {
                    fontSize = 7;
                }
                
                this.ctx.font = `bold ${fontSize}px "Noto Serif SC", serif`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(word.text, x + this.cellSize / 2, y + this.cellSize / 2);
                
                // 显示倒计时
                const remainingSeconds = Math.ceil((this.rareWordTimeoutDuration - elapsed) / 1000);
                if (remainingSeconds > 0) {
                    this.ctx.font = 'bold 10px Arial';
                    this.ctx.fillStyle = remainingSeconds < 5 ? '#ef4444' : '#fbbf24';
                    this.ctx.textBaseline = 'top';
                    this.ctx.fillText(`${remainingSeconds}s`, x + this.cellSize / 2, y + this.cellSize - 2);
                }
                
                this.ctx.textAlign = 'left';
                this.ctx.textBaseline = 'alphabetic';
            });
        }

        drawIntegrityBar() {
            const barWidth = 120;
            const barHeight = 12;
            const x = 10;
            const y = 10;

            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(x, y, barWidth, barHeight);

            const integrityWidth = (this.integrityValue / 100) * barWidth;
            let barColor;
            if (this.integrityValue > 60) {
                barColor = '#4ade80';
            } else if (this.integrityValue > 30) {
                barColor = '#f59e0b';
            } else {
                barColor = '#ef4444';
            }

            this.ctx.fillStyle = barColor;
            this.ctx.fillRect(x, y, integrityWidth, barHeight);

            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.strokeRect(x, y, barWidth, barHeight);

            this.ctx.fillStyle = '#fff';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(`廉洁值: ${this.integrityValue}%`, x + barWidth + 10, y + barHeight / 2);

            this.ctx.fillStyle = '#4ade80';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`词云: ${this.collectedWords.length}/8`, this.canvasWidth - 10, y + barHeight / 2);
        }

        drawFood() {
            if (!this.food) return;

            const x = this.food.x * this.cellSize + this.cellSize / 2;
            const y = this.food.y * this.cellSize + this.cellSize / 2;
            const radius = this.cellSize / 2 - 2;

            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(1, '#9ca3af');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }

        drawWords() {
            for (const word of this.words) {
                const x = word.x * this.cellSize + this.cellSize / 2;
                const y = word.y * this.cellSize + this.cellSize / 2;

                if (word.isClean) {
                    this.ctx.fillStyle = '#4ade80';
                    this.ctx.shadowColor = '#4ade80';
                } else {
                    this.ctx.fillStyle = '#ef4444';
                    this.ctx.shadowColor = '#ef4444';
                }

                this.ctx.shadowBlur = 8;
                
                // 根据词的长度调整字体大小（适配25px单元格）
                const textLength = word.text.length;
                let fontSize;
                if (textLength <= 2) {
                    fontSize = 12;
                } else if (textLength <= 4) {
                    fontSize = 10;
                } else if (textLength <= 6) {
                    fontSize = 8;
                } else {
                    fontSize = 7;
                }
                
                this.ctx.font = `bold ${fontSize}px "Noto Serif SC", serif`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(word.text, x, y);
                this.ctx.shadowBlur = 0;
            }
        }

        drawRedTemptation() {
            if (!this.redTemptation) return;

            const x = this.redTemptation.x * this.cellSize + this.cellSize / 2;
            const y = this.redTemptation.y * this.cellSize + this.cellSize / 2;
            const radius = this.cellSize / 2 - 2;

            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, '#fbbf24');
            gradient.addColorStop(0.5, '#f59e0b');
            gradient.addColorStop(1, '#d97706');

            this.ctx.fillStyle = gradient;
            this.ctx.shadowColor = '#fbbf24';
            this.ctx.shadowBlur = 20;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;

            this.ctx.fillStyle = '#0f172a';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('$', x, y);
        }

        drawLeftSideEmptyHint() {
            const redLineCellX = Math.floor(this.redLineX / this.cellSize);
            const x = (redLineCellX / 2) * this.cellSize;
            const y = this.canvasHeight / 2 - 20;

            // 半透明背景
            this.ctx.fillStyle = 'rgba(30, 58, 138, 0.2)';
            this.ctx.fillRect(x - 120, y - 30, 240, 60);
            
            // 边框
            this.ctx.strokeStyle = 'rgba(74, 222, 128, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x - 120, y - 30, 240, 60);

            // 文字
            this.ctx.fillStyle = '#86efac';
            this.ctx.font = 'bold 16px "Noto Serif SC", serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('坚守可待 · 廉洁自来', x, y);
            
            this.ctx.fillStyle = '#a7f3d0';
            this.ctx.font = '13px "Noto Serif SC", serif';
            this.ctx.fillText('8秒后将有新的廉洁词出现', x, y + 20);
        }

        drawSnake() {
            for (let i = this.snake.length - 1; i >= 0; i--) {
                const segment = this.snake[i];
                const x = segment.x * this.cellSize;
                const y = segment.y * this.cellSize;

                if (i === 0) {
                    this.drawSnakeHead(x, y);
                } else {
                    const alpha = 0.3 + (i / this.snake.length) * 0.7;
                    this.ctx.fillStyle = `rgba(74, 222, 128, ${alpha})`;
                    this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
                }
            }
            
            // 绘制腐败因子
            this.drawCorruptionParticles();
        }
        
        drawCorruptionParticles() {
            if (this.corruptionParticles <= 0) return;
            
            // 先更新腐败因子数组，移除过期的
            const now = Date.now();
            this.corruptionParticleVisual = this.corruptionParticleVisual.filter(p => {
                if (!p.spawnTime) p.spawnTime = now;
                return (now - p.spawnTime) < 10000; // 10秒过期
            });
            
            // 确保可视化数组长度不超过实际腐败因子数量
            while (this.corruptionParticleVisual.length > this.corruptionParticles) {
                this.corruptionParticleVisual.pop();
            }
            
            // 绘制每个腐败因子
            this.corruptionParticleVisual.forEach((particle, index) => {
                // 如果粒子没有绑定到蛇身段，或段不存在，就绑定到蛇头附近
                let segmentIndex = particle.segmentIndex;
                if (!this.snake[segmentIndex]) {
                    segmentIndex = Math.min(1, this.snake.length - 1);
                }
                
                const segment = this.snake[segmentIndex];
                const baseX = segment.x * this.cellSize + this.cellSize / 2;
                const baseY = segment.y * this.cellSize + this.cellSize / 2;
                
                const particleX = baseX + particle.offsetX;
                const particleY = baseY + particle.offsetY;
                
                // 腐败因子使用暗红色/黑色
                const alpha = 0.6 + (Math.sin(now / 200 + index) * 0.2);
                this.ctx.fillStyle = `rgba(100, 20, 20, ${alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(particleX, particleY, 5 + index * 0.5, 0, Math.PI * 2);
                this.ctx.fill();
                
                // 发光效果
                this.ctx.shadowColor = 'rgba(200, 50, 50, 0.5)';
                this.ctx.shadowBlur = 8;
                this.ctx.beginPath();
                this.ctx.arc(particleX, particleY, 3 + index * 0.3, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            });
            
            // 在界面显示腐败因子数量
            if (this.corruptionParticles > 0) {
                this.ctx.fillStyle = '#ef4444';
                this.ctx.font = 'bold 12px Arial';
                this.ctx.textAlign = 'right';
                this.ctx.textBaseline = 'top';
                this.ctx.fillText(`腐败因子: ${this.corruptionParticles}`, this.canvasWidth - 10, 30);
            }
        }

        drawAISnake() {
            if (!this.aiSnake || this.aiSnake.length === 0 || !this.aiSnakeEnabled) return;

            const config = this.aiPersonalityConfig[this.aiPersonality];
            const color = config.color;

            for (let i = this.aiSnake.length - 1; i >= 0; i--) {
                const segment = this.aiSnake[i];
                const x = segment.x * this.cellSize;
                const y = segment.y * this.cellSize;

                if (i === 0) {
                    this.ctx.fillStyle = color;
                    this.ctx.shadowColor = color;
                    this.ctx.shadowBlur = 16;
                    this.ctx.beginPath();
                    this.ctx.roundRect(x, y, this.cellSize, this.cellSize, 4);
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                    
                    this.ctx.fillStyle = '#fff';
                    this.ctx.font = 'bold 12px "Microsoft YaHei"';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(config.name.charAt(0), x + this.cellSize / 2, y + this.cellSize / 2);
                } else {
                    const alpha = 0.4 + (i / this.aiSnake.length) * 0.5;
                    const rgb = this.hexToRgb(color);
                    this.ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
                    this.ctx.beginPath();
                    this.ctx.roundRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2, 3);
                    this.ctx.fill();
                }
            }

            if (this.aiSnake.length > 0) {
                const head = this.aiSnake[0];
                this.ctx.fillStyle = color;
                this.ctx.font = '10px "Microsoft YaHei"';
                this.ctx.fillText(`AI·${config.name}`, head.x * this.cellSize - 5, head.y * this.cellSize - 5);
            }
        }
        
        adjustColor(hex, amount) {
            const num = parseInt(hex.replace('#', ''), 16);
            const r = Math.min(255, Math.max(0, (num >> 16) + amount));
            const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
            const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
            return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
        }
        
        hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 251, g: 191, b: 36 };
        }

        drawSnakeHead(x, y) {
            const gradient = this.ctx.createLinearGradient(x, y, x + this.cellSize, y + this.cellSize);
            gradient.addColorStop(0, '#4ade80');
            gradient.addColorStop(1, '#22c55e');

            this.ctx.fillStyle = gradient;
            this.ctx.shadowColor = '#4ade80';
            this.ctx.shadowBlur = 10;
            this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
            this.ctx.shadowBlur = 0;

            this.ctx.fillStyle = '#0f172a';
            const eyeSize = 4;
            const eyeOffset = 5;

            if (this.direction.x === 1) {
                this.ctx.fillRect(x + this.cellSize - eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
                this.ctx.fillRect(x + this.cellSize - eyeOffset - eyeSize, y + this.cellSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            } else if (this.direction.x === -1) {
                this.ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize);
                this.ctx.fillRect(x + eyeOffset, y + this.cellSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            } else if (this.direction.y === 1) {
                this.ctx.fillRect(x + eyeOffset, y + this.cellSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                this.ctx.fillRect(x + this.cellSize - eyeOffset - eyeSize, y + this.cellSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            } else {
                this.ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize);
                this.ctx.fillRect(x + this.cellSize - eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
            }
        }

        drawLotusEffect() {
            const time = Date.now() * 0.002;
            const centerX = this.canvasWidth / 2;
            const centerY = this.canvasHeight / 2;

            this.ctx.save();
            this.ctx.globalAlpha = 0.15 + Math.sin(time) * 0.05;
            this.ctx.shadowColor = '#4ade80';
            this.ctx.shadowBlur = 60 + Math.sin(time * 2) * 30;

            const petalCount = 8;
            for (let i = 0; i < petalCount; i++) {
                const angle = (i / petalCount) * Math.PI * 2 + time * 0.5;
                const petalLength = 40 + Math.sin(time + i) * 15;

                this.ctx.beginPath();
                this.ctx.ellipse(
                    centerX + Math.cos(angle) * 25,
                    centerY + Math.sin(angle) * 25,
                    petalLength,
                    petalLength / 3,
                    angle,
                    0,
                    Math.PI * 2
                );
                this.ctx.fillStyle = `rgba(74, 222, 128, ${0.15 + Math.sin(time + i) * 0.05})`;
                this.ctx.fill();
            }

            this.ctx.restore();
        }

        updateUI() {
            document.getElementById('score').textContent = this.score;
            document.getElementById('wordCount').textContent = `${this.collectedWords.length}/8`;
            document.getElementById('crossCount').textContent = this.crossCount;
            document.getElementById('snakeLength').textContent = this.snake.length;
            document.getElementById('skillCount').textContent = this.skillCount;
            document.getElementById('integrityValue').textContent = this.integrityValue;
            
            // 更新关卡显示
            const levelNames = ['莲心', '莲骨', '莲叶', '莲茎', '莲华'];
            document.getElementById('levelDisplay').textContent = `第${this.currentLevel}境 · ${levelNames[this.currentLevel - 1]}`;
            
            // 更新风险评分和行为模式
            const riskScore = this.predictCorruptionRisk();
            const riskPercent = Math.round(riskScore * 100);
            document.getElementById('riskScore').textContent = `${riskPercent}%`;
            
            const behaviorPattern = this.analyzeMovePattern();
            document.getElementById('behaviorPattern').textContent = behaviorPattern;
            
            // 更新风险特征条
            const features = this.getRiskFeatures();
            const featureElements = ['feature1', 'feature2', 'feature3', 'feature4'];
            featureElements.forEach((id, i) => {
                const el = document.getElementById(id);
                if (el) {
                    el.style.width = `${features[i] * 100}%`;
                    if (features[i] > 0.5) {
                        el.style.background = 'linear-gradient(90deg, #ef4444, #f59e0b)';
                    } else {
                        el.style.background = 'linear-gradient(90deg, #4ade80, #22c55e)';
                    }
                }
            });
            
            // 更新AI状态
            document.getElementById('aiStatus').textContent = this.aiPersonalityConfig[this.aiPersonality].name;
            document.getElementById('aiTarget').textContent = this.aiCurrentTarget ? `追逐中` : '巡逻中';
            document.getElementById('aiRisk').textContent = `${Math.round(this.aiRiskValue * 100)}%`;
            document.getElementById('aiLength').textContent = this.aiSnake ? this.aiSnake.length : 0;

            // 更新ML预测面板
            this.updateMLPredictionPanel();

            // 更新技能按钮文字
            document.getElementById('skillBtn').textContent = `💫 慎独 (${this.skillCount})`;
            
            // 红色晕影效果 - 廉洁值低于30%时显示
            const redVignette = document.getElementById('redVignette');
            if (redVignette) {
                if (this.integrityValue < 30) {
                    redVignette.classList.add('active');
                } else {
                    redVignette.classList.remove('active');
                }
            }
        }
        
        getRiskFeatures() {
            // 模拟四个风险特征值，加入安全检查
            const boundaryTest = (this.movePatternData && this.movePatternData.boundaryApproaches || 0) / 10;
            const redAttraction = (this.movePatternData && this.movePatternData.redZoneVisits || 0) / 5;
            const pathRisk = this.predictCorruptionRisk();
            const decisionHesitation = Math.random() * 0.3;
            
            return [
                Math.min(1, boundaryTest),
                Math.min(1, redAttraction),
                pathRisk,
                decisionHesitation
            ];
        }

        triggerRedLineWarning() {
            const canvasWrapper = document.querySelector('.canvas-wrapper');
            const gameContainer = document.querySelector('.game-container');
            
            if (canvasWrapper) {
                canvasWrapper.classList.add('game-shake');
                setTimeout(() => {
                    canvasWrapper.classList.remove('game-shake');
                }, 400);
            }
            
            if (gameContainer) {
                gameContainer.classList.add('red-flash');
                setTimeout(() => {
                    gameContainer.classList.remove('red-flash');
                }, 300);
            }
        }

        // === 慎独技能：悬崖勒马，返回安全区 ===
        useSkill() {
            if (!this.gameRunning || this.gamePaused || this.gameOver || this.gameWon) {
                showToast("请先开始游戏！", "warning");
                return;
            }
            
            if (this.skillCount <= 0) {
                showToast("慎独技能已用完！", "warning");
                return;
            }
            
            this.skillCount--;
            
            if (!this.beyondRedLine) {
                // 在安全区使用：暂停游戏3秒，清除附近负面词
                this.useSkillInSafeZone();
            } else {
                // 在危险区使用：传送回安全区
                this.useSkillInDangerZone();
            }
        }
        
        toggleLearningMode() {
            this.learningMode = !this.learningMode;
            
            // 更新按钮状态
            const learningBtn = document.getElementById('learningModeBtn');
            const speedBtn = document.getElementById('speedModeBtn');
            
            if (learningBtn && speedBtn) {
                if (this.learningMode) {
                    learningBtn.classList.add('active');
                    speedBtn.classList.remove('active');
                } else {
                    learningBtn.classList.remove('active');
                    speedBtn.classList.add('active');
                }
            }
            
            // 更新模式说明
            const modeDesc = document.getElementById('modeDescription');
            if (modeDesc) {
                if (this.learningMode) {
                    modeDesc.innerHTML = '<p>📖 <strong>学习模式</strong>：收集词汇时显示详细释义卡片，适合学习廉洁知识</p>';
                } else {
                    modeDesc.innerHTML = '<p>⚡ <strong>速通模式</strong>：词汇直接生效不弹窗，适合快速游戏和练习反应</p>';
                }
            }
            
            // 显示提示
            if (this.learningMode) {
                showToast("📖 学习模式：吃词时会显示词汇卡片", "info");
            } else {
                showToast("⚡ 速通模式：吃词直接生效，结算时回顾学习", "info");
            }
            
            console.log('学习模式切换:', this.learningMode ? '学习模式' : '速通模式');
        }
        
        useSkillInSafeZone() {
            // 暂停游戏3秒
            this.gamePaused = true;
            
            // 清除附近1格内的负面词
            const clearedCount = this.clearNearbyNegativeWords();
            
            // 显示慎独画面
            this.showSkillEffect();
            
            setTimeout(() => {
                this.gamePaused = false;
                this.gameLoop();
            }, 3000);
            
            showToast(`君子慎独，静思己过！清除了${clearedCount}个负面词`, "success");
            this.updateUI();
        }
        
        useSkillInDangerZone() {
            // 保存当前位置用于特效
            const startX = this.snake[0].x * this.cellSize + this.cellSize / 2;
            const startY = this.snake[0].y * this.cellSize + this.cellSize / 2;
            
            // 把蛇传送回安全区
            const newHead = {
                x: Math.floor((this.redLineX / this.cellSize) / 2),
                y: this.snake[0].y
            };
            
            // 计算终点位置
            const endX = newHead.x * this.cellSize + this.cellSize / 2;
            const endY = newHead.y * this.cellSize + this.cellSize / 2;
            
            // 调整蛇的位置
            for (let i = 0; i < this.snake.length; i++) {
                this.snake[i] = {
                    x: newHead.x - i,
                    y: newHead.y
                };
            }
            
            // 触发传送特效
            if (this.particles) {
                this.particles.emitTeleportEffect(this.snake, startX, endX, endY);
            }
            
            // 触发屏幕震动
            this.triggerScreenShake(5, 300);
            
            // 清除附近负面词
            this.clearNearbyNegativeWords();
            
            this.beyondRedLine = false;
            showToast("悬崖勒马！已返回安全区", "success");
            this.updateUI();
        }
        
        clearNearbyNegativeWords() {
            const head = this.snake[0];
            let clearedCount = 0;
            
            this.words = this.words.filter(word => {
                if (word.type !== 'negative') return true;
                
                const distance = Math.abs(word.x - head.x) + Math.abs(word.y - head.y);
                if (distance <= 1) {
                    clearedCount++;
                    return false;
                }
                return true;
            });
            
            return clearedCount;
        }
        
        showSkillEffect() {
            const ctx = this.canvas.getContext('2d');
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px "Noto Serif SC", serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('君子慎独，静思己过', this.canvasWidth / 2, this.canvasHeight / 2);
        }

        // === 机器学习：行为数据收集 ===
        updateBehaviorData(head) {
            const now = Date.now();
            const currentlyBeyond = head.x * this.cellSize > this.redLineX;
            const nearRedLine = Math.abs(head.x * this.cellSize - this.redLineX) < this.cellSize * 3;

            // 更新时间数据
            if (this.lastUpdateTime) {
                const deltaTime = (now - this.lastUpdateTime) / 1000;
                this.totalGameTime += deltaTime;
                if (currentlyBeyond) {
                    this.rightSideTime += deltaTime;
                }
            }
            this.lastUpdateTime = now;

            // 更新步数数据
            this.totalSteps++;
            if (currentlyBeyond) {
                this.stepsInRightZone++;
            }

            // 记录移动历史（最近20步）
            this.moveHistory.push({
                direction: { ...this.direction },
                inDangerZone: currentlyBeyond,
                nearRedLine: nearRedLine,
                timestamp: now
            });
            if (this.moveHistory.length > 20) {
                this.moveHistory.shift();
            }
        }

        // === 机器学习：逻辑回归廉洁风险预测 ===
        predictCorruptionRisk() {
            const totalEaten = this.positiveEaten + this.negativeEaten || 1;
            const negativeRatio = this.negativeEaten / totalEaten;
            const rightSideTimeRatio = this.totalGameTime > 0 ? this.rightSideTime / this.totalGameTime : 0;
            const normalizedScore = Math.min(this.score / 1000, 1);
            const crossCountNormalized = Math.min(this.crossCount / 3, 1);

            // 逻辑回归权重：越界次数权重最高，其次是负面词比例和右侧时间
            const weights = [0.45, 0.25, 0.2, -0.1];
            const bias = -0.4;

            const features = [
                crossCountNormalized,       // 越界次数（归一化到0-1）
                negativeRatio,              // 负面词比例
                rightSideTimeRatio,         // 右侧时间占比
                normalizedScore             // 归一化分数
            ];

            let logit = bias;
            for (let i = 0; i < features.length; i++) {
                logit += weights[i] * features[i];
            }

            // Sigmoid函数输出0-1的概率
            const probability = 1 / (1 + Math.exp(-logit));
            this.riskScore = probability;
            return probability;
        }

        // === 序列模式挖掘：分析玩家路径模式 ===
        analyzeMovePattern() {
            const dangerMoves = this.moveHistory.filter(m => m.inDangerZone).length;
            const nearRedLineMoves = this.moveHistory.filter(m => m.nearRedLine && !m.inDangerZone).length;

            if (dangerMoves > 8) {
                return `您在危险区域停留了${dangerMoves}步，存在明显的"边界试探"倾向，风险较高！`;
            } else if (dangerMoves > 4) {
                return `您在红线附近徘徊${nearRedLineMoves}步，属于"边缘游走"状态，需保持警惕。`;
            } else if (nearRedLineMoves > 10) {
                return `您在红线边缘试探${nearRedLineMoves}次，虽未越界，但心态值得反思。`;
            } else if (this.crossCount === 0) {
                return `恭喜！您全程坚守底线，零越界记录，是廉洁表率！`;
            } else {
                return `您的路径整体稳健，偶尔的探索也在可控范围内。`;
            }
        }

        // === AI贪欲蛇：多模式智能决策系统 ===
        initAISnake() {
            const redLineInCells = Math.floor(this.redLineX / this.cellSize);
            const startX = redLineInCells + 2;
            const startY = Math.floor(this.canvasHeight / this.cellSize / 2);
            this.aiSnake = [
                { x: startX, y: startY },
                { x: startX + 1, y: startY },
                { x: startX + 2, y: startY }
            ];
            this.aiSnakeDirection = { x: -1, y: 0 };
            this.aiPersonality = 'cautious';
            this.aiModeSwitchCounter = 0;
            this.aiRedLineAwareness = 0.5;
            this.aiPlayerAwareness = 0.3;
            this.aiCurrentTarget = null;
            this.aiRiskValue = 0;
            this.aiSpeedLevel = 0;
            // 初始化AI决策日志
            this.initAIDecisionLog();
        }

        getAISpeedMultiplier() {
            const length = this.aiSnake ? this.aiSnake.length : 3;
            if (length >= 15) return 0.7;
            if (length >= 12) return 0.75;
            if (length >= 10) return 0.8;
            if (length >= 8) return 0.85;
            return 1.0;
        }

        isAIBlockingMode() {
            return this.aiSnake && this.aiSnake.length >= 10;
        }

        startAISnakeIndependent() {
            if (this.aiSnakeTimer) {
                clearInterval(this.aiSnakeTimer);
            }
            const baseInterval = 380;
            const updateAISnakeWithSpeed = () => {
                if (!this.gameOver) {
                    this.updateAISnake();
                }
                if (this.aiSnakeTimer) {
                    clearInterval(this.aiSnakeTimer);
                    const length = this.aiSnake ? this.aiSnake.length : 3;
                    let interval = baseInterval;
                    if (length >= 15) interval = 250;
                    else if (length >= 12) interval = 280;
                    else if (length >= 10) interval = 300;
                    else if (length >= 8) interval = 340;
                    this.aiSnakeTimer = setInterval(updateAISnakeWithSpeed, interval);
                }
            };
            this.aiSnakeTimer = setInterval(updateAISnakeWithSpeed, baseInterval);
        }

        startAISnakeTimer() {
            this.startAISnakeIndependent();
        }

        updateAISnake() {
            if (!this.aiSnakeEnabled || this.aiSnake.length === 0) return;

            const levelConfig = this.levelConfigs[this.currentLevel];
            if (levelConfig && levelConfig.aiEnabled === false) return;

            const head = this.aiSnake[0];
            
            // 更新人格状态
            this.updateAIPersonality();
            
            // 根据人格和视野选择目标
            const target = this.selectTargetByPersonality(head);
            this.aiCurrentTarget = target;
            
            // 计算风险值
            this.calculateAIRisk(head, target);
            
            // 确定方向
            const direction = this.getAIDirection(head, target);
            if (direction) {
                this.aiSnakeDirection = direction;
            }

            const newHead = {
                x: head.x + this.aiSnakeDirection.x,
                y: head.y + this.aiSnakeDirection.y
            };

            // 边界检查
            if (newHead.x < 0 || newHead.x >= this.canvasWidth / this.cellSize ||
                newHead.y < 0 || newHead.y >= this.canvasHeight / this.cellSize) {
                this.aiSnakeDirection = {
                    x: -this.aiSnakeDirection.x || (Math.random() > 0.5 ? 1 : -1),
                    y: -this.aiSnakeDirection.y || (Math.random() > 0.5 ? 1 : -1)
                };
                return;
            }

            // 自碰撞检查
            if (this.aiSnake.some(s => s.x === newHead.x && s.y === newHead.y)) {
                this.aiSnakeDirection = {
                    x: Math.random() > 0.5 ? 1 : -1,
                    y: Math.random() > 0.5 ? 1 : -1
                };
                return;
            }

            // 玩家碰撞检查（疯狂模式下主动撞击）
            if (this.gameRunning && this.snake.length > 0) {
                const playerHead = this.snake[0];
                if (newHead.x === playerHead.x && newHead.y === playerHead.y) {
                    this.handleAICollision(newHead);
                    return;
                }
            }

            const redLineInCells = this.redLineX / this.cellSize;
            const wasInDangerZone = head.x >= redLineInCells;
            const nowInDangerZone = newHead.x >= redLineInCells;
            
            this.aiSnake.unshift(newHead);
            
            // AI穿越红线时显示警示语录
            if (!wasInDangerZone && nowInDangerZone) {
                this.showWarningQuote();
            }

            // 检查是否吃到稀有词
            const rareIndex = this.rareWords.findIndex(w => w.x === newHead.x && w.y === newHead.y);
            if (rareIndex !== -1) {
                const rareWord = this.rareWords[rareIndex];
                this.rareWords.splice(rareIndex, 1);
                this.spawnRareWord();
                
                this.playerRewardPenalty = Math.min(0.2, this.playerRewardPenalty + 0.05);
                
                if (this.gameRunning) {
                    showToast(`AI${this.aiPersonalityConfig[this.aiPersonality].name}抢到了"${rareWord.text}"！你的收益减少了`, "warning");
                }
            } else if (this.food && this.food.x === newHead.x && this.food.y === newHead.y) {
                this.spawnFood();
            } else {
                this.aiSnake.pop();
            }
            
            // 更新决策日志
            this.updateAIDecisionLog();
        }
        
        updateAIPersonality() {
            const now = Date.now();
            const gameElapsed = this.startTime ? (now - this.startTime) / 1000 : 0;
            
            if (!this.gameRunning) {
                // 游戏未开始时，在谨慎和贪婪之间随机切换
                if (Math.random() > 0.99) {
                    this.aiPersonality = this.aiPersonality === 'cautious' ? 'greedy' : 'cautious';
                }
                return;
            }
            
            const aiScore = this.aiSnake.length * 10;
            const playerScore = this.score;
            
            // 疯狂模式：有30%概率随机切换，或者玩家领先超过30分
            if (this.aiPersonality !== 'crazy') {
                if ((playerScore - aiScore > 30 || this.aiNegativeCount >= 2) || Math.random() > 0.995) {
                    this.aiPersonality = 'crazy';
                    this.circlingMode = true; // 开启围猎模式
                    this.logAIDecision('人格切换', `进入疯狂模式！开启围猎！`);
                    return;
                }
            } else if (this.aiPersonality === 'crazy' && playerScore - aiScore < -20) {
                // AI领先很多时，退出围猎模式，回到谨慎
                this.aiPersonality = 'cautious';
                this.circlingMode = false;
                this.logAIDecision('人格切换', `回到谨慎模式`);
            }
            
            // 贪婪模式：有稀有词或者40%概率随机切换
            if (this.aiPersonality !== 'greedy') {
                const hasRareWord = this.rareWords.length > 0;
                if (hasRareWord || Math.random() > 0.99) {
                    this.aiPersonality = 'greedy';
                    this.circlingMode = false;
                    this.logAIDecision('人格切换', `进入贪婪模式！`);
                    return;
                }
            }
            
            // 谨慎模式：默认模式
            if (this.aiPersonality !== 'cautious' && Math.random() > 0.99) {
                this.aiPersonality = 'cautious';
                this.circlingMode = false;
                this.logAIDecision('人格切换', `进入谨慎模式`);
            }
        }
        
        selectTargetByPersonality(head) {
            const redLineInCells = this.redLineX / this.cellSize;
            const distanceToPlayer = this.getDistanceToPlayer(head);
            
            // 视野分层判断
            if (distanceToPlayer <= this.aiVisionRange.near) {
                return this.selectNearTarget(head);
            } else if (distanceToPlayer <= this.aiVisionRange.medium) {
                return this.selectMediumTarget(head, redLineInCells);
            } else {
                return this.selectFarTarget(head, redLineInCells);
            }
        }
        
        selectNearTarget(head) {
            if (this.gameRunning && this.snake.length > 0) {
                const playerHead = this.snake[0];
                
                // 疯狂模式：直接攻击玩家
                if (this.aiPersonality === 'crazy') {
                    this.logAIDecision('目标选择', '疯狂模式：直接攻击玩家！');
                    return playerHead;
                }
                
                // 贪婪模式：抢玩家正要吃的词
                if (this.aiPersonality === 'greedy') {
                    const playerNearbyWords = this.words.filter(w => {
                        const distToPlayer = Math.abs(w.x - playerHead.x) + Math.abs(w.y - playerHead.y);
                        return distToPlayer <= 2 && (w.type === 'positive' || this.rareWords.includes(w));
                    });
                    
                    if (playerNearbyWords.length > 0) {
                        let bestTarget = null;
                        let minDist = Infinity;
                        playerNearbyWords.forEach(word => {
                            const dist = Math.abs(word.x - head.x) + Math.abs(word.y - head.y);
                            if (dist < minDist) {
                                minDist = dist;
                                bestTarget = word;
                            }
                        });
                        if (bestTarget) {
                            this.logAIDecision('目标选择', `贪婪模式：抢玩家附近的词: ${bestTarget.text}`);
                            return bestTarget;
                        }
                    }
                }
                
                // 谨慎模式：保持距离，找安全的词
                const safeWords = this.words.filter(w => {
                    const distToPlayer = Math.abs(w.x - playerHead.x) + Math.abs(w.y - playerHead.y);
                    return distToPlayer > 3 && w.type === 'positive';
                });
                
                if (safeWords.length > 0) {
                    let bestTarget = null;
                    let minDist = Infinity;
                    safeWords.forEach(word => {
                        const dist = Math.abs(word.x - head.x) + Math.abs(word.y - head.y);
                        if (dist < minDist) {
                            minDist = dist;
                            bestTarget = word;
                        }
                    });
                    if (bestTarget) {
                        this.logAIDecision('目标选择', `谨慎模式：保持距离找安全词: ${bestTarget.text}`);
                        return bestTarget;
                    }
                }
            }
            return this.findNearestFood();
        }
        
        selectMediumTarget(head, redLineInCells) {
            // 疯狂模式：直接冲向玩家
            if (this.aiPersonality === 'crazy' && this.gameRunning && this.snake.length > 0) {
                const playerHead = this.snake[0];
                this.logAIDecision('目标选择', '疯狂模式：中程冲向玩家！');
                return playerHead;
            }
            
            // 贪婪模式：优先找稀有词，无视风险
            if (this.aiPersonality === 'greedy') {
                const nearbyRare = this.rareWords.filter(w => {
                    const dist = Math.abs(w.x - head.x) + Math.abs(w.y - head.y);
                    return dist <= this.aiVisionRange.medium;
                });
                
                if (nearbyRare.length > 0) {
                    let bestTarget = null;
                    let bestValue = 0;
                    nearbyRare.forEach(word => {
                        if (word.value > bestValue) {
                            bestValue = word.value;
                            bestTarget = word;
                        }
                    });
                    if (bestTarget) {
                        this.logAIDecision('目标选择', `贪婪模式：冲向高价值稀有词: ${bestTarget.text} (+${bestTarget.value}分)`);
                        return bestTarget;
                    }
                }
            }
            
            // 谨慎模式：优先找安全区的稀有词
            if (this.aiPersonality === 'cautious') {
                const safeRare = this.rareWords.filter(w => {
                    const dist = Math.abs(w.x - head.x) + Math.abs(w.y - head.y);
                    return dist <= this.aiVisionRange.medium && w.x < redLineInCells;
                });
                
                if (safeRare.length > 0) {
                    let bestTarget = null;
                    let minDist = Infinity;
                    safeRare.forEach(word => {
                        const dist = Math.abs(word.x - head.x) + Math.abs(word.y - head.y);
                        if (dist < minDist) {
                            minDist = dist;
                            bestTarget = word;
                        }
                    });
                    if (bestTarget) {
                        this.logAIDecision('目标选择', `谨慎模式：安全区找到稀有词: ${bestTarget.text}`);
                        return bestTarget;
                    }
                }
            }
            
            // 通用：找最近的食物
            return this.findNearestFood();
        }
        
        selectFarTarget(head, redLineInCells) {
            // 疯狂模式：直接朝向玩家方向移动
            if (this.aiPersonality === 'crazy' && this.gameRunning && this.snake.length > 0) {
                const playerHead = this.snake[0];
                this.logAIDecision('目标选择', '疯狂模式：远程冲向玩家！');
                return playerHead;
            }
            
            // 贪婪模式：寻找高价值目标，愿意冒险穿越红线
            if (this.aiPersonality === 'greedy') {
                const allRare = this.rareWords.filter(w => {
                    const dist = Math.abs(w.x - head.x) + Math.abs(w.y - head.y);
                    return dist <= this.aiVisionRange.far;
                });
                
                if (allRare.length > 0) {
                    let bestTarget = null;
                    let bestValue = 0;
                    allRare.forEach(word => {
                        if (word.value > bestValue) {
                            bestValue = word.value;
                            bestTarget = word;
                        }
                    });
                    if (bestTarget) {
                        this.logAIDecision('目标选择', `贪婪模式：远程发现高价值词: ${bestTarget.text}，准备越界！`);
                        return bestTarget;
                    }
                }
            }
            
            // 谨慎模式：只在安全区活动，边缘巡逻
            if (this.aiPersonality === 'cautious') {
                // 在红线边缘附近巡逻
                const patrolX = redLineInCells - 1 - Math.floor(Math.random() * 3);
                const patrolY = Math.floor(Math.random() * (this.canvasHeight / this.cellSize));
                
                this.logAIDecision('目标选择', '谨慎模式：红线边缘巡逻');
                return { x: patrolX, y: patrolY, isRandom: true };
            }
            
            // 通用：随机巡逻
            if (Math.random() > 0.6) {
                const randomX = Math.floor(Math.random() * (this.canvasWidth / this.cellSize));
                const randomY = Math.floor(Math.random() * (this.canvasHeight / this.cellSize));
                this.logAIDecision('目标选择', '远程随机巡逻');
                return { x: randomX, y: randomY, isRandom: true };
            }
            
            return this.findNearestFood();
        }
        
        getDistanceToPlayer(head) {
            if (!this.gameRunning || this.snake.length === 0) return Infinity;
            const playerHead = this.snake[0];
            return Math.abs(head.x - playerHead.x) + Math.abs(head.y - playerHead.y);
        }
        
        findNearestSafeFood(head, redLineInCells = null) {
            if (!redLineInCells) redLineInCells = this.redLineX / this.cellSize;
            if (!this.food || this.food.x >= redLineInCells) return null;
            
            const dist = Math.abs(this.food.x - head.x) + Math.abs(this.food.y - head.y);
            if (dist <= this.aiVisionRange.far) {
                return this.food;
            }
            return null;
        }
        
        calculateAIRisk(head, target) {
            if (!target) {
                this.aiRiskValue = 0;
                return;
            }
            
            const redLineInCells = this.redLineX / this.cellSize;
            const headInDangerZone = head.x >= redLineInCells;
            const targetInDangerZone = target.x >= redLineInCells;
            const distanceToRedLine = Math.abs(head.x - redLineInCells);
            
            let risk = 0;
            
            // 位置风险
            if (headInDangerZone) {
                risk += 30;
            }
            
            // 目标风险
            if (targetInDangerZone && this.aiPersonality !== 'crazy') {
                risk += 40;
            }
            
            // 距离风险
            if (distanceToRedLine <= 2) {
                risk += 20;
            }
            
            // 人格修正
            if (this.aiPersonality === 'cautious') {
                risk = Math.floor(risk * 1.3);
            } else if (this.aiPersonality === 'crazy') {
                risk = Math.floor(risk * 0.3);
            }
            
            this.aiRiskValue = Math.min(100, Math.max(0, risk));
        }
        
        getAIDirection(head, target) {
            if (!target) {
                return this.getRandomDirection();
            }
            
            const redLineInCells = this.redLineX / this.cellSize;
            const headInDangerZone = head.x >= redLineInCells;
            const targetInDangerZone = target.x >= redLineInCells;
            
            // 首先尝试使用A*算法获取智能路径
            const aStarDir = this.intelligentAStarSearch(head, target);
            if (aStarDir) {
                return aStarDir;
            }
            
            // 如果A*失败，回退到简单模式
            // 谨慎模式：在危险区且目标在安全区时优先返回
            if (this.aiPersonality === 'cautious' && headInDangerZone && !targetInDangerZone) {
                return this.getDirectionTo(head, { x: redLineInCells - 1, y: head.y });
            }
            
            // 疯狂模式：无视红线
            if (this.aiPersonality === 'crazy') {
                return this.getDirectionTo(head, target);
            }
            
            // 贪婪模式：计算越界收益
            if (this.aiPersonality === 'greedy' && !headInDangerZone && targetInDangerZone) {
                const benefit = target.value || 20;
                const cost = this.aiRiskValue * 0.5;
                
                if (benefit > cost) {
                    this.logAIDecision('决策计算', `越界收益 ${benefit} > 风险代价 ${cost.toFixed(1)} → 执行穿越`);
                    return this.getDirectionTo(head, target);
                } else {
                    this.logAIDecision('决策计算', `越界收益 ${benefit} < 风险代价 ${cost.toFixed(1)} → 放弃穿越`);
                    return this.getRandomDirection();
                }
            }
            
            return this.getDirectionTo(head, target);
        }
        
        getDirectionTo(from, to) {
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                return { x: dx > 0 ? 1 : -1, y: 0 };
            } else {
                return { x: 0, y: dy > 0 ? 1 : -1 };
            }
        }
        
        getRandomDirection() {
            const directions = [
                { x: 1, y: 0 }, { x: -1, y: 0 },
                { x: 0, y: 1 }, { x: 0, y: -1 }
            ];
            return directions[Math.floor(Math.random() * directions.length)];
        }
        
        handleAICollision(newHead) {
            if (this.aiPersonality === 'crazy') {
                showToast('AI疯狂撞击！你受到迷惑效果！', 'danger');
                this.confused = true;
                setTimeout(() => { this.confused = false; }, 1000);
                
                if (this.integrityValue >= 15) {
                    this.integrityValue -= 15;
                    this.updateUI();
                }
            } else {
                showToast('AI撞到你了！它被弹回红线外！', 'warning');
                this.aiSnakeDirection = { x: 1, y: 0 };
                setTimeout(() => {
                    this.aiSnakeDirection = { x: -1, y: 0 };
                }, 2000);
            }
        }
        
        logAIDecision(type, message) {
            this.aiDecisionLog.push({
                type,
                message,
                time: Date.now()
            });
            if (this.aiDecisionLog.length > 15) {
                this.aiDecisionLog.shift();
            }
            // 立即更新显示
            this.updateAIDecisionPanel();
        }
        
        updateAIDecisionLog() {
            this.updateAIDecisionPanel();
        }
        
        initAIDecisionLog() {
            this.aiDecisionLog = [];
            this.logAIDecision('系统', 'AI贪欲蛇已初始化');
            this.logAIDecision('状态', '当前人格：谨慎型');
            this.logAIDecision('目标', '开始巡逻，寻找目标...');
        }
        
        updateAIDecisionPanel() {
            const logElement = document.getElementById('aiLogs');
            
            if (logElement) {
                const logs = this.aiDecisionLog.slice(-5).map((log, index) => {
                    const time = new Date(log.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    return `<div class="log-entry">
                        <span style="color: #64748b; font-size: 0.65rem;">${time}</span>
                        <span style="color: #94a3b8; font-size: 0.65rem; margin-left: 8px;">[${log.type}]</span>
                        <span style="color: #e2e8f0; font-size: 0.7rem; margin-left: 4px;">${log.message}</span>
                    </div>`;
                }).join('');
                logElement.innerHTML = logs;
                logElement.scrollTop = logElement.scrollHeight;
            }
        }

        // 更新ML预测面板
        updateMLPredictionPanel() {
            const panel = document.getElementById('mlPredictionPanel');
            const container = document.getElementById('mlPredictions');
            if (!panel || !container) return;

            // 每隔一段时间更新一次ML预测
            if (!this.mlUpdateCounter) this.mlUpdateCounter = 0;
            this.mlUpdateCounter++;
            if (this.mlUpdateCounter % 10 !== 0) return; // 每10帧更新一次

            // 显示面板
            panel.style.display = 'block';

            // 获取ML预测
            const predictions = this.getMLPredictions();
            if (!predictions) {
                container.innerHTML = '<div style="color:#888;font-size:0.75rem;">正在初始化模型...</div>';
                return;
            }

            const modelNames = {
                logisticRegression: { name: '逻辑回归', color: '#4ade80' },
                decisionTree: { name: '决策树', color: '#facc15' },
                randomForest: { name: '随机森林', color: '#38bdf8' },
                svm: { name: 'SVM', color: '#f472b6' },
                neuralNetwork: { name: '神经网络', color: '#a78bfa' },
                ensemble: { name: '集成模型', color: '#fb923c' }
            };

            const html = Object.entries(predictions).map(([key, pred]) => {
                const config = modelNames[key] || { name: key, color: '#888' };
                const prob = Array.isArray(pred.probability) ? pred.probability[1] || 0 : (pred.prediction || 0);
                const riskLevel = prob > 0.5 ? '🔴' : '🟢';
                return `
                    <div style="margin:4px 0;padding:4px;background:rgba(0,0,0,0.2);border-radius:4px;">
                        <span style="color:${config.color};font-size:0.7rem;">${config.name}</span>
                        <span style="float:right;font-size:0.7rem;">${riskLevel} ${(prob * 100).toFixed(0)}%</span>
                    </div>
                `;
            }).join('');

            container.innerHTML = html;
        }
        
        // 找安全区的食物
        findNearestSafeFood() {
            const redLineInCells = this.redLineX / this.cellSize;
            if (!this.food || this.food.x >= redLineInCells) return null;
            return this.food;
        }
        
        // 找躲避玩家的目标
        findEvasiveTarget() {
            const playerHead = this.snake[0];
            let bestTarget = null;
            let maxDistance = 0;
            
            const allTargets = [...this.rareWords];
            if (this.food) allTargets.push(this.food);
            
            for (const target of allTargets) {
                const distToPlayer = Math.abs(target.x - playerHead.x) + Math.abs(target.y - playerHead.y);
                if (distToPlayer > maxDistance) {
                    maxDistance = distToPlayer;
                    bestTarget = target;
                }
            }
            
            return bestTarget || this.findNearestFood();
        }

        findNearestRareWord() {
            if (this.rareWords.length === 0) return null;
            let nearest = null;
            let minDist = Infinity;
            const head = this.aiSnake[0];
            this.rareWords.forEach(word => {
                const dist = Math.abs(word.x - head.x) + Math.abs(word.y - head.y);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = word;
                }
            });
            return nearest;
        }

        findNearestFood() {
            return this.food;
        }

        // === 完整的A*寻路算法 ===
        aStarSearch(start, goal) {
            // 获取网格大小
            const gridWidth = Math.floor(this.canvasWidth / this.cellSize);
            const gridHeight = Math.floor(this.canvasHeight / this.cellSize);
            const redLineInCells = Math.floor(this.redLineX / this.cellSize);
            
            // 开放列表和关闭列表
            const openSet = [];
            const closedSet = new Set();
            
            // 节点类
            class Node {
                constructor(x, y, g = 0, h = 0, parent = null) {
                    this.x = x;
                    this.y = y;
                    this.g = g; // 从起点到当前节点的代价
                    this.h = h; // 从当前节点到目标的估计代价（启发式）
                    this.f = g + h; // 总代价
                    this.parent = parent;
                }
            }
            
            // 启发式函数：曼哈顿距离
            const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
            
            // 检查位置是否有效
            const isValidPosition = (x, y) => {
                // 边界检查
                if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) return false;
                
                // 自碰撞检查
                if (this.aiSnake.some(s => s.x === x && s.y === y)) return false;
                
                // 玩家蛇碰撞检查（除了蛇头）
                if (this.gameRunning && this.snake.length > 0) {
                    if (this.snake.some((s, i) => i > 0 && s.x === x && s.y === y)) return false;
                }
                
                return true;
            };
            
            // 计算移动代价（考虑环境因素）
            const calculateMoveCost = (x, y) => {
                let cost = 1; // 基础移动代价
                
                // 根据AI人格调整代价
                if (this.aiPersonality === 'cautious') {
                    // 谨慎模式：危险区域代价很高
                    if (x >= redLineInCells) cost += 20;
                } else if (this.aiPersonality === 'greedy') {
                    // 贪婪模式：危险区域代价适中
                    if (x >= redLineInCells) cost += 5;
                } else if (this.aiPersonality === 'crazy') {
                    // 疯狂模式：不考虑危险，甚至可能更喜欢危险区域
                    if (x >= redLineInCells) cost -= 2;
                }
                
                // 靠近玩家的代价（根据人格调整）
                if (this.gameRunning && this.snake.length > 0) {
                    const playerHead = this.snake[0];
                    const distToPlayer = Math.abs(x - playerHead.x) + Math.abs(y - playerHead.y);
                    
                    if (this.aiPersonality === 'crazy') {
                        // 疯狂模式：靠近玩家代价更低，主动追击
                        cost -= Math.max(0, 10 - distToPlayer);
                    }
                }
                
                return Math.max(1, cost);
            };
            
            // 初始化起点
            const startNode = new Node(start.x, start.y, 0, heuristic(start, goal));
            openSet.push(startNode);
            
            // 主循环
            while (openSet.length > 0) {
                // 找到f值最小的节点
                openSet.sort((a, b) => a.f - b.f);
                const current = openSet.shift();
                
                // 检查是否到达目标
                if (current.x === goal.x && current.y === goal.y) {
                    // 重建路径
                    const path = [];
                    let node = current;
                    while (node) {
                        path.unshift({ x: node.x, y: node.y });
                        node = node.parent;
                    }
                    return path;
                }
                
                // 添加到关闭列表
                closedSet.add(`${current.x},${current.y}`);
                
                // 检查四个方向
                const directions = [
                    { x: 1, y: 0 },
                    { x: -1, y: 0 },
                    { x: 0, y: 1 },
                    { x: 0, y: -1 }
                ];
                
                for (const dir of directions) {
                    // 不能直接掉头（除非是唯一选项）
                    if (dir.x === -this.aiSnakeDirection.x && dir.y === -this.aiSnakeDirection.y) {
                        continue;
                    }
                    
                    const neighborX = current.x + dir.x;
                    const neighborY = current.y + dir.y;
                    const neighborKey = `${neighborX},${neighborY}`;
                    
                    // 跳过无效位置或已检查的位置
                    if (!isValidPosition(neighborX, neighborY) || closedSet.has(neighborKey)) {
                        continue;
                    }
                    
                    // 计算新的g值
                    const tentativeG = current.g + calculateMoveCost(neighborX, neighborY);
                    
                    // 检查邻居是否已在开放列表中
                    const existingNeighbor = openSet.find(n => n.x === neighborX && n.y === neighborY);
                    
                    if (!existingNeighbor) {
                        // 添加新节点到开放列表
                        const neighborNode = new Node(
                            neighborX,
                            neighborY,
                            tentativeG,
                            heuristic({ x: neighborX, y: neighborY }, goal),
                            current
                        );
                        openSet.push(neighborNode);
                    } else if (tentativeG < existingNeighbor.g) {
                        // 更新更优路径
                        existingNeighbor.g = tentativeG;
                        existingNeighbor.f = tentativeG + existingNeighbor.h;
                        existingNeighbor.parent = current;
                    }
                }
            }
            
            // 没有找到路径，返回简单方向
            return null;
        }
        
        // 智能版路径选择（结合A*和人格特性）
        intelligentAStarSearch(start, goal) {
            const redLineInCells = this.redLineX / this.cellSize;
            const playerHead = this.snake[0];
            
            // 首先尝试完整A*算法
            const path = this.aStarSearch(start, goal);
            if (path && path.length > 1) {
                // 返回路径中的下一步
                const nextStep = path[1];
                return {
                    x: nextStep.x - start.x,
                    y: nextStep.y - start.y
                };
            }
            
            // 如果A*失败，回退到简单启发式
            const possibleMoves = [];
            const directions = [
                { x: 1, y: 0 },
                { x: -1, y: 0 },
                { x: 0, y: 1 },
                { x: 0, y: -1 }
            ];
            
            for (const dir of directions) {
                if (dir.x === -this.aiSnakeDirection.x && dir.y === -this.aiSnakeDirection.y) {
                    continue; // 不能直接掉头
                }
                
                const nextX = start.x + dir.x;
                const nextY = start.y + dir.y;
                
                // 边界检查
                if (nextX < 0 || nextX >= this.canvasWidth / this.cellSize ||
                    nextY < 0 || nextY >= this.canvasHeight / this.cellSize) {
                    continue;
                }
                
                // 自碰撞检查
                if (this.aiSnake.some(s => s.x === nextX && s.y === nextY)) {
                    continue;
                }
                
                let priority = 0;
                
                // 1. 离目标的距离（基础启发式）
                const distToGoal = Math.abs(goal.x - nextX) + Math.abs(goal.y - nextY);
                priority -= distToGoal * 2;
                
                // 2. 红线环境感知
                const config = this.aiPersonalityConfig[this.aiPersonality];
                if (nextX >= redLineInCells) {
                    if (this.aiPersonality === 'cautious') {
                        priority -= 50; // 谨慎模式：非常不想越界
                    } else if (this.aiPersonality === 'greedy') {
                        priority -= 10; // 贪婪模式：稍微有点犹豫
                    } else if (this.aiPersonality === 'crazy') {
                        priority += 5; // 疯狂模式：越界反而更好
                    }
                }
                
                // 3. 玩家预判（根据人格不同策略）
                if (this.gameRunning && this.snake.length > 0) {
                    const distToPlayer = Math.abs(nextX - playerHead.x) + Math.abs(nextY - playerHead.y);
                    
                    if (this.aiPersonality === 'crazy') {
                        priority -= (10 - distToPlayer); // 疯狂模式：更喜欢靠近玩家
                    }
                }
                
                // 4. 随机扰动（增加多样性）
                priority += Math.random() * 3;
                
                possibleMoves.push({
                    dir: dir,
                    priority: priority
                });
            }

            if (possibleMoves.length === 0) {
                return null;
            }

            possibleMoves.sort((a, b) => b.priority - a.priority);
            return possibleMoves[0].dir;
        }

        // === 贪心算法：智能食物分配 ===
        smartFoodAllocation() {
            const MAX_WORDS = 6;
            const MAX_RARE = 2;
            const MIN_LEFT_POSITIVE = 2;

            // 统计当前分布
            const leftPositive = this.words.filter(w => w.isClean && w.x * this.cellSize < this.redLineX).length;
            const rightRare = this.rareWords.filter(w => w.x * this.cellSize >= this.redLineX).length;

            // 约束1：确保左侧至少有2个正面词
            if (leftPositive < MIN_LEFT_POSITIVE && this.words.length < MAX_WORDS) {
                this.spawnSingleWord('left');
                return;
            }

            // 约束2：确保右侧至少有1个稀有词
            if (rightRare < 1 && this.rareWords.length < MAX_RARE) {
                this.spawnRareWord();
                return;
            }

            // 约束3：保持总数平衡
            if (this.words.length < MAX_WORDS) {
                this.spawnSingleWord();
            }
            if (this.rareWords.length < MAX_RARE && Math.random() > 0.6) {
                this.spawnRareWord();
            }
        }

        updateWordCloud() {
            const cloudWords = document.getElementById('cloudWords');
            if (!cloudWords) return;

            cloudWords.innerHTML = '';

            this.collectedWords.forEach(word => {
                const wordEl = document.createElement('span');
                wordEl.className = 'cloud-word';
                wordEl.textContent = word;
                wordEl.style.cursor = 'pointer';
                wordEl.addEventListener('click', () => showWordMeaning(word));
                cloudWords.appendChild(wordEl);
            });

            this.negativeWords.forEach(word => {
                const wordEl = document.createElement('span');
                wordEl.className = 'cloud-word negative';
                wordEl.textContent = word;
                cloudWords.appendChild(wordEl);
            });
        }

        showGameOver() {
            this.gameRunning = false;
            cancelAnimationFrame(this.animationId);

            const duration = this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0;

            // 显示失败莲花凋零动画
            this.showGameLoseAnimation(() => {
                // 动画完成后继续显示游戏结束界面
                this.showGameOverAfterAnimation(duration);
            });
        }
        
        showGameLoseAnimation(callback) {
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const lotusPhase = { progress: 0 };
            const animationDuration = 2500;
            const startTime = performance.now();
            
            const animate = () => {
                const elapsed = performance.now() - startTime;
                lotusPhase.progress = Math.min(1, elapsed / animationDuration);
                
                // 清除画布（灰色调）
                this.ctx.fillStyle = '#1a1a2e';
                this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
                
                // 绘制正在凋零的莲花
                this.drawLotusWitherEffect(centerX, centerY, lotusPhase.progress);
                
                if (lotusPhase.progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    if (callback) callback();
                }
            };
            
            requestAnimationFrame(animate);
        }
        
        // 绘制莲花凋零效果
        drawLotusWitherEffect(x, y, progress) {
            const petalCount = 10;
            const fadeProgress = 1 - progress;
            
            for (let i = 0; i < petalCount; i++) {
                const baseAngle = (Math.PI * 2 / petalCount) * i;
                const fallDistance = progress * 100;
                const drift = (Math.random() - 0.5) * progress * 50;
                
                const petalX = x + Math.cos(baseAngle) * (30 + progress * 50) + drift;
                const petalY = y + Math.sin(baseAngle) * (30 + progress * 50) + fallDistance;
                const rotation = baseAngle + progress * Math.PI;
                
                this.ctx.save();
                this.ctx.translate(petalX, petalY);
                this.ctx.rotate(rotation);
                this.ctx.globalAlpha = fadeProgress * 0.6;
                
                // 凋零颜色：灰色
                this.ctx.fillStyle = '#6b7280';
                
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, 8, 20, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.restore();
            }
            
            // 中心逐渐消失
            if (progress < 0.7) {
                this.ctx.save();
                this.ctx.globalAlpha = (1 - progress / 0.7) * 0.5;
                this.ctx.fillStyle = '#4b5563';
                this.ctx.beginPath();
                this.ctx.arc(x, y, 10, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        }
        
        showGameOverAfterAnimation(duration) {
            gameAudio.playLose();

            const riskScore = this.predictCorruptionRisk();
            const patternAnalysis = this.analyzeMovePattern();

            // 保存到存档
            if (window.CleanGameArchives) {
                const gameData = {
                    score: this.score,
                    crossCount: this.crossCount,
                    level: this.currentLevel,
                    result: this.endReason,
                    riskScore: Math.round(riskScore * 100),
                    integrityValue: this.integrityValue,
                    rareCollected: this.rareCollected
                };
                const { archives, newAchievements } = CleanGameArchives.updateArchiveAfterGame(gameData);
                // 如果有新成就，提示一下
                if (newAchievements && newAchievements.length > 0) {
                    showToast(`🎉 新成就解锁: ${newAchievements.join(', ')}`, 'success');
                }
            }

            // 记录评估数据
            if (window.integrityAssessment && this.assessmentSessionId) {
                const wordAccuracy = this.collectedWords.length > 0 
                    ? Math.min(100, Math.round((this.collectedWords.length / (this.collectedWords.length + this.negativeWords.length)) * 100))
                    : 50;
                
                window.integrityAssessment.endSession(this.assessmentSessionId, {
                    knowledge: wordAccuracy,
                    intuition: Math.max(20, 100 - this.crossCount * 5),
                    decision: Math.max(30, this.integrityValue),
                    semantic: Math.min(100, 40 + this.collectedWords.length * 8),
                    risk: Math.max(20, 100 - Math.round(riskScore * 100))
                });
            }

            const overlay = document.getElementById('overlay');
            const title = document.getElementById('overlayTitle');
            const message = document.getElementById('overlayMessage');
            const lotusReveal = document.getElementById('lotusReveal');
            const aiComment = document.getElementById('aiComment');

            title.textContent = '游戏结束';
            title.style.color = '#ef4444';
            
            // 风险评分颜色
            let riskColor = '#4ade80';
            if (riskScore > 0.7) riskColor = '#ef4444';
            else if (riskScore > 0.4) riskColor = '#fbbf24';
            
            message.innerHTML = `
                <p>结束原因: ${this.endReason}</p>
                <p>最终得分: ${this.score} | 用时: ${duration}秒</p>
                <p class="stats-summary">廉洁词: ${this.collectedWords.length} | 越界: ${this.crossCount}</p>
                <p style="color:#888;margin-top:5px;">
                    到达: 第${this.currentLevel}境 · ${this.levelNames[this.currentLevel - 1]}
                </p>
                <p style="color:${riskColor};margin-top:10px;font-weight:bold;">
                    🤖 廉洁风险评分: ${(riskScore * 100).toFixed(0)}%
                </p>
                <p style="color:#888;font-size:12px;margin-top:5px;">
                    ${patternAnalysis}
                </p>
                <div style="margin-top:15px;padding:10px;background:rgba(64,145,108,0.1);border-radius:8px;">
                    <p style="color:#40916c;font-size:12px;margin-bottom:5px;">💡 成就提示</p>
                    <p style="color:#94a3b8;font-size:11px;">${this.achievementTips[this.currentTipIndex]}</p>
                </div>
                <p style="margin-top:15px;">
                    <button class="btn btn-secondary" onclick="assessmentVisualizer.showPlayerReportModal()" style="padding:8px 20px;font-size:14px;">
                        📊 查看廉洁素养报告
                    </button>
                    <button class="btn btn-secondary" onclick="game.showMLComparison()" style="padding:8px 20px;font-size:14px;margin-left:10px;">
                        🧠 查看AI模型对比
                    </button>
                </p>
            `;
            lotusReveal.innerHTML = '';
            aiComment.innerHTML = '<p>正在生成AI评语...</p>';
            overlay.classList.add('active');

            leaderboard.addScore('玩家', this.score, false, duration);
            this.showAchievements({ won: false, score: this.score, crossCount: this.crossCount, collectedWords: this.collectedWords.length, duration });

            this.generateAIComment();
        }

        showIntegrityZero() {
            this.gameRunning = false;
            cancelAnimationFrame(this.animationId);

            const riskScore = this.predictCorruptionRisk();
            const patternAnalysis = this.analyzeMovePattern();

            const overlay = document.getElementById('overlay');
            const title = document.getElementById('overlayTitle');
            const message = document.getElementById('overlayMessage');
            const lotusReveal = document.getElementById('lotusReveal');
            const aiComment = document.getElementById('aiComment');

            title.textContent = '廉洁灯灭';
            title.style.color = '#ef4444';
            message.innerHTML = `
                <p style="color:#ef4444;font-size:18px;">廉洁值归零，信仰失守！</p>
                <p>您的得分: ${this.score}</p>
                <p style="color:#ef4444;margin-top:10px;font-weight:bold;">
                    🚨 廉洁风险评分: ${(riskScore * 100).toFixed(0)}%
                </p>
                <p style="color:#888;font-size:12px;">
                    ${patternAnalysis}
                </p>
            `;
            lotusReveal.innerHTML = '<div class="integrity-zero-warning">💔</div><p class="lotus-text" style="color:#888;">粉身碎骨浑不怕，要留清白在人间</p>';
            aiComment.innerHTML = '<p>正在生成AI评语...</p>';
            overlay.classList.add('active');

            this.generateIntegrityZeroComment();
        }

        showGameWon() {
            this.gameRunning = false;
            cancelAnimationFrame(this.animationId);
            gameAudio.playWin();

            const duration = this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0;
            const riskScore = this.predictCorruptionRisk();
            const patternAnalysis = this.analyzeMovePattern();

            // 检查成就
            this.checkWinAchievements();
            
            // 保存到存档
            if (window.CleanGameArchives) {
                const gameData = {
                    score: this.score,
                    crossCount: this.crossCount,
                    level: this.currentLevel,
                    result: this.endReason || '胜利',
                    riskScore: Math.round(riskScore * 100),
                    integrityValue: this.integrityValue,
                    rareCollected: this.rareCollected
                };
                const { archives, newAchievements } = CleanGameArchives.updateArchiveAfterGame(gameData);
                if (newAchievements && newAchievements.length > 0) {
                    showToast(`🎉 新成就解锁: ${newAchievements.join(', ')}`, 'success');
                }
            }

            // 记录评估数据
            if (window.integrityAssessment && this.assessmentSessionId) {
                const wordAccuracy = this.collectedWords.length > 0 
                    ? Math.min(100, Math.round((this.collectedWords.length / (this.collectedWords.length + this.negativeWords.length)) * 100))
                    : 50;
                
                window.integrityAssessment.endSession(this.assessmentSessionId, {
                    knowledge: wordAccuracy,
                    intuition: Math.max(20, 100 - this.crossCount * 5),
                    decision: Math.max(30, this.integrityValue),
                    semantic: Math.min(100, 40 + this.collectedWords.length * 8),
                    risk: Math.max(20, 100 - Math.round(riskScore * 100))
                });
            }

            const overlay = document.getElementById('overlay');
            const title = document.getElementById('overlayTitle');
            const message = document.getElementById('overlayMessage');
            const lotusReveal = document.getElementById('lotusReveal');
            const aiComment = document.getElementById('aiComment');

            if (this.endReason === '五境圆满') {
                title.textContent = '五境圆满！';
            } else {
                title.textContent = '恭喜通关！';
            }
            title.style.color = '#4ade80';
            
            const riskColor = riskScore < 0.3 ? '#4ade80' : (riskScore < 0.6 ? '#fbbf24' : '#ef4444');
            
            // 构建成就徽章HTML
            const achievementsHtml = this.buildAchievementsHtml();
            
            message.innerHTML = `
                <p>${this.endReason === '五境圆满' ? '你已通过莲境五关，终成莲华！' : '您已集满8个廉洁词云，解锁清风莲花！'}</p>
                <p>得分: ${this.score} | 用时: ${duration}秒</p>
                <p class="stats-summary">廉洁词: ${this.collectedWords.length} | 越界: ${this.crossCount}</p>
                <p style="color:#888;margin-top:5px;">
                    ${this.endReason === '五境圆满' ? '通关: 五境全部圆满达成！' : '到达: 第' + this.currentLevel + '境 · ' + this.levelNames[this.currentLevel - 1]}
                </p>
                <p style="color:${riskColor};margin-top:10px;font-weight:bold;">
                    🌱 廉洁风险评分: ${(riskScore * 100).toFixed(0)}%
                </p>
                <p style="color:#888;font-size:12px;">
                    ${patternAnalysis}
                </p>
                ${achievementsHtml}
                <p style="margin-top:15px;">
                    <button class="btn btn-secondary" onclick="assessmentVisualizer.showPlayerReportModal()" style="padding:8px 20px;font-size:14px;">
                        📊 查看廉洁素养报告
                    </button>
                </p>
            `;
            lotusReveal.innerHTML = '<div class="lotus lotus-glow">🪷</div><p class="lotus-text">出淤泥而不染，濯清涟而不妖！</p>';
            aiComment.innerHTML = '<p>正在生成AI评语...</p>';
            overlay.classList.add('active');

            leaderboard.addScore('玩家', this.score, true, duration);
            this.showAchievements({ won: true, score: this.score, crossCount: this.crossCount, collectedWords: this.collectedWords.length, duration });

            this.generateWinAIComment();
        }

        checkWinAchievements() {
            // === 基础成就 ===
            // 莲华·不染：零越界胜利
            if (this.crossCount === 0) {
                this.achievementCheck.lotusUnscathed = true;
            }
            
            // 边缘行者：越界2次内胜利
            if (this.crossCount > 0 && this.crossCount <= 2) {
                this.achievementCheck.edgeWalker = true;
            }
            
            // 绝地逢生：廉洁值<20%时胜利
            if (this.integrityValue < 20) {
                this.achievementCheck.lastStand = true;
            }
            
            // === 速度难度成就 ===
            // 龟兔赛跑：慢速模式零越界通关
            if (this.currentSpeedKey === 'slow' && this.crossCount === 0) {
                this.achievementCheck.turtle = true;
            }
            
            // 稳步前进：普通速度零越界通关
            if (this.currentSpeedKey === 'normal' && this.crossCount === 0) {
                this.achievementCheck.steady = true;
            }
            
            // 疾风知劲草：快速模式零越界通关
            if (this.currentSpeedKey === 'fast' && this.crossCount === 0) {
                this.achievementCheck.swift = true;
            }
            
            // 闪电侠：极速模式通关
            if (this.currentSpeedKey === 'extreme') {
                this.achievementCheck.flash = true;
            }
            
            // 极速挑战：极速模式零越界通关
            if (this.currentSpeedKey === 'extreme' && this.crossCount === 0) {
                this.achievementCheck.flashPerfect = true;
            }
            
            // === 地图难度成就 ===
            // 小试牛刀：小地图通关
            if (this.currentMapSize === 'small') {
                this.achievementCheck.smallMap = true;
            }
            
            // 中流砥柱：中地图零越界通关
            if (this.currentMapSize === 'medium' && this.crossCount === 0) {
                this.achievementCheck.mediumMap = true;
            }
            
            // 大展拳脚：大地图通关
            if (this.currentMapSize === 'large') {
                this.achievementCheck.largeMap = true;
            }
            
            // 勇者无惧：大地图零越界通关
            if (this.currentMapSize === 'large' && this.crossCount === 0) {
                this.achievementCheck.brave = true;
            }
            
            // === 完美成就 ===
            // 一尘不染：零负面词通关
            if (this.negativeWords.length === 0) {
                this.achievementCheck.pure = true;
            }
            
            // 完美主义：零越界零负面词通关
            if (this.crossCount === 0 && this.negativeWords.length === 0) {
                this.achievementCheck.perfectionist = true;
            }
            
            // 贪吃蛇大师：普通模式零越界零负面词通关
            if (this.currentSpeedKey === 'normal' && this.crossCount === 0 && this.negativeWords.length === 0) {
                this.achievementCheck.master = true;
            }
            
            // === 高分成就 ===
            // 高分通关（得分>200）
            if (this.score > 200) {
                this.achievementCheck.highScore = true;
            }
            
            // 卓越高分（得分>300）
            if (this.score > 300) {
                this.achievementCheck.excellentScore = true;
            }
            
            // === 首次通关 ===
            this.achievementCheck.firstWin = true;
        }

        buildAchievementsHtml() {
            const achievements = [];
            
            // 基础成就
            if (this.achievementCheck.lotusUnscathed) {
                achievements.push(`<span class="achievement-badge" title="莲华·不染 - 零越界通关">🌸</span>`);
            }
            if (this.achievementCheck.edgeWalker) {
                achievements.push(`<span class="achievement-badge" title="边缘行者 - 越界2次内通关">🌊</span>`);
            }
            if (this.achievementCheck.lastStand) {
                achievements.push(`<span class="achievement-badge" title="绝地逢生 - 廉洁值<20%通关">🔥</span>`);
            }
            
            // 速度难度成就
            if (this.achievementCheck.turtle) {
                achievements.push(`<span class="achievement-badge" title="龟兔赛跑 - 慢速零越界通关">🐢</span>`);
            }
            if (this.achievementCheck.steady) {
                achievements.push(`<span class="achievement-badge" title="稳步前进 - 普通速度零越界">🐍</span>`);
            }
            if (this.achievementCheck.swift) {
                achievements.push(`<span class="achievement-badge" title="疾风知劲草 - 快速零越界通关">🦊</span>`);
            }
            if (this.achievementCheck.flash) {
                achievements.push(`<span class="achievement-badge" title="闪电侠 - 极速模式通关">⚡</span>`);
            }
            if (this.achievementCheck.flashPerfect) {
                achievements.push(`<span class="achievement-badge" title="极速挑战 - 极速零越界通关">🌟</span>`);
            }
            
            // 地图难度成就
            if (this.achievementCheck.smallMap) {
                achievements.push(`<span class="achievement-badge" title="小试牛刀 - 小地图通关">🗺️</span>`);
            }
            if (this.achievementCheck.mediumMap) {
                achievements.push(`<span class="achievement-badge" title="中流砥柱 - 中地图零越界">🏔️</span>`);
            }
            if (this.achievementCheck.largeMap) {
                achievements.push(`<span class="achievement-badge" title="大展拳脚 - 大地图通关">🌍</span>`);
            }
            if (this.achievementCheck.brave) {
                achievements.push(`<span class="achievement-badge" title="勇者无惧 - 大地图零越界">🛡️</span>`);
            }
            
            // 完美成就
            if (this.achievementCheck.pure) {
                achievements.push(`<span class="achievement-badge" title="一尘不染 - 零负面词通关">✨</span>`);
            }
            if (this.achievementCheck.perfectionist) {
                achievements.push(`<span class="achievement-badge" title="完美主义 - 零越界零负面词">💎</span>`);
            }
            if (this.achievementCheck.master) {
                achievements.push(`<span class="achievement-badge" title="贪吃蛇大师 - 标准模式完美通关">👑</span>`);
            }
            
            // 高分成就
            if (this.achievementCheck.highScore) {
                achievements.push(`<span class="achievement-badge" title="高分通关 - 得分>200">🎯</span>`);
            }
            if (this.achievementCheck.excellentScore) {
                achievements.push(`<span class="achievement-badge" title="卓越高分 - 得分>300">🏆</span>`);
            }
            
            // 首次通关
            if (this.achievementCheck.firstWin) {
                achievements.push(`<span class="achievement-badge" title="首次通关">🎮</span>`);
            }
            
            if (achievements.length === 0) {
                return '';
            }
            
            return `
                <div style="margin-top:15px;">
                    <span style="font-size:12px;color:#888;">获得成就：</span>
                    ${achievements.join('')}
                </div>
            `;
        }

        showAchievements(gameData) {
            const newAchievements = achievementSystem.checkAchievements(gameData);
            if (newAchievements.length > 0) {
                setTimeout(() => {
                    const achList = newAchievements.map(id => {
                        const ach = achievementSystem.getAll().find(a => a.id === id);
                        return ach ? `${ach.icon} ${ach.name}` : '';
                    }).join('、');
                    showToast(`🏆 解锁成就: ${achList}`, 'success');
                }, 1500);
            }
        }

        async generateAIComment() {
            const aiComment = document.getElementById('aiComment');
            const level = this.getCommentLevel();
            const gameData = {
                score: this.score,
                crossCount: this.crossCount,
                collectedWords: this.collectedWords,
                negativeWords: this.negativeWords,
                endReason: this.endReason,
                isWordCloudFull: this.collectedWords.length >= 8,
                lotusUnlocked: this.lotusUnlocked,
                mapSize: this.mapSizes[this.currentMapSize].name,
                integrityZero: this.integrityValue <= 0,
                level
            };

            try {
                const response = await fetch('/api/ai-comment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(gameData)
                });

                const data = await response.json();
                aiComment.innerHTML = `<div class="comment-level ${level}">【${this.getLevelName(level)}评语】</div><p>${data.comment || '感谢您的参与！'}</p>`;
            } catch (error) {
                aiComment.innerHTML = `<div class="comment-level ${level}">【${this.getLevelName(level)}评语】</div><p>${this.getFallbackComment(level)}</p>`;
            }
        }

        async generateIntegrityZeroComment() {
            const aiComment = document.getElementById('aiComment');
            const level = 'high';

            try {
                const response = await fetch('/api/ai-comment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        score: this.score,
                        integrityZero: true,
                        negativeWords: this.negativeWords,
                        collectedWords: this.collectedWords,
                        level
                    })
                });

                const data = await response.json();
                aiComment.innerHTML = `<div class="comment-level high">【${this.getLevelName(level)}评语】</div><p>${data.comment || '廉洁值归零，信仰失守！'}</p>`;
            } catch (error) {
                aiComment.innerHTML = `<div class="comment-level high">【${this.getLevelName(level)}评语】</div><p>廉者，政之本也。廉洁值如内心一盏灯，负面词汇是一次次吹来的阴风。游戏可重来，人生无重至！</p>`;
            }
        }

        async generateWinAIComment() {
            const aiComment = document.getElementById('aiComment');
            const level = 'high';

            try {
                const response = await fetch('/api/ai-comment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        score: this.score,
                        collectedWords: this.collectedWords,
                        lotusUnlocked: true,
                        mapSize: this.mapSizes[this.currentMapSize].name,
                        gameWon: true,
                        level
                    })
                });

                const data = await response.json();
                aiComment.innerHTML = `<div class="comment-level high">【${this.getLevelName(level)}评语】</div><p>${data.comment || '恭喜您通关！'}</p>`;
            } catch (error) {
                aiComment.innerHTML = `<div class="comment-level high">【${this.getLevelName(level)}评语】</div><p>恭喜您！出淤泥而不染，濯清涟而不妖。您用实际行动诠释了什么是真正的廉洁！</p>`;
            }
        }

        // ===== 动态红线与安全区系统 =====
        startDynamicRedLineSystem() {
            this.redLineShrinkTimer = setInterval(() => {
                if (this.gameRunning && !this.gamePaused) {
                    this.shrinkRedLine();
                }
            }, this.redLineShrinkInterval);
        }

        shrinkRedLine() {
            const minRedLineX = this.cellSize * 4; // 红线最多缩到4个单元格
            if (this.redLineX > minRedLineX) {
                this.redLineX -= this.cellSize;
                showToast('⚠️ 安全区缩小！', 'warning');
                
                // 同时增加负面词密度
                if (Math.random() < this.negativeDensityIncreaseRate) {
                    // 有机会刷新一个额外的负面词
                    const spawnChance = Math.random();
                    if (spawnChance < 0.3) {
                        this.spawnWords();
                    }
                }
            }
        }

        // ===== 越界代价递增机制 =====
        handleCrossBoundary() {
            // 记录越界位置（用于负面词联动）
            this.recordCrossPosition();
            
            this.crossCount++;
            const effectIndex = Math.min(this.crossCount - 1, this.crossEffects.length - 1);
            const effect = this.crossEffects[effectIndex];
            
            if (effect.endGame) {
                this.endReason = '三次越界';
                this.showGameOver();
                return;
            }
            
            // 应用惩罚
            this.score = Math.max(0, this.score - effect.penalty.score);
            this.integrityValue = Math.max(0, this.integrityValue - effect.penalty.integrity);
            
            // 缩短蛇身
            if (effect.shortenSnake > 0 && this.snake.length > effect.shortenSnake + 1) {
                for (let i = 0; i < effect.shortenSnake; i++) {
                    this.snake.pop();
                }
            }
            
            // 糖衣炮弹效果：方向反转
            if (effect.confuse) {
                this.confuse = true;
                setTimeout(() => { this.confuse = false; }, effect.confuseDuration);
                showToast('💣 糖衣炮弹！方向随机反转！', 'danger');
            } else {
                showToast(`${this.crossCount}次越界！${effect.description}`, 'warning');
            }
            
            // 越界代价：在安全区生成负面词（隐喻：越界的代价）
            this.spawnNegativeAfterCross();
            
            gameAudio.playCrossBoundary();
            this.triggerRedLineWarning();
            this.updateUI();
        }

        // ===== 高风险区持续扣廉洁值机制 =====
        startHighRiskDrainSystem() {
            this.highRiskDrainTimer = setInterval(() => {
                if (this.gameRunning && !this.gamePaused && this.snake.length > 0) {
                    const head = this.snake[0];
                    const headX = head.x * this.cellSize;
                    
                    if (headX > this.redLineX) {
                        // 在高风险区，每秒扣2点廉洁值，腐败因子越多扣得越快
                        const drainAmount = this.highRiskDrainAmount + Math.floor(this.corruptionParticles / 3);
                        this.integrityValue = Math.max(0, this.integrityValue - drainAmount);
                        
                        // 增加腐败因子（在高风险区）
                        if (Math.random() < 0.2) {
                            this.addCorruptionParticle();
                        }
                        
                        this.updateUI();
                        
                        if (this.integrityValue <= 0) {
                            this.showIntegrityZero();
                        }
                    }
                }
            }, this.highRiskDrainInterval);
        }

        // ===== 腐败因子黏附机制 =====
        addCorruptionParticle() {
            this.corruptionParticles++;
            
            // 可视化：在蛇身上添加一个粒子
            if (this.snake.length > 1) {
                const particleSegment = Math.floor(Math.random() * (this.snake.length - 1)) + 1;
                this.corruptionParticleVisual.push({
                    segmentIndex: particleSegment,
                    offsetX: (Math.random() - 0.5) * this.cellSize,
                    offsetY: (Math.random() - 0.5) * this.cellSize,
                    lifetime: 10000 // 10秒后消失
                });
            }
            
            // 腐败因子过多时加速廉洁值下降
            if (this.corruptionParticles >= 5) {
                showToast('⚠️ 腐败因子大量黏附！', 'danger');
            }
        }

        // 吃廉洁词清除腐败因子
        clearCorruptionParticles(amount = 1) {
            this.corruptionParticles = Math.max(0, this.corruptionParticles - amount);
            
            // 清除可视化粒子
            if (amount > 0 && this.corruptionParticleVisual.length > 0) {
                this.corruptionParticleVisual.splice(0, amount);
            }
        }

        // ===== 稀有词公开竞争与倒计时 =====
        startRareWordCountdownSystem() {
            this.rareWordCountdownTimer = setInterval(() => {
                if (this.gameRunning && !this.gamePaused && this.rareWords.length > 0) {
                    this.checkRareWordTimeouts();
                }
            }, 1000);
        }

        checkRareWordTimeouts() {
            const now = Date.now();
            for (let i = this.rareWords.length - 1; i >= 0; i--) {
                const rareWord = this.rareWords[i];
                if (!rareWord.spawnTime) {
                    rareWord.spawnTime = now;
                }
                
                const elapsed = now - rareWord.spawnTime;
                if (elapsed >= this.rareWordTimeoutDuration) {
                    // 时间到，稀有词转变成负面词
                    this.transformRareWordToNegative(i);
                }
            }
        }

        transformRareWordToNegative(index) {
            const rareWord = this.rareWords[index];
            this.rareWords.splice(index, 1);
            
            // 创建一个新的负面词
            const negativeWords = this.NEGATIVE_WORDS;
            const randomWord = negativeWords[Math.floor(Math.random() * negativeWords.length)];
            
            this.words.push({
                x: rareWord.x,
                y: rareWord.y,
                text: randomWord,
                isClean: false,
                isRare: false
            });
            
            showToast('⏰ 稀有词变质！变成了负面词！', 'danger');
        }

        // ===== AI蛇围猎与让路行为 =====
        updateAISnakePersonality() {
            // 动态切换AI人格
            const scoreDiff = this.score - (this.aiSnake.length * 10);
            
            if (scoreDiff > 50 && this.aiPersonality !== 'crazy') {
                // 玩家领先很多，AI进入疯狂模式
                this.aiPersonality = 'crazy';
                this.circlingMode = true;
                this.logAIDecision('人格切换', '进入疯狂围猎模式！');
            } else if (scoreDiff < -30 && this.aiPersonality === 'crazy') {
                // AI领先很多，恢复谨慎
                this.aiPersonality = 'cautious';
                this.circlingMode = false;
            }
        }

        // ===== 随机事件系统 =====
        startRandomEventSystem() {
            this.randomEventTimer = setInterval(() => {
                if (this.gameRunning && !this.gamePaused && !this.currentRandomEvent) {
                    this.triggerRandomEvent();
                }
            }, this.randomEventInterval);
        }

        triggerRandomEvent() {
            const eventIndex = Math.floor(Math.random() * this.randomEventPool.length);
            const event = this.randomEventPool[eventIndex];
            
            this.currentRandomEvent = event;
            showToast(`🎲 ${event.name}：${event.description}`, 'info');
            
            // 应用事件效果
            this.applyEventEffect(event.effect);
            
            // 设置事件结束定时器
            setTimeout(() => {
                this.endRandomEvent(event.effect);
            }, event.duration);
        }

        applyEventEffect(effectType) {
            switch (effectType) {
                case 'clear_negatives':
                    // 廉政风暴：清除所有负面词
                    this.words = this.words.filter(w => w.isClean);
                    break;
                    
                case 'disguised_negative':
                    // 糖衣炮弹：把一个廉洁词伪装成负面词
                    const cleanWords = this.words.filter(w => w.isClean);
                    if (cleanWords.length > 0) {
                        const targetIndex = this.words.indexOf(cleanWords[Math.floor(Math.random() * cleanWords.length)]);
                        if (targetIndex >= 0) {
                            this.words[targetIndex].disguised = true;
                            this.words[targetIndex].originalIsClean = true;
                        }
                    }
                    break;
                    
                case 'hide_redline':
                    // 迷雾降临：隐藏红线
                    this.redLineHidden = true;
                    break;
                    
                case 'double_points':
                    // 双倍积分：得分翻倍
                    this.eventMultiplier = 2;
                    break;
                    
                case 'temptation_surge':
                    // 终极诱惑：大量金色诱惑点
                    for (let i = 0; i < 3; i++) {
                        this.spawnRedTemptation();
                    }
                    break;
                    
                case 'ai_crazy':
                    // 心魔暴走：AI进入疯狂型，玩家方向随机翻转
                    if (this.aiSnakeEnabled) {
                        this.aiPersonality = 'crazy';
                    }
                    // 玩家方向随机翻转
                    this.confused = true;
                    setTimeout(() => { this.confused = false; }, 3000);
                    break;
            }
        }

        endRandomEvent(effectType) {
            switch (effectType) {
                case 'disguised_negative':
                    // 恢复伪装的词
                    this.words.forEach(w => {
                        if (w.disguised && w.originalIsClean) {
                            w.disguised = false;
                            w.originalIsClean = undefined;
                        }
                    });
                    break;
                    
                case 'hide_redline':
                    this.redLineHidden = false;
                    break;
                    
                case 'double_points':
                    this.eventMultiplier = 1;
                    break;
                    
                case 'ai_crazy':
                    // 心魔暴走结束：AI恢复谨慎型
                    if (this.aiSnakeEnabled) {
                        this.aiPersonality = 'cautious';
                    }
                    break;
            }
            
            this.currentRandomEvent = null;
            showToast('🎲 事件结束', 'info');
        }

        // ===== 更新现有方法以支持新功能 =====
        // 更新 handleCleanWord 以清除腐败因子
        handleCleanWordEnhanced(word) {
            this.clearCorruptionParticles(1);
        }

        getCommentLevel() {
            if (this.crossCount >= 3 || this.integrityValue <= 20) {
                return 'high';
            } else if (this.crossCount >= 1 || this.integrityValue <= 50) {
                return 'medium';
            }
            return 'low';
        }

        getLevelName(level) {
            const names = {
                low: '初级',
                medium: '中级',
                high: '高级'
            };
            return names[level] || '初级';
        }

        getFallbackComment(level) {
            const comments = {
                low: '您成功守住了廉洁底线，展现了良好的自律能力。继续坚持！',
                medium: '您曾越过红线，虽有遗憾但未完全失守。愿您以此为戒，更加谨慎。',
                high: '红线不可逾越，纪律底线不可触碰。愿您迷途知返，重新开始。'
            };
            return comments[level] || comments.low;
        }

        closeOverlay() {
            document.getElementById('overlay').classList.remove('active');
            // 显示主菜单界面
            this.showMainMenu();
        }
        
        showMainMenu() {
            // 显示地图和速度选择界面
            const gameArea = document.getElementById('gameArea');
            const startScreen = document.getElementById('startScreen');
            
            if (gameArea) gameArea.style.display = 'none';
            if (startScreen) startScreen.style.display = 'flex';
        }

        openAIPanel() {
            document.getElementById('aiPanel').classList.add('active');
        }

        closeAIPanel() {
            document.getElementById('aiPanel').classList.remove('active');
        }

        async sendChatMessage() {
            const input = document.getElementById('userInput');
            const message = input.value.trim();
            if (!message) return;

            const chatContainer = document.getElementById('chatContainer');
            const userMsg = document.createElement('div');
            userMsg.className = 'chat-message user';
            userMsg.innerHTML = `<div class="content">${message}</div>`;
            chatContainer.appendChild(userMsg);

            input.value = '';

            const gameData = {
                score: this.score,
                crossCount: this.crossCount,
                collectedWords: this.collectedWords,
                negativeWords: this.negativeWords,
                mapSize: this.mapSizes[this.currentMapSize].name,
                integrityValue: this.integrityValue
            };

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message, gameData })
                });

                const data = await response.json();

                const aiMsg = document.createElement('div');
                aiMsg.className = 'chat-message ai';

                let apiInfo = '';
                if (data.apiCall) {
                    const isSuccess = data.apiCall.status === 200;
                    apiInfo = `<div class="api-badge${!isSuccess ? ' fallback' : ''}">
                        <span class="api-dot"></span>
                        智谱AI · ${data.apiCall.model}
                        <span class="api-status">● ${isSuccess ? '调用成功' : '调用失败'}</span>
                    </div>`;
                } else {
                    apiInfo = `<div class="api-badge fallback">
                        <span class="api-dot"></span>
                        本地回复
                        <span class="api-status">● 离线</span>
                    </div>`;
                }

                const parsedResponse = window.parseMarkdown ? window.parseMarkdown(data.response) : data.response;
                aiMsg.innerHTML = `<div class="sender">AI廉洁导师</div>${apiInfo}<div class="content">${parsedResponse}</div>`;
                chatContainer.appendChild(aiMsg);
            } catch (error) {
                const aiMsg = document.createElement('div');
                aiMsg.className = 'chat-message ai';
                aiMsg.innerHTML = `<div class="sender">AI廉洁导师</div><div class="content">抱歉，AI导师暂时无法回复。请稍后再试。</div>`;
                chatContainer.appendChild(aiMsg);
            }

            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
        
        // ===== AI动态难度调节系统 =====
        
        // 启动AI动态调节引擎
        startAIDifficultyAdjustment() {
            this.aiDifficultyAdjustTimer = setInterval(() => {
                if (this.gameRunning && !this.gamePaused) {
                    this.adjustDifficultyByAI();
                }
            }, this.aiAdjustInterval);
        }
        
        // AI动态调节难度核心函数
        adjustDifficultyByAI() {
            // 1. 计算风险评分
            this.currentRiskScore = this.calculateRiskScore();
            
            // 2. 根据风险评分调整安全区绿色词数量
            this.adjustSafeZoneSupply();
            
            // 3. 根据风险评分调整红线收缩速度
            this.adjustRedLineShrinkSpeed();
            
            // 4. 更新UI显示风险状态
            this.updateRiskStatusUI();
        }
        
        // 计算风险评分（0-100）
        // 使用机器学习模型进行实时风险预测
        async calculateRiskScoreWithML() {
            const features = {
                crossCount: this.crossCount,
                negativeWords: this.negativeWords,
                collectedWords: this.collectedWords,
                dangerTime: this.getDangerTime(),
                quizCorrect: this.quizCorrect || 0,
                quizTotal: this.quizTotal || 1
            };

            try {
                const predictions = await this.predictWithML();
                if (predictions && predictions.ensemble !== undefined) {
                    // 使用集成模型的预测作为风险评分
                    const mlRiskScore = predictions.ensemble * 100;
                    // 结合原有规则计算最终评分
                    return Math.round(mlRiskScore * 0.6 + this.calculateRuleBasedRisk() * 0.4);
                }
            } catch (e) {}
            return this.calculateRuleBasedRisk();
        }

        // 获取危险区停留时间
        getDangerTime() {
            if (!this.snake || this.snake.length === 0) return 0;
            const head = this.snake[0];
            return head.x * this.cellSize > this.redLineX ? (this.dangerTime || 0) + 1 : 0;
        }

        // 原有规则计算风险
        calculateRuleBasedRisk() {
            let score = 0;
            const integrityFactor = (100 - this.integrityValue) * 0.5;
            const crossFactor = this.crossCount * 20;
            const corruptionFactor = this.corruptionParticles * 10;
            const head = this.snake[0];
            const positionFactor = head.x * this.cellSize > this.redLineX ? 15 : 0;
            score = integrityFactor + crossFactor + corruptionFactor + positionFactor;
            return Math.min(100, Math.max(0, score));
        }

        // 获取ML模型预测详情
        async getMLPredictions() {
            const features = {
                crossCount: this.crossCount,
                negativeWords: this.negativeWords,
                collectedWords: this.collectedWords,
                dangerTime: this.getDangerTime(),
                quizCorrect: this.quizCorrect || 0,
                quizTotal: this.quizTotal || 1
            };

            try {
                const predictions = await this.predictWithML();
                return predictions;
            } catch (e) {
                return null;
            }
        }

        calculateRiskScore() {
            // 默认使用规则计算，异步ML计算更新时会用ML结果
            return this.calculateRuleBasedRisk();
        }
        
        // 根据风险评分和廉洁值调整安全区绿色词供给
        adjustSafeZoneSupply() {
            const integrity = this.integrityValue;
            let maxGreenWords;
            
            // 根据廉洁值和关卡确定基准数量
            if (integrity >= 81) {
                maxGreenWords = this.currentLevel <= 2 ? 4 : (this.currentLevel <= 4 ? 3 : 2);
            } else if (integrity >= 51) {
                maxGreenWords = this.currentLevel <= 2 ? 3 : (this.currentLevel <= 4 ? 2 : 1);
            } else if (integrity >= 31) {
                maxGreenWords = this.currentLevel <= 2 ? 2 : 1;
            } else {
                maxGreenWords = 1; // 保底
            }
            
            // 应用豆包API的供给策略
            if (this.aiSupplyStrategy) {
                maxGreenWords = Math.floor(maxGreenWords * this.aiSupplyStrategy.safe_zone_ratio);
            }
            
            // 确保保底
            maxGreenWords = Math.max(1, maxGreenWords);
            
            // 获取当前场上安全区绿色词数量
            const currentLeftGreen = this.words.filter(w => 
                w.isClean && (w.x * this.cellSize) < this.redLineX
            ).length;
            
            // 如果当前数量少于目标数量，补充生成
            if (currentLeftGreen < maxGreenWords) {
                const needed = maxGreenWords - currentLeftGreen;
                for (let i = 0; i < needed; i++) {
                    setTimeout(() => {
                        this.spawnSingleWord(true, true); // 在左侧安全区生成绿色词
                    }, i * 500);
                }
            }
        }
        
        // 根据风险评分调整红线收缩速度
        adjustRedLineShrinkSpeed() {
            if (!this.redLineShrinkTimer) return;
            
            // 清除旧的定时器
            clearInterval(this.redLineShrinkTimer);
            
            // 根据风险评分确定新的收缩速度（优化后更紧凑）
            let newInterval;
            if (this.currentRiskScore <= 30) {
                newInterval = 20000; // 低风险：20秒移动一次
            } else if (this.currentRiskScore <= 60) {
                newInterval = 12000; // 中风险：12秒移动一次
            } else {
                newInterval = 8000; // 高风险：8秒移动一次
            }
            
            // 重新启动定时器
            this.redLineShrinkInterval = newInterval;
            this.redLineShrinkTimer = setInterval(() => {
                if (this.gameRunning && !this.gamePaused) {
                    this.shrinkRedLine();
                }
            }, this.redLineShrinkInterval);
        }
        
        // 更新风险状态UI
        updateRiskStatusUI() {
            // 更新风险评分显示
            const riskScoreElement = document.getElementById('riskScore');
            if (riskScoreElement) {
                riskScoreElement.textContent = `${Math.round(this.currentRiskScore)}%`;
            }
            
            // 根据风险评分设置风险颜色
            const riskCircle = document.querySelector('.risk-score-circle');
            if (riskCircle) {
                let riskColor;
                if (this.currentRiskScore <= 30) {
                    riskColor = 'rgba(74, 222, 128, 0.3)';
                    riskCircle.style.boxShadow = `0 0 20px rgba(74, 222, 128, 0.5)`;
                } else if (this.currentRiskScore <= 60) {
                    riskColor = 'rgba(251, 191, 36, 0.3)';
                    riskCircle.style.boxShadow = `0 0 20px rgba(251, 191, 36, 0.5)`;
                } else {
                    riskColor = 'rgba(239, 68, 68, 0.3)';
                    riskCircle.style.boxShadow = `0 0 20px rgba(239, 68, 68, 0.5)`;
                }
                riskCircle.style.backgroundColor = riskColor;
            }
            
            // 更新风险特征条
            const feature1 = document.getElementById('feature1');
            const feature2 = document.getElementById('feature2');
            const feature3 = document.getElementById('feature3');
            const feature4 = document.getElementById('feature4');
            
            if (feature1) feature1.style.width = `${Math.min(100, this.crossCount * 25)}%`;
            if (feature2) feature2.style.width = `${Math.min(100, this.corruptionParticles * 20)}%`;
            if (feature3) feature3.style.width = `${Math.min(100, this.currentRiskScore * 0.8)}%`;
            if (feature4) feature4.style.width = `${Math.min(100, (100 - this.integrityValue) * 0.7)}%`;
        }
        
        // 记录最后一次越界位置（用于负面词联动）
        recordCrossPosition() {
            if (this.snake.length > 0) {
                this.lastCrossPosition = {
                    x: this.snake[0].x,
                    y: this.snake[0].y
                };
            }
        }
        
        // 在越界位置附近生成负面词
        spawnNegativeAfterCross() {
            if (this.lastCrossPosition && Math.random() > 0.5) { // 50%概率
                setTimeout(() => {
                    this.spawnSingleWord(false, false, this.lastCrossPosition);
                    this.showToast('⚠️ 越界的代价：安全区出现负面词！', 'warning');
                }, 2000);
            }
        }
        
        // AI蛇抢词后在该位置生成负面词
        spawnNegativeAfterAISteal(stealPosition) {
            if (Math.random() > 0.4) { // 60%概率
                setTimeout(() => {
                    this.spawnSingleWord(false, false, stealPosition);
                }, 1500);
            }
        }
        
        // 预留豆包API接口：每局开始前获取供给策略
        async requestAISupplyStrategy() {
            // 模拟豆包API调用
            // 实际项目中这里会调用后端API
            console.log('请求豆包AI供给策略...');
            
            try {
                // 模拟API延迟
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // 模拟返回数据
                this.aiSupplyStrategy = {
                    safe_zone_ratio: 1.0 - (this.crossCount * 0.1), // 越界次数越多，比例越低
                    rare_word_incentive: this.crossCount === 0, // 零越界玩家获得稀有词激励
                    negative_word_density: 0.3 + (this.crossCount * 0.1)
                };
                
                console.log('AI供给策略:', this.aiSupplyStrategy);
            } catch (error) {
                console.error('获取AI供给策略失败:', error);
                // 使用默认策略
                this.aiSupplyStrategy = {
                    safe_zone_ratio: 1.0,
                    rare_word_incentive: false,
                    negative_word_density: 0.3
                };
            }
        }

        // 显示ML模型对比面板
        showMLComparison() {
            const modal = document.createElement('div');
            modal.className = 'game-modal';
            modal.id = 'ml-comparison-modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width:800px;max-height:90vh;overflow-y:auto;">
                    <div class="modal-header">
                        <h2 class="modal-title">🧠 机器学习模型对比</h2>
                        <button class="modal-close" onclick="this.closest('.game-modal').remove()">&times;</button>
                    </div>
                    <div class="modal-body" style="padding:20px;">
                        <div id="mlTrainingViz"></div>
                        <div id="modelCompareViz"></div>
                        <div id="confusionMatrixViz"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            setTimeout(() => modal.classList.add('show'), 10);

            if (!window.trainingVisualizer) {
                window.trainingVisualizer = new TrainingVisualizer('mlTrainingViz');
            }
            window.trainingVisualizer.init(700, 300);

            fetch('http://localhost:5001/api/ml/history')
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        window.trainingVisualizer.drawCurves(data.history, window.mlEngine.modelConfigs);
                    }
                })
                .catch(() => {
                    const history = window.mlEngine?.getTrainingHistory() || {};
                    if (Object.keys(history).length > 0) {
                        window.trainingVisualizer.drawCurves(history, window.mlEngine.modelConfigs);
                    } else {
                        document.getElementById('mlTrainingViz').innerHTML = '<p style="color:#888;">正在训练模型...</p>';
                        this.trainMLModels();
                    }
                });

            if (!window.modelComparator) {
                window.modelComparator = new ModelComparator('modelCompareViz');
            }
            window.modelComparator.init();

            if (!window.confusionMatrix) {
                window.confusionMatrix = new ConfusionMatrix('confusionMatrixViz');
            }
            window.confusionMatrix.init();

            fetch('http://localhost:5001/api/ml/compare')
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        window.modelComparator.setModels(data.comparison);
                        if (data.confusionMatrix) {
                            window.confusionMatrix.setMatrix(data.confusionMatrix);
                        }
                    }
                })
                .catch(() => {
                    const comparison = window.mlEngine?.getModelComparison() || [];
                    if (comparison.length > 0) {
                        window.modelComparator.setModels(comparison);
                    } else {
                        document.getElementById('modelCompareViz').innerHTML = '<p style="color:#888;">正在训练模型...</p>';
                    }
                    const defaultMatrix = [[0.85, 0.15], [0.12, 0.88]];
                    window.confusionMatrix.setMatrix(defaultMatrix);
                });
        }

        async trainMLModels() {
            try {
                const { X, y } = window.mlEngine.generateTrainingData(500);
                const response = await fetch('http://localhost:5001/api/ml/train', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ X, y })
                });
                const data = await response.json();
                if (data.success) {
                    const history = window.mlEngine.getTrainingHistory();
                    window.trainingVisualizer.drawCurves(history, window.mlEngine.modelConfigs);
                    window.modelComparator.setModels(
                        data.results ? Object.entries(data.results).map(([k, v]) => ({
                            name: window.mlEngine.modelConfigs[k]?.name || k,
                            color: window.mlEngine.modelConfigs[k]?.color || '#888',
                            accuracy: v.accuracy
                        })) : []
                    );
                    if (data.confusionMatrix) {
                        window.confusionMatrix.setMatrix(data.confusionMatrix);
                    }
                }
            } catch (e) {
                console.log('ML训练API不可用，使用本地训练');
                await window.mlEngine.trainAllModels(
                    window.mlEngine.generateTrainingData(200).X,
                    window.mlEngine.generateTrainingData(200).y
                );
                const history = window.mlEngine.getTrainingHistory();
                window.trainingVisualizer.drawCurves(history, window.mlEngine.modelConfigs);
                window.modelComparator.setModels(window.mlEngine.getModelComparison());
                const defaultMatrix = [[0.85, 0.15], [0.12, 0.88]];
                window.confusionMatrix.setMatrix(defaultMatrix);
            }
        }

        async predictWithML() {
            const features = window.mlEngine.extractFeatures({
                crossCount: this.crossCount,
                negativeWords: this.negativeWords,
                collectedWords: this.collectedWords,
                dangerTime: this.dangerTime || 0,
                quizCorrect: this.quizCorrect || 0,
                quizTotal: this.quizTotal || 1
            });

            try {
                const response = await fetch('http://localhost:5001/api/ml/predict', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ features: Object.values(features) })
                });
                const data = await response.json();
                if (data.success) {
                    return data.predictions;
                }
            } catch (e) {}

            return window.mlEngine.predict(features);
        }
    }

    // 全局初始化
    console.log('game.js加载完成，等待DOM就绪...');
    
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM已就绪，开始初始化游戏...');
        
        try {
            window.game = new Game();
            console.log('Game实例创建成功！window.game =', window.game);
            
            // 测试：尝试调用一个方法
            if (window.game && window.game.start) {
                console.log('Game.start方法存在');
            }
        } catch (error) {
            console.error('Game初始化失败:', error);
        }
    });
