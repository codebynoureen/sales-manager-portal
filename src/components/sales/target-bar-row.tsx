import { cn } from "@/lib/utils";

interface TargetBarRowProps {
  label: string;
  achievedPaisa: number;
  targetPaisa: number;
}

function formatLakh(paisa: number) {
  return `${(paisa / 100 / 100000).toFixed(1)}L`;
}

export function TargetBarRow({ label, achievedPaisa, targetPaisa }: TargetBarRowProps) {
  const pct = Math.min(100, Math.round((achievedPaisa / targetPaisa) * 100));
  const color = pct >= 75 ? "bg-success" : pct >= 50 ? "bg-warning" : "bg-danger";
  const textColor = pct >= 75 ? "text-success" : pct >= 50 ? "text-warning" : "text-danger";

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-40 shrink-0 text-sm text-text-dim">{label}</div>
      <div className="relative h-[22px] flex-1 overflow-hidden rounded-sm bg-surface3">
        <div className={cn("flex h-full items-center rounded-sm pl-2 transition-[width] duration-700", color)} style={{ width: `${pct}%` }}>
          <span className="text-[10px] font-bold text-white">{pct}%</span>
        </div>
      </div>
      <div className={cn("w-[110px] shrink-0 text-right font-mono text-sm font-semibold", textColor)}>
        {formatLakh(achievedPaisa)} / {formatLakh(targetPaisa)}
      </div>
    </div>
  );
}
