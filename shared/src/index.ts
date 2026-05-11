/**
 * 共有される型定義。
 *
 * web / functions で同じ意味を使うデータだけを置く。
 * Firestore の document shape をそのまま書くより、
 * アプリとしての意図が分かる名前を優先している。
 */

/**
 * 地図上に投稿される1件分のデータ。
 *
 * `id` は Firestore の document id。
 * `createdAt` は serverTimestamp で入るので any にしている。
 */
export type Post = {
  id?: string;
  emoji: string;
  mood: string;
  userId?: string;
  location: {
    lat: number;
    lng: number;
  };
  createdAt: any; // FirestoreのTimestamp
};

/**
 * Google ログイン後に扱う最小のユーザー情報。
 * 投稿者表示や sidebar のログイン状態に使う。
 */
export type User = {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
};

/**
 * ミッションの表示・回転単位。
 * daily / weekly / always の3つだけを使う。
 */
export type VisibilityType = "daily" | "weekly" | "always";

/**
 * ミッションを何回開催するかを表す。
 *
 * forever は終了しない。
 * fixed は残り回数を持つ。
 */
export type RepeatSetting =
  | {
      mode: "forever";
    }
  | {
      mode: "fixed";
      remainingRuns: number;
    };

/**
 * ミッション本体の公開状態。
 * ここは「テンプレートが今使えるかどうか」を表す。
 */
export type MissionStatus = "active" | "stopped";

/**
 * 1回分の開催状態。
 * ended は cron で終わった開催回、stopped は運営停止。
 */
export type MissionRunStatus = "active" | "ended" | "stopped";

/**
 * emoji 条件は OR / AND を明示する。
 * 単なる配列だけだと条件の意味が曖昧になるため。
 */
export type EmojiCondition = {
  mode: "and" | "or";
  emojis: string[];
};

/**
 * ミッションで使う地図エリア。
 * 多角形なので points を順に並べる。
 */
export type MissionPolygon = {
  id: string;
  name?: string;
  points: {
    lat: number;
    lng: number;
  }[];
};

/**
 * ミッションのテンプレート。
 *
 * 実際の挑戦単位は missionRuns 側に分かれている。
 * そのためここは「何をやるミッションか」を定義するだけにする。
 */
export type Mission = {
  id?: string;
  title: string;
  description: string;
  status: MissionStatus;
  visibilityType: VisibilityType;
  repeat?: RepeatSetting;
  lastRunNumber: number;
  conditions: {
    requiredPostCount: number;
    emoji?: EmojiCondition;
    polygons?: MissionPolygon[];
  };
  reward: {
    xp: number;
  };
  createdAt: any;
  updatedAt: any;
  stoppedAt?: any;
};

/**
 * ミッションの1開催分。
 *
 * daily / weekly の回転や、停止・終了の状態はここで持つ。
 */
export type MissionRun = {
  id?: string;
  missionId: string;
  runNumber: number;
  status: MissionRunStatus;
  visibleFrom: any;
  activeFrom: any;
  activeUntil?: any;
  createdAt: any;
  updatedAt: any;
};

/**
 * ユーザーごとのミッション進捗。
 *
 * runId をキーにすることで、同じミッションの何回目かを区別する。
 */
export type MissionProgress = {
  missionId: string;
  runId: string;
  currentCount: number;
  completed: boolean;
  completedAt?: any;
  xpGranted: boolean;
  updatedAt: any;
  emoji?: {
    matched: string[];
  };
};
