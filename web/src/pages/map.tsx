import { MapView } from "../components/views/MapView";
import { Sidebar } from "../components/layouts/sidebar";

export function MapPage() {
  return (
    <main className="relative h-screen w-full overflow-hidden">
      <div className="h-full md:pl-[240px]">
        <MapView />
      </div>
      <Sidebar />
    </main>
  );
}
