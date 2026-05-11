/**
 * Firestore まわりで共通に使う小さなユーティリティ。
 *
 * ここには「投稿」「ミッション」「進捗」など個別の責務は置かず、
 * どの領域でも使える変換だけを集める。
 */
export function withoutUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => withoutUndefined(item)) as T;
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const entries = Object.entries(value).flatMap(([key, item]) => {
    if (item === undefined) return [];
    return [[key, withoutUndefined(item)]];
  });

  return Object.fromEntries(entries) as T;
}

/**
 * Firestore の Timestamp / Date / plain object を Date に寄せる。
 * クライアント側では比較のために Date へ揃えてしまった方が扱いやすい。
 */
export function toDate(value: unknown): Date | null {
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
