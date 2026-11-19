/**
 * cubicPro beginner curriculum (Layer-by-Layer), 8 chapters / 24 steps.
 *
 * Provenance: curriculum structure adapted from learn-cube (MIT, © 2025
 * ramkrishna-js); all lesson prose is original to cubicPro; move notation
 * follows the Singmaster standard. See NOTICE.md.
 *
 * Every move sequence here was independently verified on a cube engine;
 * `target` predicates grade cube state, not keystrokes.
 */
import type { TargetPredicate } from '../puzzle/predicates';

export type DemoKind = 'algorithm' | 'pattern' | 'motion';

export interface Bilingual {
  zh: string;
  en: string;
}

export interface TutorialStep {
  id: string;
  title: Bilingual;
  notation: string | null;
  demo: { kind: DemoKind; moves: string; expect: Bilingual };
  explain: Bilingual;
  target: TargetPredicate | null;
}

export interface TutorialChapter {
  id: string;
  order: number;
  title: Bilingual;
  goal: Bilingual;
  steps: TutorialStep[];
}

export const CURRICULUM: TutorialChapter[] = [
  {
    id: 'ch-01',
    order: 1,
    title: { zh: '认识魔方', en: 'Meet the Cube' },
    goal: {
      zh: '认识三类块与六个中心，学会握魔方，并能读懂 U D L R F B 加 \' 和 2 的记号。',
      en: "Know the three piece types and the six fixed centres, hold the cube correctly, and read U D L R F B with ' and 2.",
    },
    steps: [
      {
        id: 'ch-01-s01',
        title: { zh: '三类块与六个中心', en: 'Three piece types, six fixed centres' },
        notation: null,
        demo: {
          kind: 'motion',
          moves: "R U R'",
          expect: {
            zh: '角块跟着 R 和 U 两层一起走，棱块只跟一层。',
            en: 'A corner rides along with both R and U; an edge follows only one layer.',
          },
        },
        explain: {
          zh: '中心块只有一个颜色，而且永远不动，所以它决定这一面最后是什么颜色；棱块有两个颜色，角块有三个颜色。复原就是让每个块回到它唯一正确的位置。',
          en: 'A centre has a single colour and never moves, so it fixes what colour that face must end up. Edges have two colours, corners have three. Solving simply means sending every piece to its one correct slot.',
        },
        target: null,
      },
      {
        id: 'ch-01-s02',
        title: { zh: '转动记号', en: 'Reading the moves' },
        notation: 'U D L R F B',
        demo: {
          kind: 'motion',
          moves: "R U R' U2",
          expect: {
            zh: "R 是转右层顺时针；R' 是反着转；U2 是转 180°。",
            en: "R turns the right layer clockwise; R' turns it back; U2 is a half turn.",
          },
        },
        explain: {
          zh: "字母表示把那一层顺时针转 90°，方向是从该面外面看进去。加 ' 是逆时针 90°，加 2 是 180°。注意 R 是「转右层」，不是「转右面」——整层都会跟着动。",
          en: "A letter turns that layer 90° clockwise as seen from outside that face. A prime (') is 90° the other way, and 2 is a half turn. R means the whole right layer turns, not just the right face.",
        },
        target: null,
      },
      {
        id: 'ch-01-s03',
        title: { zh: '四步手法', en: 'The four-move trigger' },
        notation: "R U R' U'",
        demo: {
          kind: 'algorithm',
          moves: "R U R' U' R U R' U' R U R' U' R U R' U' R U R' U' R U R' U'",
          expect: {
            zh: '连做 6 次回到原状。',
            en: 'Six repetitions bring the cube back to where it started.',
          },
        },
        explain: {
          zh: "R U R' U' 叫四步手法，后面几乎每一章都会用到它。先练到不用想：做一遍、再一遍，看角块怎么被带下去又带上来。",
          en: "R U R' U' is the four-move trigger, and nearly every later chapter reuses it. Drill it until it is automatic: run it twice and watch a corner get carried down and back up.",
        },
        target: null,
      },
    ],
  },
  {
    id: 'ch-02',
    order: 2,
    title: { zh: '底面白十字', en: 'The White Cross' },
    goal: {
      zh: '底面出现白色十字，并且四个侧面的颜色都与中心块对齐。',
      en: 'A white cross on the bottom, with every side colour matching its centre.',
    },
    steps: [
      {
        id: 'ch-02-s01',
        title: { zh: '先做小花', en: 'Build the daisy first' },
        notation: null,
        demo: {
          kind: 'pattern',
          moves: 'F2 R2 B2 L2',
          expect: {
            zh: '黄色中心四周出现四个白色花瓣。',
            en: 'Four white petals appear around the yellow centre.',
          },
        },
        explain: {
          zh: '把黄色中心朝上，先把四个白色棱块贴到黄心周围，形成「小花」。这一步只看白色，先完全不管侧面的颜色——先把块聚过来，颜色下一步再对。',
          en: 'Hold yellow on top and park the four white edges around the yellow centre to make a daisy. Watch only the white stickers for now; ignore side colours completely — gather the pieces first, match colours next.',
        },
        target: 'daisy',
      },
      {
        id: 'ch-02-s02',
        title: { zh: '花瓣落下', en: 'Drop each petal' },
        notation: null,
        demo: {
          kind: 'pattern',
          moves: 'F2',
          expect: {
            zh: '白绿棱落下，白色朝下、绿色对上绿色中心。',
            en: 'The white-green edge drops in with white down and green matching the green centre.',
          },
        },
        explain: {
          zh: '看一片花瓣侧面的颜色，转顶层让它对准同色的中心块，然后把那一面转 180°，白色就落到下面去了。四片花瓣都这样处理，十字的侧面颜色自然就对齐了。',
          en: 'Read the side colour of one petal, turn the top layer until it lines up with the same-coloured centre, then turn that face 180° so the white edge drops to the bottom. Do this for all four petals and the side colours line up by themselves.',
        },
        target: 'cross',
      },
      {
        id: 'ch-02-s03',
        title: { zh: '翻错的花瓣', en: 'A petal facing the wrong way' },
        notation: null,
        demo: {
          kind: 'motion',
          moves: 'F',
          expect: {
            zh: '把白色朝侧面的棱块先转出底面。',
            en: 'Lift an edge whose white faces sideways out of the bottom layer first.',
          },
        },
        explain: {
          zh: '如果白色棱块已经在底面，但白色没有朝下，就先把它转出去：转它所在的侧面 90° 让它到中层，重新对齐中心，再用 180° 把它正确放下来。不要硬转，越转越乱。',
          en: 'If a white edge is already in the bottom layer but its white sticker faces sideways, lift it out first: turn its side face 90° to bring it to the middle layer, realign it with its centre, then turn 180° to drop it in correctly. Do not force it — brute force only creates more mess.',
        },
        target: 'cross',
      },
    ],
  },
  {
    id: 'ch-03',
    order: 3,
    title: { zh: '底层四角', en: 'First-Layer Corners' },
    goal: {
      zh: '底面全部变白，四个侧面各出现一个与中心对齐的倒 T 形。',
      en: 'The bottom face becomes solid white and each side shows a T-shape aligned with its centre.',
    },
    steps: [
      {
        id: 'ch-03-s01',
        title: { zh: '把角块停到目标位上方', en: 'Park the corner above its slot' },
        notation: null,
        demo: {
          kind: 'motion',
          moves: 'U',
          expect: {
            zh: '只转顶层，找到夹在两个同色中心之间的位置。',
            en: 'Turn only the top layer until the corner sits between the two centres it matches.',
          },
        },
        explain: {
          zh: '在顶层找一个含白色的角块，看它另外两个颜色，转顶层把它转到这两种颜色的中心之间——也就是它目标位置的正上方。位置对了再动手，这一步不要转其他层。',
          en: 'Find a corner containing white in the top layer, read its other two colours, and turn the top layer until it sits between those two centres — directly above the slot it belongs in. Only top turns here; get the position right before inserting.',
        },
        target: null,
      },
      {
        id: 'ch-03-s02',
        title: { zh: '用四步手法把角块放进去', en: 'Insert the corner with the trigger' },
        notation: "R U R' U'",
        demo: {
          kind: 'algorithm',
          moves: "R U R' U' R U R' U' R U R' U'",
          expect: {
            zh: '白色朝下，角块落进底层。',
            en: 'White ends up facing down and the corner sits in the bottom layer.',
          },
        },
        explain: {
          zh: "保持角块在右前上方，重复 R U R' U'。做 1 遍先看白色有没有朝下；没有就再做 2 遍（共 3 遍），最多到 5 遍。必须在奇数次上停手：停在第 2 或第 4 遍会把角块又送回顶层。",
          en: "Keep the corner at the front-right-top and repeat R U R' U'. After one repetition check whether white faces down; if not, do two more (three total), and at most five. Always stop on an odd count — stopping at two or four puts the corner back on top.",
        },
        target: 'first_layer',
      },
      {
        id: 'ch-03-s03',
        title: { zh: '卡在底层的角块', en: 'A corner stuck in the bottom layer' },
        notation: "R U R' U'",
        demo: {
          kind: 'algorithm',
          moves: "R U R' U'",
          expect: {
            zh: '错角被弹到右前上方。',
            en: 'The wrong corner is kicked up to the front-right-top.',
          },
        },
        explain: {
          zh: "如果目标角块已经躺在底层但位置或朝向不对，就先把它转到右下前的位置，做一遍 R U R' U' 把它弹回顶层，再按上一步正常放进去。",
          en: 'If the target corner is already in the bottom layer but in the wrong slot or twisted, hold the cube so it sits front-right-bottom, do R U R\' U\' once to knock it back up to the top layer, then insert it normally as in the previous step.',
        },
        target: 'first_layer',
      },
    ],
  },
  {
    id: 'ch-04',
    order: 4,
    title: { zh: '中层四棱', en: 'Second-Layer Edges' },
    goal: {
      zh: '前两层全部完成：底面白、中层四个棱块归位。',
      en: 'Both bottom layers are finished: white face solid and all four middle-layer edges correct.',
    },
    steps: [
      {
        id: 'ch-04-s01',
        title: { zh: '在顶层找不带黄色的棱块', en: 'Find a top edge without yellow' },
        notation: null,
        demo: {
          kind: 'motion',
          moves: 'U',
          expect: {
            zh: '把侧面颜色转到同色中心块上方。',
            en: 'Turn the top until the side colour matches its centre.',
          },
        },
        explain: {
          zh: '顶层不带黄色的棱块属于中层。转顶层让它朝你的那面颜色对上同色中心，这时它只剩两种去法：往右前方，还是往左前方。看另一个颜色落在哪一侧的中心，就知道该往哪边走。',
          en: 'A top-layer edge with no yellow belongs in the middle layer. Turn the top until the sticker facing you matches its centre; now it can only go two places — front-right or front-left. Look at which side its other colour matches to choose.',
        },
        target: null,
      },
      {
        id: 'ch-04-s02',
        title: { zh: '放进右边', en: 'Insert to the right' },
        notation: "U R U' R' U' F' U F",
        demo: {
          kind: 'algorithm',
          moves: "U R U' R' U' F' U F",
          expect: {
            zh: '顶层那条棱落进右前方的中层槽位，第一层不受影响。',
            en: 'The top edge drops into the front-right middle slot; the first layer stays intact.',
          },
        },
        explain: {
          zh: "朝向你的颜色与右侧中心同色时，做 U R U' R' U' F' U F。这串动作把顶层那条棱送进右前方的中层槽位。它只会动顶层和这一个槽位，已经拼好的第一层不会被打乱。",
          en: "When the colour facing you matches the right centre, do U R U' R' U' F' U F. It delivers the top-layer edge into the front-right middle slot. Only the top layer and that one slot are disturbed, so the finished first layer is safe.",
        },
        target: 'two_layers',
      },
      {
        id: 'ch-04-s03',
        title: { zh: '放进左边', en: 'Insert to the left' },
        notation: "U' L' U L U F U' F'",
        demo: {
          kind: 'algorithm',
          moves: "U' L' U L U F U' F'",
          expect: {
            zh: '顶层那条棱落进左前方的中层槽位。',
            en: 'The top edge drops into the front-left middle slot.',
          },
        },
        explain: {
          zh: "朝你的颜色与左侧中心同色时，做 U' L' U L U F U' F'。这是上一条的镜像，作用一样，只是进左边的槽位。",
          en: "When the colour facing you matches the left centre, do U' L' U L U F U' F'. It is the mirror of the previous sequence and does the same job on the left-hand slot.",
        },
        target: 'two_layers',
      },
      {
        id: 'ch-04-s04',
        title: { zh: '卡在中层的错棱', en: 'An edge stuck in the middle layer' },
        notation: "U R U' R' U' F' U F",
        demo: {
          kind: 'algorithm',
          moves: "U R U' R' U' F' U F",
          expect: {
            zh: '错棱被顶到顶层，再按正常方式放入。',
            en: 'The wrong edge is pushed up to the top layer, then reinserted properly.',
          },
        },
        explain: {
          zh: "如果一条棱已经在中层但位置或朝向错了，就用上面任意一条公式，随便拿一条顶层棱块塞进它那个槽位，把它顶到顶层，然后再按正确方向放进去。",
          en: 'If an edge already sits in the middle layer but in the wrong spot or flipped, run either insert sequence with any top-layer edge to push it out to the top, then insert it properly in the right direction.',
        },
        target: 'two_layers',
      },
    ],
  },
  {
    id: 'ch-05',
    order: 5,
    title: { zh: '顶面十字', en: 'The Yellow Cross' },
    goal: {
      zh: '顶面出现黄色十字。只看棱块，角块这时候不用管。',
      en: 'A yellow cross on the top face. Watch the edges only — corners are ignored here.',
    },
    steps: [
      {
        id: 'ch-05-s01',
        title: { zh: '点、拐、线：先认清情况', en: 'Dot, L, line: name the case' },
        notation: null,
        demo: {
          kind: 'motion',
          moves: "F R U R' U' F'",
          expect: {
            zh: '做一次之后，错棱少两个，图形就变了。',
            en: 'After one run, two edges are fixed and the pattern changes.',
          },
        },
        explain: {
          zh: '只看顶面棱块的黄色贴纸，会出现四种图形：点（只有中心黄）、拐（两条相邻的黄边）、线（两条相对的黄边）、十字。摆法很关键：拐的开口朝左上，也就是两条黄边在左面和后面；线要横着放，不能竖着放。',
          en: 'Look only at the yellow stickers on the top-layer edges. You will see one of four patterns: a dot (only the centre is yellow), an L (two adjacent yellow edges), a line (two opposite yellow edges), or the cross. Holding matters: for the L keep the two yellow edges at back and left; for the line keep it horizontal, never vertical.',
        },
        target: null,
      },
      {
        id: 'ch-05-s02',
        title: { zh: '重复到出现十字', en: 'Repeat until the cross appears' },
        notation: "F R U R' U' F'",
        demo: {
          kind: 'algorithm',
          moves: "F R U R' U' F'",
          expect: {
            zh: '每做一次修好两条错棱。',
            en: 'Each run fixes exactly two misoriented edges.',
          },
        },
        explain: {
          zh: "每做一次 F R U R' U' F'，顶面就有两条错棱被翻正，但图形会变，所以要重新摆好方向再做。最多做 3 次一定出十字；点的情况做完会变成拐或线。",
          en: "Each run of F R U R' U' F' flips two misoriented edges, but the pattern changes, so re-hold before each repeat. Three runs always finish the cross; a dot turns into an L or a line after the first.",
        },
        target: 'll_edges_oriented',
      },
    ],
  },
  {
    id: 'ch-06',
    order: 6,
    title: { zh: '顶面朝向', en: 'Orient the Yellow Corners' },
    goal: {
      zh: '顶面全部变黄，角块的位置这一步先不管。',
      en: 'The whole top face turns yellow. Corner placement is deliberately ignored until the next chapter.',
    },
    steps: [
      {
        id: 'ch-06-s01',
        title: { zh: '小鱼', en: 'Sune' },
        notation: "R U R' U R U2 R'",
        demo: {
          kind: 'algorithm',
          moves: "R U R' U R U2 R'",
          expect: {
            zh: '翻转三个角块，鱼形会消失。',
            en: 'Three corners are twisted and the fish shape disappears.',
          },
        },
        explain: {
          zh: "如果顶面只有一个角块的黄色朝上，就是「小鱼」。把鱼头放在左前，做 R U R' U R U2 R'。它一次翻转三个角块，同时也会挪动角块的位置——位置我们下一步再统一修正，现在不用管。",
          en: "With exactly one yellow corner facing up you have the fish. Put its head at front-left and do R U R' U R U2 R'. It twists three corners in one go and also shifts where they sit — placement gets fixed in the next chapter, so ignore it for now.",
        },
        target: null,
      },
      {
        id: 'ch-06-s02',
        title: { zh: '反小鱼', en: 'Anti-Sune' },
        notation: "R U2 R' U' R U' R'",
        demo: {
          kind: 'algorithm',
          moves: "R U2 R' U' R U' R'",
          expect: {
            zh: '鱼头朝另一边时用这条镜像公式。',
            en: 'The mirror case of the fish.',
          },
        },
        explain: {
          zh: "鱼头朝另一边、黄色贴纸的方向刚好相反时，用镜像公式 R U2 R' U' R U' R'。两条公式都只有 7 步，选错也不要紧，做完看新情况再选。",
          en: "When the fish faces the other way, use the mirror: R U2 R' U' R U' R'. Both are seven moves; picking the wrong one is harmless — just look at the new case and choose again.",
        },
        target: null,
      },
      {
        id: 'ch-06-s03',
        title: { zh: '其余情况：重复就好', en: 'Everything else: just repeat' },
        notation: "R U R' U R U2 R'",
        demo: {
          kind: 'algorithm',
          moves: "R U R' U R U2 R' R U R' U R U2 R'",
          expect: {
            zh: '最多三次，顶面全黄。',
            en: 'At most three runs and the top face is solid yellow.',
          },
        },
        explain: {
          zh: "顶面有两个角朝上、或者一个都没有时，把任意一个「黄色朝右」的角块摆在右前，做小鱼，然后抬头看新图形再重复。最多 3 次，顶面一定全黄。",
          en: 'With two corners yellow-up, or none, put any corner whose yellow sticker faces right at the front-right and do Sune, then look at the new pattern and repeat. Three runs at most and the top is solid yellow.',
        },
        target: 'll_corners_oriented',
      },
    ],
  },
  {
    id: 'ch-07',
    order: 7,
    title: { zh: '顶角归位', en: 'Place the Yellow Corners' },
    goal: {
      zh: '四个顶角都进入正确的槽位，朝向已经不需要再动。',
      en: 'All four top corners reach their correct slots; orientation stays solved throughout.',
    },
    steps: [
      {
        id: 'ch-07-s01',
        title: { zh: '先找一个已经归位的角', en: 'Find the corner that is already right' },
        notation: "R' F R' B2 R F' R' B2 R2",
        demo: {
          kind: 'algorithm',
          moves: "R' F R' B2 R F' R' B2 R2",
          expect: {
            zh: '另外三个角循环一次，朝向不变。',
            en: 'The other three corners cycle once, with no twist.',
          },
        },
        explain: {
          zh: "顶面全黄之后，转顶层，看看有没有哪个角块三个面的颜色都已经和周围对上。把它放在右前，做 R' F R' B2 R F' R' B2 R2，它会把另外三个角沿着一个方向轮换一次。",
          en: "With the top solid yellow, turn the top layer and look for a corner whose three colours already match all around it. Hold that corner front-right and do R' F R' B2 R F' R' B2 R2 — it rotates the other three corners one step in one direction.",
        },
        target: 'll_corners_placed',
      },
      {
        id: 'ch-07-s02',
        title: { zh: '一个都没对上时', en: 'When no corner is right yet' },
        notation: "R' F R' B2 R F' R' B2 R2",
        demo: {
          kind: 'algorithm',
          moves: "R' F R' B2 R F' R' B2 R2",
          expect: {
            zh: '做一遍就会出现一个对的角。',
            en: 'One run produces exactly one correct corner.',
          },
        },
        explain: {
          zh: '如果一个角都没对上，就在任意方向做一遍同一条公式，做完一定有一个角变对；把它挪到右前，再按上一步做一遍，最多两遍四角全归位。',
          en: 'If no corner is correct, run the same sequence once from anywhere — afterwards exactly one corner is right. Move that corner to front-right and run it again; two runs at most and all four corners are placed.',
        },
        target: 'll_corners_placed',
      },
      {
        id: 'ch-07-s03',
        title: { zh: '另一个方向', en: 'The other direction' },
        notation: "R B' R F2 R' B R F2 R2",
        demo: {
          kind: 'algorithm',
          moves: "R B' R F2 R' B R F2 R2",
          expect: {
            zh: '三个角往反方向轮换，朝向不变。',
            en: 'The three corners cycle the opposite way, with no twist.',
          },
        },
        explain: {
          zh: "如果一遍之后还剩三个角要往反方向换，用 R B' R F2 R' B R F2 R2。两条公式互为一对，不确定就先用上面那条，看结果再决定。",
          en: "If three corners still need to cycle the other way, use R B' R F2 R' B R F2 R2. The two sequences are a matched pair; when unsure, start with the previous one and read the result.",
        },
        target: 'll_corners_placed',
      },
    ],
  },
  {
    id: 'ch-08',
    order: 8,
    title: { zh: '顶棱归位', en: 'Place the Yellow Edges' },
    goal: {
      zh: '六面全部同色，魔方复原。',
      en: 'All six faces are single-coloured: the cube is solved.',
    },
    steps: [
      {
        id: 'ch-08-s01',
        title: { zh: '一个棱已归位', en: 'One edge already matches' },
        notation: "R U' R U R U R U' R' U' R2",
        demo: {
          kind: 'algorithm',
          moves: "R U' R U R U R U' R' U' R2",
          expect: {
            zh: '另外三条棱轮换一次。',
            en: 'The other three edges cycle once.',
          },
        },
        explain: {
          zh: "转顶层，找出已经和中心对齐的那条棱，把它放在后面。剩下三条棱要换位时，做 R U' R U R U R U' R' U' R2，一次就能全部归位。",
          en: "Turn the top layer and find the edge already matching its centre; hold it at the back. When the remaining three need to cycle, do R U' R U R U R U' R' U' R2 and they all land at once.",
        },
        target: 'solved',
      },
      {
        id: 'ch-08-s02',
        title: { zh: '反方向', en: 'The opposite cycle' },
        notation: "R2 U R U R' U' R' U' R' U R'",
        demo: {
          kind: 'algorithm',
          moves: "R2 U R U R' U' R' U' R' U R'",
          expect: {
            zh: '三条棱往另一边轮换。',
            en: 'The three edges cycle the other way.',
          },
        },
        explain: {
          zh: "如果三条棱要往另一边换，用 R2 U R U R' U' R' U' R' U R'。做完魔方就复原了。",
          en: "If the three edges need to go the other way, do R2 U R U R' U' R' U' R' U R'. That finishes the cube.",
        },
        target: 'solved',
      },
      {
        id: 'ch-08-s03',
        title: { zh: '收尾检查', en: 'Final check' },
        notation: null,
        demo: {
          kind: 'motion',
          moves: 'U',
          expect: {
            zh: '转一圈检查六面是否都同色。',
            en: 'Turn the cube over and confirm all six faces are single-coloured.',
          },
        },
        explain: {
          zh: '六面都是纯色就成功了。如果最后只剩两条棱或一个角不对，说明这个魔方装错了（出厂装配错误），拆开重装就好——那不是公式的问题，也不是你转错了。',
          en: 'Six solid faces means you did it. If only two edges or a single corner remain wrong, the cube was assembled incorrectly at the factory — pop it apart and rebuild it. That is not an algorithm problem and not your mistake.',
        },
        target: 'solved',
      },
    ],
  },
];
