const CLEAN_KNOWLEDGE = {
    words: {
        '清正': { meaning: '指人心灵纯净、行为端正，是廉洁的基础', story: '《尚书》有云："清白纯洁，正道直行。"清正之人，如清水之明镜，照见万物不失其真。' },
        '廉洁': { meaning: '不贪不义之财，清白做人', story: '《官箴》曰："当官之法，惟有三事：曰清、曰慎、曰勤。"廉洁是为官之本。' },
        '自律': { meaning: '自我约束，控制欲望', story: '《大学》云："君子必慎其独也。"自律者，在无人所见之处，亦不改其志。' },
        '慎独': { meaning: '在无人监督时仍守正道', story: '《中庸》："莫见乎隐，莫显乎微，故君子慎其独也。"这是修身最高境界。' },
        '公正': { meaning: '公平正直，不偏不倚', story: '《尚书》曰："无偏无党，王道荡荡。"公正无私者，天下为公。' },
        '守法': { meaning: '遵守法律纪律', story: '遵纪守法是公民本分，守法者虽无形约束，却有心安之报。' },
        '奉公': { meaning: '一心为公，不谋私利', story: '古语云："奉公如法则上下平。"奉公者，天下为公。' },
        '无私': { meaning: '没有私心，公正无私', story: '《左传》："奉公利而弃私怨。"无私方能公正。' },
        '清廉': { meaning: '清白廉洁，两袖清风', story: '于谦《入京》："清风两袖朝天去，免得闾阎话短长。"' },
        '正直': { meaning: '坦荡做人，正直行事', story: '《论语》："其身正，不令而行。"正直者自有一股浩然正气。' },
        '坦荡': { meaning: '胸怀坦荡，光明磊落', story: '君子坦荡荡，小人长戚戚。胸怀坦荡者，仰不愧于天，俯不怍于人。' },
        '高洁': { meaning: '高尚纯洁，品性清高', story: '周敦颐独爱莲之"出淤泥而不染"，喻高洁之士。' },
        '克己': { meaning: '克制私欲，严格要求自己', story: '《论语》："克己复礼为仁。"克己者方能成仁。' },
        '勤政': { meaning: '勤勉尽职，为民服务', story: '勤政者，如诸葛亮"鞠躬尽瘁，死而后已"，是为民之楷模。' },
        '俭朴': { meaning: '节约朴素，不铺张浪费', story: '《诫子书》："静以修身，俭以养德。"俭朴是修身之基。' },
        '淡泊': { meaning: '看淡名利，坚守本心', story: '诸葛亮《诫子书》："非淡泊无以明志，非宁静无以致远。"' },
        '忠诚': { meaning: '忠心耿耿，忠于职守', story: '《忠经》："忠者中也，至公无私。"忠诚者，天下之至德也。' },
        '敬业': { meaning: '专心致力于本职工作', story: '韩愈曰："业精于勤，荒于嬉。"敬业者，方能精进。' },
        '守信': { meaning: '诚实守约，言行一致', story: '《论语》："言必信，行必果。"守信者，一诺千金。' },
        '正派': { meaning: '作风正派，品行端正', story: '正派者，如松柏之常青，历经风霜而不改其色。' }
    },
    stories: [
        {
            id: 1,
            title: '两袖清风',
            era: '明代',
            person: '于谦',
            content: '于谦任兵部侍郎时，巡抚河南。赴任时，他不带金银珠宝，只带两袖清风。后人赞曰："清风两袖朝天去，免得闾阎话短长。"',
            moral: '为官清廉，不取不义之财'
        },
        {
            id: 2,
            title: '出淤泥而不染',
            era: '宋代',
            person: '周敦颐',
            content: '周敦颐《爱莲说》："予独爱莲之出淤泥而不染，濯清涟而不妖，中通外直，不蔓不枝，香远益清，亭亭净植，可远观而不可亵玩焉。"',
            moral: '身处污浊而不随波逐流'
        },
        {
            id: 3,
            title: '粉骨碎身浑不怕',
            era: '明代',
            person: '于谦',
            content: '于谦《石灰吟》："千锤万凿出深山，烈火焚烧若等闲。粉骨碎身浑不怕，要留清白在人间。"',
            moral: '即使粉身碎骨也要保持清白'
        },
        {
            id: 4,
            title: '羊续悬鱼',
            era: '东汉',
            person: '羊续',
            content: '羊续任庐江太守时，下属送鱼，他坚辞不受，将鱼悬于室外。后鱼化为鱼干，他仍不接受，并告诫下属"君一无所用"。',
            moral: '廉洁自律，拒绝贿赂'
        },
        {
            id: 5,
            title: '子罕辞玉',
            era: '春秋',
            person: '子罕',
            content: '宋人得玉献予子罕，子罕曰："我以不贪为宝，尔以玉为宝。若以予我，皆丧宝也。不若人有其宝。"遂不受。',
            moral: '不贪为宝，坚守本心'
        },
        {
            id: 6,
            title: '一钱太守',
            era: '唐代',
            person: '刘宠',
            content: '刘宠任会稽太守，清廉爱民。离任时，百姓赠以百钱，刘宠只取一枚钱以作纪念。后人称为"一钱太守"。',
            moral: '清正廉明，不贪民财'
        }
    ]
};

