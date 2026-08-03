'use client'

import { useEffect, useRef } from 'react'

/**
 * The WebGL lattice behind the landing hero.
 *
 * Written against the raw WebGL API rather than three.js on purpose: the site
 * is a static export with a four-package dependency tree, and pulling in a
 * scene graph to draw three grids would make the landing page the heaviest
 * download on the site. Everything here — the projection matrix, the geometry,
 * the two shaders — is a few dozen lines, and the whole component degrades to
 * nothing (the hero's Tailwind gradient stays visible) when WebGL is
 * unavailable.
 *
 * The figure is deliberately not decoration: three stacked planes, coloured and
 * ordered exactly like the `StackDiagram` below it — storefront on top,
 * platform in the middle, controller underneath — connected by vertical struts.
 * It is the same architecture the page argues for, drawn in perspective.
 */

/** Grid resolution per tier. 14×14 keeps the scene under 3k vertices and the
    cells wide enough to read as a lattice rather than a haze. */
const N = 14

/** Half-width of a tier plane in world units. */
const SPAN = 3.0

/** Vertical gap between tiers, top tier first. */
const TIERS = [
  { y: 1.85, color: [0.49, 0.36, 0.93] }, // Storefront — violet
  { y: 0.0, color: [0.17, 0.75, 0.6] }, // Platform — Vendra accent
  { y: -1.85, color: [0.06, 0.65, 0.89] } // Controller — sky
] as const

const VERT = `
attribute vec3 aPos;
attribute vec3 aColor;
attribute float aSeed;

uniform mat4 uProj;
uniform mat4 uView;
uniform float uTime;

varying vec3 vColor;
varying float vFade;

void main() {
  vec3 p = aPos;

  // A slow travelling swell, phase-shifted per tier so the planes never beat
  // in unison and read as one thick surface.
  float wave =
    sin(p.x * 0.55 + uTime * 0.55 + aSeed) * 0.13 +
    cos(p.z * 0.5 - uTime * 0.4 + aSeed * 1.7) * 0.11;
  p.y += wave;

  vec4 viewPos = uView * vec4(p, 1.0);
  gl_Position = uProj * viewPos;

  // Depth fade: far geometry dissolves instead of ending at a hard edge.
  vFade = clamp(1.0 - (-viewPos.z - 2.5) / 8.0, 0.15, 1.0);
  vColor = aColor;
  gl_PointSize = 1.8 + vFade * 3.4;
}
`

const FRAG = `
precision mediump float;

uniform float uAlpha;

varying vec3 vColor;
varying float vFade;

void main() {
  gl_FragColor = vec4(vColor, uAlpha * vFade);
}
`

/** Column-major perspective projection, matching the GLSL `mat4` layout. */
function perspective(fovY: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fovY / 2)
  const d = 1 / (near - far)
  // prettier-ignore
  return new Float32Array([
    f / aspect, 0, 0,                     0,
    0,          f, 0,                     0,
    0,          0, (far + near) * d,     -1,
    0,          0, 2 * far * near * d,    0
  ])
}

/**
 * A view matrix built from a yaw/pitch orbit at a fixed distance — enough
 * camera for this scene without a general-purpose lookAt and its inverse.
 */
function orbitView(yaw: number, pitch: number, distance: number) {
  const cy = Math.cos(yaw)
  const sy = Math.sin(yaw)
  const cp = Math.cos(pitch)
  const sp = Math.sin(pitch)

  // R = Rx(pitch) · Ry(yaw), then translate along the camera's -Z.
  // prettier-ignore
  return new Float32Array([
    cy,       sp * sy,  cp * sy,  0,
    0,        cp,      -sp,       0,
    -sy,      sp * cy,  cp * cy,  0,
    0,        0,       -distance, 1
  ])
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
}

/**
 * Builds the whole scene as three interleaved buffers of `[x, y, z, r, g, b,
 * seed]`: the lattice lines, the nodes at every intersection, and the struts
 * that tie the tiers together. All static — the motion lives in the shader.
 */
