import type { Route } from "./+types/test";
import { RingExperience } from "../components/ring-experience";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Debugger" },
    {
      name: "description",
      content:
        "debugger test page.",
    },
  ];
}

export default function TestRoute() {
  // Same experience as the landing page, with the live Scene tuner enabled.
  return <RingExperience showTuner />;
}
