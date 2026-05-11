import { collection, addDoc, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, Timestamp, type QueryDocumentSnapshot } from "firebase/firestore";
import type { Mission, MissionRun } from "@emoji-map/shared";
import { db } from "../firebase";
import { withoutUndefined } from "./common";

type MissionWithoutServerFields = Omit<
  Mission,
  "id" | "createdAt" | "updatedAt" | "stoppedAt"
>;
type MissionRunWithoutServerFields = Omit<
  MissionRun,
  "id" | "createdAt" | "updatedAt" | "visibleFrom" | "activeFrom" | "activeUntil"
>;

function getScheduleDurationMs(visibilityType: Mission["visibilityType"]) {
  if (visibilityType === "weekly") return 7 * 24 * 60 * 60 * 1000;
  return 24 * 60 * 60 * 1000;
}

function buildRunWindow(visibilityType: Mission["visibilityType"]) {
  const now = new Date();
  const activeUntil = new Date(now.getTime() + getScheduleDurationMs(visibilityType));

  return {
    activeUntil: Timestamp.fromDate(activeUntil),
  };
}

export async function createMission(params: MissionWithoutServerFields) {
  const runWindow =
    params.visibilityType === "always"
      ? null
      : buildRunWindow(params.visibilityType);

  const missionData = withoutUndefined({
    ...params,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const missionRef = await addDoc(collection(db, "missions"), missionData);
  const runId = `${missionRef.id}_1`;
  const runData: MissionRunWithoutServerFields = {
    missionId: missionRef.id,
    runNumber: 1,
    status: "active",
  };

  await setDoc(doc(db, "missionRuns", runId), {
    ...runData,
    visibleFrom: serverTimestamp(),
    activeFrom: serverTimestamp(),
    ...(runWindow ? { activeUntil: runWindow.activeUntil } : {}),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return missionRef;
}

export async function stopMission(missionId: string) {
  return updateDoc(doc(db, "missions", missionId), {
    status: "stopped",
    stoppedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function resumeMission(missionId: string) {
  return updateDoc(doc(db, "missions", missionId), {
    status: "active",
    stoppedAt: null,
    updatedAt: serverTimestamp(),
  });
}

function missionFromSnapshot(snapshot: QueryDocumentSnapshot): Mission {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    status: data.status ?? "active",
    visibilityType: data.visibilityType ?? "always",
    repeat: data.repeat,
    lastRunNumber: Number(data.lastRunNumber ?? 1),
    conditions: {
      requiredPostCount: Number(data.conditions?.requiredPostCount ?? 1),
      emoji: data.conditions?.emoji,
      polygons: data.conditions?.polygons,
    },
    reward: {
      xp: Number(data.reward?.xp ?? 0),
    },
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    stoppedAt: data.stoppedAt,
  } satisfies Mission;
}

export function subscribeMissions(
  onMissionsChange: (missions: Mission[]) => void,
) {
  const missionsQuery = query(
    collection(db, "missions"),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(missionsQuery, (snapshot) => {
    onMissionsChange(snapshot.docs.map(missionFromSnapshot));
  });
}

export async function fetchMission(missionId: string) {
  const snapshot = await getDoc(doc(db, "missions", missionId));
  if (!snapshot.exists()) return null;

  return missionFromSnapshot(snapshot);
}
