<template lang="">
  <slot></slot>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, watch } from "vue";

import DragBox, {
  type DragBoxEvent,
  type Options,
} from "ol/interaction/DragBox";

import usePropsAsObjectProperties from "@/composables/usePropsAsObjectProperties";
import type { Map } from "ol";
import {
  useOpenLayersEvents,
  type CommonEvents,
} from "@/composables/useOpenLayersEvents";

// prevent warnings caused by event pass-through via useOpenLayersEvents composable
defineOptions({
  inheritAttrs: false,
});

const props = defineProps<Options>();
defineEmits<
  CommonEvents & {
    (e: "boxcancel", event: DragBoxEvent): void;
    (e: "boxdrag", event: DragBoxEvent): void;
    (e: "boxend", event: DragBoxEvent): void;
    (e: "boxstart", event: DragBoxEvent): void;
  }
>();

const map = inject<Ref<Map>>("map");

const properties = usePropsAsObjectProperties(props);

const dragbox = computed(() => new DragBox(properties));

useOpenLayersEvents(dragbox, ["boxcancel", "boxdrag", "boxend", "boxstart"]);

watch(dragbox, (newVal, oldVal) => {
  map?.value?.removeInteraction(oldVal);
  map?.value?.addInteraction(newVal);

  map?.value?.changed();
});

onMounted(() => {
  map?.value?.addInteraction(dragbox.value);
});

onUnmounted(() => {
  map?.value?.removeInteraction(dragbox.value);
});

defineExpose({
  dragbox,
});
</script>
