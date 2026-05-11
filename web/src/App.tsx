import { AdminPage } from "./pages/admin";
import { MapPage } from "./pages/map";

function App() {
  if (window.location.pathname === "/admin") {
    return <AdminPage />;
  }

  return <MapPage />;
}

export default App;
