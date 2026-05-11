export type Point = {
  lat: number;
  lng: number;
};

export type EmojiCondition = {
  mode: "and" | "or";
  emojis: string[];
};

export type MissionPolygon = {
  points: Point[];
};

export type MissionData = {
  status?: string;
  conditions?: {
    requiredPostCount?: number;
    emoji?: EmojiCondition;
    polygons?: MissionPolygon[];
  };
  reward?: {
    xp?: number;
  };
};

export type MissionRunData = {
  missionId?: string;
  runNumber?: number;
  status?: string;
  activeUntil?: unknown;
  visibleFrom?: unknown;
  activeFrom?: unknown;
};

export type Mission = {
  id: string;
  status?: "active" | "stopped";
  visibilityType?: "daily" | "weekly" | "always";
  repeat?: {
    mode: "forever" | "fixed";
    remainingRuns: number;
  };
  lastRunNumber?: number;
};

export type MissionRun = {
  id?: string;
  missionId: string;
  runNumber: number;
  status: "active" | "ended" | "stopped";
  visibleFrom: unknown;
  activeFrom: unknown;
  activeUntil?: unknown;
  createdAt: unknown;
  updatedAt: unknown;
};

export type MissionProgressInput = {
  postId: string;
  userId: string;
  emoji: string;
  location: Point;
};
