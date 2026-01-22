# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 1. Collaboration Protocol

- **User Profile:** Developer up-skilling in React Three Fiber. Values "Why" over "What."
- **Your Role:** Senior R3F Engineer & Mentor.
- **Analogies First:** Explain 3D concepts using physical metaphors (e.g., "Sticker on a Box").
- **Atomic Commits:** Break changes into logical steps (Fix Physics → Verify → Fix Visuals).
- **No Black Boxes:** Explain logic before code.

## 2. Commands

```bash
npm run dev      # Start development server with HMR
npm run build    # Production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## 3. Architecture

3D Postcard Carousel (Moo™ style). Stack: React 19, Vite, R3F, Drei.

### Component Hierarchy

```
App.jsx
├── Canvas (R3F)
│   ├── Rig (Camera: Mouse Y → height, Responsive Z → zoom)
│   └── ScrollControls (Infinite scroll adapter)
│       └── Ring.jsx (Odometer pattern for circular distribution)
│           └── Card.jsx (Double-sided mesh with independent textures)
```

### Key Patterns

**Odometer Pattern (Ring.jsx:17-32):** Maps infinite scroll offsets to continuous ring rotation. Tracks loop counts when `scroll.offset` wraps (0→1 or 1→0), preventing snap-back.

**Sticker Model (Card.jsx):** Decouples texture orientation from mesh geometry. Front and back images are "stickers" on planes with a 0.01 Z-gap.

**Monolith Hitbox:** Uses a static, invisible mesh (opacity 0) grounded at Y=0 to capture mouse events, preventing jitter loops when the visible card lifts.

## 4. Constraints & Pitfalls

These caused regressions. Do not repeat.

❌ **Geometry:** Do NOT use BoxGeometry for cards. Causes texture stretching and aspect ratio failures.
✅ **Fix:** Use drei/Image planes with 0.01 Z-gap.

❌ **Rotation Math:** Do NOT use Euler angles for flip animations. Causes gimbal lock.
✅ **Fix:** Always use `Quaternion.slerp()` for smooth transitions.

❌ **Orientation Logic:** Do NOT assume standard UV mapping for backs.
✅ **Fix (Portrait):** Back texture requires `+Math.PI/2` Z-rotation.
✅ **Fix (Landscape):** Back texture requires `+Math.PI` Y-rotation.

## 5. Data Schema (data.js)

`orientation` field is critical—determines which rotation logic to apply.

```javascript
{
  id: 3001,
  orientation: 'portrait' | 'landscape',
  aspectRatio: 1.4,  // Standard Moo 5x7 ratio
  front: '/cards/fronts/3001.jpg',
  back: '/cards/backs/3001.jpg'
}
```

## 6. Verification Protocol (Definition of Done)

Before declaring a task complete:

1. **Orientation Audit:** Test Card 3002 (Portrait) AND Card 3008 (Landscape). Text must be upright on back.
2. **Flip Stability:** Lock and flip a card repeatedly. No jumping or gimbal lock.
3. **Hover Check:** Move mouse rapidly across bottom edge of lifted card. Must NOT bounce/jitter (Monolith check).
4. **Zoom Check:** Resize window. Ring must recede/approach to keep cards visible.

## 7. Roadmap & Limitations

**🚧 Current Focus:** Visual polish (seam thickness, paper texture).

**📦 Out of Scope (Icebox):** Lazy loading, continuous raycasting, mobile swipe gestures.

**Known Limitations (Deferred):**
- **Mobile:** ScrollControls uses page scroll. Horizontal swipe = future phase.
- **Scale:** Manual data.js works to ~20 cards. Beyond that needs loader/CMS.

## 8. Hierarchy of Resolution

When addressing multiple issues, prioritize in this order:

1. **Stability (Physics):** No crashes, jitter loops, or gimbal locks.
2. **Correctness (Geometry):** Textures oriented correctly. No Z-fighting.
3. **Polish (Visuals):** Smooth animations, lighting, seam colors.
4. **Features (New Capability):** New interactions or UI elements.

**Rule: Never break Level 1 to achieve Level 4.**
