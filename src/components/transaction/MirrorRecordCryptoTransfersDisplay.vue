<script setup lang="ts">
import { computed } from "vue";
import HbarDisplay from "@/components/HbarDisplay.vue";
import AccountIdDisplay from "@/components/AccountIdDisplay.vue";

interface TransferRecord {
  account: any;
  amount: number;
  is_approval?: boolean;
}

const props = defineProps<{
  value: any;
}>();

const crypto = computed(() => {
  return (props.value as TransferRecord[]) || [];
});
</script>

<template>
  <template v-if="crypto.length > 0">
    <div class="crypto-xfers">
      <div class="crypto-xfer-list">
        <div class="crypto-xfer-list-header">From</div>
        <template
          v-for="tx in crypto.filter((xfer) => xfer.amount < 0)"
          v-bind:key="tx.account"
        >
          <div>
            <AccountIdDisplay v-bind:value="tx.account!" />
            <span v-if="tx.is_approval" class="approval">(via Approval)</span>
          </div>
          <div>
            <HbarDisplay v-bind:value="-tx.amount" />
          </div>
        </template>
      </div>
      <div class="crypto-xfer-list">
        <div class="crypto-xfer-list-header">To</div>
        <template
          v-for="tx in crypto.filter((xfer) => xfer.amount > 0)"
          v-bind:key="tx.account"
        >
          <div>
            <AccountIdDisplay v-bind:value="tx.account!" />
            <span v-if="tx.is_approval" class="approval">(via Approval)</span>
          </div>
          <div>
            <HbarDisplay v-bind:value="tx.amount" />
          </div>
        </template>
      </div>
    </div>
  </template>
</template>

<style scoped>
div.crypto-xfers {
  display: grid;
  grid-template-columns: max-content max-content;
  justify-content: start;
  column-gap: 24px;
}

div.crypto-xfer-list {
  display: grid;
  grid-template-columns: max-content max-content;
  column-gap: 18px;
  align-self: start;
}

div.crypto-xfer-list-header {
  grid-column: 1 / 3;
  border-bottom: 0.5px solid var(--cds-cs-500);
}
</style>
