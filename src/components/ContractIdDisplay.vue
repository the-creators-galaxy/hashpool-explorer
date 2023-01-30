<script setup lang="ts">
import { computed, defineProps } from "vue";
import type { ContractID } from "@bugbytes/hapi-proto";
import { config } from "@/models/config";
import {
  is_entity_id,
  contractID_to_keyString,
  type EntityIdKeyString,
} from "@bugbytes/hapi-util";
const props = defineProps<{
  value: ContractID | EntityIdKeyString | undefined;
}>();
const data = computed(() => {
  const keyString = !props.value
    ? null
    : typeof props.value === "string" && is_entity_id(props.value)
    ? props.value
    : contractID_to_keyString(props.value);
  if (keyString) {
    const url = `${config.value.hashscanBaseUrl}/contract/${keyString}`;
    return { keyString, url };
  }
  return null;
});
</script>

<template>
  <a v-if="!!data" v-bind:href="data.url" target="_blank">{{
    data.keyString
  }}</a>
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
