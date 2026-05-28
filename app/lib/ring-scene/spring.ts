/**
 * Critical-damped spring matching the helper in test-3.js (example-2 bundle).
 *
 *   force    = (target - damped) * stiffness
 *   force   -= velocity * damping
 *   velocity = velocity + force * dt
 *   damped   = damped + velocity * dt
 *
 * `dt` is in seconds (the source uses milliseconds and multiplies by 1e-3).
 * When `criticalDamping` is true, damping is set to 2 * sqrt(stiffness) which
 * removes oscillation — the deck-hover springs in example-2 do this with
 * stiffness 130.
 */
export type SpringOptions = {
  stiffness?: number;
  damping?: number;
  criticalDamping?: boolean;
  initial?: number;
};

export class Spring {
  target: number;
  damped: number;
  velocity = 0;
  stiffness: number;
  damping: number;

  constructor(options: SpringOptions = {}) {
    const { stiffness = 50, damping = 0.5, criticalDamping = false, initial = 0 } = options;
    this.stiffness = stiffness;
    this.damping = criticalDamping ? 2 * Math.sqrt(stiffness) : damping;
    this.target = initial;
    this.damped = initial;
  }

  step(deltaMs: number) {
    const dt = deltaMs * 1e-3;
    let force = (this.target - this.damped) * this.stiffness;
    force -= this.velocity * this.damping;
    this.velocity += force * dt;
    this.damped += this.velocity * dt;
    return this.damped;
  }

  set(value: number) {
    this.target = value;
    this.damped = value;
    this.velocity = 0;
  }
}
