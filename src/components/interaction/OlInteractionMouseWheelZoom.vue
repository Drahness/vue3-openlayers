<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { inject, watch, onMounted, onUnmounted, computed, type Ref } from "vue";
import MouseWheelZoom, { type Options } from "ol/interaction/MouseWheelZoom";
import type Map from "ol/Map";
import usePropsAsObjectProperties from "@/composables/usePropsAsObjectProperties";

const props = withDefaults(defineProps<Options>(), { useAnchor: true });

const map = inject<Ref<Map>>("map");
const properties = usePropsAsObjectProperties(props);
const mouseWheelZoom = computed(() => new MouseWheelZoom(properties));

watch(mouseWheelZoom, (newVal, oldVal) => {
  map?.value?.removeInteraction(oldVal);
  map?.value?.addInteraction(newVal);
  map?.value?.changed();
});

onMounted(() => {
  // remove the default MouseWheelZoom interaction if available
  map?.value?.getInteractions().forEach((interaction) => {
    if (interaction instanceof MouseWheelZoom) {
      map?.value?.removeInteraction(interaction);
    }
  });
  map?.value?.addInteraction(mouseWheelZoom.value);
});

onUnmounted(() => {
  map?.value?.removeInteraction(mouseWheelZoom.value);
});

defineExpose({
  mouseWheelZoom,
});
</script>
