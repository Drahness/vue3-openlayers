<template>
  <template v-if="!instanceMode">
    <div ref="mapRef" v-bind="$attrs">
      <slot></slot>
    </div>
  </template>
  <template v-else>
    <slot></slot>
  </template>
</template>

<script setup lang="ts">
import Map, { type AtPixelOptions, type MapOptions } from "ol/Map";
import {
  computed,
  markRaw,
  onActivated,
  onDeactivated,
  onMounted,
  onUnmounted,
  provide,
  readonly,
  ref,
  toValue,
  watch,
} from "vue";
import usePropsAsObjectProperties from "../../composables/usePropsAsObjectProperties";
import type { Pixel } from "ol/pixel";
import type { FeatureLike } from "ol/Feature";
import type { Layer } from "ol/layer";
import type { Source } from "ol/source";
import type { SimpleGeometry } from "ol/geom";
import { type CommonEvents, useOpenLayersEvents } from "@/composables";
import type { Coordinate } from "ol/coordinate";

type Props = MapOptions & { instance?: Map };
const props = defineProps<Props>();
const instanceMode = readonly(ref(!!props.instance));

defineEmits<
  CommonEvents & {
    (e: "change:layerGroup", event: ObjectEvent): void;
    (e: "change:size", event: ObjectEvent): void;
    (e: "change:target", event: ObjectEvent): void;
    (e: "change:view", event: ObjectEvent): void;
    (e: "click", event: MapBrowserEvent<UIEvent>): void;
    (e: "dblclick", event: MapBrowserEvent<UIEvent>): void;
    (e: "singleclick", event: MapBrowserEvent<UIEvent>): void;
    (e: "loadstart", event: MapEvent): void;
    (e: "loadend", event: MapEvent): void;
    (e: "pointerdrag", event: MapBrowserEvent<UIEvent>): void;
    (e: "pointermove", event: MapBrowserEvent<UIEvent>): void;
    (e: "movestart", event: MapEvent): void;
    (e: "moveend", event: MapEvent): void;
    (e: "postrender", event: MapEvent): void;
    (e: "precompose", event: RenderEvent): void;
    (e: "postcompose", event: RenderEvent): void;
    (e: "rendercomplete", event: RenderEvent): void;
  }
>();
const properties = usePropsAsObjectProperties({
  ...props,
  instance: undefined,
});
const instance = computed(() => {
  if (instanceMode.value) return props.instance;
  else return markRaw(new Map({ ...(properties as MapOptions) }));
});

const mapTarget = computed(() => instance.value?.getTargetElement());
const mapRef = ref();

provide("map", instance);

const forEachFeatureAtPixel = (
  pixel: Pixel,
  callback: (
    arg0: FeatureLike,
    arg1: Layer<Source>,
    arg2: SimpleGeometry,
  ) => unknown,
  options?: AtPixelOptions,
) => toValue(instance)?.forEachFeatureAtPixel(pixel, callback, options);

useOpenLayersEvents(instance, [
  "change",
  "error",
  "propertychange",
  "click",
  "change:size",
  "change:target",
  "change:view",
  "change:layergroup",
  "dblclick",
  "singleclick",
  "pointerdrag",
  "pointermove",
  "movestart",
  "moveend",
  "postrender",
  "precompose",
  "rendercomplete",
  "loadstart",
  "loadend",
]);

const getCoordinateFromPixel = (pixel: Coordinate) =>
  toValue(instance)?.getCoordinateFromPixel(pixel);
const render = () => toValue(instance)?.render();
const updateSize = () => toValue(instance)?.updateSize();
const onLoadEnd = () => {
  const map = toValue(instance);
  if (!map) return;
  map.getTargetElement().classList.add("ol-map-fully-loaded");
  map.getTargetElement().classList.remove("ol-map-loading");
};
const onLoadStart = () => {
  const map = toValue(instance);
  if (!map) return;
  map.getTargetElement().classList.add("ol-map");
  map.getTargetElement().classList.add("ol-map-loading");
  map.getTargetElement().classList.remove("ol-map-fully-loaded");
};

const mount = () => {
  // bind the map to the component template if not re-using an existing one passed via prop.
  if (!instanceMode.value) instance.value?.setTarget(mapRef.value);
  instance.value?.on("loadstart", onLoadStart);
  instance.value?.on("loadend", onLoadEnd);
};
const unmount = () => {
  const _map = instance.value;
  if (!_map) return;
  if (!instanceMode.value) _map.setTarget(undefined);
  instance.value.un("loadstart", onLoadStart);
  instance.value.un("loadend", onLoadEnd);
};
onMounted(mount);
onActivated(mount);
onDeactivated(unmount);
onUnmounted(() => {
  unmount();
  if (!instanceMode.value) instance.value?.dispose();
});

watch(properties, () => {
  if (!instanceMode.value)
    instance.value?.setProperties({
      ...properties,
      target: properties.target ?? toValue(mapRef),
    });
  else
    instance.value?.setProperties({
      ...properties,
      target: properties.target ?? toValue(mapTarget),
    });
});
defineExpose({
  map: readonly(instance),
  mapRef: mapTarget,
  forEachFeatureAtPixel,
  getCoordinateFromPixel,
  render,
  updateSize,
});
</script>
