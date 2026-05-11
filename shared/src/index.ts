/**
 * 共有される型定義
 */

export type Post = {
  id?: string;
  emoji: string;
  mood: string;
  userId?: string;
  userName?: string;
  userPhotoURL?: string | null;
  createdAt: any; // FirestoreのTimestampまたはFieldValueが入るため、柔軟に持たせる
};

export type User = {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
};

/**
 * ミッションの定義
 */
export type Mission = {
  id: string;
  title: string;
  emoji: string;
  targetCount: number;
  xpReward: number;
};
