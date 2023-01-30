<script setup lang="ts">
import { computed, defineProps } from "vue";
const props = defineProps<{
  value: number;
}>();
const data = computed(() => {
  const amount = props.value;
  if (
    typeof amount == "number" &&
    !isNaN(amount) &&
    isFinite(amount) &&
    amount > 0
  ) {
    return `${amount.toLocaleString()}`;
  }
  return "0";
});
</script>

<template>
  <span>{{ data }}</span>
</template>
