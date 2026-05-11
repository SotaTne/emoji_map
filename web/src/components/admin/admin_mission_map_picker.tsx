import {
  AdvancedMarker,
  APIProvider,
  Map,
  Polygon,
  type MapMouseEvent,
} from "@vis.gl/react-google-maps";
import type { MissionPolygon } from "@emoji-map/shared";
import { maxPolygonCount, polygonColors, tokyoStation, type PolygonPoint } from "./admin_utils";

type DraggableMarkerEvent = {
  latLng?: {
    toJSON: () => PolygonPoint;
  } | null;
};

export function MissionMapPicker({
  polygons,
  points,
  onAddPoint,
  onMoveCurrentPoint,
  onMovePolygonPoint,
  onSavePolygon,
  onClearCurrent,
  onRemovePolygon,
}: {
  polygons: MissionPolygon[];
  points: PolygonPoint[];
  onAddPoint: (point: PolygonPoint) => void;
  onMoveCurrentPoint: (pointIndex: number, point: PolygonPoint) => void;
  onMovePolygonPoint: (
    polygonId: string,
    pointIndex: number,
    point: PolygonPoint,
  ) => void;
  onSavePolygon: () => void;
  onClearCurrent: () => void;
  onRemovePolygon: (polygonId: string) => void;
}) {
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;

  const handleMapClick = (event: MapMouseEvent) => {
    if (!event.detail.latLng) return;
    if (polygons.length >= maxPolygonCount && points.length === 0) return;
    onAddPoint(event.detail.latLng);
  };

  const markerPointFromDrag = (event: DraggableMarkerEvent) => {
    return event.latLng?.toJSON();
  };
  const currentColor = polygonColors[polygons.length % polygonColors.length];

  return (
    <section className="min-h-[360px] overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm md:min-h-[calc(100vh-229px)]">
      <div className="flex flex-col gap-3 border-b border-black/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold">場所条件</h2>
          <p className="text-xs text-[var(--color-text-sub)]">
            地図をクリックして点を追加し、点はドラッグで動かせます。
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClearCurrent}
            disabled={points.length === 0}
            className="rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold text-[var(--color-text-subtle)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            点をクリア
          </button>
          <button
            type="button"
            onClick={onSavePolygon}
            disabled={points.length < 3 || polygons.length >= maxPolygonCount}
            className="rounded-xl bg-[var(--color-accent)] px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#d8dbe3]"
          >
            ポリゴンを追加
          </button>
        </div>
      </div>
      <div className="relative h-[360px] md:h-[calc(100vh-229px)]">
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <Map
            style={{ width: "100%", height: "100%" }}
            defaultCenter={tokyoStation}
            defaultZoom={13}
            gestureHandling="greedy"
            disableDefaultUI
            mapId={mapId}
            onClick={handleMapClick}
          >
            {polygons.map((polygon, polygonIndex) => {
              const color = polygonColors[polygonIndex % polygonColors.length];

              return (
                <Polygon
                  key={polygon.id}
                  paths={polygon.points}
                  fillColor={color}
                  fillOpacity={0.12}
                  strokeColor={color}
                  strokeOpacity={0.54}
                  strokeWeight={2}
                />
              );
            })}
            {points.length >= 3 && (
              <Polygon
                paths={points}
                fillColor={currentColor}
                fillOpacity={0.16}
                strokeColor={currentColor}
                strokeOpacity={0.76}
                strokeWeight={2}
              />
            )}
            {mapId && (
              <>
                {polygons.map((polygon, polygonIndex) => {
                  const color =
                    polygonColors[polygonIndex % polygonColors.length];

                  return polygon.points.map((point, pointIndex) => (
                    <AdvancedMarker
                      key={`${polygon.id}-${pointIndex}`}
                      position={point}
                      draggable
                      onDragEnd={(event) => {
                        const nextPoint = markerPointFromDrag(event);
                        if (!nextPoint) return;
                        onMovePolygonPoint(polygon.id, pointIndex, nextPoint);
                      }}
                    >
                      <div
                        className="flex h-6 w-6 cursor-grab items-center justify-center rounded-full text-[11px] font-semibold text-white shadow-lg ring-2 ring-white active:cursor-grabbing"
                        style={{ backgroundColor: color }}
                      >
                        {pointIndex + 1}
                      </div>
                    </AdvancedMarker>
                  ));
                })}

                {points.map((point, index) => (
                  <AdvancedMarker
                    key={`current-${point.lat}-${point.lng}-${index}`}
                    position={point}
                    draggable
                    onDragEnd={(event) => {
                      const nextPoint = markerPointFromDrag(event);
                      if (!nextPoint) return;
                      onMoveCurrentPoint(index, nextPoint);
                    }}
                  >
                    <div
                      className="flex h-7 w-7 cursor-grab items-center justify-center rounded-full text-xs font-semibold text-white shadow-lg ring-2 ring-white active:cursor-grabbing"
                      style={{ backgroundColor: currentColor }}
                    >
                      {index + 1}
                    </div>
                  </AdvancedMarker>
                ))}
              </>
            )}
          </Map>
        </APIProvider>
        {polygons.length > 0 && (
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
            {polygons.map((polygon, index) => {
              const color = polygonColors[index % polygonColors.length];

              return (
                <button
                  key={polygon.id}
                  type="button"
                  onClick={() => onRemovePolygon(polygon.id)}
                  className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold shadow-md"
                  style={{ color }}
                >
                  エリア{index + 1}を削除
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
