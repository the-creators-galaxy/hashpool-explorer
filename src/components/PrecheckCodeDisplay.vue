<script setup lang="ts">
import { computed, defineProps } from "vue";
import { ResponseCodeEnum } from "@bugbytes/hapi-proto";
const props = defineProps<{
  value: ResponseCodeEnum | -1 | -2 | undefined;
}>();
const precheckText = computed(() => {
  const code = props.value;
  switch (code) {
    case ResponseCodeEnum.OK:
      return "OK";
    case -1:
      return "GRPC COMMUNICATION ERROR";
    case -2:
      return "UNKNOWN HASHPOOL ERROR";
    case undefined:
      return null;
  }
  const txt = ResponseCodeEnum[code];
  return txt ? txt : `UNKNOWN CODE ${code}`;
});
</script>

<template>
  <span v-if="!!precheckText">{{ precheckText }}</span>
  <span v-else class="none">None</span>
</template>

<style scoped>
span.none {
  color: var(--cds-nd-300);
}
</style>
