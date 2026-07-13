import type { AnimeKnowledge } from "@/types";
import { userAddedAnime } from "./userAddedAnime";

export const GENRES = [
  "恋爱",
  "热血",
  "悬疑",
  "科幻",
  "奇幻",
  "日常",
  "运动",
  "音乐",
  "机战",
  "治愈",
  "搞笑",
  "冒险",
  "恐怖",
  "推理",
  "校园",
  "异世界",
  "战斗",
  "美食",
  "历史",
  "科普",
  "职场",
  "竞技",
  "未分类",
] as const;

export const animeKnowledgeBase: AnimeKnowledge[] = [
  {
    aliases: ["你的名字", "君名"],
    fullName: "你的名字。 / 君の名は。",
    genres: ["恋爱", "奇幻", "治愈", "校园"],
  },
  {
    aliases: ["天气之子"],
    fullName: "天气之子 / 天気の子",
    genres: ["恋爱", "奇幻", "校园", "治愈", "日常"],
  },
  {
    aliases: ["铃芽之旅", "铃芽", "铃芽户缔"],
    fullName: "铃芽之旅 / すずめの戸締まり",
    genres: ["奇幻", "恋爱", "治愈", "校园", "冒险"],
  },
  {
    aliases: ["千与千寻"],
    fullName: "千与千寻 / 千と千尋の神隠し",
    genres: ["奇幻", "治愈", "冒险"],
  },
  {
    aliases: ["龙猫"],
    fullName: "龙猫 / となりのトトロ",
    genres: ["治愈", "奇幻"],
  },
  {
    aliases: ["哈尔的移动城堡"],
    fullName: "哈尔的移动城堡 / ハウルの動く城",
    genres: ["奇幻", "恋爱", "治愈"],
  },
  {
    aliases: ["幽灵公主"],
    fullName: "幽灵公主 / もののけ姫",
    genres: ["奇幻", "冒险", "治愈"],
  },
  {
    aliases: ["崖上的波妞", "悬崖上的金鱼姬", "波妞"],
    fullName: "崖上的波妞 / 崖の上のポニョ",
    genres: ["奇幻", "治愈", "恋爱"],
  },
  {
    aliases: ["侧耳倾听"],
    fullName: "侧耳倾听 / 耳をすませば",
    genres: ["校园", "治愈", "恋爱"],
  },
  {
    aliases: ["言叶之庭"],
    fullName: "言叶之庭 / 言の葉の庭",
    genres: ["恋爱", "治愈", "校园", "日常"],
  },
  {
    aliases: ["秒速五厘米"],
    fullName: "秒速五厘米 / 秒速5センチメートル",
    genres: ["恋爱", "日常", "校园", "治愈"],
  },
  {
    aliases: ["星之声"],
    fullName: "星之声 / ほしのこえ",
    genres: ["科幻", "恋爱", "机战", "治愈"],
  },
  {
    aliases: ["云之彼端约定的地方"],
    fullName: "云之彼端，约定的地方 / 雲のむこう、約束の場所",
    genres: ["科幻", "恋爱", "奇幻", "治愈", "校园"],
  },
  {
    aliases: ["追逐繁星的孩子"],
    fullName: "追逐繁星的孩子 / 星を追う子ども",
    genres: ["奇幻", "治愈", "恋爱", "冒险"],
  },
  {
    aliases: ["十字路口"],
    fullName: "十字路口 / クロスロード",
    genres: ["推理", "悬疑", "恋爱"],
  },
  {
    aliases: ["鬼灭之刃", "鬼灭"],
    fullName: "鬼灭之刃 / 鬼滅の刃",
    genres: ["热血", "战斗", "奇幻", "搞笑", "冒险"],
    namedSeasons: [
      { suffix: "无限列车篇", label: "无限列车篇" },
      { suffix: "游郭篇", label: "游郭篇" },
      { suffix: "锻刀村篇", label: "锻刀村篇" },
      { suffix: "柱训练篇", label: "柱训练篇" },
      { suffix: "无限城篇", label: "无限城篇" },
    ],
  },
  {
    aliases: ["咒术回战", "咒术"],
    fullName: "咒术回战 / 呪術廻戦",
    genres: ["战斗", "热血", "奇幻", "搞笑", "校园"],
  },
  {
    aliases: ["进击的巨人", "巨人"],
    fullName: "进击的巨人 / 進撃の巨人",
    genres: ["热血", "战斗", "奇幻", "恐怖", "悬疑"],
    namedSeasons: [
      { suffix: "第1季", label: "第1季" },
      { suffix: "第2季", label: "第2季" },
      { suffix: "第3季", label: "第3季" },
      { suffix: "第3季Part2", label: "第3季Part2" },
      { suffix: "最终季", label: "最终季" },
      { suffix: "最终季Part2", label: "最终季Part2" },
      { suffix: "最终季完结篇前篇", label: "最终季 完结篇 前篇" },
      { suffix: "最终季完结篇后篇", label: "最终季 完结篇 后篇" },
    ],
  },
  {
    aliases: ["海贼王", "One Piece"],
    fullName: "海贼王 / ONE PIECE",
    genres: ["战斗", "冒险", "搞笑", "日常"],
  },
  {
    aliases: ["火影忍者", "火影"],
    fullName: "火影忍者 / NARUTO",
    genres: ["搞笑", "日常", "热血", "战斗", "奇幻"],
  },
  {
    aliases: ["死神", "Bleach"],
    fullName: "死神 / BLEACH",
    genres: ["治愈"],
  },
  {
    aliases: ["龙珠", "Dragon Ball"],
    fullName: "龙珠 / ドラゴンボール",
    genres: ["热血", "战斗", "冒险", "搞笑", "奇幻"],
  },
  {
    aliases: ["银魂"],
    fullName: "银魂 / 銀魂",
    genres: ["搞笑", "热血", "战斗", "日常"],
  },
  {
    aliases: ["JOJO", "JOJO的奇妙冒险"],
    fullName: "JOJO的奇妙冒险 / ジョジョの奇妙な冒険",
    genres: ["热血", "战斗", "奇幻", "冒险", "搞笑"],
  },
  {
    aliases: ["排球少年", "小排球"],
    fullName: "排球少年 / ハイキュー!!",
    genres: ["运动", "热血", "校园", "竞技"],
  },
  {
    aliases: ["灌篮高手", "SD"],
    fullName: "灌篮高手 / SLAM DUNK",
    genres: ["热血", "运动", "校园", "竞技"],
  },
  {
    aliases: ["蓝色监狱"],
    fullName: "蓝色监狱 / ブルーロック",
    genres: ["运动", "竞技", "热血", "校园", "战斗"],
  },
  {
    aliases: ["强风吹拂"],
    fullName: "强风吹拂 / 風が強く吹いている",
    genres: ["运动", "热血", "校园", "竞技", "治愈"],
  },
  {
    aliases: ["四畳半神话大系"],
    fullName: "四畳半神话大系",
    genres: ["科幻", "校园", "奇幻", "恋爱", "日常"],
  },
  {
    aliases: ["乒乓"],
    fullName: "乒乓 / ピンポン",
    genres: ["运动", "热血", "校园", "竞技"],
  },
  {
    aliases: ["冰上的尤里", "Yuri on Ice"],
    fullName: "冰上的尤里 / ユーリ!!! on ICE",
    genres: ["运动", "恋爱", "竞技"],
  },
  {
    aliases: ["间谍过家家", "SPYxFAMILY"],
    fullName: "间谍过家家 / SPY×FAMILY",
    genres: ["搞笑", "日常", "治愈", "战斗", "恋爱"],
  },
  {
    aliases: ["孤独摇滚"],
    fullName: "孤独摇滚！ / ぼっち・ざ・ろっく！",
    genres: ["音乐", "日常", "搞笑", "恋爱", "校园"],
  },
  {
    aliases: ["轻音少女", "K-ON"],
    fullName: "轻音少女 / けいおん！",
    genres: ["校园", "治愈", "日常", "音乐", "恋爱"],
  },
  {
    aliases: ["吹响吧上低音号", "京吹"],
    fullName: "吹响吧！上低音号 / 響け！ユーフォニアム",
    genres: ["音乐", "校园", "恋爱", "日常", "治愈"],
  },
  {
    aliases: ["四月是你的谎言", "四谎"],
    fullName: "四月是你的谎言 / 四月は君の嘘",
    genres: ["恋爱", "音乐", "治愈", "校园", "日常"],
  },
  {
    aliases: ["紫罗兰永恒花园", "京紫"],
    fullName: "紫罗兰永恒花园 / ヴァイオレット・エヴァーガーデン",
    genres: ["治愈", "奇幻", "日常", "恋爱"],
    movies: true,
  },
  {
    aliases: ["Clannad", "CL", "CLANNAD"],
    fullName: "CLANNAD",
    genres: ["治愈", "校园", "恋爱", "日常", "搞笑"],
    namedSeasons: [
      { suffix: "After Story", label: "AFTER STORY" },
    ],
  },
  {
    aliases: ["未闻花名", "面码"],
    fullName: "我们仍未知道那天所看见的花的名字。 / あの日見た花の名前を僕達はまだ知らない。",
    genres: ["治愈", "恋爱", "校园", "日常", "奇幻"],
  },
  {
    aliases: ["可塑性记忆"],
    fullName: "可塑性记忆 / プラスティック・メモリーズ",
    genres: ["恋爱", "科幻", "治愈", "日常", "机战"],
  },
  {
    aliases: ["命运石之门", "石头门"],
    fullName: "命运石之门 / STEINS;GATE",
    genres: ["科幻", "悬疑", "恋爱"],
  },
  {
    aliases: ["攻壳机动队"],
    fullName: "攻壳机动队 / 攻殻機動隊",
    genres: ["科幻", "战斗"],
  },
  {
    aliases: ["新世纪福音战士", "EVA"],
    fullName: "新世纪福音战士 / 新世紀エヴァンゲリオン",
    genres: ["科幻", "机战", "战斗"],
  },
  {
    aliases: ["高达", "机动战士高达"],
    fullName: "机动战士高达 / 機動戦士ガンダム",
    genres: ["科幻", "机战", "战斗"],
  },
  {
    aliases: ["Code Geass", "反叛的鲁路修", "鲁路修"],
    fullName: "Code Geass 反叛的鲁路修 / コードギアス 反逆のルルーシュ",
    genres: ["机战", "战斗", "科幻", "热血", "奇幻"],
  },
  {
    aliases: ["钢之炼金术师", "钢炼"],
    fullName: "钢之炼金术师 FULLMETAL ALCHEMIST / 鋼の錬金術師",
    genres: ["热血", "战斗", "奇幻"],
  },
  {
    aliases: ["我的英雄学院", "我英", "MHA"],
    fullName: "我的英雄学院 / 僕のヒーローアカデミア",
    genres: ["热血", "战斗", "校园", "奇幻"],
    seasons: [1, 2, 3, 4, 5, 6],
    movies: true,
  },
  {
    aliases: ["电锯人"],
    fullName: "电锯人 / チェンソーマン",
    genres: ["战斗", "日常", "恐怖", "奇幻"],
  },
  {
    aliases: ["东京喰种", "东京食尸鬼"],
    fullName: "东京食尸鬼 / 東京喰種トーキョーグール",
    genres: ["战斗", "奇幻", "热血", "恐怖"],
  },
  {
    aliases: ["死亡笔记", "Death Note", "DN"],
    fullName: "死亡笔记 / DEATH NOTE",
    genres: ["推理", "悬疑", "奇幻"],
  },
  {
    aliases: ["名侦探柯南", "柯南"],
    fullName: "名侦探柯南 / 名探偵コナン",
    genres: ["推理", "悬疑", "恋爱", "日常"],
  },
  {
    aliases: ["金田一少年事件簿", "金田一"],
    fullName: "金田一少年事件簿 / 金田一少年の事件簿",
    genres: ["推理", "悬疑", "恐怖", "校园"],
  },
  {
    aliases: ["夏日重现"],
    fullName: "夏日重现 / サマータイムレンダ",
    genres: ["悬疑", "奇幻", "战斗", "恋爱", "推理"],
  },
  {
    aliases: ["约定的梦幻岛"],
    fullName: "约定的梦幻岛 / 約束のネバーランド",
    genres: ["悬疑", "冒险", "奇幻", "恐怖", "热血"],
  },
  {
    aliases: ["灵能百分百"],
    fullName: "灵能百分百 / モブサイコ100",
    genres: ["搞笑", "热血", "战斗", "奇幻", "校园"],
  },
  {
    aliases: ["一拳超人", "一拳"],
    fullName: "一拳超人 / ワンパンマン",
    genres: ["热血", "搞笑", "战斗", "奇幻", "异世界"],
  },
  {
    aliases: ["齐木楠雄的灾难", "齐木"],
    fullName: "齐木楠雄的灾难 / 斉木楠雄のΨ難",
    genres: ["搞笑", "校园", "奇幻", "日常", "恋爱"],
  },
  {
    aliases: ["日常"],
    fullName: "日常 / 日常",
    genres: ["日常", "搞笑", "治愈", "校园", "恋爱"],
  },
  {
    aliases: ["男子高中生的日常"],
    fullName: "男子高中生的日常 / 男子高校生の日常",
    genres: ["搞笑", "日常", "校园"],
  },
  {
    aliases: ["在下坂本有何贵干"],
    fullName: "在下坂本，有何贵干？ / 坂本ですが？",
    genres: ["搞笑", "校园", "日常", "治愈", "异世界"],
  },
  {
    aliases: ["辉夜大小姐想让我告白", "辉夜"],
    fullName: "辉夜大小姐想让我告白～天才们的恋爱头脑战～ / かぐや様は告らせたい",
    genres: ["恋爱", "搞笑", "校园", "日常"],
    seasons: [1, 2, 3],
    movies: true,
  },
  {
    aliases: ["更衣人偶坠入爱河", "更衣人偶"],
    fullName: "更衣人偶坠入爱河 / その着せ替え人形は恋をする",
    genres: ["恋爱", "校园", "日常", "搞笑", "治愈"],
    seasons: [1, 2],
  },
  {
    aliases: ["堀与宫村"],
    fullName: "堀与宫村 / ホリミヤ",
    genres: ["恋爱", "校园", "日常", "搞笑", "治愈"],
  },
  {
    aliases: ["玉子市场"],
    fullName: "玉子市场 / たまこまーけっと",
    genres: ["治愈", "日常", "恋爱", "校园", "搞笑"],
  },
  {
    aliases: ["冰菓"],
    fullName: "冰菓 / 氷菓",
    genres: ["校园", "推理", "悬疑", "治愈", "恋爱"],
  },
  {
    aliases: ["声之形"],
    fullName: "声之形 / 聲の形",
    genres: ["校园", "治愈", "恋爱", "日常"],
    movies: true,
  },
  {
    aliases: ["萤火之森"],
    fullName: "萤火之森 / 蛍火の杜へ",
    genres: ["治愈", "恋爱", "奇幻"],
  },
  {
    aliases: ["狼的孩子雨和雪"],
    fullName: "狼的孩子雨和雪 / おおかみこどもの雨と雪",
    genres: ["治愈", "奇幻"],
  },
  {
    aliases: ["穿越时空的少女"],
    fullName: "穿越时空的少女 / 時をかける少女",
    genres: ["恋爱", "校园", "治愈", "科幻"],
  },
  {
    aliases: ["夏日大作战"],
    fullName: "夏日大作战 / サマーウォーズ",
    genres: ["科幻", "热血", "治愈", "战斗", "恋爱"],
  },
  {
    aliases: ["红辣椒"],
    fullName: "红辣椒 / パプリカ",
    genres: ["科幻", "悬疑", "奇幻"],
  },
  {
    aliases: ["千年女优"],
    fullName: "千年女优 / 千年女優",
    genres: ["历史", "恋爱", "治愈", "奇幻"],
  },
  {
    aliases: ["东京教父"],
    fullName: "东京教父 / 東京ゴッドファーザーズ",
    genres: ["治愈", "搞笑"],
  },
  {
    aliases: ["幽灵线东京"],
    fullName: "幽灵线：东京 / Ghostwire: Tokyo",
    genres: ["奇幻", "搞笑", "日常", "异世界", "战斗"],
  },
  {
    aliases: ["寄生兽"],
    fullName: "寄生兽 生命的准则 / 寄生獣 セイの格率",
    genres: ["恐怖", "科幻", "战斗", "奇幻", "热血"],
  },
  {
    aliases: ["宝石之国"],
    fullName: "宝石之国 / 宝石の国",
    genres: ["奇幻", "战斗", "恋爱", "治愈"],
  },
  {
    aliases: ["来自深渊"],
    fullName: "来自深渊 / メイドインアビス",
    genres: ["奇幻", "冒险", "恐怖", "治愈", "战斗"],
  },
  {
    aliases: ["魔法少女小圆", "小圆"],
    fullName: "魔法少女小圆 / 魔法少女まどか☆マギカ",
    genres: ["奇幻", "治愈", "恋爱", "恐怖", "战斗"],
  },
  {
    aliases: [" fate", "Fate stay night"],
    fullName: "Fate/stay night",
    genres: ["恋爱", "奇幻", "战斗", "搞笑", "日常"],
  },
  {
    aliases: ["空之境界"],
    fullName: "空之境界 / 空の境界",
    genres: ["奇幻", "战斗", "恋爱"],
  },
  {
    aliases: ["物语系列", "化物语"],
    fullName: "物语系列 / 〈物語〉シリーズ",
    genres: ["恋爱", "奇幻", "校园", "搞笑", "日常"],
  },
  {
    aliases: ["凉宫春日的忧郁", "凉宫"],
    fullName: "凉宫春日的忧郁 / 涼宮ハルヒの憂鬱",
    genres: ["校园", "搞笑", "日常", "奇幻", "科幻"],
  },
  {
    aliases: ["Re从零开始的异世界生活", "Re0"],
    fullName: "Re：从零开始的异世界生活 / Re:ゼロから始める異世界生活",
    genres: ["异世界", "奇幻", "战斗", "恋爱", "冒险"],
    namedSeasons: [
      { suffix: "第一季", label: "第一季" },
      { suffix: "第二季", label: "第二季" },
      { suffix: "第三季前半", label: "第三季 前半" },
      { suffix: "第三季反击篇", label: "第三季 反击篇" },
      { suffix: "第四季", label: "第四季" },
    ],
    ovas: true,
  },
  {
    aliases: ["无职转生"],
    fullName: "无职转生～到了异世界就拿出真本事～ / 無職転生",
    genres: ["异世界", "恋爱", "奇幻", "战斗", "冒险"],
    seasons: [1, 2],
  },
  {
    aliases: [" OVERLORD", "不死者之王"],
    fullName: "OVERLORD / オーバーロード",
    genres: ["异世界", "奇幻", "战斗", "搞笑", "恋爱"],
    seasons: [1, 2, 3, 4],
  },
  {
    aliases: ["关于我转生变成史莱姆这档事", "史莱姆"],
    fullName: "关于我转生变成史莱姆这档事 / 転生したらスライムだった件",
    genres: ["异世界", "奇幻", "战斗", "恋爱", "搞笑"],
    seasons: [1, 2],
  },
  {
    aliases: ["为美好的世界献上祝福", "素晴"],
    fullName: "为美好的世界献上祝福！ / この素晴らしい世界に祝福を！",
    genres: ["搞笑", "异世界", "恋爱", "奇幻", "日常"],
  },
  {
    aliases: ["小林家的龙女仆", "龙女仆"],
    fullName: "小林家的龙女仆 / 小林さんちのメイドラゴン",
    genres: ["日常", "搞笑", "恋爱", "治愈", "奇幻"],
    seasons: [1, 2],
    ovas: true,
  },
  {
    aliases: ["工作细胞"],
    fullName: "工作细胞 / はたらく細胞",
    genres: ["战斗", "搞笑", "日常", "治愈", "奇幻"],
    seasons: [1, 2],
  },
  {
    aliases: ["鬼灯的冷彻"],
    fullName: "鬼灯的冷彻 / 鬼灯の冷徹",
    genres: ["搞笑", "奇幻", "日常", "治愈"],
  },
  {
    aliases: ["夏目友人帐", "夏目"],
    fullName: "夏目友人帐 / 夏目友人帳",
    genres: ["治愈", "奇幻", "日常"],
  },
  {
    aliases: ["虫师"],
    fullName: "虫师 / 蟲師",
    genres: ["治愈", "奇幻"],
  },
  {
    aliases: ["奇巧计程车", "Odd Taxi"],
    fullName: "奇巧计程车 / ODD TAXI",
    genres: ["悬疑", "推理", "奇幻", "日常", "治愈"],
  },
  {
    aliases: ["异度侵入"],
    fullName: "异度侵入 ID:INVADED",
    genres: ["悬疑", "推理", "科幻", "奇幻", "战斗"],
  },
  {
    aliases: ["心理测量者"],
    fullName: "心理测量者 / PSYCHO-PASS",
    genres: ["科幻", "战斗", "悬疑"],
  },
  {
    aliases: ["黑执事"],
    fullName: "黑执事 / 黒執事",
    genres: ["奇幻", "悬疑", "恋爱", "战斗"],
  },
  {
    aliases: ["元气少女缘结神"],
    fullName: "元气少女缘结神 / 神様はじめました",
    genres: ["恋爱", "奇幻", "搞笑", "治愈", "日常"],
  },
  {
    aliases: ["樱兰高校男公关部", "樱兰"],
    fullName: "樱兰高校男公关部 / 桜蘭高校ホスト部",
    genres: ["恋爱", "治愈", "搞笑", "校园"],
  },
  {
    aliases: ["会长大人是女仆"],
    fullName: "会长大人是女仆 / 会長はメイド様！",
    genres: ["恋爱", "校园", "搞笑", "日常"],
  },
  {
    aliases: [" sa特优生"],
    fullName: "S·A特优生 / S・A〜スペシャル・エー〜",
    genres: ["校园", "恋爱", "搞笑", "日常"],
  },
  {
    aliases: ["水果篮子"],
    fullName: "水果篮子 / フルーツバスケット",
    genres: ["治愈", "校园", "恋爱", "奇幻"],
  },
  {
    aliases: ["NANA"],
    fullName: "NANA",
    genres: ["恋爱", "治愈", "音乐", "校园"],
  },
  {
    aliases: ["邻座的怪同学"],
    fullName: "邻座的怪同学 / となりの怪物くん",
    genres: ["校园", "恋爱", "搞笑", "日常", "治愈"],
  },
  {
    aliases: ["月刊少女野崎君"],
    fullName: "月刊少女野崎君 / 月刊少女野崎くん",
    genres: ["搞笑", "恋爱", "校园", "日常", "治愈"],
  },
  {
    aliases: ["元气囝仔"],
    fullName: "元气囝仔 / ばらかもん",
    genres: ["治愈", "搞笑", "日常"],
  },
  {
    aliases: ["白兔糖"],
    fullName: "白兔糖 / うさぎドロップ",
    genres: ["治愈", "日常"],
  },
  {
    aliases: ["乌冬面之国的金色毛球"],
    fullName: "乌冬面之国的金色毛球 / うどんの国の金色毛鞠",
    genres: ["奇幻", "搞笑", "战斗", "冒险", "热血"],
  },
  {
    aliases: ["飞翔的魔女"],
    fullName: "飞翔的魔女 / ふらいんぐうぃっち",
    genres: ["日常", "治愈", "搞笑", "奇幻"],
  },
  {
    aliases: ["魔女宅急便"],
    fullName: "魔女宅急便 / 魔女の宅急便",
    genres: ["治愈", "奇幻", "冒险"],
  },
  {
    aliases: ["红猪"],
    fullName: "红猪 / 紅の豚",
    genres: ["奇幻", "治愈", "战斗"],
  },
  {
    aliases: ["起风了"],
    fullName: "起风了 / 風立ちぬ",
    genres: ["历史", "恋爱", "治愈"],
  },
  {
    aliases: ["萤火虫之墓"],
    fullName: "萤火虫之墓 / 火垂るの墓",
    genres: ["历史"],
  },
  {
    aliases: ["给桃子的信"],
    fullName: "给桃子的信 / ももへの手紙",
    genres: ["治愈", "奇幻"],
  },
  {
    aliases: ["狼与香辛料", "狼辛"],
    fullName: "狼与香辛料 / 狼と香辛料",
    genres: ["治愈", "奇幻", "恋爱", "日常"],
  },
  {
    aliases: ["白箱", "SHIROBAKO"],
    fullName: "白箱 / SHIROBAKO",
    genres: ["校园", "职场", "恋爱", "日常", "治愈"],
  },
  {
    aliases: ["食梦者", "爆漫王"],
    fullName: "食梦者 / バクマン。",
    genres: ["奇幻", "战斗", "校园"],
  },
  {
    aliases: ["棋魂"],
    fullName: "棋魂 / ヒカルの碁",
    genres: ["竞技", "运动", "热血"],
  },
  {
    aliases: ["食戟之灵", "药王"],
    fullName: "食戟之灵 / 食戟のソーマ",
    genres: ["美食", "热血", "搞笑", "恋爱", "校园"],
  },
  {
    aliases: ["迷宫饭"],
    fullName: "迷宫饭 / ダンジョン飯",
    genres: ["美食", "奇幻", "冒险", "搞笑", "异世界"],
  },
  {
    aliases: ["异世界食堂"],
    fullName: "异世界食堂 / 異世界食堂",
    genres: ["美食", "奇幻", "治愈", "异世界", "日常"],
  },
  {
    aliases: ["深夜食堂"],
    fullName: "深夜食堂 / 深夜食堂",
    genres: ["美食", "日常"],
  },
  {
    aliases: ["昭和元禄落语心中"],
    fullName: "昭和元禄落语心中 / 昭和元禄落語心中",
    genres: ["历史", "治愈"],
  },
  {
    aliases: ["鬼平"],
    fullName: "鬼平 / 鬼平",
    genres: ["历史", "推理", "战斗"],
  },
  {
    aliases: ["多罗罗"],
    fullName: "多罗罗 / どろろ",
    genres: ["战斗", "热血", "治愈"],
  },
  {
    aliases: ["犬夜叉"],
    fullName: "犬夜叉 / 犬夜叉",
    genres: ["异世界", "战斗", "恋爱", "奇幻", "历史"],
  },
  {
    aliases: ["魔卡少女樱", "小樱"],
    fullName: "魔卡少女樱 / カードキャプターさくら",
    genres: ["治愈", "校园", "奇幻", "恋爱", "日常"],
  },
  {
    aliases: ["美少女战士"],
    fullName: "美少女战士 / 美少女戦士セーラームーン",
    genres: ["奇幻", "战斗"],
  },
  {
    aliases: ["光之美少女"],
    fullName: "光之美少女 / プリキュアシリーズ",
    genres: ["战斗", "奇幻", "恋爱"],
  },
  {
    aliases: ["数码宝贝"],
    fullName: "数码宝贝 / デジモンアドベンチャー",
    genres: ["热血", "战斗", "冒险", "奇幻", "科幻"],
  },
  {
    aliases: ["精灵宝可梦", "宝可梦", "Pokemon"],
    fullName: "精灵宝可梦 / ポケットモンスター",
    genres: ["战斗", "冒险", "搞笑", "奇幻"],
  },
  {
    aliases: ["蜡笔小新"],
    fullName: "蜡笔小新 / クレヨンしんちゃん",
    genres: ["搞笑", "日常", "治愈"],
  },
  {
    aliases: ["哆啦A梦", "机器猫"],
    fullName: "哆啦A梦 / ドラえもん",
    genres: ["搞笑", "科幻", "日常", "治愈", "奇幻"],
  },
  {
    aliases: ["樱桃小丸子"],
    fullName: "樱桃小丸子 / ちびまる子ちゃん",
    genres: ["搞笑", "日常", "治愈", "校园"],
  },
  {
    aliases: ["海螺小姐"],
    fullName: "海螺小姐 / サザエさん",
    genres: ["日常"],
  },
  {
    aliases: ["飙速宅男"],
    fullName: "飙速宅男 / 弱虫ペダル",
    genres: ["运动", "热血", "竞技", "搞笑", "校园"],
  },
  {
    aliases: ["网球王子"],
    fullName: "网球王子 / テニスの王子様",
    genres: ["校园", "运动", "热血", "竞技"],
  },
  {
    aliases: ["黑子的篮球", "黑篮"],
    fullName: "黑子的篮球 / 黒子のバスケ",
    genres: ["运动", "热血", "校园", "竞技"],
  },
  {
    aliases: ["free", "Free!"],
    fullName: "Free!",
    genres: ["运动", "校园", "竞技"],
  },
  {
    aliases: ["弦音风舞高中弓道部", "弦音"],
    fullName: "弦音 -风舞高中弓道部- / ツルネ",
    genres: ["运动", "校园", "竞技", "治愈"],
  },
  {
    aliases: ["星合之空"],
    fullName: "星合之空 / 星合の空",
    genres: ["运动", "校园", "竞技", "治愈"],
  },
  {
    aliases: ["白箱 SHIROBAKO"],
    fullName: "白箱 / SHIROBAKO",
    genres: ["校园", "职场", "恋爱", "日常", "治愈"],
  },
  {
    aliases: ["隐瞒之事"],
    fullName: "隐瞒之事 / かくしごと",
    genres: ["日常", "治愈", "搞笑"],
  },
  {
    aliases: ["三月的狮子", "3月的狮子"],
    fullName: "3月的狮子 / 3月のライオン",
    genres: ["治愈", "日常", "校园", "竞技", "恋爱"],
  },
  {
    aliases: ["比宇宙更远的地方", "小南极"],
    fullName: "比宇宙更远的地方 / 宇宙よりも遠い場所",
    genres: ["校园", "治愈", "恋爱", "日常", "冒险"],
  },
  {
    aliases: ["少女终末旅行"],
    fullName: "少女终末旅行 / 少女終末旅行",
    genres: ["科幻", "恋爱", "治愈", "日常", "冒险"],
  },
  {
    aliases: ["来自风平浪静的明天"],
    fullName: "来自风平浪静的明天 / 凪のあすから",
    genres: ["恋爱", "奇幻", "校园", "治愈", "日常"],
  },
  {
    aliases: ["真实之泪"],
    fullName: "真实之泪 / true tears",
    genres: ["校园", "恋爱", "治愈"],
  },
  {
    aliases: ["白色相簿2", "白学"],
    fullName: "白色相簿2 / WHITE ALBUM2",
    genres: ["恋爱", "校园", "音乐"],
  },
  {
    aliases: ["白色相簿"],
    fullName: "白色相簿 / WHITE ALBUM",
    genres: ["恋爱", "音乐"],
  },
  {
    aliases: ["路人女主的养成方法", "路人女主"],
    fullName: "路人女主的养成方法 / 冴えない彼女の育てかた",
    genres: ["恋爱", "校园", "日常", "搞笑"],
    seasons: [1, 2],
    namedMovies: [
      { suffix: "Fine", label: "Fine" },
    ],
  },
  {
    aliases: ["我的青春恋爱物语果然有问题", "春物"],
    fullName: "我的青春恋爱物语果然有问题。 / やはり俺の青春ラブコメはまちがっている。",
    genres: ["恋爱", "校园", "日常", "搞笑"],
    seasons: [1, 2, 3],
  },
  {
    aliases: ["欢迎来到实力至上主义的教室", "实教"],
    fullName: "欢迎来到实力至上主义的教室 / ようこそ実力至上主義の教室へ",
    genres: ["校园", "恋爱", "日常", "推理"],
    seasons: [1, 2, 3],
  },
  {
    aliases: ["暗杀教室"],
    fullName: "暗杀教室 / 暗殺教室",
    genres: ["搞笑", "校园", "战斗", "治愈", "日常"],
  },
  {
    aliases: ["三年E班"],
    fullName: "三年E班 / 暗殺教室",
    genres: ["搞笑", "校园", "日常", "奇幻"],
  },
  {
    aliases: ["境界的彼方"],
    fullName: "境界的彼方 / 境界の彼方",
    genres: ["奇幻", "恋爱", "战斗", "校园", "治愈"],
  },
  {
    aliases: ["中二病也要谈恋爱", "中二病"],
    fullName: "中二病也要谈恋爱！ / 中二病でも恋がしたい！",
    genres: ["恋爱", "搞笑", "校园", "日常", "治愈"],
  },
  {
    aliases: ["小鸟游六花"],
    fullName: "中二病也要谈恋爱！ / 中二病でも恋がしたい！",
    genres: ["恋爱", "搞笑", "校园", "日常", "治愈"],
  },
  {
    aliases: ["小林家的龙女仆S"],
    fullName: "小林家的龙女仆S / 小林さんちのメイドラゴンS",
    genres: ["日常", "搞笑", "恋爱", "奇幻", "治愈"],
  },
  {
    aliases: ["舞动青春"],
    fullName: "舞动青春 / ボールルームへようこそ",
    genres: ["运动", "竞技", "热血", "校园"],
  },
  {
    aliases: [" given 被赠与的未来"],
    fullName: "GIVEN 被赠与的未来 / ギヴン",
    genres: ["恋爱", "音乐", "治愈", "校园", "日常"],
  },
  {
    aliases: ["beck"],
    fullName: "BECK",
    genres: ["音乐", "校园", "恋爱"],
  },
  {
    aliases: ["NANA 世界上的另一个我"],
    fullName: "NANA",
    genres: ["恋爱", "治愈", "音乐", "校园"],
  },
  {
    aliases: ["白色相簿2"],
    fullName: "白色相簿2 / WHITE ALBUM2",
    genres: ["恋爱", "校园", "音乐"],
  },
  {
    aliases: ["摇曳露营"],
    fullName: "摇曳露营△ / ゆるキャン△",
    genres: ["治愈", "恋爱", "日常", "搞笑", "校园"],
  },
  {
    aliases: ["向山进发"],
    fullName: "向山进发 / ヤマノススメ",
    genres: ["恋爱", "治愈", "日常", "运动", "校园"],
  },
  {
    aliases: ["前进吧！登山少女"],
    fullName: "前进吧！登山少女 / ヤマノススメ",
    genres: ["恋爱", "校园", "奇幻", "搞笑"],
  },
  {
    aliases: ["new game"],
    fullName: "NEW GAME!",
    genres: ["恋爱", "职场", "日常", "搞笑", "治愈"],
  },
  {
    aliases: ["樱花任务"],
    fullName: "樱花任务 / SAKURA QUEST",
    genres: ["职场", "日常", "恋爱", "治愈", "校园"],
  },
  {
    aliases: ["花开伊吕波"],
    fullName: "花开伊吕波 / 花咲くいろは",
    genres: ["治愈", "日常", "职场", "校园", "恋爱"],
  },
  {
    aliases: ["风平浪静的闲暇", "凪的新生活"],
    fullName: "风平浪静的闲暇 / 凪のお暇",
    genres: ["校园", "战斗", "恋爱", "异世界", "搞笑"],
  },
  {
    aliases: ["日本的古老民间故事"],
    fullName: "日本的古老民间故事 / まんが日本昔ばなし",
    genres: ["治愈", "奇幻"],
  },
  {
    aliases: ["海螺小姐"],
    fullName: "海螺小姐 / サザエさん",
    genres: ["日常"],
  },

  ...userAddedAnime,
];

