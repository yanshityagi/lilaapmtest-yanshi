```markdown
# 📄 SPEC.md — Player Journey Visualization Tool (PM + UX + Tech Driven)

---

## 1. Product Overview

### 1.1 Problem Statement

Level Designers currently rely on **raw telemetry data** which is:
- Hard to interpret
- Not spatially intuitive
- Lacks actionable insights

This creates a gap between:
👉 *What is happening in the game* vs *What designers understand*

---

### 1.2 Product Vision

Build a **decision-support visualization tool** that enables Level Designers to:

- Instantly understand player behavior on maps  
- Identify gameplay and balance issues  
- Make informed design decisions in under 30 seconds  

---

### 1.3 Success Criteria

The product is successful if:

- A designer can open the tool and identify 1–2 key issues within 10–30 seconds  
- Map insights are visually obvious without deep analysis  
- The tool reduces reliance on raw data exploration  

---

## 2. User & Use Cases

### 2.1 Primary User

**Level Designer**

---

### 2.2 Key Questions the Tool Must Answer

The UX and features must directly answer:

- Where are players spending most of their time?
- Where are fights happening?
- Where are players dying and why?
- Which areas are ignored?
- Is player movement aligned with intended map design?
- Are bots affecting gameplay patterns?

---

### 2.3 Core Use Cases

| Use Case | Description |
|--------|------------|
| Analyze combat zones | Identify high kill/death areas |
| Identify dead zones | Find underutilized regions |
| Study player flow | Understand movement patterns |
| Compare bot vs human | Detect behavioral differences |
| Replay match | Observe how gameplay evolves over time |

---

## 3. UX Strategy

### 3.1 UX Principles

1. **Clarity First**  
   No clutter. Default view should be easy to interpret.

2. **Progressive Disclosure**  
   Show minimal data → allow deeper exploration via toggles.

3. **Visual Hierarchy**  
   - Heatmaps → high emphasis  
   - Events → medium  
   - Paths → subtle  

4. **Insight-Led Experience**  
   UX should guide user toward conclusions, not just display data.

---

### 3.2 Layout Structure

```

---

## | Top Bar (Filters)                             |

| Sidebar (Layers) | Main Map (Primary View)    |
|                  |                            |
|                  |                            |
|                  |                            |
-------------------------------------------------

## | Bottom Bar (Timeline Slider)                  |

## | Right Panel (Insights)                        |

```

---

### 3.3 UX Components

#### A. Top Bar (Context Control)
- Map Selector
- Match Selector
- Date Filter
- Player Type Toggle (Human / Bot / Both)

👉 Goal: Set context quickly

---

#### B. Main Map (Core Experience)

- Minimap image as base layer  
- Overlays:
  - Player paths
  - Heatmaps
  - Event markers  

👉 Must be readable in <5 seconds

---

#### C. Layer Control Panel

Toggle visibility:

- Player Paths  
- Kill Zones  
- Death Zones  
- Loot  
- Storm Deaths  

👉 Enables focused analysis

---

#### D. Timeline Slider

- Range: start → end of match  
- Updates map dynamically  

👉 Shows **how gameplay evolves**

---

#### E. Insight Panel (Critical)

Displays auto-generated insights:

Each insight must include:
- Observation  
- Evidence  
- Design implication  
- Suggested action  

---

## 4. Functional Requirements

### 4.1 Data Ingestion

**Input:**
- `.parquet` files

**Fields:**
- `player_id`
- `x`, `y`
- `timestamp`
- `event_type`
- `player_type`
- `match_id`
- `map_name`

---

### 4.2 Data Processing

- Parse parquet → pandas DataFrame  
- Normalize timestamps  
- Separate:
  - movement data  
  - event data  

---

### 4.3 Coordinate Mapping (Critical Logic)

Convert game coordinates → image coordinates:

```

x_map = (x - min_x) / (max_x - min_x) * image_width
y_map = (y - min_y) / (max_y - min_y) * image_height

