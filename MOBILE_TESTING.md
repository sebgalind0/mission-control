# Mobile Testing Guide - Mission Control

## Quick Test (Chrome DevTools)

### Setup
1. Open Mission Control in Chrome
2. Press `F12` or `Cmd+Opt+I` (Mac) to open DevTools
3. Click **Toggle Device Toolbar** (phone icon) or press `Cmd+Shift+M`
4. Select **iPhone SE** (375px) or **iPhone 14 Pro** (393px)

### Test Checklist

#### 1. Sidebar & Navigation (ALL SCREENS)
- [ ] Hamburger menu icon visible in top-left
- [ ] Click hamburger → sidebar slides in from left
- [ ] Overlay appears behind sidebar
- [ ] All nav items have 44px touch targets
- [ ] Click nav item → sidebar closes, screen loads
- [ ] Click overlay or X → sidebar closes
- [ ] ESC key closes sidebar

#### 2. Fleet Overview
- [ ] Stats grid: 2 columns (not 4)
- [ ] "View Org Chart" button full-width
- [ ] Agent cards stack vertically (avatar + info + skills)
- [ ] Skills badges wrap properly
- [ ] No horizontal scroll
- [ ] All agent cards tappable

#### 3. Command Center
- [ ] Stats grid: 2 columns
- [ ] Activity feed, Active Agents, Active Work stack vertically
- [ ] Each panel scrollable independently
- [ ] Command input full-width
- [ ] "Execute" button below input (not beside)
- [ ] No text overflow

#### 4. Task Board
- [ ] Stats grid: 2 columns
- [ ] Filters stack vertically
- [ ] **Kanban columns scroll horizontally** (swipe left/right)
- [ ] One column visible at a time (~280px wide)
- [ ] Snap scrolling works
- [ ] Task cards readable

#### 5. Analytics
- [ ] Stats grid: 2 columns
- [ ] Agent performance chart fits screen
- [ ] Expandable agent details stack (1 col)

#### 6. Calendar
- [ ] Day headers show single letters (S M T W T F S)
- [ ] All 7 columns visible (small but readable)
- [ ] Calendar cells tappable
- [ ] Events readable

#### 7. Projects
- [ ] Project cards stack vertically (1 col)
- [ ] All buttons tappable

#### 8. Modals
**Search Modal (⌘K)**
- [ ] Modal fits screen width (with 16px margin)
- [ ] Input field accessible
- [ ] Results scrollable

**Notifications Panel (Bell icon)**
- [ ] Panel full-width on mobile
- [ ] All notifications readable
- [ ] No overflow

**Chat Log Modal (Click agent)**
- [ ] Modal fits screen (with margin)
- [ ] Chat history scrollable
- [ ] Input field accessible

#### 9. Other Screens (Quick Check)
- [ ] Reports: 2-col stats
- [ ] System Info: 2-col stats
- [ ] Team Org Chart: Cards stack
- [ ] Settings: Forms full-width
- [ ] Memory Browser: No overflow
- [ ] Docs Library: Cards stack

### Common Issues to Check
- [ ] **No horizontal scroll** on any screen
- [ ] All tap targets **minimum 44px**
- [ ] Text doesn't **overflow** cards/containers
- [ ] **Buttons** are finger-friendly (not tiny)
- [ ] **Inputs** are easy to tap and type in
- [ ] **Modals** don't extend beyond viewport
- [ ] **Stats cards** don't squish text

## Device Testing (if available)

### iPhone SE (375px) - Smallest
Most restrictive. If it works here, it works everywhere.

### iPhone 14/15 (393px)
Standard size.

### iPhone 14/15 Pro Max (430px)
Largest iPhone.

## Visual Regression Spots

Check these specific areas:

1. **Fleet Overview** - Agent card layout (mobile vs desktop difference is big)
2. **Task Board** - Kanban horizontal scroll
3. **Command Center** - 3-panel stacking
4. **Calendar** - 7-column grid on small screen
5. **Sidebar** - Hamburger menu animation

## Known Good Patterns

### ✅ Working Examples
- **Fleet Overview agent cards** - Best example of mobile/desktop split layout
- **Task Board kanban** - Horizontal scroll with snap points
- **Command Center** - Vertical stacking of complex layout
- **Sidebar** - Slide-in animation with overlay

### ⚠️ Edge Cases Handled
- Calendar maintains 7 columns (standard calendar UX)
- Kanban scrolls horizontally (better than vertical stack)
- Modals use px-4 padding (prevents edge-to-edge)

## Screenshots (Recommended)

Take screenshots at **375px width** for:
1. Fleet Overview (with agent card open)
2. Command Center (showing all 3 panels)
3. Task Board (kanban scroll)
4. Sidebar open (hamburger menu)
5. Any modal open

Save to `~/mission-control/screenshots/mobile/` for reference.

## Performance

On mobile DevTools, check:
- [ ] No layout shifts when opening sidebar
- [ ] Smooth scroll in kanban
- [ ] Fast navigation between screens
- [ ] No jank when opening modals

## Final Checklist

- [ ] All 18 screens load without errors
- [ ] Hamburger menu works on every screen
- [ ] No horizontal scroll anywhere
- [ ] All buttons/links tappable (44px min)
- [ ] All text readable (not cut off)
- [ ] All modals fit screen
- [ ] TypeScript build passes (`npm run build`)

---

**If all checks pass → SHIP IT! 🚀**
