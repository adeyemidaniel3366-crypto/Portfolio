import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import Lenis from 'lenis'
import { ArrowDown, ArrowDownRight, ArrowUpRight, Braces, Camera, Code2, Command, Layers3, Menu, X } from 'lucide-react'
import { SiGithub, SiX } from 'react-icons/si'
import { FaLinkedinIn } from 'react-icons/fa'
import { content } from './data/content'
import AntigravityBackground from './components/AntigravityBackground'
import './App.css'

const reveal = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } } }
const filters = ['All work', 'Mobile', 'Web', 'Full-stack']
const serviceIcons = [Code2, Braces, Layers3, ArrowUpRight, Camera]
const socialIcons = { GitHub: SiGithub, LinkedIn: FaLinkedinIn, X: SiX }

function Label({ children, light = false }) {
  return <p className={`section-label${light ? ' section-label-light' : ''}`}><span />{children}</p>
}

function Reveal({ children, className = '', delay = 0 }) {
  return <motion.div className={className} variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-10%' }} transition={{ delay }}>{children}</motion.div>
}

function Counter({ value }) {
  const ref = useRef(null)
  const reduceMotion = useReducedMotion() ?? false
  const [count, setCount] = useState(reduceMotion ? value : 0)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (hasAnimated) return
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasAnimated(true)
            observer.disconnect()
            if (reduceMotion) {
              setCount(value)
              return
            }
            let frame
            const start = performance.now()
            const tick = (now) => {
              const progress = Math.min((now - start) / 1050, 1)
              setCount(Math.round(value * (1 - (1 - progress) ** 4)))
              if (progress < 1) frame = requestAnimationFrame(tick)
            }
            frame = requestAnimationFrame(tick)
            return () => cancelAnimationFrame(frame)
          }
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [value, reduceMotion, hasAnimated])

  return <span ref={ref}>{count}</span>
}

function Preloader() {
  const [done, setDone] = useState(false)
  const [number, setNumber] = useState(0)
  useEffect(() => {
    const start = performance.now()
    let frame
    const tick = (now) => {
      const progress = Math.min((now - start) / 650, 1)
      setNumber(Math.round(progress * 100))
      if (progress < 1) frame = requestAnimationFrame(tick)
      else setTimeout(() => setDone(true), 120)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])
  return <AnimatePresence>{!done && <motion.div className="preloader" initial={{ y: 0 }} exit={{ y: '-100%', transition: { duration: 0.75, ease: [0.76, 0, 0.24, 1] } }}><span className="preloader-name">{content.identity.name}<b>.</b></span><span className="preloader-number">{number}<small>%</small></span></motion.div>}</AnimatePresence>
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  return <motion.div className="scroll-progress" style={{ scaleX: scrollYProgress }} />
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('home')
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id) }), { rootMargin: '-35% 0px -55% 0px' })
    content.nav.forEach(({ id }) => { const section = document.getElementById(id); if (section) observer.observe(section) })
    return () => { window.removeEventListener('scroll', onScroll); observer.disconnect() }
  }, [])
  useEffect(() => {
    if (!open) return
    const onKey = (event) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.body.classList.add('menu-open')
    return () => { document.removeEventListener('keydown', onKey); document.body.classList.remove('menu-open') }
  }, [open])
  const closeMenu = () => setOpen(false)
  return <>
    <header className={`navbar${scrolled ? ' navbar-scrolled' : ''}`}>
      <a className="wordmark" href="#home" onClick={closeMenu} aria-label={`${content.identity.name}, home`}>{content.identity.name}<b>.</b></a>
      <nav className="desktop-nav" aria-label="Main navigation">{content.nav.map((item) => <a className={active === item.id ? 'active' : ''} href={`#${item.id}`} key={item.id}>{item.label}</a>)}</nav>
      <a className="nav-cta" href="#contact">Let's talk <ArrowUpRight size={14} /></a>
      <button className="menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </header>
    <AnimatePresence>{open && <motion.nav className="mobile-menu" initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }} aria-label="Mobile navigation">{content.nav.map((item, index) => <motion.a key={item.id} href={`#${item.id}`} onClick={closeMenu} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.045 }}>{item.label}<ArrowUpRight /></motion.a>)}<p>{content.identity.location}</p></motion.nav>}</AnimatePresence>
  </>
}