function buildGeometry() {
  const lines: number[] = []
  const points: number[] = []
  const struts: number[] = []

  const at = (i: number) => -SPAN + (2 * SPAN * i) / (N - 1)

  TIERS.forEach((tier, t) => {
    const [r, g, b] = tier.color
    const seed = t * 2.1
    const push = (out: number[], x: number, z: number) => {
      out.push(x, tier.y, z, r, g, b, seed)
    }

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        push(points, at(i), at(j))

        // One segment per gap, in each direction.
        if (j < N - 1) {
          push(lines, at(i), at(j))
          push(lines, at(i), at(j + 1))
        }
        if (i < N - 1) {
          push(lines, at(i), at(j))
          push(lines, at(i + 1), at(j))
        }
      }
    }

    // Struts down to the tier below, on a coarse subgrid so they stay legible.
    const below = TIERS[t + 1]
    if (below) {
      const step = 3
      for (let i = 0; i < N; i += step) {
        for (let j = 0; j < N; j += step) {
          struts.push(at(i), tier.y, at(j), r, g, b, seed)
          struts.push(
            at(i),
            below.y,
            at(j),
            below.color[0],
            below.color[1],
            below.color[2],
            (t + 1) * 2.1
          )
        }
      }
    }
  })

  return {
    lines: new Float32Array(lines),
    points: new Float32Array(points),
    struts: new Float32Array(struts)
  }
}

type Geometry = ReturnType<typeof buildGeometry>

/**
 * Everything that lives inside a GL context: the program, the three buffers,
 * and the attribute/uniform locations.
 *
 * Separated from the effect because it has to be rebuildable. A WebGL context
 * can be taken away at any time — the driver resets, the tab is backgrounded
 * too long, the GPU process restarts — and when it comes back every object
 * created against the old one is gone. Anything that treats setup as a
 * once-per-mount step leaves a permanently blank canvas the first time that
 * happens.
 */
type Scene = ReturnType<typeof buildScene>

function buildScene(gl: WebGLRenderingContext, geometry: Geometry) {
  const program = gl.createProgram()
  const vs = compile(gl, gl.VERTEX_SHADER, VERT)
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
  if (!program || !vs || !fs) return null

  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)

  const buffers = {
    lines: gl.createBuffer(),
    points: gl.createBuffer(),
    struts: gl.createBuffer()
  }
  for (const key of ['lines', 'points', 'struts'] as const) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers[key])
    gl.bufferData(gl.ARRAY_BUFFER, geometry[key], gl.STATIC_DRAW)
  }

  const aPos = gl.getAttribLocation(program, 'aPos')
  const aColor = gl.getAttribLocation(program, 'aColor')
  const aSeed = gl.getAttribLocation(program, 'aSeed')

  const STRIDE = 7 * 4
  const bind = (buffer: WebGLBuffer | null) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, STRIDE, 0)
    gl.enableVertexAttribArray(aColor)
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, STRIDE, 12)
    gl.enableVertexAttribArray(aSeed)
    gl.vertexAttribPointer(aSeed, 1, gl.FLOAT, false, STRIDE, 24)
  }

  gl.enable(gl.BLEND)

  return {
    program,
    vs,
    fs,
    buffers,
    bind,
    uProj: gl.getUniformLocation(program, 'uProj'),
    uView: gl.getUniformLocation(program, 'uView'),
    uTime: gl.getUniformLocation(program, 'uTime'),
    uAlpha: gl.getUniformLocation(program, 'uAlpha')
  }
}

function destroyScene(gl: WebGLRenderingContext, scene: Scene) {
  // Nothing to release if the context is already gone — the objects went with
  // it, and calling into a lost context just logs warnings.
  if (!scene || gl.isContextLost()) return
  for (const buffer of Object.values(scene.buffers)) gl.deleteBuffer(buffer)
  gl.deleteProgram(scene.program)
  gl.deleteShader(scene.vs)
  gl.deleteShader(scene.fs)
}

