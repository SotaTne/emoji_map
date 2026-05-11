import { APIProvider, Map, Polygon } from "@vis.gl/react-google-maps";
import type { Mission } from "@emoji-map/shared";
import { polygonCenter, polygonColors } from "./admin_utils";

export function MissionLocationPreview({ mission }: { mission: Mission | null }) {
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
  const polygons = mission?.conditions.polygons ?? [];

  return (
    <section className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
      <div className="border-b border-black/5 px-4 py-3">
        <h2 className="text-sm font-semibold">場所プレビュー</h2>
        <p className="text-xs text-[var(--color-text-sub)]">
          {mission ? `${mission.title} の場所条件` : "ミッションを選択してください。"}
        </p>
      </div>
      <div className="h-[320px]">
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <Map
            key={mission?.id ?? "empty"}
            style={{ width: "100%", height: "100%" }}
            defaultCenter={polygonCenter(mission?.conditions.polygons)}
            defaultZoom={mission && polygons.length > 0 ? 14 : 12}
            gestureHandling="greedy"
            disableDefaultUI
            mapId={mapId}
          >
            {polygons.map((polygon, index) => {
              const color = polygonColors[index % polygonColors.length];

              return (
                <Polygon
                  key={polygon.id}
                  paths={polygon.points}
                  fillColor={color}
                  fillOpacity={0.14}
                  strokeColor={color}
                  strokeOpacity={0.7}
                  strokeWeight={2}
                />
              );
            })}
          </Map>
        </APIProvider>
      </div>
    </section>
  );
}
