import {
  getCurrentInstance,
  isRef,
  type MaybeRefOrGetter,
  onActivated,
  onDeactivated,
  onMounted,
  onUnmounted,
  toHandlerKey,
  toValue,
  watch,
} from "vue";
import type BaseObject from "ol/Object";
import type BaseEvent from "ol/events/Event";
import type { ObjectEvent } from "ol/Object";
import type RenderEvent from "ol/render/Event";
import type { TileSourceEvent } from "ol/source/Tile";
import type { ImageSourceEvent } from "ol/source/Image";
import type { VectorSourceEvent } from "ol/source/Vector";
import { logDebug, logError } from "@/helpers/logging";

export const COMMON_EVENTS = ["change", "error", "propertychange"];
export interface CommonEvents {
  (e: "change", event: BaseEvent): void;
  (e: "error", event: BaseEvent): void;
  (e: "propertychange", event: ObjectEvent): void;
}

export const LAYER_EVENTS = [
  "change:extent",
  "change:maxResolution",
  "change:maxZoom",
  "change:minResolution",
  "change:minZoom",
  "change:opacity",
  "change:source",
  "change:visible",
  "change:zIndex",
  "postrender",
  "prerender",
  "sourceready",
];
export interface LayerChangeEvents {
  (e: "change:extent", event: ObjectEvent): void;
  (e: "change:maxResolution", event: ObjectEvent): void;
  (e: "change:maxZoom", event: ObjectEvent): void;
  (e: "change:minResolution", event: ObjectEvent): void;
  (e: "change:minZoom", event: ObjectEvent): void;
  (e: "change:opacity", event: ObjectEvent): void;
  (e: "change:source", event: ObjectEvent): void;
  (e: "change:visible", event: ObjectEvent): void;
  (e: "change:zIndex", event: ObjectEvent): void;
}
export interface LayerRenderEvents {
  (e: "postrender", event: RenderEvent): void;
  (e: "prerender", event: RenderEvent): void;
}
export interface LayerEvents
  extends CommonEvents,
    LayerChangeEvents,
    LayerRenderEvents {
  (e: "sourceready", event: BaseEvent): void;
}

export const TILE_SOURCE_EVENTS = [
  "tileloadend",
  "tileloaderror",
  "tileloadstart",
];
export interface TileSourceEvents extends CommonEvents {
  (e: "tileloadend", event: TileSourceEvent): void;
  (e: "tileloaderror", event: TileSourceEvent): void;
  (e: "tileloadstart", event: TileSourceEvent): void;
}

export const IMAGE_SOURCE_EVENTS = [
  "imageloadend",
  "imageloaderror",
  "imageloadstart",
];
export interface ImageSourceEvents extends CommonEvents {
  (e: "imageloadend", event: ImageSourceEvent): void;
  (e: "imageloaderror", event: ImageSourceEvent): void;
  (e: "imageloadstart", event: ImageSourceEvent): void;
}

export const VECTOR_SOURCE_EVENTS = [
  "addfeature",
  "changefeature",
  "clear",
  "featuresloadend",
  "featuresloaderror",
  "featuresloadstart",
  "removefeature",
];
export interface VectorSourceEvents extends CommonEvents {
  (e: "addfeature", event: VectorSourceEvent): void;
  (e: "changefeature", event: VectorSourceEvent): void;
  (e: "clear", event: VectorSourceEvent): void;
  (e: "featuresloadend", event: VectorSourceEvent): void;
  (e: "featuresloaderror", event: VectorSourceEvent): void;
  (e: "featuresloadstart", event: VectorSourceEvent): void;
  (e: "removefeature", event: VectorSourceEvent): void;
}

export function useOpenLayersEvents(
  feature: MaybeRefOrGetter<BaseObject>,
  eventNames: string[],
) {
  const events = [...COMMON_EVENTS, ...eventNames].map((evtKey) =>
    useOpenLayersEvent(evtKey, feature),
  );
  return {
    updateOpenLayersEventHandlers: () => {
      events.forEach((event) => {
        event?.remove();
        event?.attach();
      });
    },
    removeOpenLayersEventHandlers: () =>
      events.forEach((event) => event?.remove()),
  };
}

export function useOpenLayersEvent<F extends BaseObject, T extends string>(
  evtKey: T,
  obj: MaybeRefOrGetter<F | undefined | null>,
) {
  const vm = getCurrentInstance();
  if (!vm) return;
  const emits = vm.type.emits;
  if (evtKey in emits)
    return logError("[Vue3-OpenLayers Error] EVENT doesnt have emit", evtKey);

  const handlerKey = toHandlerKey(evtKey);
  const props = vm.vnode.props;

  if (
    !props ||
    !(handlerKey in props) ||
    typeof props[handlerKey] !== "function"
  )
    return;
  const originalHandler = props[handlerKey];
  const handler = (evt: BaseEvent) => {
    logDebug(evt.type, {
      eventName: evt.type,
      args: [evt],
      source: evt.target,
    });
    return originalHandler(evt);
  };
  const attachHandler = (obj: MaybeRefOrGetter<F | undefined | null>) => {
    const instance = toValue(obj);
    if (!instance) return logError("ON Instance doesnt exists");
    instance.on(evtKey as never, handler);
  };
  const deattachHandler = (obj: MaybeRefOrGetter<F | undefined | null>) => {
    const instance = toValue(obj);
    if (!instance) return logError("[UN] Instance doesnt exists");
    instance.un(evtKey as never, handler);
  };
  onMounted(() => attachHandler(obj));
  onActivated(() => attachHandler(obj));
  onUnmounted(() => deattachHandler(obj));
  onDeactivated(() => deattachHandler(obj));

  if (isRef(obj))
    watch(obj, (value, oldValue) => {
      if (oldValue === value) return;
      if (oldValue != null) deattachHandler(oldValue);
      if (value != null) attachHandler(value);
    });
  return {
    attach: () => attachHandler(obj),
    remove: () => deattachHandler(obj),
  };
}