export function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    const gl =
      (canvas.getContext('webgl', {
        alpha: true,
        antialias: true,
        premultipliedAlpha: false
      }) as WebGLRenderingContext | null) ?? null
    if (!gl) return

    const geometry = buildGeometry()
    let scene = buildScene(gl, geometry)
    if (!scene) return

    // Blending has to follow the theme. Additive light on the dark background
    // makes the lattice glow where lines cross; the same additive pass on the
    // white background of the light theme only brightens white, so light mode
    // composites normally — and, on white, the same alpha reads far heavier, so
    // it is scaled down rather than up.
    let dark = document.documentElement.classList.contains('dark')
    const theme = new MutationObserver(() => {
      dark = document.documentElement.classList.contains('dark')
    })
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    let width = 0
    let height = 0
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      width = Math.max(1, Math.round(rect.width * dpr))
      height = Math.max(1, Math.round(rect.height * dpr))
      canvas.width = width
      canvas.height = height
      gl.viewport(0, 0, width, height)
    }
    resize()

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    // Pointer parallax, eased toward the target so the camera never snaps.
    let targetX = 0
    let targetY = 0
    let panX = 0
    let panY = 0
    const onPointer = (event: PointerEvent) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 2
      targetY = (event.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Skip the work entirely while the hero is scrolled away or the tab is
    // hidden — this runs on the busiest page on the site.
    let onscreen = true
    const visibility = new IntersectionObserver(
      entries => {
        onscreen = entries[0]?.isIntersecting ?? true
      },
      { threshold: 0 }
    )
    visibility.observe(canvas)

    let frame = 0
    let time = 0
    let last = performance.now()

    const render = (now: number) => {
      frame = requestAnimationFrame(render)

      const delta = Math.min((now - last) / 1000, 0.05)
      last = now
      if (!scene || gl.isContextLost() || !onscreen || document.hidden) return

      // Reduced motion still gets the figure, just held still.
      if (!reduced.matches) time += delta

      panX += (targetX - panX) * 0.045
      panY += (targetY - panY) * 0.045

      const yaw = 0.55 + time * 0.06 + panX * 0.22
      const pitch = 0.44 + panY * 0.1

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.blendFunc(gl.SRC_ALPHA, dark ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA)
      const gain = dark ? 1 : 0.72

      gl.uniformMatrix4fv(
        scene.uProj,
        false,
        perspective(0.9, width / height, 0.1, 100)
      )
      gl.uniformMatrix4fv(scene.uView, false, orbitView(yaw, pitch, 6.8))
      gl.uniform1f(scene.uTime, time)

      scene.bind(scene.buffers.struts)
      gl.uniform1f(scene.uAlpha, 0.55 * gain)
      gl.drawArrays(gl.LINES, 0, geometry.struts.length / 7)

      scene.bind(scene.buffers.lines)
      gl.uniform1f(scene.uAlpha, 0.6 * gain)
      gl.drawArrays(gl.LINES, 0, geometry.lines.length / 7)

      scene.bind(scene.buffers.points)
      gl.uniform1f(scene.uAlpha, 0.6 * gain)
      gl.drawArrays(gl.POINTS, 0, geometry.points.length / 7)
    }
    frame = requestAnimationFrame(render)

    // Losing the context is normal, not exceptional. Calling preventDefault is
    // what tells the browser we intend to recover — without it `contextrestored`
    // never fires and the hero stays blank for the rest of the visit.
    const onLost = (event: Event) => {
      event.preventDefault()
      scene = null
    }
    const onRestored = () => {
      scene = buildScene(gl, geometry)
      resize()
    }
    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      visibility.disconnect()
      theme.disconnect()
      window.removeEventListener('pointermove', onPointer)
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      destroyScene(gl, scene)

      // Deliberately NOT calling `WEBGL_lose_context.loseContext()` here.
      // `getContext` caches one context per <canvas>, and a context killed that
      // way stays dead: every later `getContext` on the element hands back the
      // same lost object. Any remount onto the same element — React's
      // development double-invoke of effects does exactly this — then rebuilds
      // against a corpse and renders nothing. Dropping the references is enough;
      // the context goes when the element does.
    }
  }, [])

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute -top-[16%] -right-[6%] -z-1 block h-[118%] w-[58%] [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent_0%,black_34%),linear-gradient(to_bottom,black_72%,transparent_100%)] [-webkit-mask-composite:source-in] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_34%),linear-gradient(to_bottom,black_72%,transparent_100%)] max-[60rem]:hidden"
      aria-hidden="true"
      role="presentation"
    />
  )
}
