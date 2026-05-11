import { Lock } from "lucide-react";
import type { Mission, MissionProgress, MissionRun } from "@emoji-map/shared";

export function MissionProgressRow({
  run,
  mission,
  progress,
  isLocked,
}: {
  run: MissionRun;
  mission: Mission;
  progress?: MissionProgress;
  isLocked: boolean;
}) {
  const targetCount = mission.conditions.requiredPostCount;
  const currentCount = progress?.currentCount ?? 0;
  const percent = isLocked
    ? 0
    : Math.min((currentCount / targetCount) * 100, 100);

  return (
    <li
      className={`border-b border-black/5 py-3 last:border-b-0 ${
        isLocked ? "opacity-45" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-bg)] text-sm">
          {isLocked ? <Lock size={14} /> : "🎯"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-[var(--color-text)]">
              {mission.title}
            </p>
            <span className="shrink-0 text-xs text-[var(--color-text-sub)]">
              {isLocked
                ? "--"
                : progress?.completed
                  ? "done"
                  : `${currentCount}/${targetCount}`}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--color-text-sub)]">
            #{run.runNumber} / +{mission.reward.xp}xp
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eceef3]">
            <div
              className="h-full rounded-full bg-[var(--color-accent)]"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    </li>
  );
}
