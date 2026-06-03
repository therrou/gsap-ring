import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import type { Route } from "./+types/test";
import {
  DEFAULT_RING_CONFIG,
  RING_CARD_COUNT,
  RING_FEATURED_INDEX,
  createRingScene,
  type RingSceneConfig,
  type RingSceneController,
} from "../lib/ring-scene/scene";

// ScrollSmoother (free in GSAP 3.13+) gives the Lenis-style inertial scroll the
// reference uses; it drives ScrollTrigger off the same smoothed scroll position.
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export function meta({}: Route.MetaArgs) {
  return [
    { title: "OGL Image Ring" },
    {
      name: "description",
      content:
        "High-fidelity WebGL replication of the example-2 image-ring flow: ring idle, zoom, stack, iso.",
    },
  ];
}

const IMAGE_SOURCES = Array.from(
  { length: RING_CARD_COUNT },
  (_, index) => `https://picsum.photos/seed/ring2-${index + 1}/360/480`,
);

/**
 * Total scroll length the pin covers, in pixels. Split into three contiguous
 * phases that bleed slightly into one another so the transitions feel fluid:
 *
 *   0.00 → 0.40  zoom (ring → featured card)
 *   0.36 → 0.74  stack (deck collapses behind featured)
 *   0.70 → 1.00  iso  (deck rotates into a diagonal index)
 */
const SCROLL_LENGTH = 2600;
const ZOOM_END = 0.45;
const STACK_START = 0.4;
const STACK_END = 0.7;
const ISO_START = 0.65;
const ISO_END = 1.0;

const CATEGORIES = [
  "Specifications & Coordination",
  "Documentation & Permitting",
  "Compliance & Submission",
];

type Phase = "ring" | "zoom" | "stack" | "iso";

function phaseFromProgress(p: number): Phase {
  if (p < ZOOM_END * 0.25) return "ring";
  if (p < ZOOM_END) return "zoom";
  if (p < ISO_START) return "stack";
  return "iso";
}

function mapProgress(p: number, start: number, end: number) {
  if (end <= start) return p >= start ? 1 : 0;
  return Math.min(1, Math.max(0, (p - start) / (end - start)));
}

// Live-tweak sliders for the debug panel — keyed to RingSceneConfig fields.
const DEBUG_SLIDERS: {
  key: keyof RingSceneConfig;
  label: string;
  min: number;
  max: number;
  step: number;
}[] = [
  { key: "zoomScaleMax", label: "Zoom scale", min: 1, max: 5, step: 0.05 },
  { key: "rowScalePullback", label: "Spread scale", min: 0.1, max: 1.2, step: 0.01 },
  { key: "rowMarginFactor", label: "Spread length", min: 0.4, max: 3, step: 0.05 },
  { key: "tightScale", label: "Album tightness", min: 0.02, max: 0.6, step: 0.01 },
  { key: "spineTiltDeg", label: "Spine tilt °", min: -45, max: 45, step: 1 },
  { key: "containerLeanXDeg", label: "Deck lean °", min: -30, max: 30, step: 1 },
  { key: "baseTiltXDeg", label: "Ring tilt °", min: -20, max: 20, step: 1 },
  { key: "cornerRadius", label: "Corner radius", min: 0, max: 30, step: 0.5 },
  { key: "hoverSlide", label: "Hover slide", min: 0, max: 60, step: 1 },
];

