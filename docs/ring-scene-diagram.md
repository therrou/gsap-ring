# Ring Scene — Visual Diagrams

Companion to [`ring-scene-architecture.md`](./ring-scene-architecture.md). These
Mermaid diagrams render on GitHub, in VS Code's Markdown preview, or paste them
into <https://mermaid.live> for a full-screen, exportable view (great for a deck).

---

## 1. The scroll timeline — four overlapping channels

One pinned `ScrollTrigger` maps pin-progress `p ∈ [0,1]` into four overlapping
channels. The overlap is what makes stages cross-fade instead of snapping.

```mermaid
gantt
    title Scroll progress p (0 → 1) over SCROLL_LENGTH = 3200px
    dateFormat X
    axisFormat %s

    section zoom
    ring scale · centre · splay · ortho    :z, 0, 40

    section stack
    gather into tight album                 :s, 35, 58

    section row
    tight album → flat horizontal row       :r, 54, 78

    section iso
    flat row → diagonal slab spread         :i, 74, 100
```

> Read the X axis as `p × 100`. Where bars overlap (e.g. 35–40, 54–58, 74–78),
> two stages ease simultaneously — the hand-off beats.

---

## 2. What you see, stage by stage

```mermaid
flowchart LR
    A["🟦 Idle ring<br/>24 cards on vertical XY ring<br/>perspective · hoverable"]
    B["🔍 Zoom<br/>featured sweeps top → centre<br/>ring scales up"]
    C["🗂️ Tight album<br/>cards gather behind featured<br/>sides splay + fade · ortho"]
    D["➖ Flat row<br/>single horizontal line<br/>fronto-parallel · deck tilt in"]
    E["⬗ Diagonal spread<br/>even slabs lower-left → upper-right<br/>same size · hoverable peek"]

    A -->|zoom 0→1| B -->|stack 0→1| C -->|row 0→1| D -->|iso 0→1| E

    style A fill:#1e293b,color:#fff
    style B fill:#312e81,color:#fff
    style C fill:#3730a3,color:#fff
    style D fill:#4338ca,color:#fff
    style E fill:#4f46e5,color:#fff
```

---

## 3. Transform hierarchy (the matrix stack)

Placement lives on `card.root`; hover offsets live on `card.mesh`. That split
keeps hover always in the card's **local** frame.

```mermaid
flowchart TD
    scene["scene"]
    ring["ringRoot<br/><i>zoom scale · mouse tilt · centring lift</i>"]
    wrap["wrapperRoot<br/><i>Z-rotation: swings featured to TOP on zoom</i>"]
    cont["containerRoot<br/><i>album/deck tilt — X lean + Y spine tilt</i>"]
    root["card.root<br/><i>ring / stack / spread position + Z roll</i>"]
    mesh["card.mesh<br/><i>LOCAL hover: forward push · face turn · row peek</i>"]
    slab["flat Plane + frosted shader program<br/><i>slab look is faked, not real thickness</i>"]

    scene --> ring --> wrap --> cont --> root --> mesh --> slab

    style scene fill:#0f172a,color:#fff
    style mesh fill:#4f46e5,color:#fff
    style root fill:#4338ca,color:#fff
```

---

## 4. Per-frame update — data flow

Every frame, raw channels → easings → pure stage math → damped follow → render.

```mermaid
flowchart TD
    subgraph input["Inputs"]
        ST["ScrollTrigger pin progress p"]
        PTR["damped pointer"]
        INTRO["intro 0→1 tween"]
    end

    ST -->|mapProgress| CH["channels: zoom · stack · row · iso"]
    CH -->|easings| EZ["zoomEase · gatherT · flatRowT · spreadT"]

    EZ --> STAGES["ring-stages.ts (pure)<br/>computeZoomScale · computeRowTarget<br/>computeFlatRowTarget · mixProjectionMatrices"]
    PTR --> PARITY["ring-parity.ts (pure)<br/>mouse torque · plane influence<br/>face turn · forward push"]
    INTRO --> PARITY

    STAGES --> TARGET["per-card target X/Y/Z + rotation"]
    PARITY --> HOVER["mesh-local hover offsets"]

    TARGET -->|dampToward| POS["eased card.pos"]
    POS --> APPLY["apply to card.root"]
    HOVER --> APPLYM["apply to card.mesh"]

    EZ --> CAM["mix perspective ↔ orthographic"]

    APPLY --> RENDER["renderOrder = count − deckIndex<br/>painter's algorithm · OGL draw"]
    APPLYM --> RENDER
    CAM --> RENDER

    style STAGES fill:#312e81,color:#fff
    style PARITY fill:#3730a3,color:#fff
    style RENDER fill:#4f46e5,color:#fff
```

---

## 5. Camera blend & frost — what's driven by what

```mermaid
flowchart LR
    Z["zoom"] --> OBT["orthographicBlendT(zoom)"]
    GT["gatherT"] --> MAX
    SP["spreadT"] --> MAX
    OBT --> MAX["t = max(...)"]
    MAX -->|mixProjectionMatrices| CAM["camera: perspective → orthographic<br/><i>→ every spread card same size</i>"]

    GT --> FMAX["uFrost = max(gatherT, flatRowT, spreadT)"]
    FR["flatRowT"] --> FMAX
    SP --> FMAX
    FMAX --> FROST["frosted-glass shader<br/><i>noise tint · edge falloff · spine darkening</i>"]

    style CAM fill:#4f46e5,color:#fff
    style FROST fill:#3730a3,color:#fff
```

---

## 6. Two hovers, gated by phase

```mermaid
stateDiagram-v2
    [*] --> IdleRingHover: zoom ≈ 0
    IdleRingHover --> DeadZone: zoom rises
    DeadZone --> RowHover: iso > 0.5
    RowHover --> DeadZone: scroll back

    state IdleRingHover {
        direction LR
        ar: Ar — pure math, damped pointer
        ar2: faceY (turn to face) + forwardZ (lift)
        ar3: no spring · fades out as zoom rises
        ar --> ar2 --> ar3
    }

    state RowHover {
        direction LR
        k: spring stiffness 130 → target 2
        k2: mesh.position.x = damped · hoverSlide
        k3: sideways peek only · no reorder
        k --> k2 --> k3
    }

    note right of DeadZone
        Mid-sequence: hover suppressed
        so it never leaks into the deck
    end note
```

---

### Rendering tip

To export a single image for a slide: open <https://mermaid.live>, paste one
block, then **Actions → PNG/SVG**. For a one-page poster, GitHub renders this
whole file inline.
