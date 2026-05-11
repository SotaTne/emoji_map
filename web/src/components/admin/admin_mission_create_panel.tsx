import type {
  EmojiCondition,
  MissionPolygon,
  RepeatSetting,
  VisibilityType,
} from "@emoji-map/shared";
import type { Dispatch, SetStateAction } from "react";
import { MissionMapPicker } from "./admin_mission_map_picker";
import { maxPolygonCount, parseEmojiCondition, type PolygonPoint } from "./admin_utils";

export function AdminMissionCreatePanel({
  title,
  setTitle,
  description,
  setDescription,
  visibilityType,
  setVisibilityType,
  repeatMode,
  setRepeatMode,
  repeatCount,
  setRepeatCount,
  requiredPostCount,
  setRequiredPostCount,
  xp,
  setXp,
  emojiMode,
  setEmojiMode,
  emojiText,
  setEmojiText,
  polygons,
  polygonPoints,
  setPolygons,
  setPolygonPoints,
  isSubmitting,
  onSubmit,
}: {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  visibilityType: VisibilityType;
  setVisibilityType: (value: VisibilityType) => void;
  repeatMode: RepeatSetting["mode"];
  setRepeatMode: (value: RepeatSetting["mode"]) => void;
  repeatCount: string;
  setRepeatCount: (value: string) => void;
  requiredPostCount: string;
  setRequiredPostCount: (value: string) => void;
  xp: string;
  setXp: (value: string) => void;
  emojiMode: EmojiCondition["mode"];
  setEmojiMode: (value: EmojiCondition["mode"]) => void;
  emojiText: string;
  setEmojiText: (value: string) => void;
  polygons: MissionPolygon[];
  polygonPoints: PolygonPoint[];
  setPolygons: Dispatch<SetStateAction<MissionPolygon[]>>;
  setPolygonPoints: Dispatch<SetStateAction<PolygonPoint[]>>;
  isSubmitting: boolean;
  onSubmit: (params: {
    title: string;
    description: string;
    visibilityType: VisibilityType;
    repeat: RepeatSetting | undefined;
    requiredPostCount: number;
    emoji: EmojiCondition | undefined;
    polygons: MissionPolygon[] | undefined;
    xp: number;
  }) => Promise<void>;
}) {
  const repeat =
    visibilityType === "always"
      ? undefined
      : repeatMode === "forever"
        ? { mode: "forever" as const }
        : {
            mode: "fixed" as const,
            remainingRuns: Math.max(Number(repeatCount || 1) - 1, 0),
          };

  return (
    <div className="grid gap-5 lg:grid-cols-[390px_1fr]">
      <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmit({
              title,
              description,
              visibilityType,
              repeat,
              requiredPostCount: Number(requiredPostCount || 1),
              emoji: parseEmojiCondition(emojiMode, emojiText),
              polygons: polygons.length > 0 ? polygons : undefined,
              xp: Number(xp || 0),
            });
          }}
          className="space-y-4"
        >
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
                onChange={(event) => setRequiredPostCount(event.target.value)}
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
                  onChange={(event) => setRepeatCount(event.target.value)}
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
                    points: polygon.points.map((currentPoint, currentIndex) =>
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
  );
}
