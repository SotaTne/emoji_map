import { collection, onSnapshot, orderBy, query, type QueryDocumentSnapshot } from "firebase/firestore";
import type { MissionRun } from "@emoji-map/shared";
import { db } from "../firebase";
import { toDate } from "./common";

function missionRunFromSnapshot(snapshot: QueryDocumentSnapshot): MissionRun {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    missionId: String(data.missionId ?? ""),
    runNumber: Number(data.runNumber ?? 1),
    status: data.status ?? "active",
    visibleFrom: data.visibleFrom,
    activeFrom: data.activeFrom,
    activeUntil: data.activeUntil,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  } satisfies MissionRun;
}

/**
 * いま挑戦可能な開催回だけを流す購読。
 * 期限切れの run は画面に出さない。
 */
export function subscribeMissionRuns(
  onRunsChange: (runs: MissionRun[]) => void,
) {
  const missionRunsQuery = query(
    collection(db, "missionRuns"),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(missionRunsQuery, (snapshot) => {
    const now = Date.now();
    onRunsChange(
      snapshot.docs
        .map(missionRunFromSnapshot)
        .filter((run) => {
          if (run.status !== "active") return false;

          const deadline = toDate(run.activeUntil);
          if (deadline && deadline.getTime() <= now) return false;

          return true;
        }),
    );
  });
}
