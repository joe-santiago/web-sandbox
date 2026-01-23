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

❌ **Multi-Instance Callbacks:** Do NOT call parent callbacks from useEffect in components that exist as multiple instances (e.g., Card in a ring). ALL instances run useEffect on mount/dependency change.
✅ **Fix:** Use refs to track state transitions. Only call callback when THIS instance transitions (e.g., `wasActive.current && !active` plus `wasFlipped.current`).

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

**🎯 MVP Definition (v1.0):**
1. Carousel loads with all current cards
2. Cards flip correctly (portrait + landscape verified)
3. Story links open in new tab to main site
4. Deployed to `postcards.mediabyjoe.com`
5. Linked from main Squarespace site

**🚧 Current Focus:** Bug fixes and stability. Image pipeline complete.

**📦 Out of Scope (Icebox):** Lazy loading, continuous raycasting, mobile swipe gestures, metadata sorting/filtering (season, year tags - revisit at 50+ cards).

**Known Limitations (Deferred):**
- **Initial Scroll Direction:** On fresh page load, must scroll "up" (counter-clockwise) before "down" (clockwise) works. Root cause: Drei ScrollControls initialization at offset=0. Workaround: scroll up once to unlock both directions.
- **Mobile:** ScrollControls uses page scroll. Horizontal swipe = future phase.
- **Scale:** Manual data.js works to ~20 cards. Beyond that needs loader/CMS.

**🔮 Future Scaling:** See Section 15 for iframe embed and Squarespace replacement options.

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

Each card back includes a "Read the Journal →" link that opens the card's journal page.

**Implementation:**
- Fixed DOM overlay in App.jsx (not attached to 3D canvas)
- Appears when card is locked AND flipped (`activeId && isCardFlipped`)
- Card.jsx passes flip state up via `onFlip` callback chain (Card → Ring → App)
- Custom font: `Myfont` (loaded from `/public/fonts/`)

**Why DOM overlay (not Drei Html):**
Drei's `Html` component projects 3D position to screen coordinates. When the ring scrolls, the 3D position changes and the link drifts. A fixed DOM overlay stays outside the 3D coordinate system, maintaining stable screen position.

**URL Pattern:** `http://mediabyjoe.com/postcard-{id}`

## 13. Deployment

**Architecture:** Subdomain on external host, linked from main Squarespace site.

```
mediabyjoe.com              → Squarespace (main site, content)
postcards.mediabyjoe.com    → Vercel (this carousel app)
```

### Why This Setup
- Squarespace cannot run React apps—it only serves static content
- Vercel auto-builds from GitHub on every push (zero manual deployment)
- Subdomain avoids iframe scroll/performance issues
- Free tier is sufficient for this use case

### Initial Setup (One-Time)

