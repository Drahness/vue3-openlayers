<template lang="">
  <slot></slot>
</template>

<script setup lang="ts">
import { inject, watch, onMounted, onUnmounted, computed, type Ref } from "vue";

import DragRotate, { type Options } from "ol/interaction/DragRotate";

import usePropsAsObjectProperties from "@/composables/usePropsAsObjectProperties";
import type { Map } from "ol";

const props = defineProps<Options>();

const map = inject<Ref<Map>>("map");

const properties = usePropsAsObjectProperties(props);

const dragrotate = computed(() => {
  return new DragRotate(properties);
});

watch(dragrotate, (newVal, oldVal) => {
  map?.value?.removeInteraction(oldVal);
  map?.value?.addInteraction(newVal);

  map?.value?.changed();
});

onMounted(() => {
  map?.value?.addInteraction(dragrotate.value);
});

onUnmounted(() => {
  map?.value?.removeInteraction(dragrotate.value);
});

defineExpose({
  dragrotate,
});
</script>
