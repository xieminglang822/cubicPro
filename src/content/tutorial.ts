/**
 * Beginner-method tutorial content (seed). Bilingual zh/en.
 * The full curriculum is being researched separately; this seed keeps the
 * Tutorial mode functional and unblocks wiring.
 *
 * NOTE: move sequences are illustrative teaching fragments, not a guaranteed
 * full solution for arbitrary states.
 */
export interface TutorialStep {
  id: string;
  moves: string;
  zh: string;
  en: string;
}

export interface TutorialChapter {
  id: string;
  titleZh: string;
  titleEn: string;
  goalZh: string;
  goalEn: string;
  steps: TutorialStep[];
}

export const TUTORIAL_CHAPTERS: TutorialChapter[] = [
  {
    id: 'ch1-notation',
    titleZh: '认识魔方与符号',
    titleEn: 'The cube and notation',
    goalZh: '了解六面与基本转动符号，会用 U/D/L/R/F/B、撇号（逆时针）和 2（180°）。',
    goalEn: 'Learn the six faces and basic turns: U/D/L/R/F/B, apostrophe (counter-clockwise) and 2 (180°).',
    steps: [
      {
        id: 'ch1-s1',
        moves: 'U R F',
        zh: '每个字母代表一个面顺时针转 90°。试试点「演示」看 U R F 的效果。',
        en: 'Each letter is a 90° clockwise turn of one face. Press Demo to see U R F.',
      },
      {
        id: 'ch1-s2',
        moves: "R'",
        zh: "字母后加撇号表示逆时针 90°，例如 R'。",
        en: "An apostrophe means a 90° counter-clockwise turn, e.g. R'.",
      },
    ],
  },
  {
    id: 'ch2-cross',
    titleZh: '白色十字',
    titleEn: 'White cross',
    goalZh: '把四个白色棱块归位，形成白色十字，并让侧面颜色对齐。',
    goalEn: 'Place the four white edges to form a white cross with matching side colours.',
    steps: [
      {
        id: 'ch2-s1',
        moves: "F U' R U",
        zh: '先找到白色棱块，把它移到顶层，再转到正确的侧面。演示是一段示例手法。',
        en: 'Find a white edge, bring it to the top layer, then align it with the correct side. The demo is one example.',
      },
    ],
  },
  {
    id: 'ch3-corners',
    titleZh: '第一层角块',
    titleEn: 'First-layer corners',
    goalZh: '用「右手公式」把白色角块放进底层。',
    goalEn: 'Use the "sexy move" to insert white corners into the bottom layer.',
    steps: [
      {
        id: 'ch3-s1',
        moves: "R U R' U'",
        zh: '这就是最常用的「右手公式」（sexy move）。重复它直到角块归位。',
        en: "This is the classic sexy move. Repeat it until the corner drops into place.",
      },
    ],
  },
  {
    id: 'ch4-middle',
    titleZh: '中层棱块',
    titleEn: 'Middle-layer edges',
    goalZh: '把中层四个棱块放进正确位置。',
    goalEn: 'Insert the four middle-layer edges.',
    steps: [
      {
        id: 'ch4-s1',
        moves: "U R U' R' U' F' U F",
        zh: '把棱块移到顶层，观察它要去的方向，再用对应手法插入中层。',
        en: 'Bring the edge to the top layer, read its direction, then use the matching insertion.',
      },
    ],
  },
  {
    id: 'ch5-lastlayer',
    titleZh: '顶层还原',
    titleEn: 'Last layer',
    goalZh: '先做出顶层十字，再调整角块与棱块完成还原。',
    goalEn: 'Make the top cross, then orient/permute the last-layer pieces.',
    steps: [
      {
        id: 'ch5-s1',
        moves: "F R U R' U' F'",
        zh: '顶层十字公式：把顶面对齐后反复使用，直到出现黄色十字。',
        en: 'Top-cross algorithm: align the top and repeat until a yellow cross appears.',
      },
      {
        id: 'ch5-s2',
        moves: "R U R' U R U2 R'",
        zh: 'Sune 公式，用来调整顶层角块的朝向。',
        en: 'Sune, used to orient the last-layer corners.',
      },
    ],
  },
];
