import { onSchedule } from "firebase-functions/v2/scheduler";
import { runMissionRotationCron } from "../services/missionRuns.js";

/**
 * cron は毎日 0:00 JST に 1 回だけ動かす。
 *
 * daily / weekly の違いは cron の本数で分けず、
 * mission run 側が持つ activeUntil を見て、必要なものだけ回転させる。
 * こうしておくと「どこから 1 週間か」を cron が持たなくてよい。
 */
export const missionRotationCron = onSchedule(
  {
    schedule: "0 0 * * *",
    timeZone: "Asia/Tokyo",
  },
  async () => {
    await runMissionRotationCron();
  },
);
