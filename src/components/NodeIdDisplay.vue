<script setup lang="ts">
import { computed, defineProps } from "vue";
import type { AccountID } from "@bugbytes/hapi-proto";
import { config } from "@/models/config";
import {
  accountID_to_keyString,
  is_entity_id,
  type EntityIdKeyString,
} from "@bugbytes/hapi-util";
const props = defineProps<{
  value: AccountID | EntityIdKeyString | undefined;
}>();
const data = computed(() => {
  const keyString = !props.value
    ? null
    : typeof props.value === "string" && is_entity_id(props.value)
    ? props.value
    : accountID_to_keyString(props.value);
  if (keyString) {
    const channel = config.value.nodes.find(
      (n) => n.node_account_id === keyString
    );
    const url = channel
      ? `${config.value.hashscanBaseUrl}/node/${channel.node_id}`
      : `${config.value.hashscanBaseUrl}/account/${keyString}`;
    return { keyString, url };
  }
  return null;
});
</script>

<template>
  <a v-if="!!data" v-bind:href="data.url" target="_blank">{{
    data.keyString
  }}</a>
  <span v-else>Unknown Node</span>
</template>

<style scoped>
a {
  color: var(--cds-cs-700);
}
</style>
