<script setup lang="ts">
import type { TransactionBody } from "@bugbytes/hapi-proto";
import { computed } from "vue";
import JsonNodeDisplay from "./JsonNodeDisplay.vue";

const props = defineProps<{
  value: any;
}>();

const info = computed(() => {
  const data = (props.value as TransactionBody).data as any;
  const txCase = data?.$case;
  if (txCase) {
    let kind = txCase.replace(/([A-Z])/g, " $1").trim();
    kind = kind.charAt(0).toUpperCase() + kind.slice(1);
    const details =
      data[Object.keys(data as any).filter((k) => k !== "$case")[0]] || {};
    return { kind, details };
  }
  return { kind: "Unknown", details: data || {} };
});
</script>

<template v-if="info">
  <h2 class="kind">{{ info.kind }}</h2>
  <JsonNodeDisplay v-bind:value="info.details" />
</template>

<style scoped>
h2 {
  margin: 16px 0 6px 0;
}
</style>
