<script setup lang="ts">
import * as ed from "@noble/ed25519";
import type { SignaturePair } from "@bugbytes/hapi-proto";
import { computed, defineProps } from "vue";
const props = defineProps<{
  value: SignaturePair | undefined;
}>();
const data = computed(() => {
  const kind = props.value?.signature?.$case;
  return kind
    ? { kind, prefixInHex: ed.utils.bytesToHex(props.value.pubKeyPrefix) }
    : null;
});
</script>

<template>
  <div v-if="!data" class="none">None</div>
  <div v-else class="sig-pair">
    <div class="sig-type">{{ data.kind }}</div>
    <div class="sig-prefix">{{ data.prefixInHex }}</div>
  </div>
</template>

<style scoped>
.sig-pair {
  display: flex;
  flex-direction: row;
  gap: 12px;
  justify-content: start;
  overflow: hidden;
}
.sig-type {
  font-size: 12px;
  text-transform: capitalize;
  color: var(--cds-cs-700);
}
.sig-prefix {
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
  flex-shrink: 1;
  user-select: text;
}
</style>
