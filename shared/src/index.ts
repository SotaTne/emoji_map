/**
 * 共有される型定義
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

export type User = {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
};

export type VisibilityType = "daily" | "weekly" | "always";

export type RepeatSetting =
  | {
      mode: "forever";
    }
  | {
      mode: "fixed";
      count: number;
    };

export type EmojiCondition = {
  mode: "and" | "or";
  emojis: string[];
};

export type MissionPolygon = {
  id: string;
  name?: string;
  points: {
    lat: number;
    lng: number;
  }[];
};

export type Mission = {
  id?: string;
  title: string;
  description: string;
  enabled: boolean;
  visibilityType: VisibilityType;
  repeat?: RepeatSetting;
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
