// Import the functions you need from the SDKs you need
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";

// firebaseのjsonファイルのロード
import firebaseConfig from "../../firebase/firebase-config.json" with { type: "json" };

// 効率的なfirebaseの初期化
export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// データベースの取得
export const db = getFirestore(firebaseApp);

// 認証基盤の取得
export const auth = getAuth(firebaseApp);

// ローカルで起動する場合エミュレーターを使う。
if (import.meta.env.MODE === "development") {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
}
