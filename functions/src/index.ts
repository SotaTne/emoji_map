import { setGlobalOptions } from "firebase-functions";
import { initializeApp } from "firebase-admin/app";

setGlobalOptions({ maxInstances: 10 });
initializeApp();

export { onPostCreated } from "./triggers/posts.js";
export { missionRotationCron } from "./triggers/cron.js";
