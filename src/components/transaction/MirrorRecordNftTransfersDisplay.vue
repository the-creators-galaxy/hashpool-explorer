<script setup lang="ts">
import { computed } from "vue";
import AccountIdDisplay from "@/components/AccountIdDisplay.vue";
import TokenIdDisplay from "@/components/TokenIdDisplay.vue";

interface TransferRecord {
  is_approval?: boolean;
  receiver_account_id: any;
  sender_account_id: any;
  serial_number: number;
  token_id: any;
}

const props = defineProps<{
  value: any;
}>();

const nfts = computed(() => {
  const recordsAsMap = new Map<any, TransferRecord[]>();
  for (const record of (props.value as TransferRecord[]) || []) {
    const list = recordsAsMap.get(record.token_id);
    if (list) {
      list.push(record);
    } else {
      recordsAsMap.set(record.token_id, [record]);
    }
  }
  return recordsAsMap;
});
</script>

<template>
  <template v-for="nft in nfts.values()" v-bind:key="nft[0].token_id">
    <div class="header">
      NFT <TokenIdDisplay v-bind:value="nft[0].token_id" />
    </div>
    <div class="nft-xfer-list">
      <div class="nft-header">Serial No.</div>
      <div class="nft-header">From</div>
      <div class="nft-header">To</div>
      <template v-for="tx in nft" v-bind:key="tx.serial_number">
        <div>
          {{ tx.serial_number }}
        </div>
        <div>
          <AccountIdDisplay v-bind:value="tx.sender_account_id!" />
          <span v-if="tx.is_approval" class="approval">(via Approval)</span>
        </div>
        <div>
          <AccountIdDisplay v-bind:value="tx.receiver_account_id!" />
        </div>
      </template>
    </div>
  </template>
</template>

<style scoped>
div.header {
  font-size: 18px;
  font-weight: 100;
  margin: 16px 0 6px 0;
}
div.nft-xfer-list {
  display: grid;
  grid-template-columns: max-content max-content max-content;
  column-gap: 18px;
  align-self: start;
}
div.nft-header {
  border-bottom: 0.5px solid var(--cds-cs-500);
}
span.approval {
  font-size: 8px;
  margin-left: 6px;
}
</style>
