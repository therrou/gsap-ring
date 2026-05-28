import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Route } from "./+types/test";
import {
  RING_CARD_COUNT,
  RING_FEATURED_INDEX,
  createRingScene,
  type RingSceneController,
} from "../lib/ring-scene/scene";

gsap.registerPlugin(ScrollTrigger);

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
const ZOOM_END = 0.4;
const STACK_START = 0.36;
const STACK_END = 0.74;
const ISO_START = 0.7;
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

export default function TestRoute() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [phase, setPhase] = useState<Phase>("ring");
  const [currentCategory, setCurrentCategory] = useState(1);

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
    const scene: RingSceneController = createRingScene({
      canvas: canvasEl,
      imageSources: IMAGE_SOURCES,
    });

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

      if (sceneState.stackScroll > 0.6 && sceneState.isoScroll < 0.4) {
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
      cancelAnimationFrame(rafId);
      ro.disconnect();
      canvasEl.removeEventListener("pointermove", handlePointerMove);
      canvasEl.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("resize", handleResize);
      scene.destroy();
    };
  }, []);

  return (
    <main className="ogl-ring-page">
      <header className="ogl-ring-topbar">
        <span className="ogl-ring-mark">◎ Atelier 24</span>
        <nav className="ogl-ring-nav" aria-label="Sections">
          <a href="#work">Work</a>
          <a href="#process">Process</a>
          <a href="#studio">Studio</a>
          <a href="#contact">Contact</a>
        </nav>
        <ul className="ogl-ring-phases" aria-label="Current phase">
          {phaseList.map((entry) => (
            <li key={entry.id} className={entry.id === phase ? "is-active" : undefined}>
              {entry.label}
            </li>
          ))}
        </ul>
      </header>

      <section className="ogl-ring-stage" ref={stageRef}>
        <canvas ref={canvasRef} className="ogl-ring-canvas" />

        <div className="ogl-ring-hero-text" ref={heroRef}>
          <h1>The future is built on Artificial Intelligence.</h1>
          <p className="ogl-ring-cta">SCROLL TO EXPLORE</p>
        </div>

        <div className="ogl-ring-panel" ref={panelRef} aria-hidden={phase === "ring"}>
          <span className="ogl-ring-panel-label">Architecture</span>
          <span className="ogl-ring-panel-count">{String(13).padStart(2, "0")}</span>
          <ul className="ogl-ring-panel-list">
            {CATEGORIES.map((category, index) => (
              <li
                key={category}
                className={index === currentCategory ? "is-active" : undefined}
              >
                <span>{category}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="ogl-ring-progress" aria-hidden="true">
          <span className="ogl-ring-progress-dot" />
        </div>
      </section>

      <section className="ogl-ring-footer">
        <p>{RING_CARD_COUNT} cards · featured #{RING_FEATURED_INDEX} · scroll back to reverse</p>
      </section>
    </main>
  );
}
