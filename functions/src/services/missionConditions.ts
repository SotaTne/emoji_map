import type { EmojiCondition, MissionPolygon, Point } from "../types.js";

export function isPoint(value: unknown): value is Point {
  if (!value || typeof value !== "object") return false;

  const point = value as Record<string, unknown>;
  return typeof point.lat === "number" && typeof point.lng === "number";
}

function isInsidePolygon(point: Point, polygon: MissionPolygon) {
  const points = polygon.points;
  if (!Array.isArray(points) || points.length < 3) return false;

  let isInside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const current = points[i];
    const previous = points[j];
    if (!current || !previous) continue;

    const intersects =
      current.lng > point.lng !== previous.lng > point.lng &&
      point.lat <
        ((previous.lat - current.lat) * (point.lng - current.lng)) /
          (previous.lng - current.lng) +
          current.lat;

    if (intersects) isInside = !isInside;
  }

  return isInside;
}

export function matchesPolygonCondition(
  location: Point,
  polygons: MissionPolygon[] | undefined,
) {
  if (!polygons || polygons.length === 0) return true;
  return polygons.some((polygon) => isInsidePolygon(location, polygon));
}

export function nextEmojiMatches(
  postedEmoji: string,
  condition: EmojiCondition | undefined,
  currentMatched: string[],
) {
  if (!condition || condition.emojis.length === 0) {
    return { matches: true, matched: currentMatched, completed: true };
  }

  if (!condition.emojis.includes(postedEmoji)) {
    return { matches: false, matched: currentMatched, completed: false };
  }

  if (condition.mode === "or") {
    return { matches: true, matched: currentMatched, completed: true };
  }

  const matched = Array.from(new Set([...currentMatched, postedEmoji]));
  const completed = condition.emojis.every((emoji) => matched.includes(emoji));

  return { matches: true, matched, completed };
}
