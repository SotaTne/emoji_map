import type {
  EmojiCondition,
  Mission,
  MissionPolygon,
  RepeatSetting,
  VisibilityType,
} from "@emoji-map/shared";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  Polygon,
  type MapMouseEvent,
} from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { createMission, stopMission, subscribeMissions } from "../lib/db";

const tokyoStation = { lat: 35.6812, lng: 139.7671 };
const maxPolygonCount = 5;
const polygonColors = ["#6b5ce7", "#2f80ed", "#00a676", "#f2994a", "#eb5757"];

type AdminTab = "create" | "list";
type PolygonPoint = MissionPolygon["points"][number];
type DraggableMarkerEvent = {
  latLng?: {
    toJSON: () => PolygonPoint;
  } | null;
};

function parseEmojiCondition(mode: EmojiCondition["mode"], text: string) {
  const emojis = text
    .split(",")
    .map((emoji) => emoji.trim())
    .filter(Boolean);

  if (emojis.length === 0) return undefined;

  return {
    mode,
    emojis,
  };
}

function repeatLabel(repeat: RepeatSetting | undefined) {
  if (!repeat) return "繰り返しなし";
  if (repeat.mode === "forever") return "永続";
  return `${repeat.count}回`;
}

function MissionMapPicker({
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
    <section className="min-h-[360px] overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm md:min-h-[calc(100vh-148px)]">
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

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("create");
  const [missions, setMissions] = useState<Mission[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibilityType, setVisibilityType] =
    useState<VisibilityType>("daily");
  const [repeatMode, setRepeatMode] = useState<RepeatSetting["mode"]>("forever");
  const [repeatCount, setRepeatCount] = useState("3");
  const [requiredPostCount, setRequiredPostCount] = useState("1");
  const [xp, setXp] = useState("10");
  const [emojiMode, setEmojiMode] = useState<EmojiCondition["mode"]>("or");
  const [emojiText, setEmojiText] = useState("");
  const [polygons, setPolygons] = useState<MissionPolygon[]>([]);
  const [polygonPoints, setPolygonPoints] = useState<PolygonPoint[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return subscribeMissions(setMissions);
  }, []);

  const repeat =
    visibilityType === "always"
      ? undefined
      : repeatMode === "forever"
        ? { mode: "forever" as const }
        : { mode: "fixed" as const, count: Number(repeatCount || 1) };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createMission({
        title,
        description,
        enabled: true,
        visibilityType,
        repeat,
        conditions: {
          requiredPostCount: Number(requiredPostCount || 1),
          emoji: parseEmojiCondition(emojiMode, emojiText),
          polygons: polygons.length > 0 ? polygons : undefined,
        },
        reward: {
          xp: Number(xp || 0),
        },
      });

      setTitle("");
      setDescription("");
      setRequiredPostCount("1");
      setXp("10");
      setEmojiText("");
      setPolygons([]);
      setPolygonPoints([]);
      setActiveTab("list");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-[var(--color-accent)]">
              ADMIN
            </p>
            <h1 className="text-xl font-semibold">ミッション管理</h1>
          </div>
          <div className="grid grid-cols-2 rounded-2xl bg-[#eef0f5] p-1 sm:w-[220px]">
            {(["create", "list"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`h-9 rounded-xl text-sm font-semibold transition ${
                  activeTab === tab
                    ? "bg-white text-[var(--color-text)] shadow-sm"
                    : "text-[var(--color-text-subtle)]"
                }`}
              >
                {tab === "create" ? "作成" : "一覧"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-5">
        {activeTab === "create" ? (
          <div className="grid gap-5 lg:grid-cols-[390px_1fr]">
            <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="text-xs font-medium text-[var(--color-text-subtle)]">
                    タイトル
                  </span>
                  <input
                    required
                    maxLength={30}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-[var(--color-accent)]"
                    placeholder="雨の日投稿"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-[var(--color-text-subtle)]">
                    説明
                  </span>
                  <textarea
                    maxLength={100}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="mt-1 min-h-20 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                    placeholder="指定エリアで今日の気分を投稿しよう"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-medium text-[var(--color-text-subtle)]">
                      表示期間
                    </span>
                    <select
                      value={visibilityType}
                      onChange={(event) =>
                        setVisibilityType(event.target.value as VisibilityType)
                      }
                      className="mt-1 h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-[var(--color-accent)]"
                    >
                      <option value="daily">daily</option>
                      <option value="weekly">weekly</option>
                      <option value="always">always</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs font-medium text-[var(--color-text-subtle)]">
                      必要投稿数
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[1-9][0-9]*"
                      title="1以上の整数を入力してください"
                      required
                      value={requiredPostCount}
                      onChange={(event) =>
                        setRequiredPostCount(event.target.value)
                      }
                      className="mt-1 h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-[var(--color-accent)]"
                    />
                  </label>
                </div>

                {visibilityType !== "always" && (
                  <div className="grid grid-cols-[1fr_96px] gap-3">
                    <label className="block">
                      <span className="text-xs font-medium text-[var(--color-text-subtle)]">
                        繰り返し
                      </span>
                      <select
                        value={repeatMode}
                        onChange={(event) =>
                          setRepeatMode(event.target.value as RepeatSetting["mode"])
                        }
                        className="mt-1 h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-[var(--color-accent)]"
                      >
                        <option value="forever">永続</option>
                        <option value="fixed">回数指定</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-[var(--color-text-subtle)]">
                        回数
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[1-9][0-9]*"
                        title="1以上の整数を入力してください"
                        required={repeatMode === "fixed"}
                        disabled={repeatMode === "forever"}
                        value={repeatCount}
                        onChange={(event) =>
                          setRepeatCount(event.target.value)
                        }
                        className="mt-1 h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[#f2f3f6] disabled:text-[var(--color-text-sub)]"
                      />
                    </label>
                  </div>
                )}

                <div className="grid grid-cols-[96px_1fr] gap-3">
                  <label className="block">
                    <span className="text-xs font-medium text-[var(--color-text-subtle)]">
                      emoji条件
                    </span>
                    <select
                      value={emojiMode}
                      onChange={(event) =>
                        setEmojiMode(event.target.value as EmojiCondition["mode"])
                      }
                      className="mt-1 h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-[var(--color-accent)]"
                    >
                      <option value="or">or</option>
                      <option value="and">and</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs font-medium text-[var(--color-text-subtle)]">
                      emoji一覧
                    </span>
                    <input
                      value={emojiText}
                      onChange={(event) => setEmojiText(event.target.value)}
                      className="mt-1 h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-[var(--color-accent)]"
                      placeholder="😀,😊,☔"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-xs font-medium text-[var(--color-text-subtle)]">
                    XP
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]+"
                    title="0以上の整数を入力してください"
                    required
                    value={xp}
                    onChange={(event) => setXp(event.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-[var(--color-accent)]"
                  />
                </label>

                <div className="rounded-2xl bg-[#fbfbfd] p-3 text-xs text-[var(--color-text-subtle)]">
                  場所条件: {polygons.length}/{maxPolygonCount}個のポリゴン / 作成中{" "}
                  {polygonPoints.length}点
                  {polygons.length >= maxPolygonCount
                    ? " / 最大数に達しています"
                    : ""}
                  {polygonPoints.length >= 3
                    ? " / 追加できます"
                    : " / 3点以上で追加できます"}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="h-11 w-full rounded-xl bg-[var(--color-accent)] text-sm font-semibold text-white shadow-[0_10px_24px_rgba(107,92,231,0.28)] disabled:cursor-not-allowed disabled:bg-[#d8dbe3] disabled:shadow-none"
                >
                  ミッションを投稿
                </button>
              </form>
            </section>

            <MissionMapPicker
              polygons={polygons}
              points={polygonPoints}
              onAddPoint={(point) =>
                setPolygonPoints((currentPoints) => [...currentPoints, point])
              }
              onMoveCurrentPoint={(pointIndex, point) =>
                setPolygonPoints((currentPoints) =>
                  currentPoints.map((currentPoint, currentIndex) =>
                    currentIndex === pointIndex ? point : currentPoint,
                  ),
                )
              }
              onMovePolygonPoint={(polygonId, pointIndex, point) =>
                setPolygons((currentPolygons) =>
                  currentPolygons.map((polygon) =>
                    polygon.id === polygonId
                      ? {
                          ...polygon,
                          points: polygon.points.map(
                            (currentPoint, currentIndex) =>
                              currentIndex === pointIndex ? point : currentPoint,
                          ),
                        }
                      : polygon,
                  ),
                )
              }
              onSavePolygon={() => {
                if (polygonPoints.length < 3) return;
                if (polygons.length >= maxPolygonCount) return;

                setPolygons((currentPolygons) => [
                  ...currentPolygons,
                  {
                    id: crypto.randomUUID(),
                    name: `対象エリア${currentPolygons.length + 1}`,
                    points: polygonPoints,
                  },
                ]);
                setPolygonPoints([]);
              }}
              onClearCurrent={() => setPolygonPoints([])}
              onRemovePolygon={(polygonId) =>
                setPolygons((currentPolygons) =>
                  currentPolygons.filter((polygon) => polygon.id !== polygonId),
                )
              }
            />
          </div>
        ) : (
          <section className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 text-base font-semibold">ミッション一覧</h2>
            <div className="space-y-3">
              {missions.map((mission) => (
                <article
                  key={mission.id}
                  className="rounded-2xl border border-black/5 bg-[#fbfbfd] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{mission.title}</h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            mission.enabled
                              ? "bg-[var(--color-accent-bg)] text-[var(--color-accent)]"
                              : "bg-[#eceef3] text-[var(--color-text-sub)]"
                          }`}
                        >
                          {mission.enabled ? "active" : "stopped"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--color-text-subtle)]">
                        {mission.description || "説明なし"}
                      </p>
                      <p className="mt-2 text-xs text-[var(--color-text-sub)]">
                        {mission.visibilityType} / {repeatLabel(mission.repeat)} /{" "}
                        {mission.conditions.requiredPostCount}回 / +
                        {mission.reward.xp}xp / 場所
                        {mission.conditions.polygons?.length ?? 0}件
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={!mission.enabled || !mission.id}
                      onClick={() => mission.id && stopMission(mission.id)}
                      className="h-10 rounded-xl border border-black/10 px-3 text-xs font-semibold text-[var(--color-text-subtle)] disabled:cursor-not-allowed disabled:opacity-40 sm:h-auto sm:py-2"
                    >
                      停止
                    </button>
                  </div>
                </article>
              ))}

              {missions.length === 0 && (
                <p className="rounded-2xl bg-[#fbfbfd] p-5 text-sm text-[var(--color-text-sub)]">
                  まだミッションはありません。
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
