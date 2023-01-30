<script setup lang="ts">
import { computed } from "vue";
import AccountIdDisplay from "@/components/AccountIdDisplay.vue";

interface TransferRecord {
  amount?: number;
  collector_account_id: any;
  effective_payer_account_ids: any;
  token_id: any;
}

const props = defineProps<{
  value: any;
}>();

const fees = computed(() => {
  return (props.value as TransferRecord[]) || [];
});
</script>

<template>
  <div v-if="fees.length > 0" class="fee-xfer-list">
    <div class="fee-header">Amount</div>
    <div class="fee-header">Token</div>
    <div class="fee-header">From</div>
    <div class="fee-header">To</div>
    <template v-for="(fee, index) in fees" v-bind:key="index">
      <div>
        {{ fee.amount }}
      </div>
      <div>
        <AccountIdDisplay v-bind:value="fee.token_id" />
      </div>
      <div>
        <div
          v-for="payer in fee.effective_payer_account_ids"
          v-bind:key="payer"
        >
          <AccountIdDisplay v-bind:value="payer" />
        </div>
      </div>
      <div>
        <AccountIdDisplay v-bind:value="fee.collector_account_id" />
      </div>
    </template>
  </div>
</template>

<style scoped>
div.fee-xfer-list {
  display: grid;
  grid-template-columns: max-content max-content max-content max-content;
  column-gap: 18px;
  align-self: start;
}

div.fee-header {
  border-bottom: 0.5px solid var(--cds-cs-500);
}
</style>
