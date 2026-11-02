import { ref } from "vue";

export interface AppVersion {
  hash: string;
  date: string;
  subject: string;
}

export const appVersion = ref<AppVersion>({
  hash: typeof __APP_COMMIT__ === "string" ? __APP_COMMIT__ : "local",
  date: typeof __APP_COMMIT_DATE__ === "string" ? __APP_COMMIT_DATE__ : "",
  subject: "",
});

export async function loadVersion() {
  if (!import.meta.env.DEV) return;
  try {
    const response = await fetch("/__app-version", { cache: "no-store" });
    if (!response.ok) return;
    const info = (await response.json()) as Partial<AppVersion>;
    if (!info.hash) return;
    appVersion.value = {
      hash: info.hash,
      date: info.date ?? "",
      subject: info.subject ?? "",
    };
  } catch {
    return;
  }
}