export default function TestRoute() {
  const smoothWrapperRef = useRef<HTMLDivElement | null>(null);
  const smoothContentRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<RingSceneController | null>(null);
  const [phase, setPhase] = useState<Phase>("ring");
  const [currentCategory, setCurrentCategory] = useState(1);
  const [debugConfig, setDebugConfig] = useState<RingSceneConfig>(DEFAULT_RING_CONFIG);
  const [debugScrub, setDebugScrub] = useState(0);
  const [showDebug, setShowDebug] = useState(true);

  const phaseList = useMemo(
    () =>
      [
        { id: "ring", label: "Ring" },
        { id: "zoom", label: "Zoom" },
        { id: "stack", label: "Stack" },
        { id: "iso", label: "Index" },
      ] as const,
    [],
  );

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    const panel = panelRef.current;
    if (!stage || !canvas) return;

    const stageEl: HTMLDivElement = stage;
    const canvasEl: HTMLCanvasElement = canvas;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Inertial smooth scroll (Lenis-equivalent). Created before the pin so
    // ScrollTrigger reads the smoothed scroll position. Skipped for reduced
    // motion so those users get native, instant scrolling.
    const smoothWrapper = smoothWrapperRef.current;
    const smoothContent = smoothContentRef.current;
    let smoother: ScrollSmoother | null = null;
    if (!prefersReducedMotion && smoothWrapper && smoothContent) {
      smoother = ScrollSmoother.create({
        wrapper: smoothWrapper,
        content: smoothContent,
        smooth: 1,
        smoothTouch: 0.1,
        effects: false,
      });
    }

    const scene: RingSceneController = createRingScene({
      canvas: canvasEl,
      imageSources: IMAGE_SOURCES,
    });
    sceneRef.current = scene;

    const pointerState = { x: 0, y: 0, inside: false };
    const sceneState = { zoomScroll: 0, stackScroll: 0, isoScroll: 0, intro: 0 };

    const introTween = gsap.to(sceneState, {
      intro: 1,
      duration: prefersReducedMotion ? 0 : 1.6,
      ease: "power2.out",
      onUpdate: () => {
        scene.setProgress({ intro: sceneState.intro });
      },
    });

    function handleResize() {
      const rect = stageEl.getBoundingClientRect();
      scene.setSize(rect.width, rect.height);
    }
    handleResize();
    // ResizeObserver catches changes that don't fire window.resize (e.g.
    // scrollbar appearing once ScrollTrigger pins the stage and pushes the
    // footer content into existence). The window listener is the backup.
    const ro = new ResizeObserver(() => handleResize());
    ro.observe(stageEl);
    window.addEventListener("resize", handleResize);
    // One more pass on the next frame so layout is fully settled.
    const rafId = requestAnimationFrame(handleResize);

    function handlePointerMove(event: PointerEvent) {
      const rect = canvasEl.getBoundingClientRect();
      pointerState.x = event.clientX - (rect.left + rect.width * 0.5);
      pointerState.y = rect.top + rect.height * 0.5 - event.clientY;
      pointerState.inside = true;
      scene.setPointer(pointerState);

      // Hover-pick is only meaningful once the cards have spread into the
      // diagonal row (the iso channel). Before that they're collapsed/zooming.
      if (sceneState.isoScroll > 0.5) {
        const index = scene.pickAt(event.clientX, event.clientY);
        scene.setHoveredIndex(index ?? -1);
      } else {
        scene.setHoveredIndex(-1);
      }
    }

    function handlePointerLeave() {
      pointerState.inside = false;
      pointerState.x = 0;
      pointerState.y = 0;
      scene.setPointer(pointerState);
      scene.setHoveredIndex(-1);
    }

    canvasEl.addEventListener("pointermove", handlePointerMove);
    canvasEl.addEventListener("pointerleave", handlePointerLeave);

    // Hero & panel opacity are driven straight from the same scroll progress so
    // they're always in lock-step with the WebGL transitions (no React render
    // tearing between scene + DOM).
    function applyOverlayOpacity(p: number) {
      if (hero) {
        // Hero fades out as the ring starts to zoom.
        const heroFade = 1 - mapProgress(p, 0.04, 0.22);
        hero.style.opacity = `${heroFade}`;
        hero.style.transform = `translate(-50%, calc(-50% + ${(1 - heroFade) * -30}px))`;
      }
      if (panel) {
        // Panel fades in as we leave the ring and stays visible through iso.
        const panelFade = mapProgress(p, ZOOM_END * 0.7, ZOOM_END + 0.1);
        panel.style.opacity = `${panelFade}`;
        panel.style.transform = `translateY(${(1 - panelFade) * 16}px)`;
      }
    }
    applyOverlayOpacity(0);

    let scrollTrigger: ScrollTrigger | null = null;
    if (!prefersReducedMotion) {
      scrollTrigger = ScrollTrigger.create({
        trigger: stageEl,
        start: "top top",
        end: `+=${SCROLL_LENGTH}`,
        pin: true,
        scrub: 0.6,
        onUpdate: (self) => {
          const p = self.progress;
          const zoom = mapProgress(p, 0, ZOOM_END);
          const stack = mapProgress(p, STACK_START, STACK_END);
          const iso = mapProgress(p, ISO_START, ISO_END);
          sceneState.zoomScroll = zoom;
          sceneState.stackScroll = stack;
          sceneState.isoScroll = iso;
          scene.setProgress({ zoom, stack, iso });
          applyOverlayOpacity(p);

          const nextPhase = phaseFromProgress(p);
          setPhase((prev) => (prev === nextPhase ? prev : nextPhase));

          // Land on "Documentation & Permitting" (index 1) by the end of the
          // iso scroll — matches the reference screenshot where the centre
          // row is the active one. We briefly hover the previous and next
          // rows so the panel feels alive on the way in.
          if (iso <= 0) {
            setCurrentCategory((prev) => (prev === 1 ? prev : 1));
          } else if (iso < 0.35) {
            setCurrentCategory((prev) => (prev === 0 ? prev : 0));
          } else if (iso < 0.7) {
            setCurrentCategory((prev) => (prev === 2 ? prev : 2));
          } else {
            setCurrentCategory((prev) => (prev === 1 ? prev : 1));
          }
        },
      });
    }

    let lastTime = performance.now();
    function tick() {
      const now = performance.now();
      const delta = now - lastTime;
      lastTime = now;
      scene.update(delta);
    }
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      introTween.kill();
      scrollTrigger?.kill();
      smoother?.kill();
      cancelAnimationFrame(rafId);
      ro.disconnect();
      canvasEl.removeEventListener("pointermove", handlePointerMove);
      canvasEl.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("resize", handleResize);
      scene.destroy();
      sceneRef.current = null;
    };
  }, []);

  // ─── Debug panel handlers ──────────────────────────────────────────────────
  function updateConfig(key: keyof RingSceneConfig, value: number) {
    setDebugConfig((prev) => {
      const next = { ...prev, [key]: value };
      sceneRef.current?.setConfig({ [key]: value });
      return next;
    });
  }

  // Manually drive the scene to a scroll position for inspecting a phase. The
  // next real scroll re-takes control via ScrollTrigger.
  function scrubTo(p: number) {
    setDebugScrub(p);
    const scene = sceneRef.current;
    if (!scene) return;
    scene.setProgress({
      zoom: mapProgress(p, 0, ZOOM_END),
      stack: mapProgress(p, STACK_START, STACK_END),
      iso: mapProgress(p, ISO_START, ISO_END),
    });
    setPhase(phaseFromProgress(p));
  }

  return (
    <>
      {/* Fixed UI must live OUTSIDE the smoother: ScrollSmoother transforms the
          content, which would otherwise make position:fixed scroll with it. */}


      {showDebug ? (
        <div className="ring-debug">
          <div className="ring-debug-head">
            <strong>Scene tuner</strong>
            <button type="button" onClick={() => setShowDebug(false)} aria-label="Hide">
              ×
            </button>
          </div>

          <label className="ring-debug-row">
            <span>Scrub {debugScrub.toFixed(2)}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.005}
              value={debugScrub}
              onChange={(e) => scrubTo(Number(e.target.value))}
            />
          </label>

          {DEBUG_SLIDERS.map((s) => (
            <label key={s.key} className="ring-debug-row">
              <span>
                {s.label} {Number(debugConfig[s.key]).toFixed(2)}
              </span>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={debugConfig[s.key]}
                onChange={(e) => updateConfig(s.key, Number(e.target.value))}
              />
            </label>
          ))}
        </div>
      ) : (
        <button
          type="button"
          className="ring-debug-toggle"
          onClick={() => setShowDebug(true)}
        >
          Tune
        </button>
      )}

      <div id="smooth-wrapper" ref={smoothWrapperRef}>
        <div id="smooth-content" ref={smoothContentRef}>
          <main className="ogl-ring-page">

      <section className="ogl-ring-stage" ref={stageRef}>
        <canvas ref={canvasRef} className="ogl-ring-canvas" />
        <div className="ogl-ring-progress" aria-hidden="true">
          <span className="ogl-ring-progress-dot" />
        </div>
      </section>
          </main>
        </div>
      </div>
    </>
  );
}
