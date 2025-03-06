<template>
  <slot></slot>
</template>

<script setup lang="ts">
import {
  computed,
  inject,
  onMounted,
  onUnmounted,
  provide,
  type Ref,
  watch,
} from "vue";
import Select, { type Options, SelectEvent } from "ol/interaction/Select";
import Style from "ol/style/Style";
import type Map from "ol/Map";
import usePropsAsObjectProperties from "@/composables/usePropsAsObjectProperties";
import {
  type CommonEvents,
  useOpenLayersEvents,
} from "@/composables/useOpenLayersEvents";

// prevent warnings caused by event pass-through via useOpenLayersEvents composable
defineOptions({
  inheritAttrs: false,
});

const props = defineProps<Options>();

type Emits = CommonEvents & {
  (e: "select", event: SelectEvent): void;
};
defineEmits<Emits>();

const map = inject<Ref<Map>>("map");
const properties = usePropsAsObjectProperties(props);

const select = computed(
  () =>
    new Select({
      ...(properties as Options),
      style: new Style(),
    }),
);

useOpenLayersEvents(select, ["select"]);

watch(select, (newVal, oldVal) => {
  map?.value?.removeInteraction(oldVal);
  map?.value?.addInteraction(newVal);

  map?.value?.changed();
});

onMounted(() => {
  map?.value?.addInteraction(select.value);
});

onUnmounted(() => {
  map?.value?.removeInteraction(select.value);
});

provide("stylable", select);

defineExpose({
  select,
});
</script>
