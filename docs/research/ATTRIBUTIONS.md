# 内容来源与署名 / Content sources & attributions

Scope: the curriculum in [`tutorial-content.md`](./tutorial-content.md) — 8 chapters, 24 steps,
10 algorithms. This file records what is **borrowed**, what is **original**, what was **rejected**,
and the exact attribution strings the app must ship.

> Not legal advice. Licences were verified against the source itself where possible; the evidence
> for each row is quoted in §5 so a lawyer can re-check it in seconds.

---

## 1. 一句话结论 / Bottom line

- **The curriculum text is original.** Every Chinese and English sentence in `tutorial-content.md` was
  written for cubicPro in this task. Nothing is a translation or paraphrase of a source's prose.
- **Two things are borrowed:** the chapter skeleton (Daisy → Cross → First Layer → Second Layer →
  Last Layer, with the Dot/L/Line case names) from an **MIT**-licensed repo, and **Singmaster
  notation** (a public standard).
- **No CC BY-SA text is reproduced.** The CC BY-SA 4.0 tutorials below were used to *cross-check*
  terminology and step order only. That is why cubicPro's curriculum can stay all-rights-reserved
  (see §4).
- **Everything with an unclear licence was excluded**, and every algorithm in the curriculum was
  independently verified on a cube engine (§6) rather than copied from any tutorial.

---

## 2. 借用清单 / Sources we borrow from

| Source name | URL | License | Exactly what we borrow | Required attribution text |
|---|---|---|---|---|
| **learn-cube** (ramkrishna-js) | https://github.com/ramkrishna-js/learn-cube | **MIT** (SPDX `MIT`, verified via GitHub licence API) | The five-section beginner skeleton **Daisy → White Cross → First Layer → Second Layer → Last Layer**, the cross-case names **Dot / "L" / Line**, the term **"four-move sequence"** (rendered 四步手法), and the split of the last layer into *orient corners* then *place corners* then *place edges*. Structure and terminology only — **no sentences copied**. | `Curriculum structure adapted from learn-cube (MIT License, Copyright (c) 2025 ramkrishna-js).` — full MIT text must ship with the app (§3). |
| **Singmaster notation** (standard, not a single work) | e.g. described in both Wikibooks pages below | **Public domain / uncopyrightable facts** | The letter scheme `U D L R F B` plus `'` (counter-clockwise 90°) and `2` (180°), and the readable face order. | None required. Credit as a standard: `Notation: Singmaster.` |
| **Wikibooks — 三阶魔方解法** (zh) | https://zh.wikibooks.org/wiki/三阶魔方解法 | **CC BY-SA 4.0** (page footer: 「本站的全部文字在創用CC 姓名標示-相同方式分享 4.0 協議之條款下提供」) | **Reference only.** Confirmed the mainstream Chinese step vocabulary used as chapter titles (小花, 底棱, 底角, 中层, 顶十字, 顶棱, 顶角, 朝向) and cross-checked the 7-step 层先法 order. **No prose, no examples, no images reproduced.** | Not legally required (nothing copied). Courtesy credit recommended — see §7. |
| **Wikibooks — How to Solve the Rubik's Cube** (+ `/Beginner`) (en) | https://en.wikibooks.org/wiki/How_to_Solve_the_Rubik%27s_Cube | **CC BY-SA 4.0** (page footer) | **Reference only.** Cross-checked the layer-by-layer taxonomy; also read the "working space" variant (3 corners + 3 edges first) and **deliberately did not adopt it** because it is harder to explain per-step. **No text reproduced.** | Not legally required. Courtesy credit recommended — see §7. |
| **Speedsolving.com Wiki — "Beginner Methods"** | https://www.speedsolving.com/wiki/index.php/Beginner_Methods | **CC BY-SA 4.0** (footer: "Content is available under Creative Commons Attribution-ShareAlike 4.0 International unless otherwise noted") | **Reference only.** Confirmed the meaning of *LBL* and the *2-look last layer* grouping used to order chapters 5–8. **No text reproduced.** | Not legally required. Courtesy credit optional. |

