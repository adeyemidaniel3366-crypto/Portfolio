# Adeyemi Daniel Oluwasegun — Software Developer Portfolio

A production-quality, fully responsive personal portfolio website built with modern React tooling. Features smooth scroll-driven animations, a custom design system, and a content-driven architecture for easy maintenance.

---

## 🎯 Project Overview

This portfolio showcases a software developer's work, skills, and experience through a bold, editorial-style design inspired by creative director portfolios. Every section is animated with scroll-triggered transitions, and all content is managed through a single data file.

**Live Demo:** [http://127.0.0.1:5173/](http://127.0.0.1:5173/) (local development)

---

## 🛠 Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | React 18 | Component-based UI with hooks and concurrent features |
| **Build Tool** | Vite 5 | Fast dev server, optimized production builds, HMR |
| **Styling** | Tailwind CSS 4 | Utility-first CSS with custom design tokens via `@theme` |
| **Animations** | Framer Motion 11 | Scroll-driven animations, layout transitions, gesture handling |
| **Smooth Scroll** | Lenis 1 | Buttery-smooth scrolling synced with Framer Motion |
| **Icons** | Lucide React + React Icons | Lightweight SVG icons + brand icons (GitHub, LinkedIn, X) |
| **Fonts** | Google Fonts (Anton, Inter, Caveat, DM Mono) | Editorial typography system |
| **Linting** | ESLint 9 + React Hooks | Code quality and best practices |

### Why These Choices?

- **React 18 + Vite**: Modern, fast, minimal config. Vite's native ESM dev server is significantly faster than Webpack-based alternatives.
- **Tailwind CSS 4**: Zero-config design tokens via CSS variables, no `tailwind.config.js` needed. JIT compilation keeps CSS tiny (~34KB gzipped).
- **Framer Motion**: Best-in-class for scroll animations (`useScroll`, `useTransform`), layout animations (`layoutId`), and gesture handling.
- **Lenis**: Handles smooth scrolling without breaking native scroll behavior or accessibility. Integrates cleanly with Framer Motion's scroll APIs.
- **No heavy UI libraries**: Keeps bundle small (~112KB JS gzipped). All components are custom.

---

## 📁 Project Structure

```
918/
├── public/
│   ├── favicon.svg              # Red dot on black background
│   ├── profile.png              # Hero portrait (4:5 crop recommended)
│   └── projects/                # Project screenshots
│       ├── note-app.png
│       ├── inventory-master.png
│       ├── document-converter.png
│       ├── vscode-replica.png
│       ├── mobile-anti-theft-guard.png
│       └── material-fx.png
├── src/
│   ├── components/
│   │   ├── layout/              # Global layout components
│   │   │   ├── Navbar.jsx       # Sticky nav, mobile menu, active section highlighting
│   │   │   ├── Footer.jsx       # Footer with nav, services, contact, social
│   │   │   ├── Preloader.jsx    # Loading screen with count-up animation
│   │   │   ├── ScrollProgress.jsx  # Top progress bar
│   │   │   ├── CustomCursor.jsx # Desktop-only magnetic cursor
│   │   │   └── SmoothScroll.jsx # Lenis initialization
│   │   ├── sections/            # Page sections (composed in App.jsx)
│   │   │   ├── Hero.jsx         # Headline, portrait, availability label
│   │   │   ├── About.jsx        # Bio, signature, stats, code window
│   │   │   ├── Services.jsx     # 5-column service cards
│   │   │   ├── Skills.jsx       # Animated skill bars + grouped chips
│   │   │   ├── Work.jsx         # Filterable project grid + modal
│   │   │   ├── TechStack.jsx    # Infinite marquee + foundations grid
│   │   │   ├── HowIBuild.jsx    # 3 principle cards
│   │   │   └── Contact.jsx      # CTA + contact modal
│   │   └── ui/                  # Reusable UI primitives
│   │       ├── Button.jsx       # Dark, light, outline variants
│   │       ├── Label.jsx        # Section label with red bullet
│   │       ├── Reveal.jsx       # Scroll-triggered fade-up
│   │       ├── Counter.jsx      # Count-up number animation
│   │       ├── SkillBar.jsx     # Animated progress bar
│   │       ├── ProjectCard.jsx  # Project tile with hover reveal
│   │       ├── ProjectModal.jsx # Shared-layout modal
│   │       └── Marquee.jsx      # Infinite scrolling track
│   ├── data/
│   │   └── content.js           # 🎯 SINGLE SOURCE OF TRUTH — all content here
│   ├── hooks/
│   │   ├── useActiveSection.js  # IntersectionObserver for nav highlighting
│   │   ├── useMediaQuery.js     # Responsive breakpoints
│   │   └── useReducedMotion.js  # prefers-reduced-motion wrapper
│   ├── lib/
│   │   └── motion.js            # Shared Framer Motion variants
│   ├── styles/
│   │   └── index.css            # Tailwind imports + global styles
│   ├── App.jsx                  # Root component, composes all sections
│   └── main.jsx                 # Entry point
├── index.html                   # SEO meta, Open Graph, favicon
├── vite.config.js               # Vite + Tailwind plugin config
├── package.json
└── eslint.config.js
```

---

## 🎨 Design System

### Colors (CSS Variables in `src/styles/index.css`)

```css
:root {
  --ink: #0a0a0a;        /* Near-black for text */
  --paper: #fafafa;      /* Off-white background */
  --soft: #f1f0ee;       /* Light gray bands */
  --line: #d9d7d4;       /* Thin dividers */
  --muted: #77736f;      /* Secondary text */
  --accent: #ff3b1f;     /* Vivid red-orange — primary accent */
}
```

### Typography

| Role | Font | Usage |
|------|------|-------|
| **Display** | Anton (Google Fonts) | Giant condensed headlines, uppercase, tight leading |
| **Body** | Inter (Google Fonts) | All UI text, readable at small sizes |
| **Signature** | Caveat (Google Fonts) | Handwritten signature in About |
| **Mono** | DM Mono (Google Fonts) | Code snippets, labels, numbers |

### Layout Principles

- **Max-width**: 1320px container with fluid padding (`max(6.4vw, calc((100vw - 1320px) / 2))`)
- **Whitespace**: Generous vertical rhythm, 1px dividers
- **Grid**: Strict alignment, responsive breakpoints at 360/768/1024/1440px
- **Responsive**: Mobile-first, `clamp()` for fluid headline scaling

---

## ⚡ Animation Architecture

### Scroll-Driven Animations (Framer Motion)

```jsx
// Scroll progress for any element
const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
const y = useTransform(scrollYProgress, [0, 1], [50, -50])

// Viewport-triggered reveals
<motion.div
  initial={{ opacity: 0, y: 28 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-10%' }}
  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
/>
```

### Key Animation Patterns Used

| Pattern | Implementation | Sections |
|---------|----------------|----------|
| **Masked text reveal** | `overflow: hidden` on parent, `y: '110%' → 0` on text | Hero headlines |
| **SVG path drawing** | `pathLength: 0 → 1` on `<motion.path>` | Hero brush stroke |
| **Count-up numbers** | Custom `Counter` component with `IntersectionObserver` | About stats, Skill percentages |
| **Progress bars** | `scaleX: 0 → level/100` on `whileInView` | Skills section |
| **Layout transitions** | `layoutId` + `layout` prop on shared elements | Project card → Modal |
| **Parallax** | `useTransform` with different speeds | Hero portrait, red block |
| **Staggered entrance** | `transition: { delay: index * 0.07 }` | Grids, lists |
| **Infinite marquee** | CSS animation + `animation-play-state: paused` on hover | Tech Stack |

### Reduced Motion Support

All animations respect `prefers-reduced-motion`:

```jsx
const reduceMotion = useReducedMotion()
// Disables: parallax, count-ups, marquee, cursor, preloader
// Shows content instantly
```

---

## 📝 Content Management

**All content lives in `src/data/content.js`** — no hardcoded strings in components.

### Structure

```js
export const content = {
  identity: { name, role, location, basedIn, institution, email },
  hero: { headline: ['Software', 'Developer'], subtext, availability },
  about: { heading, paragraph, signature, caption, stats: [...] },
  services: [{ number, title, description }, ...],
  skills: [{ name, level }, ...],           // 0-100
  skillGroups: [{ title, items: [...] }, ...],
  projects: [{
    id, title, category, type, stack, description,
    focus: [...], theme, mark, image, imageFit, imageScale,
    githubUrl, liveUrl
  }, ...],
  stack: [...],                              // Marquee items
  foundations: [...],                        // 4-column grid
  principles: [{ number, title, description }, ...],
  social: [{ name, url }, ...],
  nav: [{ label, id }, ...]
}
```

### Adding/Editing Content

1. **Edit `src/data/content.js`** — change text, add projects, update skills
2. **Add project screenshots** to `public/projects/` with matching filenames
3. **Update `public/projects/README.md`** if adding new projects
4. **No component changes needed** — everything is data-driven

---

## 🚀 Development Workflow

### Prerequisites

- Node.js 18+
- npm 9+

### Commands

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Production build (outputs to dist/)
npm run build

# Preview production build locally
npm run preview

# Lint source files
npm run lint
```

### Hot Module Replacement

Vite's HMR preserves component state during edits. CSS changes apply instantly without reload.

### Adding a New Section

1. Create component in `src/components/sections/`
2. Import and add to `App.jsx` in desired order
3. Add `id` to section element for nav highlighting
4. Add nav item to `content.nav` in `content.js`

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repository in Vercel
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Deploy — automatic on push to main

### Netlify

1. Connect repository
2. Build Command: `npm run build`
3. Publish Directory: `dist`
4. Add `_redirects` file for SPA fallback if adding client-side routes:
   ```
   /*  /index.html  200
   ```

### Static Hosting (Any)

The `dist/` folder contains static assets. Upload to any static host (GitHub Pages, Cloudflare Pages, AWS S3 + CloudFront, etc.).

---

## 🎨 Customization Guide

### Changing Colors

Edit CSS variables in `src/styles/index.css`:

```css
:root {
  --accent: #your-color;    /* Primary accent */
  --ink: #your-dark;        /* Text color */
  --paper: #your-bg;        /* Background */
}
```

### Changing Fonts

1. Update Google Fonts import in `src/styles/index.css`
2. Update `--heading`, `--body`, `--mono`, `--serif` variables

### Adding a Project

1. Add entry to `content.projects` in `content.js`
2. Add screenshot to `public/projects/your-project.png`
3. Set `image: '/projects/your-project.png'` in project data
4. Choose `theme: 'dark' | 'red' | 'paper'`
5. Set `imageFit: 'contain' | 'cover'` and optional `imageScale`

### Modifying Animations

- **Global variants**: `src/lib/motion.js`
- **Per-component**: Edit transition props in section components
- **Reduced motion**: All components check `useReducedMotion()`

---

## ♿ Accessibility

- Semantic HTML5 (`header`, `nav`, `main`, `section`, `footer`)
- Proper heading hierarchy (h1 → h2 → h3)
- Focus visible states on all interactive elements
- Keyboard-navigable modal (focus trap, Escape to close)
- ARIA labels on icon-only buttons
- `prefers-reduced-motion` respected
- Color contrast ≥ WCAG AA
- Alt text on all images

---

## 📦 Bundle Analysis

```
dist/assets/index-*.js   ~347 KB (112 KB gzipped)
dist/assets/index-*.css  ~37 KB  (9 KB gzipped)
```

Main contributors:
- Framer Motion ~120 KB
- React + React DOM ~45 KB
- Lenis ~15 KB
- Lucide/React Icons ~20 KB
- Application code ~147 KB

---

## 🔧 Troubleshooting

### Animations not triggering
- Check `prefers-reduced-motion` in OS settings
- Verify element has `viewport={{ once: true, margin: '-10%' }}`
- Ensure section is in DOM (not conditionally rendered before scroll)

### Images not loading
- Verify file exists in `public/projects/`
- Check filename matches `content.js` exactly (case-sensitive)
- Ensure `public/` files are served at root (`/projects/image.png`)

### Build fails
- Run `npm run lint` to see errors
- Check for missing imports or syntax errors
- Clear `node_modules` and reinstall: `rm -rf node_modules package-lock.json && npm install`

---

## 📄 License

MIT License — feel free to use as a template for your own portfolio.

---

## 🙏 Credits

- **Design inspiration**: Creative director portfolio references
- **Fonts**: Google Fonts (Anton, Inter, Caveat, DM Mono)
- **Icons**: Lucide, Font Awesome (via React Icons)
- **Smooth scroll**: Lenis by @studio-freight
- **Animations**: Framer Motion by @framer

---

*Built with care by Adeyemi Daniel Oluwasegun*
