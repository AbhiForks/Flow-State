import { initials } from "@/lib/format";
import { userGradient } from "@/lib/colors";

const SIZES = {
  sm: 26,
  md: 34,
  lg: 44,
} as const;

export function Avatar({ name, size = "md" }: { name: string; size?: keyof typeof SIZES }) {
  const d = SIZES[size];
  return (
    <span
      className="avatar"
      title={name}
      style={{
        width: d,
        height: d,
        background: userGradient(name),
        fontSize: Math.round(d * 0.38),
      }}
    >
      <span className="av-initials">{initials(name)}</span>
    </span>
  );
}