function Hero() {
  const ref = useRef(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const portraitY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 55])
  const blockY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -22])
  return <section className="hero-section" id="home" ref={ref}>
    <div className="hero-topline"><span>{content.identity.role}</span><span>Based in / {content.identity.basedIn}</span></div>
    <div className="hero-main"><div className="hero-copy"><div className="hero-title-wrap">{content.hero.headline.map((line, index) => <div className="headline-mask" key={line}><motion.h1 initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 0.95, delay: 0.76 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}>{line}{index === 1 && <svg className="brush-stroke" viewBox="0 0 520 26" preserveAspectRatio="none" aria-hidden="true"><motion.path d="M4 17 C104 5 166 20 258 13 S424 9 516 5" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 1.35, ease: 'easeOut' }} /></svg>}</motion.h1></div>)}</div><div className="hero-bottom"><p>{content.hero.subtext}</p><a className="button button-dark" href="#work">View my work <ArrowUpRight size={16} /></a></div></div>
      <div className="portrait-scene" aria-label="Portrait area"><motion.div className="portrait-block" style={{ y: blockY }} /><motion.div className="portrait-frame" style={{ y: portraitY }}><img src="/profile.png" alt={`${content.identity.name}, software developer`} width="640" height="800" fetchpriority="high" onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.parentElement.classList.add('portrait-fallback') }} /><div className="portrait-fallback-art" aria-hidden="true"><div className="portrait-glow" /><div className="portrait-silhouette"><span /></div><div className="portrait-caption">AD / 001</div></div></motion.div><div className="portrait-index">FIG. 01 <span>—</span> 2026</div></div>
      <motion.div className="availability" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.25, duration: 0.65 }}><i />{content.hero.availability}</motion.div>
    </div><a className="scroll-cue" href="#about"><span>Scroll to explore</span><ArrowDown size={15} /></a><span className="hero-coordinate">06°37' N / 04°50' E</span>
  </section>
}

function About() {
  return <section className="about-section section-pad" id="about"><div className="section-grid"><div><Label>About me</Label><Reveal><h2 className="section-heading">{content.about.heading}</h2></Reveal></div><Reveal className="about-copy" delay={0.12}><p>{content.about.paragraph}</p><p className="institution-line">{content.identity.institution}</p><div className="signature"><span>{content.about.signature}</span><small>{content.about.caption}</small></div></Reveal></div>
    <div className="about-lower"><div className="stats-row">{content.about.stats.map((stat, index) => <Reveal className="stat" delay={index * 0.1} key={stat.label}><strong><Counter value={stat.value} /></strong><span>{stat.label}</span>{stat.note && <small>{stat.note}</small>}</Reveal>)}</div>
      <Reveal className="code-art"><div className="code-window"><div className="window-bar"><span /><span /><span /><em>build.ts</em><Command size={13} /></div><div className="code-content"><span className="code-no">01</span><code><i>const</i> craft = {'{'}</code><span className="code-no">02</span><code>&nbsp;&nbsp;clarity: <b>'always'</b>,</code><span className="code-no">03</span><code>&nbsp;&nbsp;speed: <b>'by design'</b>,</code><span className="code-no">04</span><code>&nbsp;&nbsp;details: <b>'matter'</b></code><span className="code-no">05</span><code>{'}'}</code><span className="code-no">06</span><code>craft.<i>ship</i>()<span className="cursor-blink">_</span></code></div></div><div className="art-caption">A considered process, from first line to final detail.</div></Reveal></div>
  </section>
}

function Services() {
  return <section className="services-section section-pad" id="services"><div className="section-head"><Label>What I do</Label><Reveal><h2 className="section-heading">Thoughtful by nature.<br /><span>Useful by design.</span></h2></Reveal></div><div className="services-grid">{content.services.map((service, index) => { const Icon = serviceIcons[index]; return <Reveal className="service-card" key={service.number} delay={index * 0.07}><div className="service-top"><span>{service.number}</span><Icon size={22} strokeWidth={1.5} /></div><h3>{service.title}</h3><p>{service.description}</p><div className="service-rule" /></Reveal> })}</div></section>
}

