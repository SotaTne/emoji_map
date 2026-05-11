import * as logger from "firebase-functions/logger";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import type {
  MissionData,
  MissionProgressInput,
  MissionRunData,
} from "../types.js";
import {
  matchesPolygonCondition,
  nextEmojiMatches,
} from "./missionConditions.js";

const db = getFirestore();

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

export async function updateMissionProgressForPost(
  input: MissionProgressInput,
) {
  const { postId, userId, emoji, location } = input;
  logger.info("Starting mission progress update", {
    userId,
    postId,
    emoji,
    location,
  });

  // トランザクションの外で、現在アクティブなミッションランを先に取得する。
  // トランザクション内では DocumentReference しか get できないため。
  const activeRunsSnapshot = await db
    .collection("missionRuns")
    .where("status", "==", "active")
    .get();

  if (activeRunsSnapshot.empty) {
    logger.info("No active mission runs found in missionRuns collection");
    return;
  }

  logger.info(`Found ${activeRunsSnapshot.docs.length} active mission runs`);

  await db.runTransaction(async (transaction) => {
    const userRef = db.collection("users").doc(userId);
    const processedPostRef = userRef.collection("processedPosts").doc(postId);

    const userSnapshot = await transaction.get(userRef);
    const processedPostSnapshot = await transaction.get(processedPostRef);

    if (processedPostSnapshot.exists) {
      logger.info("Skip already processed post", { userId, postId });
      return;
    }

    const updates: Array<{
      runId: string;
      run: MissionRunData;
      mission: MissionData;
      progressRef: FirebaseFirestore.DocumentReference;
      progress: FirebaseFirestore.DocumentData | undefined;
    }> = [];

    // アクティブな各ランに対して、ミッション定義とユーザーの進捗を取得する。
    for (const runSnapshot of activeRunsSnapshot.docs) {
      const run = runSnapshot.data() as MissionRunData;
      if (!run.missionId) {
        logger.info(`Skip run ${runSnapshot.id} because missionId is missing`);
        continue;
      }

      const missionRef = db.collection("missions").doc(run.missionId);
      const progressRef = userRef
        .collection("missionProgress")
        .doc(runSnapshot.id);

      const [missionSnapshot, progressSnapshot] = await Promise.all([
        transaction.get(missionRef),
        transaction.get(progressRef),
      ]);

      if (!missionSnapshot.exists) {
        logger.info(
          `Skip run ${runSnapshot.id} because mission ${run.missionId} not found`,
        );
        continue;
      }

      const missionData = missionSnapshot.data() as MissionData;
      logger.info(
        `Checking mission: ${run.missionId} (status: ${missionData.status})`,
      );

      updates.push({
        runId: runSnapshot.id,
        run,
        mission: missionData,
        progressRef,
        progress: progressSnapshot.exists ? progressSnapshot.data() : undefined,
      });
    }

    let grantedXp = 0;
    let matchedMissionCount = 0;
    const now = new Date();

    for (const update of updates) {
      const { runId, run, mission, progressRef, progress } = update;

      // status が未定義の場合は active とみなす（初期データの互換性のため）
      const isMissionActive = !mission.status || mission.status === "active";
      if (!isMissionActive) {
        logger.info(`Skip mission ${run.missionId} because it is not active`, {
          status: mission.status,
        });
        continue;
      }
      if (progress?.completed) {
        logger.info(
          `Skip mission ${run.missionId} because it is already completed by user`,
        );
        continue;
      }

      const deadline = toDate(run.activeUntil);
      if (deadline && deadline.getTime() <= now.getTime()) {
        logger.info(`Skip mission ${run.missionId} because deadline passed`, {
          deadline,
        });
        continue;
      }

      const conditions = mission.conditions ?? {};
      if (!matchesPolygonCondition(location, conditions.polygons)) {
        logger.info(`Skip mission ${run.missionId} because location mismatch`);
        continue;
      }

      const currentMatched = Array.isArray(progress?.emoji?.matched)
        ? progress.emoji.matched
        : [];

      logger.info(`Checking emoji condition for mission ${run.missionId}`, {
        postedEmoji: emoji,
        required: conditions.emoji,
        currentMatched,
      });

      const emojiResult = nextEmojiMatches(
        emoji,
        conditions.emoji,
        currentMatched,
      );

      if (!emojiResult.matches) {
        logger.info(`Skip mission ${run.missionId} because emoji mismatch`, {
          emoji,
          required: conditions.emoji,
        });
        continue;
      }

      const targetCount = Math.max(
        Number(conditions.requiredPostCount ?? 1),
        1,
      );
      const currentCount = Number(progress?.currentCount ?? 0);
      const nextCount = currentCount + 1;

      // emoji 条件がある場合は、その条件も満たしている必要がある
      const emojiCompleted = emojiResult.completed;
      const completed = nextCount >= targetCount && emojiCompleted;

      logger.info(
        `Mission progress update for ${run.missionId}: ${nextCount}/${targetCount} (completed: ${completed})`,
      );

      const xpReward = Number(mission.reward?.xp ?? 0);
      const shouldGrantXp = completed && !progress?.xpGranted && xpReward > 0;

      matchedMissionCount += 1;
      if (shouldGrantXp) {
        grantedXp += xpReward;
        logger.info(`XP will be granted: +${xpReward}`);
      }

      transaction.set(
        progressRef,
        {
          missionId: run.missionId,
          runId,
          runNumber: run.runNumber ?? 1,
          currentCount: nextCount,
          completed,
          completedAt: completed ? FieldValue.serverTimestamp() : null,
          xpGranted: completed ? true : Boolean(progress?.xpGranted),
          updatedAt: FieldValue.serverTimestamp(),
          ...(conditions.emoji?.mode === "and"
            ? { emoji: { matched: emojiResult.matched } }
            : {}),
        },
        { merge: true },
      );
    }

    // ユーザーが存在しない場合は作成し、存在する場合はXPを加算する
    if (!userSnapshot.exists) {
      logger.info("Creating new user document with initial XP", {
        userId,
        grantedXp,
      });
      transaction.set(userRef, {
        xp: grantedXp,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else if (grantedXp > 0) {
      logger.info(`Updating existing user XP: +${grantedXp}`);
      transaction.update(userRef, {
        xp: FieldValue.increment(grantedXp),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    // 処理済みフラグを立てる
    transaction.set(processedPostRef, {
      processedAt: FieldValue.serverTimestamp(),
      matchedMissionCount,
      grantedXp,
    });

    logger.info("Mission transaction finished", {
      userId,
      postId,
      matchedMissionCount,
      grantedXp,
    });
  });
}
