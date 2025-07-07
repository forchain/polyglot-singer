import { describe, it, expect } from 'vitest';
import { restoreLyricAnalysis } from './restoreLyricAnalysis';

describe('restoreLyricAnalysis', () => {
  it('能正确还原有重复歌词的分析结果', () => {
    const originalLines = [
      'Le ciel bleu sur nous peut s\'effondrer',
      'Et la terre peut bien s\'écrouler',
      'Peu m\'importe si tu m\'aimes',
      'Je me fous du monde entier',
      'Tant que l\'amour inondera mes matins',
      'Tant que mon corps frémira sous tes mains',
      'Peu m\'importent les problèmes',
      'Mon amour, puisque tu m\'aimes',
      'J\'irais jusqu\'au bout du monde',
      'Je me ferais teindre en blonde',
      'Si tu me la demandais',
      'J\'irais décrocher la lune',
      'J\'irais voler la fortune',
      'Si tu me le demandais',
      'Je renierais ma patrie',
      'Je renierais mes amis',
      'Si tu me la demandais',
      'On peut bien rire de moi',
      'Je ferais n\'importe quoi',
      'Je ferais n\'importe quoi',
      'Si tu me le demandais',
      'Si un jour la vie t\'arrache à moi',
      'Si tu meurs, que tu sois loin de moi',
      'Peu m\'importe, si tu m\'aimes',
      'Car moi je mourrai aussi',
      'Nous aurons pour nous l\'éternité',
      'Dans le bleu de toute l\'immensité',
      'Dans le ciel, plus de problèmes',
      'Mon amour, crois-tu qu\'on s\'aime',
      'Dieu réunit ceux qui s\'aiment'
    ];

    // uniqueLines = ['hello world', 'foo bar', 'baz qux']
    const compressedLines = [
      [
        "蓝天在我们头顶崩塌也无妨",
        [
          ["Le", "/lə/", "这"],
          ["ciel", "/sjɛl/", "天空"],
          ["bleu", "/blø/", "蓝色的"],
          ["sur", "/syʁ/", "在...之上"],
          ["nous", "/nu/", "我们"],
          ["peut", "/pø/", "可以"],
          ["s'effondrer", "/sefɔ̃dʁe/", "崩塌"]
        ]
      ],
      [
        "大地尽可以坍塌",
        [
          ["Et", "/e/", "和"],
          ["la", "/la/", "这"],
          ["terre", "/tɛʁ/", "大地"],
          ["peut", "/pø/", "可以"],
          ["bien", "/bjɛ̃/", "完全"],
          ["s'écrouler", "/sekʁule/", "坍塌"]
        ]
      ],
      [
        "只要你爱我 我都不在乎",
        [
          ["Peu", "/pø/", "很少"],
          ["m'importe", "/mɛ̃pɔʁt/", "我在乎"],
          ["si", "/si/", "如果"],
          ["tu", "/ty/", "你"],
          ["m'aimes", "/mɛm/", "爱我"]
        ]
      ],
      [
        "我根本不在乎全世界",
        [
          ["Je", "/ʒə/", "我"],
          ["me", "/mə/", "我自己"],
          ["fous", "/fu/", "不在乎"],
          ["du", "/dy/", "的"],
          ["monde", "/mɔ̃d/", "世界"],
          ["entier", "/ɑ̃tje/", "整个"]
        ]
      ],
      [
        "只要爱充满我的每个清晨",
        [
          ["Tant", "/tɑ̃/", "只要"],
          ["que", "/kə/", "那"],
          ["l'amour", "/lamuʁ/", "爱情"],
          ["inondera", "/inɔ̃dʁa/", "淹没"],
          ["mes", "/me/", "我的"],
          ["matins", "/matɛ̃/", "早晨"]
        ]
      ],
      [
        "只要我的身体还在你的手下颤抖",
        [
          ["Tant", "/tɑ̃/", "只要"],
          ["que", "/kə/", "那"],
          ["mon", "/mɔ̃/", "我的"],
          ["corps", "/kɔʁ/", "身体"],
          ["frémira", "/fʁemiʁa/", "颤抖"],
          ["sous", "/su/", "在...之下"],
          ["tes", "/te/", "你的"],
          ["mains", "/mɛ̃/", "手"]
        ]
      ],
      [
        "问题我都不在乎",
        [
          ["Peu", "/pø/", "很少"],
          ["m'importent", "/mɛ̃pɔʁt/", "我在乎"],
          ["les", "/le/", "这些"],
          ["problèmes", "/pʁɔblɛm/", "问题"]
        ]
      ],
      [
        "我的爱 既然你爱我",
        [
          ["Mon", "/mɔ̃/", "我的"],
          ["amour", "/amuʁ/", "爱"],
          ["puisque", "/pɥisk/", "既然"],
          ["tu", "/ty/", "你"],
          ["m'aimes", "/mɛm/", "爱我"]
        ]
      ],
      [
        "我会走到世界尽头",
        [
          ["J'irais", "/ʒiʁɛ/", "我会去"],
          ["jusqu'au", "/ʒysko/", "直到"],
          ["bout", "/bu/", "尽头"],
          ["du", "/dy/", "的"],
          ["monde", "/mɔ̃d/", "世界"]
        ]
      ],
      [
        "我会把头发染成金色",
        [
          ["Je", "/ʒə/", "我"],
          ["me", "/mə/", "我自己"],
          ["ferais", "/fəʁɛ/", "会做"],
          ["teindre", "/tɛ̃dʁ/", "染"],
          ["en", "/ɑ̃/", "成为"],
          ["blonde", "/blɔ̃d/", "金发"]
        ]
      ],
      [
        "只要你要求我",
        [
          ["Si", "/si/", "如果"],
          ["tu", "/ty/", "你"],
          ["me", "/mə/", "我"],
          ["la", "/la/", "它"],
          ["demandais", "/dəmɑ̃dɛ/", "要求"]
        ]
      ],
      [
        "我会去摘下月亮",
        [
          ["J'irais", "/ʒiʁɛ/", "我会去"],
          ["décrocher", "/dekʁɔʃe/", "摘下"],
          ["la", "/la/", "这"],
          ["lune", "/lyn/", "月亮"]
        ]
      ],
      [
        "我会去偷取财富",
        [
          ["J'irais", "/ʒiʁɛ/", "我会去"],
          ["voler", "/vɔle/", "偷"],
          ["la", "/la/", "这"],
          ["fortune", "/fɔʁtyn/", "财富"]
        ]
      ],
      [
        "我会背弃我的祖国",
        [
          ["Je", "/ʒə/", "我"],
          ["renierais", "/ʁənjəʁɛ/", "否认"],
          ["ma", "/ma/", "我的"],
          ["patrie", "/patʁi/", "祖国"]
        ]
      ],
      [
        "我会背弃我的朋友",
        [
          ["Je", "/ʒə/", "我"],
          ["renierais", "/ʁənjəʁɛ/", "否认"],
          ["mes", "/me/", "我的"],
          ["amis", "/ami/", "朋友"]
        ]
      ],
      [
        "人们尽可以嘲笑我",
        [
          ["On", "/ɔ̃/", "人们"],
          ["peut", "/pø/", "可以"],
          ["bien", "/bjɛ̃/", "完全"],
          ["rire", "/ʁiʁ/", "笑"],
          ["de", "/də/", "对"],
          ["moi", "/mwa/", "我"]
        ]
      ],
      [
        "我愿意做任何事",
        [
          ["Je", "/ʒə/", "我"],
          ["ferais", "/fəʁɛ/", "会做"],
          ["n'importe", "/nɛ̃pɔʁt/", "无论什么"],
          ["quoi", "/kwa/", "事情"]
        ]
      ],
      [
        "如果有一天生活将你从我身边夺走",
        [
          ["Si", "/si/", "如果"],
          ["un", "/œ̃/", "一个"],
          ["jour", "/ʒuʁ/", "日子"],
          ["la", "/la/", "这"],
          ["vie", "/vi/", "生活"],
          ["t'arrache", "/taʁaʃ/", "夺走你"],
          ["à", "/a/", "从"],
          ["moi", "/mwa/", "我"]
        ]
      ],
      [
        "如果你死去 远离我",
        [
          ["Si", "/si/", "如果"],
          ["tu", "/ty/", "你"],
          ["meurs", "/mœʁ/", "死去"],
          ["que", "/kə/", "那"],
          ["tu", "/ty/", "你"],
          ["sois", "/swa/", "是"],
          ["loin", "/lwɛ̃/", "远离"],
          ["de", "/də/", "从"],
          ["moi", "/mwa/", "我"]
        ]
      ],
      [
        "只要你爱我 我都不在乎",
        [
          ["Peu", "/pø/", "很少"],
          ["m'importe", "/mɛ̃pɔʁt/", "我在乎"],
          ["si", "/si/", "如果"],
          ["tu", "/ty/", "你"],
          ["m'aimes", "/mɛm/", "爱我"]
        ]
      ],
      [
        "因为我也将死去",
        [
          ["Car", "/kaʁ/", "因为"],
          ["moi", "/mwa/", "我"],
          ["je", "/ʒə/", "我"],
          ["mourrai", "/muʁe/", "将死去"],
          ["aussi", "/osi/", "也"]
        ]
      ],
      [
        "我们将拥有永恒",
        [
          ["Nous", "/nu/", "我们"],
          ["aurons", "/oʁɔ̃/", "将有"],
          ["pour", "/puʁ/", "为了"],
          ["nous", "/nu/", "我们"],
          ["l'éternité", "/letɛʁnite/", "永恒"]
        ]
      ],
      [
        "在无垠的蓝色中",
        [
          ["Dans", "/dɑ̃/", "在"],
          ["le", "/lə/", "这"],
          ["bleu", "/blø/", "蓝色"],
          ["de", "/də/", "的"],
          ["toute", "/tut/", "全部"],
          ["l'immensité", "/limɑ̃site/", "浩瀚"]
        ]
      ],
      [
        "在天堂 不再有问题",
        [
          ["Dans", "/dɑ̃/", "在"],
          ["le", "/lə/", "这"],
          ["ciel", "/sjɛl/", "天空"],
          ["plus", "/ply/", "不再"],
          ["de", "/də/", "的"],
          ["problèmes", "/pʁɔblɛm/", "问题"]
        ]
      ],
      [
        "我的爱 你相信我们相爱吗",
        [
          ["Mon", "/mɔ̃/", "我的"],
          ["amour", "/amuʁ/", "爱"],
          ["crois-tu", "/kʁwa ty/", "你相信"],
          ["qu'on", "/kɔ̃/", "我们"],
          ["s'aime", "/sɛm/", "相爱"]
        ]
      ],
      [
        "上帝会让相爱的人团聚",
        [
          ["Dieu", "/djø/", "上帝"],
          ["réunit", "/ʁeyni/", "团聚"],
          ["ceux", "/sø/", "那些"],
          ["qui", "/ki/", "谁"],
          ["s'aiment", "/sɛm/", "相爱"]
        ]
      ]
    ];

    const expected = [
      {
        lineNumber: 1,
        originalLine: 'hello world',
        lineTranslation: '你好，世界',
        words: [
          { word: 'hello', phonetic: '/həˈloʊ/', translation: '你好' },
          { word: 'world', phonetic: '/wɜːrld/', translation: '世界' }
        ]
      },
      {
        lineNumber: 2,
        originalLine: 'foo bar',
        lineTranslation: '示例翻译',
        words: [
          { word: 'foo', phonetic: '/fuː/', translation: '示例' },
          { word: 'bar', phonetic: '/bɑːr/', translation: '条' }
        ]
      },
      {
        lineNumber: 3,
        originalLine: 'hello world',
        lineTranslation: '你好，世界',
        words: [
          { word: 'hello', phonetic: '/həˈloʊ/', translation: '你好' },
          { word: 'world', phonetic: '/wɜːrld/', translation: '世界' }
        ]
      },
      {
        lineNumber: 4,
        originalLine: 'baz qux',
        lineTranslation: '测试翻译',
        words: [
          { word: 'baz', phonetic: '/bæz/', translation: '测试' },
          { word: 'qux', phonetic: '/kwʌks/', translation: '翻译' }
        ]
      },
      {
        lineNumber: 5,
        originalLine: 'foo bar',
        lineTranslation: '示例翻译',
        words: [
          { word: 'foo', phonetic: '/fuː/', translation: '示例' },
          { word: 'bar', phonetic: '/bɑːr/', translation: '条' }
        ]
      }
    ];

    const result = restoreLyricAnalysis(originalLines, compressedLines);
    expect(result).toEqual(expected);
  });
}); 