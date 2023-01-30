<script setup lang="ts">
import { computed, defineProps } from "vue";
import type { TransactionID } from "@bugbytes/hapi-proto";
import {
  is_transaction_id,
  keyString_to_transactionID,
  timestamp_to_date,
  type TransactionIdKeyString,
} from "@bugbytes/hapi-util";
const props = defineProps<{
  value: TransactionID | TransactionIdKeyString | undefined;
}>();
const data = computed(() => {
  const transactionId = !props.value
    ? null
    : typeof props.value === "string" && is_transaction_id(props.value)
    ? keyString_to_transactionID(props.value)
    : props.value;
  if (transactionId && transactionId.transactionValidStart) {
    const date = timestamp_to_date(transactionId.transactionValidStart);
    if (Date.now() < date.getTime() + 86400000) {
      return date.toLocaleTimeString();
    }
    return date.toLocaleString();
  }
  return "";
});
</script>

<template>
  {{ data }}
</template>
