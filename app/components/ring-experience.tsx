import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import {
  DEFAULT_RING_CONFIG,
  RING_CARD_COUNT,
  createRingScene,
  type RingSceneConfig,
  type RingSceneController,
} from "../lib/ring-scene/scene";

// ScrollSmoother (free in GSAP 3.13+) gives the Lenis-style inertial scroll the
// reference uses; it drives ScrollTrigger off the same smoothed scroll position.
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const IMAGE_SOURCES = Array.from(
  { length: RING_CARD_COUNT },
  (_, index) => `https://picsum.photos/seed/ring2-${index + 1}/360/480`,
);

/**
 * Total scroll length the pin covers, in pixels. The scene runs one continuous
 * flow: an on-mount intro (cards appear → centred row → ring) handled inside the
 * WebGL scene, then scroll drives these three overlapping phases:
 *
 *   0.00 → 0.45  zoom  (ring → featured card centred)
 *   0.40 → 0.70  stack (cards gather into the album behind featured)
 *   0.65 → 1.00  iso   (album expands + spreads into the diagonal row)
 */
const SCROLL_LENGTH = 2600;
const ZOOM_END = 0.45;
const STACK_START = 0.4;
const STACK_END = 0.7;
const ISO_START = 0.65;
const ISO_END = 1.0;

function mapProgress(p: number, start: number, end: number) {
  if (end <= start) return p >= start ? 1 : 0;
  return Math.min(1, Math.max(0, (p - start) / (end - start)));
}

// Live-tweak sliders for the debug tuner — keyed to RingSceneConfig fields.
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

export type RingExperienceProps = {
  /** Show the live "Scene tuner" debug panel (dev only). */
  showTuner?: boolean;
};

/**
 * The full WebGL image-ring experience: on-mount intro → idle ring (hoverable) →
 * scroll-driven zoom → album → spread (hoverable). Used as the landing page and
 * on /test. All WebGL work is inside the effect (client-only / SSR-safe).
 */
export function RingExperience({ showTuner = false }: RingExperienceProps) {
  const smoothWrapperRef = useRef<HTMLDivElement | null>(null);
  const smoothContentRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<RingSceneController | null>(null);
  const [debugConfig, setDebugConfig] = useState<RingSceneConfig>(DEFAULT_RING_CONFIG);
  const [debugScrub, setDebugScrub] = useState(0);
  const [showDebug, setShowDebug] = useState(showTuner);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
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
    const sceneState = { isoScroll: 0, intro: 0 };

    // On-mount intro: the WebGL scene animates cards from scattered → centred
    // row → onto the ring as `intro` ramps 0→1 (the bundle's `introProgress`).
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
    const ro = new ResizeObserver(() => handleResize());
    ro.observe(stageEl);
    window.addEventListener("resize", handleResize);
    const rafId = requestAnimationFrame(handleResize);

    function handlePointerMove(event: PointerEvent) {
      const rect = canvasEl.getBoundingClientRect();
      pointerState.x = event.clientX - (rect.left + rect.width * 0.5);
      pointerState.y = rect.top + rect.height * 0.5 - event.clientY;
      pointerState.inside = true;
      scene.setPointer(pointerState);

      // Hover-pick is only meaningful once the cards have spread into the row.
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
          sceneState.isoScroll = iso;
          scene.setProgress({ zoom, stack, iso });
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

  function updateConfig(key: keyof RingSceneConfig, value: number) {
    setDebugConfig((prev) => ({ ...prev, [key]: value }));
    sceneRef.current?.setConfig({ [key]: value });
  }

  // Manually drive the scene to a scroll position to inspect a phase. The next
  // real scroll re-takes control via ScrollTrigger.
  function scrubTo(p: number) {
    setDebugScrub(p);
    sceneRef.current?.setProgress({
      zoom: mapProgress(p, 0, ZOOM_END),
      stack: mapProgress(p, STACK_START, STACK_END),
      iso: mapProgress(p, ISO_START, ISO_END),
    });
  }

  return (
    <>
      {showTuner &&
        (showDebug ? (
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
          <button type="button" className="ring-debug-toggle" onClick={() => setShowDebug(true)}>
            Tune
          </button>
        ))}

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
