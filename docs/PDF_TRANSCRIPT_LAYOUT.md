# PDF transcript layout and exclusion patterns

This doc records how the 8 sphere PDFs (Foundation, Family, Economics, Government, Religion, Education, Communications, Celebration) are structured so the extraction script can split out **only the 52 key-passage transcripts** and exclude category/section intro content.

## Key passage splitting strategy

- **Pattern:** Key passage transcripts in the PDFs (and in existing CSV/JSON) follow a pattern like `Number 1: Title.` or `Number 2: Title` then the body text. The next passage starts with `Number N:` (N = 1..52).
- **Regex for split:** Split full PDF text on `Number\s+(\d+):` (case-insensitive) and assign each segment to the captured number N. Only segments with N in **1–52** are key passages.
- **Per-PDF variation:** If a PDF uses a different pattern (e.g. "Passage 1:" or "1. Title"), document it here and add a per-sphere split rule in the extractor.

## Content to exclude (category / section intros)

These are **not** key passages. Any segment that is primarily one of these should be discarded.

### Global exclusion patterns (apply to all PDFs)

- **SECTION INTRODUCTION** / **Section Introduction** (often in CSV as transcript for FAM-CAT-*, EDU-CAT-*, etc.)
- **God and the Sphere of** (Family, Economics, Government, Religion, Education, Media/Communication, Celebration) — section intro headings
- **Intro**, **#00 Intro**, **Intro Final** (e.g. "Celebration #00 Intro Final", "Government #00 Intro Final")
- **Crossover Passages** (section heading; crossover entries 50–51 are still key passages, but a standalone "Crossover Passages" intro block is not)
- **Crossovers Introduction**

### Category headings from Key Passages MD (exclude if segment starts with these)

When the **first line** of an extracted segment matches one of these (after normalizing case/spaces), treat it as category content and exclude:

- God Is Infinite and Personal
- Man Is Finite and Personal
- Truth Is Constant and Knowable
- Choices Are Significant and Have Consequences
- Called to Be Change-Makers with God
- God and the Sphere of Family
- Biblical Principles for Husbands and Wives
- Biblical Principles for Parents and Children
- Biblical Principles for Living in Family
- Family & Healthcare
- Crossover Passages
- God and the Sphere of Economics
- Innovative Science and Technology
- Biblical Principles for Business
- Economic Do's and Don'ts
- Economics & Healthcare
- God and the Sphere of Government
- To Protect Citizens and Safeguard Justice
- Principles and Practices of Godly Government
- Principles for the Executive Branch
- Principles for the Judicial Branch
- Principles for the Legislative Branch
- War and Peace
- Government & Healthcare
- God and the Sphere of Religion
- The Marks of True and False Religion
- Biblical Purpose of Religion
- Two Streams: Mobile and Local Expressions of Church
- Role of Religious Leaders
- God with Us – God at the Center
- Life of a Jesus-Follower
- Religion & Healthcare
- God and the Sphere of Education
- Goals and Purposes of Biblical Education
- Biblical Guidelines for Teachers
- Biblical Guidelines for Students
- Principles and Practices of Biblical Education
- Key Elements of Biblical Education
- God and the Sphere of Media/Communication
- The Purpose of Communication
- Communication to Imitate
- Communication to Avoid
- Pursue Vertical Communication with God
- Pursue Horizontal Communication with Your Neighbor
- God and the Sphere of Celebration
- The Purpose of Celebration
- The Five Senses and God's Design
- The Prophet/Artist
- Jesus and the Arts
- Biblical Principles for Sports

## Validation

- After extraction, each sphere must have **exactly 52** transcript entries (orders 1–52). No more (category content included) and no fewer (missing or merged passages).
- The validation script checks this and also flags any segment whose first line looks like one of the exclusion patterns above.

## Per-PDF notes (update after manual review)

| PDF | Notes |
|-----|--------|
| Foundation 52 FINAL.pdf | Missing 1–9: PDF may use different format (e.g. "1. Title" without "Number"). Fallback pattern fills some gaps. |
| Family 52 FINAL.pdf | Missing 2, 11, 13. Some title mismatches on 40, 48–52 (crossover section). |
| Economics 52 Final.pdf | Missing 12, 19. Title mismatches on 47, 51–52. |
| Government 52 FINAL.pdf | Missing 1–6, 8, 9, 29. Similar to Foundation. |
| Religion 52 FINAL.pdf | Missing 1–9, 12, 15, 20, 23. |
| Education 52 FINAL.pdf | Missing 45. |
| Communications 52 FINAL.pdf | Missing 1 (or 51). |
| Celebration 52 FINAL.pdf | Missing 24. |

**Extraction improvements applied:** (1) Keep **last** occurrence when duplicates (real passage usually after category intro). (2) Fallback pattern `(?:^|\n)\s*(\d+)\s*[.:)]\s+` fills gaps for orders missing from primary "Number N:" split.
