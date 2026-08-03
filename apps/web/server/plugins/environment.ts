import { definePlugin } from "nitro";
import { parseWebRuntimeEnvironment } from "../../src/server/environment.server";

export default definePlugin(() => {
  parseWebRuntimeEnvironment(process.env);
});
