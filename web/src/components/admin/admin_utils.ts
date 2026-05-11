import type { EmojiCondition, MissionPolygon, RepeatSetting } from "@emoji-map/shared";

export const tokyoStation = { lat: 35.6812, lng: 139.7671 };
export const maxPolygonCount = 5;
export const polygonColors = ["#6b5ce7", "#2f80ed", "#00a676", "#f2994a", "#eb5757"];

export type AdminTab = "create" | "list";
export type PolygonPoint = MissionPolygon["points"][number];

/**
 * emoji 条件は OR / AND を明示して持つ。
 * 文字列をただ並べるだけにすると、条件の意味が後から読めなくなる。
 */
export function parseEmojiCondition(mode: EmojiCondition["mode"], text: string) {
  const emojis = text
    .split(",")
    .map((emoji) => emoji.trim())
    .filter(Boolean);

  if (emojis.length === 0) return undefined;

  return {
    mode,
    emojis,
  };
}

export function repeatLabel(repeat: RepeatSetting | undefined) {
  if (!repeat) return "繰り返しなし";
  if (repeat.mode === "forever") return "永続";
  return `残り${repeat.remainingRuns}回`;
}

/**
 * ポリゴン一覧のプレビューは、最初の表示位置をだいたい中央に寄せる。
 * 厳密な bounds fit はあとで必要になってから足せばよい。
 */
export function polygonCenter(polygons: MissionPolygon[] | undefined) {
  const points = polygons?.flatMap((polygon) => polygon.points) ?? [];
  if (points.length === 0) return tokyoStation;

  return {
    lat: points.reduce((sum, point) => sum + point.lat, 0) / points.length,
    lng: points.reduce((sum, point) => sum + point.lng, 0) / points.length,
  };
}