**1. Connect GitHub to Vercel:**
- Go to [vercel.com](https://vercel.com) → Sign up with GitHub
- Import this repository
- Vercel auto-detects Vite and configures build settings
- Note the deployed URL (e.g., `pp-carousel-03.vercel.app`)

**2. Configure Custom Subdomain:**
- In Vercel project settings → Domains → Add `postcards.mediabyjoe.com`
- Vercel provides DNS records to add

**3. Add DNS Record in Squarespace:**
- Squarespace Domains → mediabyjoe.com → DNS Settings
- Add CNAME record:
  - Host: `postcards`
  - Value: `cname.vercel-dns.com`
- Wait for propagation (usually <1 hour)

**4. Link from Main Site:**
- Add navigation link or button on Squarespace pointing to `https://postcards.mediabyjoe.com`
- Consider: "View Postcard Collection →"

### Ongoing Deployment
```bash
git add . && git commit -m "Add card {id}" && git push
# Vercel auto-deploys in ~60 seconds
```

### Rollback
Vercel keeps deployment history. If a push breaks something:
- Vercel Dashboard → Deployments → Click previous deployment → "Promote to Production"

## 14. External Accounts & Credentials

**Purpose:** Document account info so future sessions don't need to re-ask. Never commit secrets—only identifiers.

| Service | Purpose | Identifier |
|---------|---------|------------|
| GitHub | Source code hosting | `___YOUR_GITHUB_USERNAME___` |
| Vercel | Deployment/hosting | (uses GitHub SSO) |
| Squarespace | Main site + DNS | mediabyjoe.com |

**To update:** Replace placeholders above with your actual usernames. Do NOT add passwords, tokens, or API keys.

**Getting your GitHub username:**
1. Go to [github.com](https://github.com) and sign in
2. Click your profile icon (top right)
3. Your username appears at the top of the dropdown
4. Or: The URL `github.com/YOUR_USERNAME` shows your profile

## 15. Future Scaling Path

**Current state (MVP):** Subdomain + external host. Carousel is a standalone app.

**If rapid scaling requires deeper integration:**

### Option A: Embed via Iframe (Medium Effort)
Keep Squarespace, embed carousel in a page. Requires solving:
- Scroll conflict (carousel uses page scroll, iframe traps it)
- Fixed height container (loses responsive fullscreen)
- Mobile touch gesture passthrough

**When to consider:** If you need carousel visible alongside other Squarespace content on same page.

### Option B: Replace Squarespace (Major Effort)
Migrate entire site to a framework that can host the carousel natively.

**Recommended framework:** [Astro](https://astro.build)
- Static site generator (fast, simple hosting)
- Supports React components as "islands" (carousel drops in directly)
- Markdown-based content (similar simplicity to Squarespace)
- Can recreate your current site structure

**Migration path:**
1. Export Squarespace content (Settings → Export)
2. Scaffold Astro site with existing pages
3. Import carousel as React component
4. Deploy entire site to Vercel

**When to consider:**
- Squarespace limitations become blocking (custom interactions, performance)
- You want single codebase for everything
- 50+ cards and need programmatic page generation

**Note:** An LLM assistant can help recreate your Squarespace site in Astro by analyzing the current site structure and content. This is a future session task, not MVP scope.

### Design for Portability (Now)
The carousel is already built for portability:
- Self-contained in `/src/components/`
- Data-driven via `data.js`
- No Squarespace dependencies
- Standard Vite build output

No additional work needed to "prepare" for migration—it's ready when you are.

## 16. Browser & Device Requirements

**Minimum Requirements:**
- WebGL 2.0 support (all modern browsers since 2017)
- JavaScript enabled
- Desktop: Chrome, Firefox, Safari, Edge (current versions)
- Mobile: Works but scroll UX is suboptimal (see Known Limitations)

**Known Incompatible:**
- Internet Explorer (no WebGL 2.0)
- Very old mobile devices (pre-2017)
- Browsers with WebGL disabled

**Testing Note:** If carousel doesn't render, check browser console for WebGL errors. Most issues are driver-related on older hardware.

## 17. Production URLs

**Update these after deployment:**

| Environment | URL | Status |
|-------------|-----|--------|
| Development | `localhost:5173` | ✅ Active |
| Staging | `pp-carousel-03.vercel.app` (or similar) | ⏳ Pending |
| Production | `postcards.mediabyjoe.com` | ⏳ Pending |
| Main Site | `mediabyjoe.com` | ✅ Active |

## 18. Session History

**Purpose:** Track major decisions and context for future coding sessions.

| Date | Summary |
|------|---------|
| 2025-01-22 | Added deployment docs (Sections 13-17). Decided on subdomain architecture over iframe. MVP definition established. |
| 2025-01-23 | Added instruction hints overlay with fade behavior. Moved story link from Drei Html to fixed DOM overlay (fixes scroll drift). Learned multi-instance callback pattern (wasActive/wasFlipped refs). |

**How to use:** Add a row after significant sessions. Helps future Claude sessions understand project evolution without re-explaining.