function Skills() {
  const reduceMotion = useReducedMotion()
  return <section className="skills-section section-pad" id="skills"><div className="section-grid skills-intro"><div><Label>Skills that drive impact</Label><Reveal><h2 className="section-heading">Strong fundamentals.<br /><span>Practical outcomes.</span></h2></Reveal></div><Reveal className="skills-aside"><p>Tools are only as useful as the thinking behind them. Here’s where my experience is focused today.</p></Reveal></div>
    <div className="skill-bars">{content.skills.map((skill, index) => <Reveal className="skill-row" key={skill.name} delay={index * 0.06}><div className="skill-meta"><span>{skill.name}</span><span><Counter value={skill.level} /><small>%</small></span></div><div className="skill-track"><motion.span initial={{ scaleX: 0 }} whileInView={{ scaleX: skill.level / 100 }} viewport={{ once: true, margin: '-10%' }} transition={{ duration: reduceMotion ? 0 : 1, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }} /></div></Reveal>)}</div>
    <div className="skill-groups">{content.skillGroups.map((group, index) => <Reveal className="skill-group" key={group.title} delay={index * 0.06}><h3>{group.title}</h3><div>{group.items.map((item) => <span key={item}>{item}</span>)}</div></Reveal>)}</div>
  </section>
}

function ProjectCard({ project, onOpen, index }) {
  const [imageFailed, setImageFailed] = useState(false)
  const hasImage = Boolean(project.image && !imageFailed)
  const isWeb = project.category?.toLowerCase() === 'web'
  return <motion.button className={`project-card theme-${project.theme}`} layoutId={`project-${project.id}`} layout onClick={() => onOpen(project)} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-8%' }} transition={{ duration: 0.55, delay: index % 3 * 0.07 }} aria-label={`View ${project.title} project details`}><div className={`project-art${hasImage ? ' has-image' : ''}`}><span className="project-type">{project.type}</span><span className="project-corner"><ArrowUpRight size={16} /></span>{hasImage ? (isWeb ? <div className="window-mockup"><div className="window-header"><div className="window-dots"><span /><span /><span /></div><span className="window-title">{project.title}</span></div><div className="window-body"><img className="window-img" src={project.image} alt={`${project.title} app screenshot`} loading="lazy" onError={() => setImageFailed(true)} /></div></div> : <div className="phone-mockup"><div className="phone-island" /><div className="phone-screen"><img className="phone-img" src={project.image} alt={`${project.title} app screenshot`} loading="lazy" onError={() => setImageFailed(true)} /></div></div>) : <span className="project-mark">{project.mark}</span>}<div className="project-hover"><p>{project.description}</p><span>Explore project <ArrowUpRight size={13} /></span></div></div><div className="project-info"><span>{project.category} <i>·</i> {project.stack}</span><h3>{project.title}</h3></div></motion.button>
}

function ProjectModal({ project, onClose }) {
  const dialog = useRef(null)
  const closeButton = useRef(null)
  const [imageError, setImageError] = useState({ projectId: null, failed: false })
  const imageFailed = imageError.projectId === project?.id && imageError.failed
  const isWeb = project?.category?.toLowerCase() === 'web'
  useEffect(() => {
    if (!project) return
    const previous = document.activeElement
    document.body.classList.add('dialog-open')
    closeButton.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab' && dialog.current) {
        const focusable = [...dialog.current.querySelectorAll('a, button')].filter((element) => !element.hasAttribute('disabled'))
        const first = focusable[0]; const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); document.body.classList.remove('dialog-open'); previous?.focus?.() }
  }, [project, onClose])
  if (!project) return null
  return <AnimatePresence><motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><motion.article className="project-modal" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="modal-title" layoutId={`project-${project.id}`} initial={{ scale: 0.95, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, opacity: 0 }} transition={{ duration: 0.35 }}><button ref={closeButton} className="modal-close" onClick={onClose} aria-label="Close project details"><X /></button><div className={`modal-art theme-${project.theme}${project.image && !imageFailed ? ' has-image' : ''}`}><span className="project-type">{project.type}</span>{project.image && !imageFailed ? (isWeb ? <div className="window-mockup modal-mockup"><div className="window-header"><div className="window-dots"><span /><span /><span /></div><span className="window-title">{project.title}</span></div><div className="window-body"><img className="window-img" src={project.image} alt={`${project.title} app screenshot`} onError={() => setImageError({ projectId: project.id, failed: true })} /></div></div> : <div className="phone-mockup modal-mockup"><div className="phone-island" /><div className="phone-screen"><img className="phone-img" src={project.image} alt={`${project.title} app screenshot`} onError={() => setImageError({ projectId: project.id, failed: true })} /></div></div>) : <strong>{project.mark}</strong>}</div><div className="modal-content"><Label>{project.category} / {project.stack}</Label><h2 id="modal-title">{project.title}</h2><p>{project.description}</p><h3>Key focus</h3><ul>{project.focus.map((item) => <li key={item}>{item}</li>)}</ul><div className="modal-links"><a className="button button-dark" href={project.githubUrl || 'https://github.com/adeyemidaniel3366-crypto'} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={15} /></a>{project.liveUrl && <a className="button button-outline" href={project.liveUrl} target="_blank" rel="noreferrer">Live project <ArrowUpRight size={15} /></a>}<button className="text-button" onClick={onClose}>Close <X size={14} /></button></div></div></motion.article></motion.div></AnimatePresence>
}

