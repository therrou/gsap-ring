import type { Route } from "./+types/home";
import { RingExperience } from "../components/ring-experience";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Image Ring" },
    {
      name: "description",
      content:
        "Cards appear, gather to centre, and assemble into an interactive image ring that zooms, stacks into an album, and spreads.",
    },
  ];
}

export default function Home() {
  // The landing page IS the WebGL ring experience: the intro (cards appear →
  // centre → ring) now lives inside the scene, so it flows straight into the
  // scroll-driven zoom/album/spread — one continuous component.
  return <RingExperience />;
}
