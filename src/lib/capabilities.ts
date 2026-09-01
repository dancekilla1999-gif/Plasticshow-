/**
 * Device capability probe. Heavy effects (WebGL hero, custom cursor, hover
 * distortion) are opt-in per device rather than per breakpoint, so a low-end
 * phone and a low-end laptop are treated the same way.
 */
export type Capabilities = {
  reducedMotion: boolean;
  /** Fine pointer + hover — i.e. a real mouse, not a touchscreen. */
  pointerFine: boolean;
  /** Enough cores/memory and a fine pointer to justify shader work. */
  allowHeavy: boolean;
  supportsWebGL: boolean;
  /** The visitor asked the OS to economise on traffic. */
  saveData: boolean;
};

let cached: Capabilities | null = null;

export function getCapabilities(): Capabilities {
  if (cached) return cached;

  if (typeof window === 'undefined') {
    return {
      reducedMotion: false,
      pointerFine: false,
      allowHeavy: false,
      supportsWebGL: false,
      saveData: false,
    };
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointerFine = window.matchMedia('(pointer: fine) and (hover: hover)').matches;

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const saveData =
    (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ?? false;

  let supportsWebGL = false;
  try {
    const canvas = document.createElement('canvas');
    supportsWebGL = Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    supportsWebGL = false;
  }

  cached = {
    reducedMotion,
    pointerFine,
    supportsWebGL,
    saveData,
    allowHeavy: !reducedMotion && !saveData && supportsWebGL && cores >= 4 && memory >= 4,
  };

  return cached;
}