function Work() {
  const [filter, setFilter] = useState('All work')
  const [selected, setSelected] = useState(null)
  const shown = filter === 'All work' ? content.projects : content.projects.filter((project) => project.category.toLowerCase() === filter.toLowerCase())
  return <section className="work-section section-pad" id="work"><div className="work-heading"><div><Label>Selected work</Label><Reveal><h2 className="section-heading">Made to work.<br /><span>Built to feel right.</span></h2></Reveal></div><Reveal className="work-intro"><p>A selection of mobile and web products shaped by clear thinking, considered interfaces, and a focus on the details.</p></Reveal></div>
    <div className="work-controls"><div className="filter-tabs" role="tablist" aria-label="Filter projects">{filters.map((item) => <button key={item} role="tab" aria-selected={filter === item} className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><span className="work-count">0{shown.length} projects</span></div><motion.div className="project-grid" layout>{shown.map((project, index) => <ProjectCard key={project.id} project={project} onOpen={setSelected} index={index} />)}</motion.div><ProjectModal project={selected} onClose={() => setSelected(null)} />
  </section>
}

function TechStack() {
  const reduceMotion = useReducedMotion()
  const wordmarks = [...content.stack, ...content.stack]
  return <section className="stack-section" id="stack"><div className="section-pad stack-head"><Label>Tech stack & foundations</Label><Reveal><h2 className="section-heading">The tools behind<br /><span>the thinking.</span></h2></Reveal></div><div className={`marquee${reduceMotion ? ' marquee-static' : ''}`} aria-label={`Technologies: ${content.stack.join(', ')}`}><div className="marquee-track">{wordmarks.map((name, index) => <span key={`${name}-${index}`}><i />{name}</span>)}</div></div><div className="foundation-grid">{content.foundations.map((item, index) => <Reveal key={item}><span>0{index + 1}</span><p>{item}</p></Reveal>)}</div></section>
}

function HowIBuild() {
  return <section className="principles-section section-pad" id="approach"><div className="principles-head"><Label>How I build</Label><Reveal><h2 className="section-heading">The work is in<br /><span>the way you work.</span></h2></Reveal></div><div className="principles-grid">{content.principles.map((item, index) => <Reveal className="principle-card" delay={index * 0.09} key={item.number}><span className="principle-number">{item.number}</span><div><h3>{item.title}</h3><p>{item.description}</p></div><ArrowDownRight className="principle-arrow" size={19} /></Reveal>)}</div></section>
}

function ContactModal({ onClose }) {
  const dialog = useRef(null)
  const closeButton = useRef(null)
  useEffect(() => {
    const previous = document.activeElement
    document.body.classList.add('dialog-open')
    closeButton.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab' && dialog.current) {
        const focusable = [...dialog.current.querySelectorAll('a, button')]
        const first = focusable[0]; const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); document.body.classList.remove('dialog-open'); previous?.focus?.() }
  }, [onClose])
  return <motion.div className="modal-backdrop contact-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><motion.div className="contact-modal" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="contact-title" initial={{ y: 25, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 15, opacity: 0 }}><button ref={closeButton} className="modal-close contact-close" onClick={onClose} aria-label="Close contact links"><X /></button><Label>Start a conversation</Label><h2 id="contact-title">Where to find me.</h2><div className="contact-links">{content.social.map((item) => { const Icon = socialIcons[item.name]; return <a href={item.url} key={item.name} target="_blank" rel="noreferrer"><span><Icon aria-hidden="true" />{item.name}</span><ArrowUpRight /></a> })}{content.identity.email && <a href={`mailto:${content.identity.email}`}><span>Email</span><ArrowUpRight /></a>}</div><p>{content.identity.location}</p></motion.div></motion.div>
}

