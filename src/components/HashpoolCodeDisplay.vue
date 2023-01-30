<script setup lang="ts">
import { computed, defineProps } from "vue";
import { HashpoolTransactionStatus } from "@bugbytes/hapi-hashpool";
const props = defineProps<{
  value: HashpoolTransactionStatus | undefined;
}>();
const statusText = computed(() => {
  const code = props.value;
  if (code) {
    const txt = HashpoolTransactionStatus[code];
    return txt ? txt : `UNKNOWN STATUS ${code}`;
  }
  return null;
});
</script>

<template>
  <span v-if="!!statusText">{{ statusText }}</span>
  <span v-else class="none">None</span>
</template>

<style scoped>
span.none {
  color: var(--cds-nd-300);
}
</style>
