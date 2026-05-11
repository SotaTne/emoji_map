import type { Mission, Post } from "@emoji-map/shared";
import {
  collection,
  addDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

type PostLocation = Post["location"];
type PostWithoutServerFields = Omit<Post, "id" | "createdAt">;
type MissionWithoutServerFields = Omit<
  Mission,
  "id" | "createdAt" | "updatedAt" | "stoppedAt"
>;

function isPostLocation(value: unknown): value is PostLocation {
  if (!value || typeof value !== "object") return false;

  const location = value as Record<string, unknown>;
  return typeof location.lat === "number" && typeof location.lng === "number";
}

function withoutUndefined<T>(value: T): T {
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
 * 投稿を新規作成する
 * ユーザー名はIDから引けるため、投稿データには含めない(正規化)
 */
export async function createPost(params: PostWithoutServerFields) {
  const postsRef = collection(db, "posts");
  const postData = {
    emoji: params.emoji,
    mood: params.mood,
    location: params.location,
    createdAt: serverTimestamp(),
    ...(params.userId ? { userId: params.userId } : {}),
  };

  return addDoc(postsRef, postData);
}

function postFromSnapshot(snapshot: QueryDocumentSnapshot): Post | null {
  const data = snapshot.data();
  const location = data.location;

  if (!isPostLocation(location)) return null;

  return {
    id: snapshot.id,
    emoji: String(data.emoji ?? "😀"),
    mood: String(data.mood ?? ""),
    userId: typeof data.userId === "string" ? data.userId : undefined,
    location,
    createdAt: data.createdAt,
  };
}

export function subscribePosts(onPostsChange: (posts: Post[]) => void) {
  const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"));

  return onSnapshot(postsQuery, (snapshot) => {
    onPostsChange(snapshot.docs.map(postFromSnapshot).filter((post) => post !== null));
  });
}

export async function createMission(params: MissionWithoutServerFields) {
  const missionData = withoutUndefined({
    ...params,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return addDoc(collection(db, "missions"), missionData);
}

export async function stopMission(missionId: string) {
  return updateDoc(doc(db, "missions", missionId), {
    enabled: false,
    stoppedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

function missionFromSnapshot(snapshot: QueryDocumentSnapshot): Mission {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    enabled: Boolean(data.enabled),
    visibilityType: data.visibilityType ?? "always",
    repeat: data.repeat,
    conditions: {
      requiredPostCount: Number(data.conditions?.requiredPostCount ?? 1),
      emoji: data.conditions?.emoji,
      polygons: data.conditions?.polygons,
    },
    reward: {
      xp: Number(data.reward?.xp ?? 0),
    },
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    stoppedAt: data.stoppedAt,
  };
}

export function subscribeMissions(
  onMissionsChange: (missions: Mission[]) => void,
) {
  const missionsQuery = query(
    collection(db, "missions"),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(missionsQuery, (snapshot) => {
    onMissionsChange(snapshot.docs.map(missionFromSnapshot));
  });
}