function expandEntry(entry: AnimeKnowledge): AnimeKnowledge[] {
  const expanded: AnimeKnowledge[] = [{ ...entry }];
  const baseAliases = entry.aliases;
  const baseName = entry.fullName;

  if (entry.namedSeasons) {
    for (const ns of entry.namedSeasons) {
      expanded.push({
        aliases: baseAliases.map((a) => `${a}${ns.suffix}`),
        fullName: `${baseName}（${ns.label}）`,
        genres: entry.genres,
      });
    }
  } else if (entry.seasons) {
    for (const n of entry.seasons) {
      const suffix = `第${n}季`;
      expanded.push({
        aliases: baseAliases.map((a) => `${a}${suffix}`),
        fullName: `${baseName}（${suffix}）`,
        genres: entry.genres,
      });
    }
  }

  if (entry.namedMovies) {
    for (const nm of entry.namedMovies) {
      expanded.push({
        aliases: baseAliases.map((a) => `${a}${nm.suffix}`),
        fullName: `${baseName}（${nm.label}）`,
        genres: entry.genres,
      });
    }
  } else if (entry.movies) {
    const suffix = "剧场版";
    expanded.push({
      aliases: [
        ...baseAliases.map((a) => `${a}${suffix}`),
        ...baseAliases.map((a) => `${a}电影版`),
      ],
      fullName: `${baseName}（${suffix}）`,
      genres: entry.genres,
    });
  }

  if (entry.ovas) {
    const suffix = "OVA/SP";
    expanded.push({
      aliases: [
        ...baseAliases.map((a) => `${a}OVA`),
        ...baseAliases.map((a) => `${a}SP`),
        ...baseAliases.map((a) => `${a}番外`),
        ...baseAliases.map((a) => `${a}特别篇`),
      ],
      fullName: `${baseName}（${suffix}）`,
      genres: entry.genres,
    });
  }

  if (entry.finalSeason) {
    const suffix = "最终季";
    expanded.push({
      aliases: baseAliases.map((a) => `${a}${suffix}`),
      fullName: `${baseName}（${suffix}）`,
      genres: entry.genres,
    });
  }

  return expanded;
}

