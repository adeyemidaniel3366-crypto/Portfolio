import { useEffect, useRef } from 'react'

/**
 * Antigravity interactive dot matrix background.
 * - Dots are invisible by default (not everything displayed at once).
 * - ONLY the dots actively being interacted with appear when moving the mouse.
 * - When scrolling, dots do not appear.
 * - The revealed dots form a circular pattern around the cursor.
 * - Dots closer to the mouse are smaller (~0.95px), while dots farther from the mouse
 *   (towards the circular rim) are a little larger (~3.1px), remaining relatively small.
 * - Uses spring-damper physics for weightless "antigravity" elasticity and inertia.
 */
export default function AntigravityBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let animationFrameId
    let width = 0
    let height = 0
    let dpr = 1
    let dots = []
    let ripples = []

    // Spacing between dots
    const SPACING = 30
    const BASE_RADIUS = 1.35
    const INTERACTION_RADIUS = 175
    const SPRING = 0.09
    const DAMPING = 0.8

    let isScrolling = false
    let scrollTimeout = null
    let idleTimeout = null
    let lastMoveX = -9999
    let lastMoveY = -9999

    const mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      active: false,
    }

    function initGrid() {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.scale(dpr, dpr)

      const cols = Math.floor(width / SPACING)
      const rows = Math.floor(height / SPACING)
      const offsetX = (width - (cols - 1) * SPACING) / 2
      const offsetY = (height - (rows - 1) * SPACING) / 2

      dots = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const originX = offsetX + c * SPACING
          const originY = offsetY + r * SPACING
          dots.push({
            originX,
            originY,
            x: originX,
            y: originY,
            vx: 0,
            vy: 0,
            radius: BASE_RADIUS,
            targetRadius: BASE_RADIUS,
            baseRadius: BASE_RADIUS,
            alpha: 0,
            targetAlpha: 0,
            phase: Math.random() * Math.PI * 2,
          })
        }
      }
    }

    function onPointerMove(e) {
      // Do not reveal dots while actively scrolling
      if (isScrolling) return

      // Verify physical cursor movement to ignore synthetic scroll events
      const dx = e.clientX - lastMoveX
      const dy = e.clientY - lastMoveY
      if (Math.hypot(dx, dy) < 2) return

      lastMoveX = e.clientX
      lastMoveY = e.clientY

      mouse.targetX = e.clientX
      mouse.targetY = e.clientY
      mouse.active = true

      // When the mouse stops moving, smoothly fade dots out
      clearTimeout(idleTimeout)
      idleTimeout = setTimeout(() => {
        mouse.active = false
      }, 850)
    }

    function onScrollOrWheel() {
      // Immediately deactivate and fade out dots during scrolling
      isScrolling = true
      mouse.active = false
      clearTimeout(idleTimeout)
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        isScrolling = false
      }, 200)
    }

    function onPointerLeave() {
      mouse.active = false
      clearTimeout(idleTimeout)
    }

    function onPointerDown(e) {
      if (prefersReducedMotion || isScrolling) return
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 12,
        maxRadius: Math.min(window.innerWidth, window.innerHeight) * 0.38,
        speed: 7,
        strength: 0.9,
      })
      if (ripples.length > 4) ripples.shift()
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('scroll', onScrollOrWheel, { passive: true })
    window.addEventListener('wheel', onScrollOrWheel, { passive: true })
    document.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('pointerdown', onPointerDown, { passive: true })

    const resizeObserver = new ResizeObserver(() => {
      initGrid()
    })
    resizeObserver.observe(canvas)
    initGrid()

    function animate(time) {
      ctx.clearRect(0, 0, width, height)

      // Smooth mouse tracking
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.3
        mouse.y += (mouse.targetY - mouse.y) * 0.3
      } else {
        mouse.x += (-9999 - mouse.x) * 0.1
        mouse.y += (-9999 - mouse.y) * 0.1
      }

      // Update ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i]
        ripple.radius += ripple.speed
        ripple.strength = Math.max(0, 1 - ripple.radius / ripple.maxRadius)
        if (ripple.radius >= ripple.maxRadius) {
          ripples.splice(i, 1)
        }
      }

      // Render only the dots being interacted with
      const len = dots.length
      const EFFECT_RADIUS = INTERACTION_RADIUS * 1.25

      for (let i = 0; i < len; i++) {
        const dot = dots[i]

        // Subtle zero-g drift while active
        const driftX = prefersReducedMotion ? 0 : Math.sin(time * 0.0012 + dot.phase) * 1.0
        const driftY = prefersReducedMotion ? 0 : Math.cos(time * 0.0009 + dot.phase) * 1.0

        let targetX = dot.originX + driftX
        let targetY = dot.originY + driftY
        let targetRadius = dot.baseRadius
        let targetAlpha = 0 // Invisible unless actively interacted with

        // Mouse interaction (only when actively moving the mouse)
        if (mouse.active) {
          const dx = targetX - mouse.x
          const dy = targetY - mouse.y
          const dist = Math.hypot(dx, dy)

          if (dist < EFFECT_RADIUS) {
            if (dist < INTERACTION_RADIUS) {
              const norm = dist / INTERACTION_RADIUS // 0 at cursor, 1 at boundary

              // Radial push forming the circular pattern around the cursor
              const pushMagnitude = Math.pow(1 - norm, 0.72) * 44
              const angle = Math.atan2(dy, dx)
              targetX += Math.cos(angle) * pushMagnitude
              targetY += Math.sin(angle) * pushMagnitude

              // Sizing requirement:
              // Dots closer to the mouse are smaller (~0.95px).
              // Dots farther from the mouse (towards circular rim) are a little larger (~3.1px).
              // All remain relatively small and elegant.
              targetRadius = 0.95 + Math.pow(norm, 1.35) * 2.15

              // Opacity gradient across circular format
              targetAlpha = 0.3 + Math.pow(norm, 1.1) * 0.6
            } else {
              // Outer smooth fade to invisible
              const outerNorm = (dist - INTERACTION_RADIUS) / (EFFECT_RADIUS - INTERACTION_RADIUS)
              const falloff = 1 - outerNorm
              targetRadius = BASE_RADIUS + (3.1 - BASE_RADIUS) * falloff
              targetAlpha = 0.85 * falloff
            }
          }
        }

        // Ripple interaction on click
        if (ripples.length > 0) {
          for (let r = 0; r < ripples.length; r++) {
            const rip = ripples[r]
            const rdx = targetX - rip.x
            const rdy = targetY - rip.y
            const rdist = Math.hypot(rdx, rdy)
            const waveDiff = Math.abs(rdist - rip.radius)
            const waveWidth = 45

            if (waveDiff < waveWidth) {
              const waveFactor = (1 - waveDiff / waveWidth) * rip.strength
              const waveAngle = Math.atan2(rdy, rdx)
              targetX += Math.cos(waveAngle) * waveFactor * 20
              targetY += Math.sin(waveAngle) * waveFactor * 20
              targetRadius = Math.max(targetRadius, dot.baseRadius + waveFactor * 1.5)
              targetAlpha = Math.max(targetAlpha, waveFactor * 0.75)
            }
          }
        }

        // Physics updates
        if (prefersReducedMotion) {
          dot.x = targetX
          dot.y = targetY
          dot.radius = targetRadius
          dot.alpha = targetAlpha
        } else {
          dot.vx = (dot.vx + (targetX - dot.x) * SPRING) * DAMPING
          dot.vy = (dot.vy + (targetY - dot.y) * SPRING) * DAMPING
          dot.x += dot.vx
          dot.y += dot.vy
          dot.radius += (targetRadius - dot.radius) * 0.16
          dot.alpha += (targetAlpha - dot.alpha) * 0.15
        }

        // Performance & appearance: only draw dots that are currently visible
        if (dot.alpha < 0.015) continue

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, Math.max(0.6, dot.radius), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(20, 20, 20, ${dot.alpha})`
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameId)
      clearTimeout(idleTimeout)
      clearTimeout(scrollTimeout)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', onScrollOrWheel)
      window.removeEventListener('wheel', onScrollOrWheel)
      document.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('pointerdown', onPointerDown)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div
      className="antigravity-background-container"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  )
}
