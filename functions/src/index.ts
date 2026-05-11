import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { setGlobalOptions } from "firebase-functions";

// グローバル設定
setGlobalOptions({ maxInstances: 10 });

/**
 * 投稿作成トリガー
 * ユーザー情報は userId をキーに別コレクションから参照する前提
 */
export const onPostCreated = onDocumentCreated("posts/{postId}", (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.error("No data associated with the event");
    return;
  }

  const data = snapshot.data();
  const postId = event.params.postId;

  logger.info(`New post detected! [ID: ${postId}]`, {
    emoji: data.emoji,
    mood: data.mood,
    userId: data.userId || "anonymous",
  });
});
