import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, type QueryDocumentSnapshot } from "firebase/firestore";
import type { Post } from "@emoji-map/shared";
import { db } from "../firebase";

type PostLocation = Post["location"];
type PostWithoutServerFields = Omit<Post, "id" | "createdAt">;

function isPostLocation(value: unknown): value is PostLocation {
  if (!value || typeof value !== "object") return false;

  const location = value as Record<string, unknown>;
  return typeof location.lat === "number" && typeof location.lng === "number";
}

/**
 * 投稿を新規作成する。
 * post は「事実ログ」なので、画面表示で必要な最小限だけ保存する。
 */
export async function createPost(params: PostWithoutServerFields) {
  return addDoc(collection(db, "posts"), {
    emoji: params.emoji,
    mood: params.mood,
    location: params.location,
    createdAt: serverTimestamp(),
    ...(params.userId ? { userId: params.userId } : {}),
  });
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

/**
 * 投稿一覧のリアルタイム購読。
 * Map 画面はここから最新のピンだけを受け取る。
 */
export function subscribePosts(onPostsChange: (posts: Post[]) => void) {
  const postsQuery = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(postsQuery, (snapshot) => {
    onPostsChange(
      snapshot.docs.map(postFromSnapshot).filter((post) => post !== null),
    );
  });
}
