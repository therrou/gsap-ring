import type { Route } from "./+types/test";
import { RingExperience } from "../components/ring-experience";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "OGL Image Ring" },
    {
      name: "description",
      content:
        "High-fidelity WebGL replication of the example-2 image-ring flow: intro, ring, zoom, album, spread.",
    },
  ];
}

export default function TestRoute() {
  // Same experience as the landing page, with the live Scene tuner enabled.
  return <RingExperience showTuner />;
}
