# Design Guidelines: Real-Time Collaborative Sketch Canvas

## Design Approach

**Reference-Based with System Foundation**
Primary inspiration from collaborative whiteboard tools (Figma, Miro, Excalidraw) with Material Design principles for UI components. The design prioritizes canvas real estate and tool accessibility while maintaining a clean, distraction-free environment.

## Core Design Principles

1. **Canvas-First Layout**: Maximum screen space dedicated to drawing surface
2. **Tool Accessibility**: Essential tools immediately visible, advanced features tucked away
3. **Collaborative Clarity**: Clear visual indicators of other users' presence and actions
4. **Minimal Chrome**: UI elements fade into background, canvas is the hero

---

## Typography

**Primary Font**: Inter (Google Fonts)
- Headings: 600 weight, 18-24px
- Body/UI Labels: 400 weight, 13-14px
- Small Labels: 400 weight, 11-12px

**Secondary Font**: Monospace for coordinate/dimension displays
- JetBrains Mono, 400 weight, 12px

---

## Layout System

**Spacing Units**: Tailwind units of **2, 3, 4, 6, 8**
- Tight spacing: p-2, gap-2 (tool buttons, icon groups)
- Standard spacing: p-4, gap-4 (panels, sections)
- Generous spacing: p-6, p-8 (board cards, modals)

**Canvas Layout Structure**:
```
┌─────────────────────────────────────┐
│ Top Bar (h-14): Logo, Board Name   │
├──┬──────────────────────────────┬───┤
│T │                              │ L │
│o │      Canvas (flex-1)         │ a │
│o │                              │ y │
│l │                              │ e │
│s │                              │ r │
│  │                              │ s │
│(w│                              │(w-│
│-16│                             │64)│
│) │                              │   │
└──┴──────────────────────────────┴───┘
```

---

## Component Library

### Navigation & Structure

**Top Bar**:
- Fixed height: h-14
- Contains: Logo (left), Board title (center), User avatars + Share button (right)
- Border bottom: 1px solid border
- Background: Solid, subtle

**Left Toolbar** (w-16):
- Vertical stack of tool buttons
- Grouped by function with dividers (my-3)
- Tools: Select, Pen, Eraser, Shapes, Text, Sticky Note, Laser Pointer
- Bottom: Settings/Help icons

**Right Panel - Layers** (w-64):
- Collapsible sidebar
- Layer list with drag handles
- Each layer: thumbnail preview (48x48), name, visibility toggle, opacity slider
- Add layer button at bottom

### Drawing Tools

**Tool Buttons**:
- Size: w-12 h-12
- Icon-only with tooltips
- Active state: distinct visual indicator
- Grouped with gap-2

**Tool Options Panel** (appears below active tool):
- Floating panel, absolute positioning
- Contains: Color picker, stroke width slider, opacity control
- Compact: p-3, max-w-xs

**Color Picker**:
- Preset swatches in grid (grid-cols-6, gap-1)
- Each swatch: w-8 h-8, rounded
- Custom color input below swatches

### Sticky Notes

**Note Cards**:
- Draggable, resizable containers
- Min size: w-48 h-48
- Rounded corners: rounded-lg
- Shadow: Soft drop shadow for depth
- Header with drag handle + delete icon (h-8)
- Text area: Full-bleed, p-3
- Color variants: Yellow, pink, blue, green

### Laser Pointer

**Pointer Indicator**:
- Animated circle with user's avatar/initial
- Size: w-10 h-10
- Pulse animation when active
- Trail effect: Fading dots (opacity decreasing)
- User name label offset above pointer

### Board Lobby Gallery

**Gallery Grid**:
- Grid layout: grid-cols-2 md:grid-cols-3 lg:grid-cols-4
- Gap: gap-6
- Container: max-w-7xl, centered, px-8, py-12

**Board Card**:
- Aspect ratio: 16:9 for thumbnail
- Thumbnail: AI-generated abstract brush strokes
- Overlay on hover: Slightly darker with "Open" button
- Below thumbnail:
  - Board name (font-semibold, text-lg)
  - Active users count with avatar stack
  - Last modified date (text-sm, muted)
- Padding: p-4
- Border: rounded-lg with subtle border

**Create New Board Card**:
- Dashed border instead of solid
- Plus icon centered
- "Create New Board" text
- Same size as board cards

### User Presence

**Active User Avatars**:
- Stacked avatars with -space-x-2
- Size: w-8 h-8, rounded-full
- Border: 2px solid background color (for separation)
- Max 5 visible, "+X more" indicator

**Cursor Tracking**:
- Each user gets distinct color
- Small cursor icon with name label
- Smooth position interpolation

### Modals & Dialogs

**Board Creation Modal**:
- Centered overlay with backdrop blur
- Content: max-w-md, p-6
- Fields: Board name input, template selection (optional)
- Actions: Cancel + Create buttons (gap-3)

**Share Dialog**:
- Copy link button with feedback
- Invite via email input
- Permission toggles (view/edit)

---

## Images

**Board Thumbnails**: AI-generated abstract art featuring:
- Colorful brush strokes in varied directions
- Geometric shapes overlapping
- Watercolor-style gradients
- Minimalist compositions with negative space
- Size: 16:9 aspect ratio, rendered at 640x360px

**Empty State Illustrations**:
- Center of canvas when board is empty
- Simple line art suggesting "Start drawing"
- Size: 200x200px

---

## Interactions & Feedback

**Canvas Interactions**:
- Pan: Space + drag or two-finger drag
- Zoom: Ctrl/Cmd + scroll or pinch
- Zoom indicator: Bottom-right corner (e.g., "100%")

**Real-time Updates**:
- Smooth stroke rendering (60fps target)
- Optimistic UI updates
- Conflict resolution visual indicators if needed

**Feedback Patterns**:
- Tool selection: Immediate visual confirmation
- Save status: "Saved" indicator in top bar (auto-fades)
- User joins/leaves: Toast notification (bottom-left, 3s duration)

**Loading States**:
- Board loading: Skeleton of canvas + toolbars
- Thumbnail generation: Shimmer placeholder

---

## Accessibility

- Keyboard shortcuts for all tools (display in tooltips)
- Focus indicators on all interactive elements
- ARIA labels for icon-only buttons
- Zoom controls accessible via keyboard
- Screen reader announcements for collaborative actions