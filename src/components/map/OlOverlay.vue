<template lang="">
  <div ref="htmlContent">
    <slot :position="position" />
  </div>
</template>

<script setup lang="ts">
import type { PanIntoViewOptions, Positioning } from "ol/Overlay";
import Overlay, { type Options } from "ol/Overlay";
import {
  inject,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  watch,
  watchEffect,
} from "vue";

import type Map from "ol/Map";
import type { Coordinate } from "ol/coordinate";
import usePropsAsObjectProperties from "@/composables/usePropsAsObjectProperties";
import {
  useOpenLayersEvents,
  type CommonEvents,
} from "@/composables/useOpenLayersEvents";
import type { ObjectEvent } from "ol/Object";

// prevent warnings caused by event pass-through via useOpenLayersEvents composable
defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<Options>(), {
  stopEvent: true,
  insertFirst: true,
});

type Emits = CommonEvents & {
  (e: "change:element", event: ObjectEvent): void;
  (e: "change:map", event: ObjectEvent): void;
  (e: "change:offset", event: ObjectEvent): void;
  (e: "change:position", event: ObjectEvent): void;
  (e: "change:positioning", event: ObjectEvent): void;
};
defineEmits<Emits>();

const map = inject<Map>("map");

const htmlContent = ref<HTMLElement>();

const properties = usePropsAsObjectProperties(props);

const overlay = shallowRef(new Overlay(properties));

useOpenLayersEvents(overlay, [
  "change:element",
  "change:map",
  "change:offset",
  "change:position",
  "change:positioning",
]);

const getOffset = () => overlay.value.getOffset();
const getPosition = () => overlay.value.getPosition();
const getPositioning = () => overlay.value.getPositioning();
const panIntoView = (optPanIntoViewOptions: PanIntoViewOptions) =>
  overlay.value.panIntoView(optPanIntoViewOptions);
const setElement = (element: HTMLElement | undefined) =>
  overlay.value.setElement(element);
const setOffset = (offset: number[]) => overlay.value.setOffset(offset);
const setPosition = (position?: Coordinate) =>
  overlay.value.setPosition(position);
const setPositioning = (positioning: Positioning) =>
  overlay.value.setPositioning(positioning);

function removeOverlay(ov: Overlay) {
  const removed = map?.removeOverlay(ov);
  if (!removed) {
    console.warn("couldn't find matching overlay to remove", overlay.value);
  }
}

onMounted(() => {
  map?.addOverlay(overlay.value);
});

onUnmounted(() => removeOverlay(overlay.value));

watch(
  () => properties,
  (newValue) => {
    for (const key in newValue) {
      const keyInObj = key as keyof typeof newValue;
      if (newValue[keyInObj] !== undefined) {
        overlay.value.set(key, newValue[keyInObj]);
      }
    }
  },
  { deep: true },
);

watchEffect(
  () => {
    setElement(htmlContent.value);
  },
  {
    flush: "post",
  },
);

defineExpose({
  overlay,
  htmlContent,
  getOffset,
  getPosition,
  getPositioning,
  panIntoView,
  setElement,
  setOffset,
  setPosition,
  setPositioning,
});
</script>
