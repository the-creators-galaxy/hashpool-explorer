<script setup lang="ts">
import { computed, defineProps } from "vue";
import type { FileID } from "@bugbytes/hapi-proto";
import {
  is_entity_id,
  fileID_to_keyString,
  type EntityIdKeyString,
} from "@bugbytes/hapi-util";
const props = defineProps<{
  value: FileID | EntityIdKeyString | undefined;
}>();
const data = computed(() => {
  const keyString = !props.value
    ? null
    : typeof props.value === "string" && is_entity_id(props.value)
    ? props.value
    : fileID_to_keyString(props.value);
  if (keyString) {
    return { keyString };
  }
  return null;
});
</script>

<template>
  <span v-if="!!data">{{ data.keyString }}</span>
  <span class="none" v-else>None</span>
</template>

<style scoped>
a {
  color: var(--cds-cs-700);
}

span.none {
  color: var(--cds-nd-300);
}
</style>
