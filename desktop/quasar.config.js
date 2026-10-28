import { defineConfig } from "#q-app/wrappers";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

function gitInfo() {
  try {
    const line = execSync("git log -1 --format=%h§%cs§%s")
      .toString()
      .replace(/\r?\n$/, "");
    const [hash, date, ...rest] = line.split("§");
    return { hash: hash || "local", date: date || "", subject: rest.join("§") };
  } catch {
    return { hash: "local", date: "", subject: "" };
  }
}

export default defineConfig(() => {
  const commit = gitInfo();

  return {
    boot: ["native", "auth", "icons"],

    css: ["tailwind.css"],

    extras: ["roboto-font", "material-icons"],

    build: {
      target: {
        browser: ["es2022", "edge111", "firefox115", "chrome115", "safari15"],
        node: "node20",
      },
      typescript: {
        strict: true,
        vueShim: true,
      },
      vueRouterMode: "hash",
      distDir: "dist/spa",
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
      extendViteConf(cfg) {
        cfg.define = {
          ...(cfg.define ?? {}),
          __APP_COMMIT__: JSON.stringify(commit.hash),
          __APP_COMMIT_DATE__: JSON.stringify(commit.date),
        };
      },
    },

    devServer: {
      port: 9000,
      open: false,
    },

    framework: {
      config: {
        dark: true,
      },
      plugins: ["Notify", "Loading", "Dialog"],
    },

    animations: [],

    ssr: false,
  };
});
