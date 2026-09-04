/** Format a kilobits-per-second rate for a glanceable label. */
export function formatKbps(kbps: number): string {
  if (!Number.isFinite(kbps) || kbps <= 0) return "0 bps";
  const bits = kbps * 1000;
  if (bits < 1000) return `${Math.round(bits)} bps`;
  if (bits < 1_000_000) return `${trimRate(bits / 1000)} Kbps`;
  if (bits < 1_000_000_000) return `${trimRate(bits / 1_000_000)} Mbps`;
  return `${trimRate(bits / 1_000_000_000)} Gbps`;
}

export function formatKbpsCompact(kbps: number): string {
  if (!Number.isFinite(kbps) || kbps <= 0) return "0";
  const bits = kbps * 1000;
  if (bits < 1000) return `${Math.round(bits)}`;
  if (bits < 1_000_000) return `${trimRate(bits / 1000)}K`;
  if (bits < 1_000_000_000) return `${trimRate(bits / 1_000_000)}M`;
  return `${trimRate(bits / 1_000_000_000)}G`;
}

/** Log-scaled 0–1 fill so LAN and WAN rates both read on a ring. */
export function ringProgress(kbps: number, ceilingKbps = 100_000): number {
  if (!Number.isFinite(kbps) || kbps <= 0) return 0;
  const ratio = Math.log10(1 + kbps) / Math.log10(1 + ceilingKbps);
  return Math.min(1, Math.max(0, ratio));
}

export function walkRate(current: number, min: number, max: number, step: number): number {
  const next = current + (Math.random() * 2 - 1) * step;
  return Math.min(max, Math.max(min, next));
}

function trimRate(value: number): string {
  const rounded = value >= 10 ? value.toFixed(0) : value.toFixed(1);
  return rounded.replace(/\.0$/, "");
}
