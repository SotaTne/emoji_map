import { Lock, LogIn, LogOut, X } from "lucide-react";
import { useEffect, useState } from "react";
import type {
  Mission,
  MissionProgress,
  MissionRun,
  User as SharedUser,
} from "@emoji-map/shared";
import { useAuthUser } from "../../hooks/useAuthUser";
import { signInWithGoogle, signOutUser } from "../../lib/auth";
import {
  fetchMission,
  subscribeMissionProgress,
  subscribeMissionRuns,
  subscribeUser,
} from "../../lib/db";
import { MissionProgressRow } from "./mission_progress_row";

export function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { user: authUser, isLoading } = useAuthUser();
  const [userData, setUserData] = useState<
    (SharedUser & { xp?: number }) | null
  >(null);
  const [runs, setRuns] = useState<MissionRun[]>([]);
  const [missionsById, setMissionsById] = useState<Record<string, Mission>>({});
  const [progressByRunId, setProgressByRunId] = useState<
    Record<string, MissionProgress>
  >({});

  useEffect(() => {
    return subscribeMissionRuns(setRuns);
  }, []);

  useEffect(() => {
    // ログイン中だけ、そのユーザーの進捗ドキュメントと基本情報を購読する。
    if (!authUser) {
      setUserData(null);
      setProgressByRunId({});
      return;
    }

    const unsubUser = subscribeUser(authUser.uid, (data) => {
      setUserData(data as SharedUser & { xp?: number });
    });

    const unsubProgress = subscribeMissionProgress(
      authUser.uid,
      (progressList) => {
        setProgressByRunId(
          Object.fromEntries(
            progressList.map((progress) => [progress.runId, progress]),
          ),
        );
      },
    );

    return () => {
      unsubUser();
      unsubProgress();
    };
  }, [authUser]);

  useEffect(() => {
    // missionRuns は軽く、mission の説明や条件は重いので、
    // まず run を購読し、必要な mission だけ後から取りに行く。
    const missingMissionIds = Array.from(
      new Set(
        runs
          .map((run) => run.missionId)
          .filter((missionId) => !missionsById[missionId]),
      ),
    );

    missingMissionIds.forEach((missionId) => {
      fetchMission(missionId).then((mission) => {
        if (!mission) return;
        setMissionsById((currentMissions) => ({
          ...currentMissions,
          [missionId]: mission,
        }));
      });
    });
  }, [missionsById, runs]);

  const visibleRuns = runs.filter((run) => {
    const mission = missionsById[run.missionId];
    return mission?.status === "active";
  });
  const isLoggedIn = Boolean(authUser);
  const currentXp = userData?.xp ?? 0;
  const xpInLevel = currentXp % 100; // 100XPごとにレベルアップと仮定
  const xpPercent = Math.min((xpInLevel / 100) * 100, 100);

  return (
    <aside className="flex h-full w-[240px] flex-col border-r border-black/5 bg-white/95 shadow-[10px_0_30px_rgba(15,23,42,0.08)] backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-black/5 px-4 py-4">
        <div>
          <p className="text-lg font-semibold tracking-[-0.03em]">
            emoji<span className="text-[var(--color-accent)]">map</span>
          </p>
          <p className="text-xs text-[var(--color-text-sub)]">
            {isLoggedIn
              ? userData?.displayName || authUser?.displayName || "ログイン中"
              : "ゲスト"}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f3f6] text-[var(--color-text-subtle)] md:hidden"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="border-b border-black/5 px-4 py-4">
        <div className={isLoggedIn ? "" : "opacity-45"}>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.1em] text-[var(--color-accent)]">
                XP
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {isLoggedIn ? currentXp : "--"}
              </p>
            </div>
            {!isLoggedIn && (
              <Lock size={18} className="text-[var(--color-text-sub)]" />
            )}
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eceef3]">
            <div
              className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500"
              style={{ width: `${isLoggedIn ? xpPercent : 0}%` }}
            />
          </div>
        </div>
        {!isLoggedIn && (
          <p className="mt-3 text-xs leading-5 text-[var(--color-text-subtle)]">
            ログインするとミッションに挑戦できます。
          </p>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-[0.12em] text-[var(--color-text-sub)]">
            MISSIONS
          </h2>
          {isLoading && (
            <span className="text-[11px] text-[var(--color-text-sub)]">
              loading
            </span>
          )}
        </div>
        <ul>
          {visibleRuns.map((run) => {
            const mission = missionsById[run.missionId];
            if (!mission) return null;

            return (
              <MissionProgressRow
                key={run.id}
                run={run}
                mission={mission}
                progress={
                  isLoggedIn && run.id ? progressByRunId[run.id] : undefined
                }
                isLocked={!isLoggedIn}
              />
            );
          })}
        </ul>
        {visibleRuns.length === 0 && (
          <p className="rounded-2xl bg-[#f7f8fb] p-4 text-sm text-[var(--color-text-sub)]">
            表示できるミッションはまだありません。
          </p>
        )}
      </div>

      <div className="border-t border-black/5 p-4">
        <button
          type="button"
          onClick={() => {
            if (isLoggedIn) {
              signOutUser();
            } else {
              signInWithGoogle();
            }
          }}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] text-sm font-semibold text-white shadow-[0_10px_24px_rgba(107,92,231,0.26)]"
        >
          {isLoggedIn ? <LogOut size={17} /> : <LogIn size={17} />}
          {isLoggedIn ? "ログアウト" : "Googleでログイン"}
        </button>
      </div>
    </aside>
  );
}
