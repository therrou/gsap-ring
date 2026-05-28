import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "GSAP Split Row Showcase" },
    { name: "description", content: "Scattered grid that collapses on the Y axis into a centered row" },
  ];
}

export default function Home() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const stage = stageRef.current;
    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];

    if (!stage || cards.length === 0) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const rowLayout = buildRowLayout(cards.length, stage.clientWidth);

      if (reduceMotion) {
        gsap.set(cards, {
          xPercent: -50,
          yPercent: -50,
          autoAlpha: 1,
          x: (index) => rowLayout[index].x,
          y: 0,
        });
        return;
      }

      const scatterLayout = buildScatterLayout(cards.length, rowLayout, stage.clientHeight);

      gsap.set(cards, {
        xPercent: -50,
        yPercent: -50,
        autoAlpha: 0,
        x: (index) => scatterLayout[index].x,
        y: (index) => scatterLayout[index].y,
      });

      const introTimeline = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      introTimeline.to(cards, {
        autoAlpha: 1,
        duration: 0.5,
        stagger: {
          each: 0.03,
          from: "random",
        },
      });

      introTimeline.to(
        cards,
        {
          y: 0,
          duration: 1.1,
          ease: "power3.inOut",
        },
        "-=0.15",
      );
    }, stageRef);

    return () => ctx.revert();
  }, []);

  return (
    <main className="showcase-page">
      <section className="showcase-section">
        <div className="showcase-stage" ref={stageRef}>
          <p className="showcase-copy">Scattered grid, then collapse to a centered row.</p>
          {MESSI_IMAGES.map((src, index) => (
            <div
              className="showcase-card"
              key={`${src}-${index}`}
              ref={(node) => {
                cardsRef.current[index] = node;
              }}
            >
              <img src={src} alt={`Lionel Messi ${index + 1}`} className="showcase-face showcase-face-front" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

const MESSI_SOURCES = [
  "https://upload.wikimedia.org/wikipedia/commons/c/c1/Lionel_Messi_20180626.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/b/b8/Messi_vs_Nigeria_2018.jpg",
];

const MESSI_IMAGES = Array.from({ length: 24 }, (_, index) => {
  const source = MESSI_SOURCES[index % MESSI_SOURCES.length];
  return `${source}?v=${index + 1}`;
});

type RowPoint = {
  x: number;
};

type ScatterPoint = {
  x: number;
  y: number;
};

// Must match `.showcase-card` width / height in app/app.css.
const CARD_WIDTH = 72;
const CARD_HEIGHT = 96;
const ROW_GAP = 10;
const STAGE_PADDING = 24;

function buildRowLayout(count: number, stageWidth: number): RowPoint[] {
  const naturalSlot = CARD_WIDTH + ROW_GAP;
  const availableWidth = Math.max(CARD_WIDTH, stageWidth - STAGE_PADDING * 2);
  // Shrink the slot if the natural row would overflow the stage so the row
  // always stays inside; cards can overlap slightly on narrow viewports.
  const maxSlot = count > 1 ? availableWidth / (count - 1) : naturalSlot;
  const slotWidth = Math.min(naturalSlot, maxSlot);

  return Array.from({ length: count }, (_, index) => ({
    x: (index - (count - 1) / 2) * slotWidth,
  }));
}

function buildScatterLayout(
  count: number,
  rowLayout: RowPoint[],
  stageHeight: number,
): ScatterPoint[] {
  // Shuffle which row column each card belongs to so cards don't snap into
  // their natural left-to-right order during the collapse.
  const columnAssignment = shuffledIndices(count);
  const maxY = Math.max(0, stageHeight / 2 - CARD_HEIGHT / 2 - STAGE_PADDING);

  return Array.from({ length: count }, (_, index) => {
    const columnIndex = columnAssignment[index];
    return {
      x: rowLayout[columnIndex].x,
      y: randomBetween(-maxY, maxY),
    };
  });
}

function shuffledIndices(count: number): number[] {
  const indices = Array.from({ length: count }, (_, index) => index);
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const swapIndex = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[swapIndex]] = [indices[swapIndex], indices[i]];
  }
  return indices;
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}