**Evaluated but deliberately not used:** `ikwbb/3d-rubiks-cube-guide`
(https://github.com/ikwbb/3d-rubiks-cube-guide, **Apache-2.0**, verified via GitHub licence API).
Licence-compatible and a good reference for interactive lesson UX, but we copied nothing from it.
If code or text is adopted later, ship the Apache-2.0 `LICENSE` file and preserve any `NOTICE`.

---

## 3. MIT 许可全文（必须随应用分发）/ MIT licence text (must ship)

The MIT licence requires the copyright notice and permission notice to travel with copies or
substantial portions. Because we borrow structure and terminology, ship this block in the app's
licences screen and in the repository.

```text
MIT License

Copyright (c) 2025 ramkrishna-js

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 4. 原创 vs 借用 / ORIGINAL vs BORROWED

### 4.1 原创（无需署名）/ ORIGINAL — no attribution needed

| Item | Why it is original |
|---|---|
| All Chinese prose and all English prose in `tutorial-content.md` | Written for this task; no source was translated, paraphrased or quoted at sentence level. Spot-check: the teaching framing ("gather the pieces first, match colours next", "stop on an odd count", "not your mistake") exists nowhere in the sources. |
| Chapter and step **IDs** (`ch-01` … `ch-08-s03`) and their numbering | Ours, chosen to fit the app's `SaveSlot.completedSteps` model. |
| Every chapter **goal** statement, and every `expect` string | Ours. |
| The **target predicate vocabulary** (§2 of the curriculum: `daisy`, `cross`, `first_layer`, `two_layers`, `ll_edges_oriented`, `ll_corners_oriented`, `ll_corners_placed`, `solved`) | Ours; designed so lessons are graded on cube state, not on keystrokes. |
| The **demo-case convention** ("case = `inverse(demo.moves)` applied to solved") and the `pattern` / `algorithm` / `motion` demo taxonomy | Ours. |
| The **choice and justification of the EO → CO → CP → EP order** for v1, and the note on the alternative 层先法 order | Ours (the deviation is explained in the curriculum, §5). |
| The **verification harness and its assertions** (§6 of the curriculum) | Ours; written from scratch for this task. |
| The **chapter 8 hint** that an unsolvable end state means a mis-assembled cube | Common knowledge in the community, phrased by us. |

### 4.2 借用（必须署名）/ BORROWED — attribution required

| Item | Source | Licence | Where it appears |
|---|---|---|---|
| Chapter skeleton: Daisy → White Cross → First Layer → Second Layer → Last Layer | learn-cube | MIT | `ch-02` … `ch-08` |
| Case names **Dot / "L" / Line** for the top cross | learn-cube | MIT | `ch-05-s01` |
| The concept and name **"four-move sequence"** → 四步手法 | learn-cube | MIT | `ch-01-s03`, `ch-03-s02` |
| **Singmaster notation** (`U D L R F B`, `'`, `2`) | public standard | none | everywhere |
| The ten algorithms themselves (move strings) | **functional facts**, published identically in the CC BY-SA sources above and in countless tutorials; not protected expression | n/a | §5 algorithm sheet |

**On the algorithms.** A move sequence is a procedure for achieving a physical result; it carries no
protectable expression, and the ten strings here are the ones every beginner tutorial in every
language prints. They are listed in the table above for transparency, not because a licence obliges
us to. Each one was independently verified (§6) rather than trusted to any single source.

### 4.3 为什么可以不采用 CC BY-SA / Why ShareAlike does not reach us

CC BY-SA 4.0 attaches to *adapted material*: a derivative that reproduces protected expression. The
curriculum reproduces none — the borrowings are (a) a sequence of steps and case names, which are
method/idea and short functional labels, and (b) algorithm strings, which are functional facts.
The Wikibooks and Speedsolving pages were read to confirm vocabulary and ordering; not one sentence,
example, diagram or number was lifted.

**Consequence for the product:** the curriculum can ship under cubicPro's normal all-rights-reserved
terms. **If that changes** — e.g. someone pastes a paragraph, a diagram, or a worked example from
Wikibooks or the Speedsolving wiki into a lesson — then *that lesson* must be released under
**CC BY-SA 4.0**, must name the authors, must link the licence, and the app's terms of service must
permit it. Keep such content in a separate file so the licence boundary stays visible in git history.

---

## 5. 许可核验证据 / Licence evidence (as checked)

| Source | What was checked | Evidence |
|---|---|---|
| learn-cube | `GET api.github.com/repos/ramkrishna-js/learn-cube/license` | JSON: `"license": {"key": "mit", "spdx_id": "MIT", "name": "MIT License"}`, `"path": "LICENSE"`, copyright line `Copyright (c) 2025 ramkrishna-js`. |
| ikwbb/3d-rubiks-cube-guide | same endpoint | `"spdx_id": "Apache-2.0"`. |
| Wikibooks (en) | page footer of `/How_to_Solve_the_Rubik%27s_Cube` and `/Beginner` | "Text is available under the Creative Commons Attribution-ShareAlike License; additional terms may apply." (links `//creativecommons.org/licenses/by-sa/4.0/`). |
| Wikibooks (zh) | page footer of 三阶魔方解法 | 「本站的全部文字在創用CC 姓名標示-相同方式分享 4.0 協議之條款下提供」. |
| Speedsolving.com Wiki | page footer of `Beginner_Methods` | CC BY-SA 4.0 badge + "Content is available under Creative Commons Attribution-ShareAlike 4.0 International unless otherwise noted." |

---

## 6. 已排除来源 / Rejected — UNVERIFIED, do not reuse

These were found during research and are listed so nobody re-imports them later. All are excluded
from the curriculum.

| Source name | URL | Status | Why |
|---|---|---|---|
| J Perm — How To Solve a 3x3 | https://jperm.net/3x3 | **UNVERIFIED - do not reuse** | No licence offered; page footer reads "© 2026 J Perm". Method facts only would be uncopyrightable, but the written steps, images and video are all rights reserved. Our step order was **not** taken from it. |
| Rubik's official solution guide (Spin Master) | https://www.rubiks.com/en-eu/how-to-solve-rubiks-cube/ | **UNVERIFIED - do not reuse** | Proprietary site; terms of use prohibit reproduction. Also a trademarked brand we must not imply endorsement from. |
| OER Commons — "Multimedia Intro to Rubik's Cube, 1st 2 layers" (Peter Hastings) | https://oercommons.org/courseware/lesson/79355/overview | **UNVERIFIED - do not reuse** | The OER Commons *listing* advertises "Creative Commons Attribution Share Alike", but the item page returned **HTTP 403** on fetch, so the licence statement could not be confirmed on the work itself. Re-check manually before any use. |
| SpeedCubeShop blog — "The LBL Method for Beginners" | https://speedcubeshop.com/a/blog/the-lbl-method-for-beginners-speed-cubing-made-simple | **UNVERIFIED - do not reuse** | Commercial blog, copyright notice, no open licence. |
| Cubelelo blog — "What is Speedcubing?" | https://www.cubelelo.com/blogs/cubing/speedcubing-in-india-2026-the-complete-community-competition-culture-guide-1 | **UNVERIFIED - do not reuse** | Commercial blog, copyright notice, no open licence. |
| Martins3 cube guide (GitHub Pages, zh 七步层先) | https://github.com/Martins3/Martins3.github.io | **UNVERIFIED - do not reuse** | A well-made Chinese 7-step LBL guide, but no repository licence was confirmed in this pass. Verify `LICENSE` before any reuse. |
| cubedev docs / random "cube tutorial markdown" hits | — | **UNVERIFIED - do not reuse** | Unrelated products (e.g. the Cube analytics platform's docs) surfaced by the search terms; not Rubik's content at all. |

---

## 7. 应用内署名文案 / In-app attribution strings (copy verbatim)

Ship these on a **Credits / 开源许可** screen reachable from the tutorial and from Settings.
Keep the MIT block from §3 in the same screen.

**Required (MIT):**

> 课程章节结构参考 learn-cube（MIT 许可，© 2025 ramkrishna-js）。
> Curriculum structure adapted from learn-cube (MIT License, © 2025 ramkrishna-js).

**Required (standard):**

> 转动记号遵循 Singmaster 标准。
> Move notation follows the Singmaster standard.

**Courtesy (recommended, not legally required — we credit the sources we cross-checked):**

> 术语与步骤顺序核对参考：维基教科书《三阶魔方解法》、《How to Solve the Rubik's Cube》、
> Speedsolving.com Wiki（均为 CC BY-SA 4.0）；本课程文字为 cubicPro 原创，未复制上述来源的文字或图片。
>
> Terminology and step ordering cross-checked against Wikibooks《三阶魔方解法》,
> Wikibooks "How to Solve the Rubik's Cube", and the Speedsolving.com Wiki (all CC BY-SA 4.0).
> The lesson text is original to cubicPro; no text or images from those sources are reproduced.

**Trademark hygiene:** the app must not claim affiliation with Rubik's / Spin Master. Use
"3×3 cube / 三阶魔方" in product copy; keep "Rubik's Cube" to nominative references (e.g. "a Rubik's
Cube-style puzzle") and never in the logo or app name.