function Contact() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [20, -20])
  return <section className="contact-section" id="contact" ref={ref}><motion.div className="contact-splash" style={{ y }} aria-hidden="true">✳</motion.div><div className="contact-inner section-pad"><Label light>Have something in mind?</Label><Reveal><h2>Let's build something<br /><em>extraordinary.</em></h2></Reveal><div className="contact-bottom"><p>Have a project in mind or just want to say hello? I'd love to hear from you.</p><button className="button button-light" onClick={() => setOpen(true)}>Get in touch <ArrowUpRight size={16} /></button></div></div><AnimatePresence>{open && <ContactModal onClose={() => setOpen(false)} />}</AnimatePresence></section>
}

function Footer() {
  return <footer className="footer"><div className="footer-main"><div className="footer-brand"><a className="wordmark wordmark-light" href="#home">{content.identity.name}<b>.</b></a><p>Software developer crafting fast, beautiful apps.</p><div className="social-row">{content.social.map((item) => { const Icon = socialIcons[item.name]; return <a key={item.name} href={item.url} aria-label={item.name} target="_blank" rel="noreferrer"><Icon aria-hidden="true" />{item.name}<ArrowUpRight size={13} /></a> })}</div></div><div className="footer-col"><h3>Navigation</h3>{content.nav.map((item) => <a href={`#${item.id}`} key={item.id}>{item.label}</a>)}</div><div className="footer-col"><h3>Services</h3>{content.services.map((item) => <a href="#services" key={item.number}>{item.title}</a>)}</div><div className="footer-col footer-contact"><h3>Contact</h3><p>{content.identity.location}</p><a href="#contact">Let's connect <ArrowUpRight size={13} /></a></div></div><div className="footer-bottom"><span>© 2026 {content.identity.name}. All rights reserved.</span><a href="#home">Back to top <ArrowUpRight size={13} /></a></div></footer>
}

function CustomCursor() {
  const reduceMotion = useReducedMotion()
  const ref = useRef(null)
  useEffect(() => {
    if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return
    const move = (event) => {
      if (ref.current) {
        ref.current.style.opacity = '1'
        ref.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`
      }
    }
    const leave = () => { if (ref.current) ref.current.style.opacity = '0' }
    const hover = (event) => ref.current?.classList.toggle('cursor-hover', Boolean(event.target.closest('a, button')))
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    document.addEventListener('pointerover', hover)
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      document.removeEventListener('pointerover', hover)
    }
  }, [reduceMotion])
  return <div className="custom-cursor" ref={ref} style={{ opacity: 0 }} aria-hidden="true" />
}

function SmoothScroll() {
  const reduceMotion = useReducedMotion()
  useEffect(() => {
    if (reduceMotion) return
    const lenis = new Lenis({ duration: 1.1, easing: (value) => 1 - (1 - value) ** 4, smoothWheel: true, anchors: { offset: -78 } })
    let frame
    const raf = (time) => { lenis.raf(time); frame = requestAnimationFrame(raf) }
    frame = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(frame); lenis.destroy() }
  }, [reduceMotion])
  return null
}

function App() {
  return <><AntigravityBackground /><SmoothScroll /><Preloader /><ScrollProgress /><Navbar /><CustomCursor /><main><Hero /><About /><Services /><Skills /><Work /><TechStack /><HowIBuild /><Contact /></main><Footer /></>
}

export default App