function showWordMeaning(word) {
    const wordData = CLEAN_KNOWLEDGE.words[word];
    if (!wordData) return;

    const overlay = document.createElement('div');
    overlay.className = 'word-meaning-overlay';
    overlay.innerHTML = `
        <div class="word-meaning-card">
            <h3>📖 ${word}</h3>
            <p class="word-meaning">${wordData.meaning}</p>
            <div class="word-story">
                <h4>💡 典故</h4>
                <p>${wordData.story}</p>
            </div>
            <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">关闭</button>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}

function showStoryCard(storyId) {
    const story = CLEAN_KNOWLEDGE.stories.find(s => s.id === storyId);
    if (!story) return;

    const overlay = document.createElement('div');
    overlay.className = 'word-meaning-overlay';
    overlay.innerHTML = `
        <div class="word-meaning-card story-card-full">
            <span class="story-era-badge">${story.era}</span>
            <h3>📜 ${story.title}</h3>
            <p class="story-person">人物：${story.person}</p>
            <div class="story-full-content">
                <p>${story.content}</p>
            </div>
            <div class="story-moral-box">
                <span>✨ 寓意：${story.moral}</span>
            </div>
            <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">关闭</button>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}

const storyStyle = document.createElement('style');
storyStyle.textContent = `
    .word-meaning-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 500;
        animation: fadeIn 0.3s ease;
    }
    .word-meaning-card {
        background: linear-gradient(135deg, rgba(13,27,42,0.98), rgba(27,38,59,0.98));
        border: 2px solid #40916c;
        border-radius: 20px;
        padding: 30px;
        max-width: 450px;
        text-align: center;
        animation: scaleIn 0.3s ease;
    }
    .word-meaning-card h3 {
        color: #40916c;
        font-size: 1.8rem;
        margin-bottom: 15px;
    }
    .word-meaning {
        color: #e0e1dd;
        font-size: 1.1rem;
        margin-bottom: 20px;
        line-height: 1.6;
    }
    .word-story {
        background: rgba(64,145,108,0.1);
        border-radius: 12px;
        padding: 15px;
        margin-bottom: 20px;
        text-align: left;
    }
    .word-story h4 {
        color: #40916c;
        margin-bottom: 10px;
    }
    .word-story p {
        color: #94a3b8;
        font-style: italic;
        line-height: 1.7;
    }
    .story-card-full {
        max-width: 500px;
    }
    .story-era-badge {
        background: rgba(212,163,115,0.25);
        color: #d4a373;
        padding: 5px 15px;
        border-radius: 20px;
        font-size: 0.9rem;
    }
    .story-person {
        color: #778da9;
        margin: 10px 0 20px;
    }
    .story-full-content {
        background: rgba(64,145,108,0.08);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
    }
    .story-full-content p {
        color: #cbd5e1;
        font-style: italic;
        line-height: 1.8;
    }
    .story-moral-box {
        background: rgba(64,145,108,0.15);
        border-left: 3px solid #40916c;
        padding: 12px 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        text-align: left;
    }
    .story-moral-box span {
        color: #40916c;
    }
`;
document.head.appendChild(storyStyle);