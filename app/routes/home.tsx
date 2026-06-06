import type { Route } from "./+types/home";
import { RingExperience } from "../components/ring-experience";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Image Ring + GSAP" },
    {
      name: "description",
      content:
        ".",
    },
  ];
}

export default function Home() {
  // The landing page IS the WebGL ring experience: the intro (cards appear →
  // centre → ring) now lives inside the scene, so it flows straight into the
  // scroll-driven zoom/album/spread — one continuous component.
  return <RingExperience />;
}
