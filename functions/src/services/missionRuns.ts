import * as logger from "firebase-functions/logger";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import type { Mission, MissionRun } from "../types.js";

const db = getFirestore();

type RotatingVisibilityType = "daily" | "weekly";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

function getRotationDurationMs(visibilityType: RotatingVisibilityType) {
  return visibilityType === "weekly" ? WEEK_MS : DAY_MS;
}

function toDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) return value;

  if (typeof value === "object" && value !== null) {
    const candidate = value as { toDate?: () => Date };
    if (typeof candidate.toDate === "function") {
      return candidate.toDate();
    }
  }

  return null;
}

function getNextRotationDate(
  visibilityType: RotatingVisibilityType,
  baseDate: Date,
) {
  return new Date(baseDate.getTime() + getRotationDurationMs(visibilityType));
}

function getMissionDeadline(
  mission: Mission,
  activeRun: MissionRun | undefined,
  visibilityType: RotatingVisibilityType,
) {
  const runDueDate = toDate(activeRun?.activeUntil);
  if (runDueDate) return runDueDate;

  const runStart = toDate(activeRun?.activeFrom) ?? toDate(activeRun?.createdAt);
  if (runStart) {
    return getNextRotationDate(visibilityType, runStart);
  }

  return null;
}

function shouldCreateNextRun(mission: Mission) {
  if (!mission.repeat) return false;
  if (mission.repeat.mode === "forever") return true;
  return mission.repeat.remainingRuns > 0;
}

async function endActiveRunsForMission(
  missionId: string,
  reason: RotatingVisibilityType | "manual",
) {
  // いま挑戦中の run を終了に変える。
  // 新しい開催回を作る前に、古い開催回を閉じておく。
  const activeRunsQuery = db
    .collection("missionRuns")
    .where("missionId", "==", missionId)
    .where("status", "==", "active");

  const activeRunsSnapshot = await activeRunsQuery.get();

  for (const runSnapshot of activeRunsSnapshot.docs) {
    await runSnapshot.ref.set(
      {
        status: "ended",
        updatedAt: FieldValue.serverTimestamp(),
        endedAt: FieldValue.serverTimestamp(),
        endedReason: reason,
      },
      { merge: true },
    );
  }

  return activeRunsSnapshot.docs.length;
}

async function createNextRunForMission(
  mission: Mission,
  visibilityType: RotatingVisibilityType,
) {
  const nextRunNumber = (mission.lastRunNumber ?? 0) + 1;
  const nextRunId = `${mission.id}_${nextRunNumber}`;
  const runRef = db.collection("missionRuns").doc(nextRunId);
  const runSnapshot = await runRef.get();

  if (runSnapshot.exists) {
    logger.info("Skip next run creation because it already exists", {
      missionId: mission.id,
      nextRunId,
    });
    return;
  }

  const nextRunDeadline = getNextRotationDate(visibilityType, new Date());
  const nextRemainingRuns =
    mission.repeat?.mode === "fixed"
      ? Math.max((mission.repeat.remainingRuns ?? 0) - 1, 0)
      : undefined;

  await runRef.set({
    missionId: mission.id,
    runNumber: nextRunNumber,
    status: "active",
    visibleFrom: FieldValue.serverTimestamp(),
    activeFrom: FieldValue.serverTimestamp(),
    activeUntil: Timestamp.fromDate(nextRunDeadline),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    generatedBy: visibilityType,
  } satisfies Omit<MissionRun, "id"> & { generatedBy: string });

  await db.collection("missions").doc(mission.id).set(
    {
      lastRunNumber: nextRunNumber,
      repeat:
        mission.repeat?.mode === "fixed"
          ? {
              mode: "fixed" as const,
              remainingRuns: nextRemainingRuns,
            }
          : mission.repeat,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

async function processMissionVisibilityType(
  visibilityType: RotatingVisibilityType,
) {
  // daily / weekly どちらも同じ日次 cron で見る。
  // ここでは「次回開催時刻を過ぎた mission」だけを回転させる。
  const missionsSnapshot = await db
    .collection("missions")
    .where("status", "==", "active")
    .where("visibilityType", "==", visibilityType)
    .get();

  for (const missionSnapshot of missionsSnapshot.docs) {
    const mission = {
      id: missionSnapshot.id,
      ...missionSnapshot.data(),
    } as Mission;

    if (mission.status !== "active") continue;

    const activeRunsSnapshot = await db
      .collection("missionRuns")
      .where("missionId", "==", mission.id)
      .where("status", "==", "active")
      .get();

    const activeRun = activeRunsSnapshot.docs[0]
      ? ({
          id: activeRunsSnapshot.docs[0].id,
          ...activeRunsSnapshot.docs[0].data(),
        } as MissionRun)
      : undefined;

    const deadline = getMissionDeadline(mission, activeRun, visibilityType);
    if (!deadline) {
      logger.info("Skip mission rotation because deadline is unknown", {
        missionId: mission.id,
        visibilityType,
      });
      continue;
    }

    if (deadline.getTime() > Date.now()) {
      continue;
    }

    await endActiveRunsForMission(mission.id, visibilityType);

    if (shouldCreateNextRun(mission)) {
      await createNextRunForMission(mission, visibilityType);
      continue;
    }

    logger.info("No next run created because repeat limit reached", {
      missionId: mission.id,
      visibilityType,
    });
  }
}

export async function runMissionRotationCron() {
  logger.info("Mission rotation cron started");

  // daily 0:00 の 1 本で daily / weekly の両方を進める。
  await processMissionVisibilityType("daily");
  await processMissionVisibilityType("weekly");

  logger.info("Mission rotation cron finished");
}
