import type { Mission } from "@emoji-map/shared";
import { repeatLabel } from "./admin_utils";
import { MissionLocationPreview } from "./admin_mission_location_preview";

export function AdminMissionListPanel({
  missions,
  selectedMission,
  setSelectedMission,
  onToggleMission,
}: {
  missions: Mission[];
  selectedMission: Mission | null;
  setSelectedMission: (mission: Mission) => void;
  onToggleMission: (mission: Mission) => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
      <section className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 text-base font-semibold">ミッション一覧</h2>
        <div className="space-y-3">
          {missions.map((mission) => (
            <article
              key={mission.id}
              className={`rounded-2xl border p-4 transition ${
                selectedMission?.id === mission.id
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-bg)]"
                  : "border-black/5 bg-[#fbfbfd]"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedMission(mission)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{mission.title}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        mission.status === "active"
                          ? "bg-white text-[var(--color-accent)]"
                          : "bg-[#eceef3] text-[var(--color-text-sub)]"
                      }`}
                    >
                      {mission.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-text-subtle)]">
                    {mission.description || "説明なし"}
                  </p>
                  <p className="mt-2 text-xs text-[var(--color-text-sub)]">
                    {mission.visibilityType} / {repeatLabel(mission.repeat)} /{" "}
                    {mission.conditions.requiredPostCount}回 / +
                    {mission.reward.xp}xp / 場所
                    {mission.conditions.polygons?.length ?? 0}件
                  </p>
                </button>
                <button
                  type="button"
                  disabled={!mission.id}
                  onClick={() => onToggleMission(mission)}
                  className="h-10 rounded-xl border border-black/10 bg-white px-3 text-xs font-semibold text-[var(--color-text-subtle)] disabled:cursor-not-allowed disabled:opacity-40 sm:h-auto sm:py-2"
                >
                  {mission.status === "active" ? "停止" : "再開"}
                </button>
              </div>
            </article>
          ))}

          {missions.length === 0 && (
            <p className="rounded-2xl bg-[#fbfbfd] p-5 text-sm text-[var(--color-text-sub)]">
              まだミッションはありません。
            </p>
          )}
        </div>
      </section>
      <MissionLocationPreview mission={selectedMission} />
    </div>
  );
}
