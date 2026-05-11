import { useEffect } from "react";
import { AdminPage } from "./pages/admin";
import { MapPage } from "./pages/map";
import { useAuthUser } from "./hooks/useAuthUser";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./lib/firebase";

function App() {
  const { user } = useAuthUser();

  useEffect(() => {
    // ログイン済みだがFirestoreにドキュメントがない場合に作成する
    if (user) {
      const userRef = doc(db, "users", user.uid);
      getDoc(userRef).then((snap) => {
        if (!snap.exists()) {
          setDoc(userRef, {
            displayName: user.displayName ?? "",
            email: user.email ?? "",
            photoURL: user.photoURL ?? null,
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
            xp: 0,
          });
        }
      });
    }
  }, [user]);

  if (window.location.pathname === "/admin") {
    return <AdminPage />;
  }

  return <MapPage />;
}

export default App;
