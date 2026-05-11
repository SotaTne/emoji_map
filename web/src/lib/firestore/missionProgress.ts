import { collection, onSnapshot, type QueryDocumentSnapshot } from "firebase/firestore";
import type { MissionProgress } from "@emoji-map/shared";
import { db } from "../firebase";

function progressFromSnapshot(snapshot: QueryDocumentSnapshot): MissionProgress {
  const data = snapshot.data();

  return {
    missionId: String(data.missionId ?? ""),
    runId: String(data.runId ?? snapshot.id),
    currentCount: Number(data.currentCount ?? 0),
    completed: Boolean(data.completed),
    completedAt: data.completedAt,
    xpGranted: Boolean(data.xpGranted),
    updatedAt: data.updatedAt,
    emoji: data.emoji,
  } satisfies MissionProgress;
}

/**
 * ログイン中ユーザーだけが購読する進捗一覧。
 * サイドバーでは runId をキーにして mission の進捗と結合する。
 */
export function subscribeMissionProgress(
  userId: string,
  onProgressChange: (progress: MissionProgress[]) => void,
) {
  return onSnapshot(
    collection(db, "users", userId, "missionProgress"),
    (snapshot) => {
      onProgressChange(snapshot.docs.map(progressFromSnapshot));
    },
  );
}
