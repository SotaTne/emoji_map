import { useEffect, useState } from "react";
import type {
  EmojiCondition,
  Mission,
  MissionPolygon,
  RepeatSetting,
  VisibilityType,
} from "@emoji-map/shared";
import { createMission, resumeMission, stopMission, subscribeMissions } from "../lib/db";
import { AdminMissionCreatePanel } from "../components/admin/admin_mission_create_panel";
import { AdminMissionListPanel } from "../components/admin/admin_mission_list";
import type { AdminTab, PolygonPoint } from "../components/admin/admin_utils";

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
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return subscribeMissions(setMissions);
  }, []);

  const handleSubmit = async (params: {
    title: string;
    description: string;
    visibilityType: VisibilityType;
    repeat: RepeatSetting | undefined;
    requiredPostCount: number;
    emoji: EmojiCondition | undefined;
    polygons: MissionPolygon[] | undefined;
    xp: number;
  }) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createMission({
        title: params.title,
        description: params.description,
        status: "active",
        visibilityType: params.visibilityType,
        repeat: params.repeat,
        lastRunNumber: 1,
        conditions: {
          requiredPostCount: params.requiredPostCount,
          emoji: params.emoji,
          polygons: params.polygons,
        },
        reward: {
          xp: params.xp,
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
          <AdminMissionCreatePanel
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            visibilityType={visibilityType}
            setVisibilityType={setVisibilityType}
            repeatMode={repeatMode}
            setRepeatMode={setRepeatMode}
            repeatCount={repeatCount}
            setRepeatCount={setRepeatCount}
            requiredPostCount={requiredPostCount}
            setRequiredPostCount={setRequiredPostCount}
            xp={xp}
            setXp={setXp}
            emojiMode={emojiMode}
            setEmojiMode={setEmojiMode}
            emojiText={emojiText}
            setEmojiText={setEmojiText}
            polygons={polygons}
            polygonPoints={polygonPoints}
            setPolygons={setPolygons}
            setPolygonPoints={setPolygonPoints}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        ) : (
          <AdminMissionListPanel
            missions={missions}
            selectedMission={selectedMission}
            setSelectedMission={setSelectedMission}
            onToggleMission={(mission) => {
              if (!mission.id) return;
              if (mission.status === "active") {
                stopMission(mission.id);
              } else {
                resumeMission(mission.id);
              }
            }}
          />
        )}
      </div>
    </main>
  );
}
