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
 * WebGL scene, then scroll drives these four overlapping phases:
 *
 *   0.00 → 0.38  zoom  (ring → featured fully scaled up + centred)
 *   0.38 → 0.42  (settle beat: featured held big & centred before the hand-off)
 *   0.42 → 0.64  stack (ring fades/swings out; deck forms behind featured)
 *   0.62 → 0.82  row   (album → flat horizontal fronto-parallel row, Image #11)
 *   0.80 → 1.00  iso   (flat row → diagonal slab spread, Image #12)
 *
 * The zoom is a COMPLETE phase before the stack — matching the bundle, where
 * `zoomProgress` (scale `bezier.inOutZoom` 1→3.7 + rotate featured to centre)
 * finishes before `stackProgress` (the ring fade + deck) begins. No overlap, so
 * the featured card is fully zoomed and centred before the deck enters / the ring
 * fades — otherwise the deck arrives and the neighbours vanish mid-zoom.
 */
const SCROLL_LENGTH = 3200;
const ZOOM_END = 0.38;
const STACK_START = 0.42;
const STACK_END = 0.64;
const ROW_START = 0.62;
const ROW_END = 0.82;
const ISO_START = 0.8;
const ISO_END = 1.0;

function mapProgress(p: number, start: number, end: number) {
  if (end <= start) return p >= start ? 1 : 0;
  return Math.min(1, Math.max(0, (p - start) / (end - start)));
}

// Numeric (slider-backed) config keys — excludes the colour field `borderColor`.
type NumericConfigKey = {
  [K in keyof RingSceneConfig]: RingSceneConfig[K] extends number ? K : never;
}[keyof RingSceneConfig];

// Live-tweak sliders for the debug tuner — keyed to numeric RingSceneConfig fields.
const DEBUG_SLIDERS: {
  key: NumericConfigKey;
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
  { key: "splayAmount", label: "Side splay", min: 0, max: 300, step: 5 },
  { key: "splayFade", label: "Side fade", min: 0, max: 1, step: 0.05 },
  { key: "soloFadeEnd", label: "Solo fade end", min: 0.1, max: 0.9, step: 0.01 },
  { key: "reappearStart", label: "Reappear start", min: 0.1, max: 0.95, step: 0.01 },
  { key: "borderWidth", label: "Slab border px", min: 0, max: 4, step: 0.1 },
  { key: "slabEdge", label: "Slab edge", min: 0, max: 1, step: 0.05 },
  { key: "stackGapTight", label: "Stack gap tight", min: 0.5, max: 2, step: 0.05 },
  { key: "stackGapOpen", label: "Stack gap open", min: 1, max: 4, step: 0.1 },
  { key: "glassCenter", label: "Glass center", min: 0, max: 1, step: 0.02 },
  { key: "glassStrength", label: "Glass strength", min: 0, max: 0.3, step: 0.005 },
  { key: "glassRim", label: "Glass rim", min: 0, max: 2, step: 0.05 },
  { key: "introFadeEnd", label: "Intro · fade end", min: 0.1, max: 0.9, step: 0.01 },
  { key: "introCollapseEnd", label: "Intro · collapse end", min: 0.2, max: 0.95, step: 0.01 },
  { key: "introRingStart", label: "Intro · ring start", min: 0.2, max: 0.95, step: 0.01 },
  { key: "introGap", label: "Intro · grid gap", min: 0, max: 120, step: 2 },
];

// Live scroll-schedule thresholds (channel start/end in pin progress 0..1).
type Schedule = {
  zoomEnd: number;
  stackStart: number;
  stackEnd: number;
  rowStart: number;
  rowEnd: number;
  isoStart: number;
};
const DEFAULT_SCHEDULE: Schedule = {
  zoomEnd: ZOOM_END,
  stackStart: STACK_START,
  stackEnd: STACK_END,
  rowStart: ROW_START,
  rowEnd: ROW_END,
  isoStart: ISO_START,
};
const SCHEDULE_SLIDERS: { key: keyof Schedule; label: string }[] = [
  { key: "zoomEnd", label: "Zoom end" },
  { key: "stackStart", label: "Stack start" },
  { key: "stackEnd", label: "Stack end" },
  { key: "rowStart", label: "Row start" },
  { key: "rowEnd", label: "Row end" },
  { key: "isoStart", label: "Spread start" },
];

// gsap eases offered for the intro tween curve.
const INTRO_EASES = [
  "power2.out",
  "power1.out",
  "power3.out",
  "power4.out",
  "expo.out",
  "back.out(1.7)",
  "elastic.out(1, 0.5)",
  "sine.inOut",
  "power2.inOut",
  "none",
];

// Channels shown in the live "current step" readout (order = sequence order).
const STATUS_CHANNELS: { key: "intro" | "zoom" | "stack" | "row" | "iso"; label: string }[] = [
  { key: "intro", label: "0 Intro" },
  { key: "zoom", label: "2 Zoom" },
  { key: "stack", label: "3 Stack" },
  { key: "row", label: "4 Row" },
  { key: "iso", label: "5 Spread" },
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
  const [debugIntro, setDebugIntro] = useState(1);
  const [showDebug, setShowDebug] = useState(showTuner);
  const [showLabels, setShowLabels] = useState(showTuner);
  const labelsRef = useRef<HTMLDivElement | null>(null);
  const statusRef = useRef<HTMLDivElement | null>(null);
  // Read inside the rAF tick without re-subscribing the loop.
  const showLabelsRef = useRef(showLabels);
  showLabelsRef.current = showLabels;
  // When the tuner mounts we don't want the on-mount intro tween to keep driving
  // `intro` while the user scrubs the Intro slider; the effect parks it here.
  const introTweenRef = useRef<gsap.core.Tween | null>(null);
  // Intro tween "speed" (duration, s) + "curve" (ease). Refs feed the replay
  // closure inside the effect without re-running it.
  const [introDuration, setIntroDuration] = useState(4);
  const [introEase, setIntroEase] = useState("sine.inOut");
  const introDurationRef = useRef(introDuration);
  introDurationRef.current = introDuration;
  const introEaseRef = useRef(introEase);
  introEaseRef.current = introEase;
  // Set inside the effect to a closure that replays the intro from 0.
  const replayIntroRef = useRef<(() => void) | null>(null);
  // Live scroll-schedule; ref feeds the ScrollTrigger onUpdate closure.
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);
  const scheduleRef = useRef(schedule);
  scheduleRef.current = schedule;

  // Lightbox: clicking a card in the final spread opens its image near-fullscreen.
  // `rect` is the clicked card's on-screen box so the modal can grow from it.
  const smootherRef = useRef<ScrollSmoother | null>(null);
  const [lightbox, setLightbox] = useState<{ src: string; rect: LightboxRect } | null>(null);
  function closeLightbox() {
    setLightbox(null);
    smootherRef.current?.paused(false);
  }

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
    smootherRef.current = smoother;

    const pointerState = { x: 0, y: 0, inside: false };
    const sceneState = { isoScroll: 0, intro: 0 };

    // On-mount intro: the WebGL scene animates cards from scattered → centred
    // row → onto the ring as `intro` ramps 0→1 (the bundle's `introProgress`).
    function playIntro() {
      introTweenRef.current?.kill();
      sceneState.intro = 0;
      scene.setProgress({ intro: 0 });
      setDebugIntro(0);
      introTweenRef.current = gsap.to(sceneState, {
        intro: 1,
        duration: prefersReducedMotion ? 0 : introDurationRef.current,
        ease: introEaseRef.current,
        onUpdate: () => {
          scene.setProgress({ intro: sceneState.intro });
          setDebugIntro(sceneState.intro);
        },
      });
    }
    replayIntroRef.current = playIntro;
    playIntro();

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
        // Clickable in the spread → pointer cursor over a card.
        canvasEl.style.cursor = index != null ? "pointer" : "default";
      } else {
        scene.setHoveredIndex(-1);
        canvasEl.style.cursor = "default";
      }
    }

    function handlePointerLeave() {
      pointerState.inside = false;
      pointerState.x = 0;
      pointerState.y = 0;
      scene.setPointer(pointerState);
      scene.setHoveredIndex(-1);
    }

    // Click a card in the FINAL spread → open it in the lightbox, growing from
    // the card's on-screen box. Ignored in every earlier phase.
    function handleClick(event: MouseEvent) {
      if (sceneState.isoScroll <= 0.5) return;
      const index = scene.pickAt(event.clientX, event.clientY);
      if (index == null) return;
      const r = scene.getCardScreenRect(index);
      if (!r) return;
      smoother?.paused(true);
      setLightbox({
        src: `https://picsum.photos/seed/ring2-${r.imageIndex + 1}/900/1200`,
        rect: { left: r.left, top: r.top, width: r.width, height: r.height },
      });
    }

    canvasEl.addEventListener("pointermove", handlePointerMove);
    canvasEl.addEventListener("pointerleave", handlePointerLeave);
    canvasEl.addEventListener("click", handleClick);

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
          const s = scheduleRef.current;
          const zoom = mapProgress(p, 0, s.zoomEnd);
          const stack = mapProgress(p, s.stackStart, s.stackEnd);
          const row = mapProgress(p, s.rowStart, s.rowEnd);
          const iso = mapProgress(p, s.isoStart, ISO_END);
          sceneState.isoScroll = iso;
          scene.setProgress({ zoom, stack, row, iso });
        },
      });
    }

    // Debug number labels: one span per card, positioned imperatively each frame
    // from the scene's projected card centres (so they track any projection).
    const labelHost = labelsRef.current;
    const labelEls: HTMLSpanElement[] = [];
    if (labelHost) {
      for (let i = 0; i < RING_CARD_COUNT; i++) {
        const span = document.createElement("span");
        span.className = "ring-card-label";
        span.textContent = String(i);
        labelHost.appendChild(span);
        labelEls.push(span);
      }
    }

    // Live "current step" readout. Built lazily into the tuner's status node so
    // it survives the panel being hidden/shown (React recreates that node).
    type StatusDom = {
      host: HTMLDivElement;
      phase: HTMLDivElement;
      fills: HTMLDivElement[];
      vals: HTMLSpanElement[];
      rows: HTMLDivElement[];
    };
    let statusDom: StatusDom | null = null;
    function ensureStatus(): StatusDom | null {
      const host = statusRef.current;
      if (!host) return (statusDom = null);
      if (statusDom && statusDom.host === host && host.childElementCount > 0) return statusDom;
      host.replaceChildren();
      const phase = document.createElement("div");
      phase.className = "ring-status-phase";
      host.appendChild(phase);
      const fills: HTMLDivElement[] = [];
      const vals: HTMLSpanElement[] = [];
      const rows: HTMLDivElement[] = [];
      for (const ch of STATUS_CHANNELS) {
        const row = document.createElement("div");
        row.className = "ring-status-row";
        const label = document.createElement("span");
        label.className = "ring-status-label";
        label.textContent = ch.label;
        const bar = document.createElement("div");
        bar.className = "ring-status-bar";
        const fill = document.createElement("div");
        fill.className = "ring-status-fill";
        bar.appendChild(fill);
        const val = document.createElement("span");
        val.className = "ring-status-val";
        row.append(label, bar, val);
        host.appendChild(row);
        rows.push(row);
        fills.push(fill);
        vals.push(val);
      }
      statusDom = { host, phase, fills, vals, rows };
      return statusDom;
    }

    let lastTime = performance.now();
    function tick() {
      const now = performance.now();
      const delta = now - lastTime;
      lastTime = now;
      scene.update(delta);

      const status = ensureStatus();
      if (status) {
        const pr = scene.getProgress();
        const vals = [pr.intro, pr.zoom, pr.stack, pr.row, pr.iso];
        let phase = "1 · Idle ring (hoverable)";
        if (pr.intro < 1) phase = "0 · Intro (grid → row → ring)";
        else if (pr.iso > 0) phase = "5 · Diagonal slab spread";
        else if (pr.row > 0) phase = "4 · Flat horizontal row";
        else if (pr.stack > 0) phase = "3 · Stack / album (ring fades out)";
        else if (pr.zoom > 0) phase = "2 · Zoom (featured → centre)";
        status.phase.textContent = phase;
        for (let i = 0; i < vals.length; i++) {
          const v = vals[i];
          status.fills[i].style.width = `${Math.round(v * 100)}%`;
          status.vals[i].textContent = v.toFixed(2);
          status.rows[i].classList.toggle("is-active", v > 0.001 && v < 0.999);
        }
      }

      if (labelHost) {
        if (showLabelsRef.current) {
          const rect = canvasEl.getBoundingClientRect();
          for (const p of scene.getCardScreenPositions()) {
            const el = labelEls[p.index];
            if (!el) continue;
            el.style.display = p.visible ? "block" : "none";
            el.style.opacity = String(0.35 + 0.65 * p.opacity);
            el.style.transform = `translate(${rect.left + p.x}px, ${rect.top + p.y}px) translate(-50%, -50%)`;
          }
        } else {
          for (const el of labelEls) el.style.display = "none";
        }
      }
    }
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      replayIntroRef.current = null;
      introTweenRef.current?.kill();
      scrollTrigger?.kill();
      smoother?.kill();
      cancelAnimationFrame(rafId);
      ro.disconnect();
      canvasEl.removeEventListener("pointermove", handlePointerMove);
      canvasEl.removeEventListener("pointerleave", handlePointerLeave);
      canvasEl.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      smootherRef.current = null;
      for (const el of labelEls) el.remove();
      scene.destroy();
      sceneRef.current = null;
    };
  }, []);

  function updateConfig(key: keyof RingSceneConfig, value: number) {
    setDebugConfig((prev) => ({ ...prev, [key]: value }));
    sceneRef.current?.setConfig({ [key]: value });
  }

  // Manually drive the on-mount INTRO phase (scattered grid → centred row →
  // ring) to inspect it. We kill the auto intro tween so it stops fighting the
  // slider; reload the page to replay the automatic version.
  function scrubIntro(value: number) {
    introTweenRef.current?.kill();
    setDebugIntro(value);
    sceneRef.current?.setProgress({ intro: value });
  }

  // Manually drive the scene to a scroll position to inspect a phase. The next
  // real scroll re-takes control via ScrollTrigger.
  function scrubTo(p: number) {
    setDebugScrub(p);
    sceneRef.current?.setProgress({
      zoom: mapProgress(p, 0, schedule.zoomEnd),
      stack: mapProgress(p, schedule.stackStart, schedule.stackEnd),
      row: mapProgress(p, schedule.rowStart, schedule.rowEnd),
      iso: mapProgress(p, schedule.isoStart, ISO_END),
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

            <div className="ring-debug-status" ref={statusRef} />

            <label className="ring-debug-row ring-debug-check">
              <span>Card numbers</span>
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
              />
            </label>

            <label className="ring-debug-row">
              <span>Intro {debugIntro.toFixed(2)}</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.005}
                value={debugIntro}
                onChange={(e) => scrubIntro(Number(e.target.value))}
              />
            </label>

            <label className="ring-debug-row">
              <span>Intro speed {introDuration.toFixed(2)}s</span>
              <input
                type="range"
                min={0.2}
                max={5}
                step={0.1}
                value={introDuration}
                onChange={(e) => setIntroDuration(Number(e.target.value))}
              />
            </label>

            <label className="ring-debug-row">
              <span>Intro curve</span>
              <select value={introEase} onChange={(e) => setIntroEase(e.target.value)}>
                {INTRO_EASES.map((ease) => (
                  <option key={ease} value={ease}>
                    {ease}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="ring-debug-replay"
              onClick={() => replayIntroRef.current?.()}
            >
              ▶ Replay intro
            </button>

            <div className="ring-debug-section">Scroll schedule (p 0–1)</div>
            {SCHEDULE_SLIDERS.map((s) => (
              <label key={s.key} className="ring-debug-row">
                <span>
                  {s.label} {schedule[s.key].toFixed(2)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={schedule[s.key]}
                  onChange={(e) =>
                    setSchedule((prev) => ({ ...prev, [s.key]: Number(e.target.value) }))
                  }
                />
              </label>
            ))}

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

      {showTuner && <div className="ring-card-labels" ref={labelsRef} aria-hidden="true" />}

      {lightbox && (
        <Lightbox src={lightbox.src} rect={lightbox.rect} onClose={closeLightbox} />
      )}

      <div id="smooth-wrapper" ref={smoothWrapperRef}>
        <div id="smooth-content" ref={smoothContentRef}>
          <main className="ogl-ring-page">
            <section className="ogl-ring-stage" ref={stageRef}>
              <canvas ref={canvasRef} className="ogl-ring-canvas" />
          
            </section>
          </main>
        </div>
      </div>
    </>
  );
}

type LightboxRect = { left: number; top: number; width: number; height: number };

/**
 * Near-fullscreen image modal. On open it grows from `rect` (the clicked card's
 * on-screen box) to a centred, aspect-preserved frame with a soft blurred
 * backdrop — matching the project's clean, rounded, light aesthetic. Close via
 * backdrop click, the × button, or Escape (animates back into the card).
 */
function Lightbox({
  src,
  rect,
  onClose,
}: {
  src: string;
  rect: LightboxRect;
  onClose: () => void;
}) {
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const closingRef = useRef(false);

  // Centred, near-fullscreen target box preserving the card's 3:4 aspect.
  function targetRect(): LightboxRect {
    const margin = 0.92;
    const aspect = 3 / 4;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let width = vw * margin;
    let height = width / aspect;
    if (height > vh * margin) {
      height = vh * margin;
      width = height * aspect;
    }
    return { left: (vw - width) / 2, top: (vh - height) / 2, width, height };
  }

  // Grow-in from the clicked card's box.
  useEffect(() => {
    const frame = frameRef.current;
    const backdrop = backdropRef.current;
    if (!frame || !backdrop) return;
    const t = targetRect();
    gsap.set(backdrop, { opacity: 0 });
    gsap.set(frame, {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      borderRadius: 9,
    });
    const tl = gsap.timeline();
    tl.to(backdrop, { opacity: 1, duration: 0.45, ease: "power2.out" }, 0);
    tl.to(
      frame,
      {
        left: t.left,
        top: t.top,
        width: t.width,
        height: t.height,
        borderRadius: 16,
        duration: 0.65,
        ease: "expo.out",
      },
      0,
    );
    return () => {
      tl.kill();
    };
    // Mount-only: rect/src are fixed for this instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function close() {
    if (closingRef.current) return;
    closingRef.current = true;
    const frame = frameRef.current;
    const backdrop = backdropRef.current;
    if (!frame || !backdrop) {
      onClose();
      return;
    }
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(
      frame,
      {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        borderRadius: 9,
        duration: 0.5,
        ease: "power3.inOut",
      },
      0,
    );
    tl.to(backdrop, { opacity: 0, duration: 0.5, ease: "power2.in" }, 0.05);
  }

  // Latest `close` for the key listener + lock page scroll while open.
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div className="ring-lightbox" onClick={close}>
      <div className="ring-lightbox-backdrop" ref={backdropRef} style={{ opacity: 0 }} />
      <div
        className="ring-lightbox-frame"
        ref={frameRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          borderRadius: 9,
        }}
      >
        <img className="ring-lightbox-img" src={src} alt="" draggable={false} />
      </div>
      <button type="button" className="ring-lightbox-close" onClick={close} aria-label="Close">
        ×
      </button>
    </div>
  );
}
