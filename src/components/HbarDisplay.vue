<script setup lang="ts">
import { computed, defineProps } from "vue";
const props = defineProps<{
  value: number;
}>();
const data = computed(() => {
  const tbar = props.value;
  if (typeof tbar == "number" && !isNaN(tbar) && isFinite(tbar) && tbar > 0) {
    if (tbar < 1_000_000) {
      return `${tbar.toLocaleString()} tℏ`;
    }
    const hbar = tbar / 1_00_000_000;
    if (hbar === ~~hbar) {
      return `${hbar.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })} ℏ`;
    }
    return `${hbar.toLocaleString(undefined, {
      minimumFractionDigits: 8,
      maximumFractionDigits: 8,
    })} ℏ`;
  }
  return "0 tℏ";
});
</script>

<template>
  <span>{{ data }}</span>
</template>
