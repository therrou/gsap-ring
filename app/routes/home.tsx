import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import type { Route } from "./+types/home";
import { buildRingTransforms } from "../lib/ring-layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "GSAP 3D Ring Showcase" },
    { name: "description", content: "3D image ring with live rotation debugger controls" },
  ];
}

type DebugControls = {
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  spinSpeed: number;
  radius: number;
  depth: number;
  centerOffsetZ: number;
  cardTwist: number;
};

const DEFAULT_CONTROLS: DebugControls = {
  rotationX: 64,
  rotationY: 0,
  rotationZ: 0,
  spinSpeed: 0.25,
  radius: 350,
  depth: 115,
  centerOffsetZ: 0,
  cardTwist: 0,
};

const FRAME_SOURCES = [
  "https://picsum.photos/seed/ring-01/320/420",
  "https://picsum.photos/seed/ring-02/320/420",
  "https://picsum.photos/seed/ring-03/320/420",
  "https://picsum.photos/seed/ring-04/320/420",
  "https://picsum.photos/seed/ring-05/320/420",
  "https://picsum.photos/seed/ring-06/320/420",
  "https://picsum.photos/seed/ring-07/320/420",
  "https://picsum.photos/seed/ring-08/320/420",
  "https://picsum.photos/seed/ring-09/320/420",
  "https://picsum.photos/seed/ring-10/320/420",
];

const IMAGE_SOURCES = Array.from({ length: 24 }, (_, index) => FRAME_SOURCES[index % FRAME_SOURCES.length]);

export default function Home() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<Array<HTMLDivElement | null>>([]);
  const [controls, setControls] = useState<DebugControls>(DEFAULT_CONTROLS);
  const ringImages = useMemo(() => IMAGE_SOURCES, []);

  useEffect(() => {
    const stage = stageRef.current;
    const ring = ringRef.current;
    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];

    if (!stage || !ring || cards.length === 0) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      gsap.set(ring, {
        transformStyle: "preserve-3d",
        rotationX: controls.rotationX,
        rotationY: controls.rotationY,
        rotationZ: controls.rotationZ,
      });

      const transforms = buildRingTransforms({
        count: cards.length,
        radius: controls.radius,
        depthWarp: controls.depth,
      });

      cards.forEach((card, index) => {
        const transform = transforms[index];

        gsap.set(card, {
          xPercent: -50,
          yPercent: -50,
          x: transform.x,
          y: transform.y,
          z: transform.z + controls.centerOffsetZ,
          rotationZ: transform.faceRotationZ + controls.cardTwist,
          autoAlpha: 1,
        });
      });
    }, stage);

    let spinningRotation = controls.rotationZ;
    const tick = () => {
      if (reduceMotion) {
        return;
      }

      spinningRotation += controls.spinSpeed * gsap.ticker.deltaRatio(60);
      gsap.set(ring, {
        rotationX: controls.rotationX,
        rotationY: controls.rotationY,
        rotationZ: spinningRotation,
      });
    };

    if (!reduceMotion && controls.spinSpeed !== 0) {
      gsap.ticker.add(tick);
    }

    return () => {
      gsap.ticker.remove(tick);
      ctx.revert();
    };
  }, [controls, ringImages]);

  return (
    <main className="ring-page">
      <aside className="debug-panel">
        <strong>3D Ring Debugger</strong>
        <RangeControl
          label="Rotation X"
          min={-180}
          max={180}
          step={1}
          value={controls.rotationX}
          onChange={(value) => {
            setControls((previous) => ({ ...previous, rotationX: value }));
          }}
        />
        <RangeControl
          label="Rotation Y"
          min={-180}
          max={180}
          step={1}
          value={controls.rotationY}
          onChange={(value) => {
            setControls((previous) => ({ ...previous, rotationY: value }));
          }}
        />
        <RangeControl
          label="Rotation Z"
          min={-180}
          max={180}
          step={1}
          value={controls.rotationZ}
          onChange={(value) => {
            setControls((previous) => ({ ...previous, rotationZ: value }));
          }}
        />
        <RangeControl
          label="Auto Spin"
          min={-2}
          max={2}
          step={0.01}
          value={controls.spinSpeed}
          onChange={(value) => {
            setControls((previous) => ({ ...previous, spinSpeed: value }));
          }}
        />
        <RangeControl
          label="Ring Radius"
          min={220}
          max={460}
          step={1}
          value={controls.radius}
          onChange={(value) => {
            setControls((previous) => ({ ...previous, radius: value }));
          }}
        />
        <RangeControl
          label="Depth Warp"
          min={0}
          max={220}
          step={1}
          value={controls.depth}
          onChange={(value) => {
            setControls((previous) => ({ ...previous, depth: value }));
          }}
        />
        <RangeControl
          label="Center Offset Z"
          min={-300}
          max={300}
          step={1}
          value={controls.centerOffsetZ}
          onChange={(value) => {
            setControls((previous) => ({ ...previous, centerOffsetZ: value }));
          }}
        />
        <RangeControl
          label="Card Twist"
          min={-180}
          max={180}
          step={1}
          value={controls.cardTwist}
          onChange={(value) => {
            setControls((previous) => ({ ...previous, cardTwist: value }));
          }}
        />
        <button
          type="button"
          onClick={() => {
            setControls(DEFAULT_CONTROLS);
          }}
        >
          Reset Controls
        </button>
      </aside>

      <section className="ring-section">
        <div className="ring-stage" ref={stageRef}>
          <div className="image-ring" ref={ringRef}>
            {ringImages.map((src, index) => (
              <div
                className="ring-card"
                key={`${src}-${index}`}
                ref={(node) => {
                  cardsRef.current[index] = node;
                }}
              >
                <img src={src} alt={`Ring visual ${index + 1}`} className="ring-card-image" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

type RangeControlProps = {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
};

function RangeControl({ label, min, max, step, value, onChange }: RangeControlProps) {
  return (
    <label>
      <span>
        {label}: <em>{value.toFixed(step < 1 ? 2 : 0)}</em>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => {
          onChange(Number(event.target.value));
        }}
      />
    </label>
  );
}
