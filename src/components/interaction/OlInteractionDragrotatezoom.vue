<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { inject, watch, onMounted, onUnmounted, computed } from "vue";
import DragRotateAndZoom, {
  type Options,
} from "ol/interaction/DragRotateAndZoom";
import type Map from "ol/Map";
import usePropsAsObjectProperties from "@/composables/usePropsAsObjectProperties";

const props = defineProps<Options>();

const map = inject<Ref<Map>>("map");
const properties = usePropsAsObjectProperties(props);
const dragRotateZoom = computed(() => new DragRotateAndZoom(properties));

watch(dragRotateZoom, (newVal, oldVal) => {
  map?.value?.removeInteraction(oldVal);
  map?.value?.addInteraction(newVal);

  map?.value?.changed();
});

onMounted(() => {
  map?.value?.addInteraction(dragRotateZoom.value);
});

onUnmounted(() => {
  map?.value?.removeInteraction(dragRotateZoom.value);
});

defineExpose({
  dragRotateZoom,
});
</script>
