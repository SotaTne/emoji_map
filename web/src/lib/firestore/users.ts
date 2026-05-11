import { doc, onSnapshot } from "firebase/firestore";
import type { User } from "@emoji-map/shared";
import { db } from "../firebase";

/**
 * ユーザー基本情報のリアルタイム購読。
 * XPやレベルなどの動的な情報を反映するために使う。
 */
export function subscribeUser(
  userId: string,
  onUserChange: (user: User | null) => void,
) {
  return onSnapshot(doc(db, "users", userId), (snapshot) => {
    if (!snapshot.exists()) {
      onUserChange(null);
      return;
    }

    const data = snapshot.data();
    onUserChange({
      uid: userId,
      displayName: String(data.displayName ?? ""),
      email: String(data.email ?? ""),
      photoURL: data.photoURL ?? null,
      ...data, // xp などの追加フィールドを含む
    } as User);
  });
}
