import { hasInjectionContext, inject } from "vue";

export function logDebug(msg: string, ...args: unknown[]) {
  if (!hasInjectionContext()) return;
  const globalOptions = inject("ol-options", { debug: false });
  if (!globalOptions?.debug) return;
  console.debug(`[Vue3-OpenLayers] ${msg}`, ...args);
}

export function logError(msg: string, ...args: unknown[]) {
  if (!hasInjectionContext()) return;
  const globalOptions = inject("ol-options", { debug: false });
  if (!globalOptions?.debug) return;
  console.error(`[Vue3-OpenLayers] ${msg}`, ...args);
}

export function logWarning(msg: string, ...args: unknown[]) {
  if (!hasInjectionContext()) return;
  const globalOptions = inject("ol-options", { debug: false });
  if (!globalOptions?.debug) return;
  console.warn(`[Vue3-OpenLayers] ${msg}`, ...args);
}
