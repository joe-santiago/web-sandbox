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
npm run optimize # Auto-resize/compress images in /public/cards/
npm run validate # Check image sizes without modifying
npm run add-card # Add new card: npm run add-card -- 3013 portrait
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

**🚧 Current Focus:** Bug fixes and stability. Image pipeline complete.

**📦 Out of Scope (Icebox):** Lazy loading, continuous raycasting, mobile swipe gestures, metadata sorting/filtering (season, year tags - revisit at 50+ cards).

**Known Limitations (Deferred):**
- **Initial Scroll Direction:** On fresh page load, must scroll "up" (counter-clockwise) before "down" (clockwise) works. Root cause: Drei ScrollControls initialization at offset=0. Workaround: scroll up once to unlock both directions.
- **Mobile:** ScrollControls uses page scroll. Horizontal swipe = future phase.
- **Scale:** Manual data.js works to ~20 cards. Beyond that needs loader/CMS.

## 8. Hierarchy of Resolution

When addressing multiple issues, prioritize in this order:

1. **Stability (Physics):** No crashes, jitter loops, or gimbal locks.
2. **Correctness (Geometry):** Textures oriented correctly. No Z-fighting.
3. **Polish (Visuals):** Smooth animations, lighting, seam colors.
4. **Features (New Capability):** New interactions or UI elements.

**Rule: Never break Level 1 to achieve Level 4.**

## 9. Performance Constraints

| Metric | Target | Rationale |
|--------|--------|-----------|
| Image file size | <200KB each | Keeps page weight manageable |
| Max resolution | 1400×1000 px | Sufficient for retina without bloat |
| Initial load | <3 seconds | Standard UX threshold |

**Optimization Commands:**
```bash
npm run optimize   # Auto-resize/compress images in /public/cards/
npm run validate   # Check image sizes without modifying
```

## 10. User Profile Context

- **Operator:** Solo artist, single trusted uploader
- **Cadence:** ~1 card/month (12 cards/year)
- **Scale Target:** ~240 cards over a 20-year career
- **Philosophy:** Simplicity over features. No admin UI, no CMS, no database.

This informs every architectural decision: we optimize for a low-frequency, high-trust workflow rather than multi-user collaboration or real-time updates.

## 11. Upload Workflow (Current)

**To add a new card today:**

1. **Prepare images:**
   - Front image: any resolution (will be optimized)
   - Back image: same card, back side

2. **Optimize images:**
   ```bash
   # Drop images anywhere, then run:
   npm run optimize
   ```

3. **Copy to project:**
   - Front → `/public/cards/fronts/{id}.jpg`
   - Back → `/public/cards/backs/{id}.jpg`

4. **Update data.js:**
   ```javascript
   // Add ID to cardIds array
   const cardIds = [3001, 3002, ..., NEW_ID];

   // Add orientation to orientations object
   const orientations = {
     ...
     NEW_ID: 'portrait' | 'landscape',
   };
   ```

5. **Verify locally:**
   ```bash
   npm run dev
   # Check: text upright on back, no jitter, responsive zoom
   ```

6. **Deploy:**
   ```bash
   git add . && git commit -m "Add card {id}" && git push
   ```

**Automated alternative:** `npm run add-card -- {id} {orientation}` handles steps 2-4 automatically.

## 12. Story Link Feature

Each card back includes a "Read the Story →" link that opens the card's story page.

**Implementation (Card.jsx):**
- Uses Drei's `Html` component for DOM overlay
- Appears only when card is locked AND flipped (showing back)
- Position adjusts for portrait vs landscape orientation
- Custom font: `Myfont` (loaded from `/public/fonts/`)

**URL Pattern:** `http://mediabyjoe.com/postcard-{id}`
