import type { DevOverlayPlugin } from "astro";
import sentrylogo from "./sentry-logo.svg?raw";

import * as Spotlight from "@sentry/spotlight";

export default {
  id: "spotlight-plugin",
  name: "Sentry Spotlight",
  icon: sentrylogo,
  init(canvas, eventTarget) {
    eventTarget.dispatchEvent(
      new CustomEvent("plugin-notification", {
        detail: {
          state: true,
        },
      })
    );

    eventTarget.addEventListener("plugin-toggle", () => {
      Spotlight.toggleSpotlight();
    });
  },
} satisfies DevOverlayPlugin;
