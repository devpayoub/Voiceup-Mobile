export function relativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const AVATAR_COLORS = [
  { bg: "#dbe1ff", fg: "#00174b" },
  { bg: "#ffddb8", fg: "#653e00" },
  { bg: "#d3e4fe", fg: "#0b1c30" },
  { bg: "#dce9ff", fg: "#0051d5" },
  { bg: "#cbdbf5", fg: "#213145" },
];

export function avatarColor(seed: string): { bg: string; fg: string } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function memberSince(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

const CATEGORY_ICONS: Record<string, string> = {
  water: "water-drop",
  electricity: "bolt",
  internet: "wifi",
  telecom: "cell-tower",
  gas: "local-fire-department",
  transport: "directions-bus",
};

export function categoryIcon(name: string): string {
  return CATEGORY_ICONS[name.trim().toLowerCase()] || "category";
}