```

**Requirements:**
- Maintain spatial accuracy  
- Align perfectly with minimap  

---

### 4.4 Player Path Rendering

- Group by `player_id`
- Sort by timestamp
- Draw line segments

**Style:**
- Thin lines  
- Low opacity  
- Color:
  - Human → White/Green  
  - Bot → Orange  

---

### 4.5 Event Visualization

| Event | Visual |
|------|--------|
| Kill | Red dot 🔴 |
| Death | Blue dot 🔵 |
| Loot | Yellow dot 🟡 |
| Storm | Purple ⚡ |

---

### 4.6 Heatmap Generation

- Use density estimation
- Generate overlays for:
  - Kills
  - Deaths
  - Player movement

**Behavior:**
- Toggleable  
- Adjustable intensity  

---

### 4.7 Filtering Logic

Filters must dynamically update:

- Map  
- Match  
- Date  
- Player Type  

---

### 4.8 Timeline Playback

- Slider controls time window  
- Filter dataset based on timestamp  

---

## 5. Insight Engine (Core Differentiator)

### 5.1 Logic Rules

#### Rule 1: High Death Zone
- Death density > threshold  

#### Rule 2: Low Traffic Area
- Player visits < threshold  

#### Rule 3: Passive Zone
- High movement + low kills  

#### Rule 4: Bot-Dominated Zone
- Bot density significantly higher than humans  

---

### 5.2 Insight Output Format

```

Observation:
Evidence:
Why it matters:
Recommended action:

```

---

### 5.3 Example Insight

**Observation:**  
High deaths in central corridor  

**Evidence:**  
60% of deaths occur in 25% of map area  

**Why it matters:**  
Indicates choke point  

**Action:**  
Add alternate routes or reduce loot density  

---

## 6. Non-Functional Requirements

### Performance
- Load < 3 seconds  
- Smooth interactions  

### Usability
- Understandable within 10 seconds  

### Reliability
- Handle missing or noisy data  

---

## 7. Tech Stack

- Python  
- Streamlit  
- pandas  
- plotly / matplotlib  

---

## 8. File Structure

```

/app
main.py
data_loader.py
visualization.py
insights.py

/data
parquet files
minimap images

/docs
SPEC.md
ARCHITECTURE.md
INSIGHTS.md

```

---

## 9. Development Plan (for Codex)

### Phase 1: Data Layer
- Load parquet  
- Clean and structure data  

### Phase 2: Visualization
- Render map  
- Plot coordinates  

### Phase 3: Interaction
- Add filters  
- Add timeline  

### Phase 4: Insights
- Implement rule engine  

### Phase 5: UX Polish
- Improve layout  
- Add toggles  

---

## 10. Definition of Done

- Map renders correctly  
- Player paths visible  
- Events distinguishable  
- Filters working  
- Timeline functional  
- Heatmaps accurate  
- Insights generated  
- UX intuitive  

---

## 11. Instructions for Codex

- Follow tasks sequentially  
- Do not generate full app at once  
- Keep modules separate  
- Reuse logic  
- Validate outputs after each step  

---

## 12. PM Notes (IMPORTANT)

This is not a visualization tool.  
This is a **decision-making system**.

Prioritize:
- Insight clarity over feature count  
- UX simplicity over complexity  
- Actionable output over raw data  

---

## 13. UI SPEC (STRICT)

### Layout Requirements

- Full-width layout
- Sidebar width: ~250px
- Insight panel width: ~300px
- Map takes remaining space

---

### Component Structure

Top Bar:
- Dropdown (Map)
- Dropdown (Match)
- Toggle (Bot/Human)

Sidebar:
- Toggle switches for layers

Main Map:
- Background image
- Canvas overlay

Bottom:
- Timeline slider

Right Panel:
- List of insights (cards)

---

### Visual Rules

- Background: dark (game-like)
- Map: centered
- Heatmaps: high contrast
- Paths: low opacity

---

### Interaction Rules

- Hover → show tooltip
- Toggle → instant update
- Timeline → smooth update

## 14. Data Contract

Assume input schema:

player_id: string  
x: float  
y: float  
timestamp: int  
event_type: string  
player_type: string  
match_id: string  
map_name: string  

---

### Event Types

- "kill"
- "death"
- "loot"
- "storm"

---

### Player Types

- "human"
- "bot"

---

## 15. Execution Rules for Codex

- Implement ONE task at a time
- After each task:
  - Show full working code
  - Do not refactor previous code unless asked
- Do not change data schema
- Do not redesign UI
- Ask before adding new features

---

## 16. Designer Outcome Goal

The tool must enable a designer to:

- Identify 1 high-risk zone
- Identify 1 underutilized zone
- Understand player flow

Within 30 seconds of opening the tool.
```