export function getExpandedAnimeKnowledge(): AnimeKnowledge[] {
  return animeKnowledgeBase.flatMap(expandEntry);
}

export function findAnimeMatches(query: string, limit = 5): AnimeKnowledge[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const scored = getExpandedAnimeKnowledge()
    .map((entry) => {
      const fullNameLower = entry.fullName.toLowerCase();
      const aliasScores = entry.aliases.map((alias) => {
        const aliasLower = alias.toLowerCase();
        if (aliasLower === trimmed) return 100;
        if (aliasLower.startsWith(trimmed)) return 80;
        if (aliasLower.includes(trimmed)) return 60;
        if (trimmed.includes(aliasLower) && aliasLower.length >= 2) return 50;
        return 0;
      });

      let fullNameScore = 0;
      if (fullNameLower === trimmed) fullNameScore = 90;
      else if (fullNameLower.startsWith(trimmed)) fullNameScore = 70;
      else if (fullNameLower.includes(trimmed)) fullNameScore = 50;
      else if (trimmed.includes(fullNameLower) && fullNameLower.length >= 4) fullNameScore = 40;

      const bestScore = Math.max(...aliasScores, fullNameScore);
      return { entry, score: bestScore };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.entry);

  return scored;
}

export function findExactAnime(query: string): AnimeKnowledge | undefined {
  const trimmed = query.trim().toLowerCase();
  return getExpandedAnimeKnowledge().find(
    (entry) =>
      entry.fullName.toLowerCase() === trimmed ||
      entry.aliases.some((alias) => alias.toLowerCase() === trimmed),
  );
}

export function generateDoubanUrl(title: string): string {
  return `https://www.douban.com/search?cat=1002&q=${encodeURIComponent(title)}`;
}
