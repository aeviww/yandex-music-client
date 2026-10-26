export const INPUT =
  "h-9 w-full max-w-[340px] rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 text-[12.5px] text-[var(--fg)] outline-none transition duration-150 placeholder:text-[color:var(--fg-faint)] focus:border-[color-mix(in_srgb,var(--accent)_55%,var(--line))]";

export const TEXTAREA =
  "min-h-[120px] w-full resize-y rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2.5 text-[12.5px] leading-relaxed text-[var(--fg)] outline-none transition duration-150 placeholder:text-[color:var(--fg-faint)] focus:border-[color-mix(in_srgb,var(--accent)_55%,var(--line))]";

export const SELECT =
  "h-9 min-w-[180px] rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 text-[12.5px] text-[var(--fg)] outline-none transition duration-150 focus:border-[color-mix(in_srgb,var(--accent)_55%,var(--line))]";

export const BUTTON =
  "inline-flex h-8 flex-none items-center justify-center gap-1.5 rounded-lg border border-[var(--line)] bg-transparent px-3 text-[12px] font-medium text-[color:var(--fg-dim)] transition duration-150 hover:border-[color-mix(in_srgb,var(--fg)_16%,var(--line))] hover:bg-[var(--hover)] hover:text-[var(--fg)] disabled:pointer-events-none disabled:opacity-50";

export const BUTTON_ACCENT =
  "inline-flex h-8 flex-none items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 text-[12px] font-semibold text-white transition duration-150 hover:brightness-110 disabled:pointer-events-none disabled:opacity-50";

export const BUTTON_ACCENT_OUTLINE =
  "inline-flex h-8 flex-none items-center justify-center gap-1.5 rounded-lg border border-[color-mix(in_srgb,var(--accent)_50%,var(--line))] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-3.5 text-[12px] font-semibold text-[var(--accent)] transition duration-150 hover:bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] disabled:pointer-events-none disabled:opacity-50";

export const BUTTON_DANGER =
  "inline-flex h-8 flex-none items-center justify-center gap-1.5 rounded-lg border border-[color-mix(in_srgb,#ff5d5d_40%,var(--line))] bg-transparent px-3 text-[12px] font-medium text-[#ff8080] transition duration-150 hover:bg-[color-mix(in_srgb,#ff5d5d_12%,transparent)] hover:text-[#ff5d5d] disabled:pointer-events-none disabled:opacity-50";

export const LINK =
  "text-[var(--accent)] no-underline underline-offset-2 transition hover:underline";
