import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { isPoint } from "../services/missionConditions.js";
import { updateMissionProgressForPost } from "../services/missionProgress.js";

/**
 * 投稿作成トリガー。
 *
 * posts はユーザー行動の事実ログなので、ここを起点に
 * missionProgress や users.xp の派生データをサーバー側で更新する。
 */
export const onPostCreated = onDocumentCreated(
  "posts/{postId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.error("No data associated with the event");
      return;
    }

    const data = snapshot.data();
    const postId = event.params.postId;
    const userId = typeof data.userId === "string" ? data.userId : undefined;
    const emoji = typeof data.emoji === "string" ? data.emoji : undefined;
    const location = data.location;

    if (!userId || !emoji || !isPoint(location)) {
      logger.info("Skip mission progress update", {
        postId,
        hasUserId: Boolean(userId),
        hasEmoji: Boolean(emoji),
        hasLocation: isPoint(location),
      });
      return;
    }

    logger.info(`New post detected! [ID: ${postId}]`, {
      emoji,
      mood: data.mood,
      userId,
    });

    // posts は事実ログなので、ここから派生データの更新だけを行う。
    await updateMissionProgressForPost({
      postId,
      userId,
      emoji,
      location,
    });
  },
);
