<script setup lang="ts">
import { computed } from "vue";
import AmountDisplay from "@/components/AmountDisplay.vue";
import AccountIdDisplay from "@/components/AccountIdDisplay.vue";
import TokenIdDisplay from "@/components/TokenIdDisplay.vue";

interface TransferRecord {
  token_id: any;
  account: any;
  amount: number;
  is_approval?: boolean;
}

const props = defineProps<{
  value: any;
}>();

const tokens = computed(() => {
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
  <template v-for="tok in tokens.values()" v-bind:key="tok[0].token_id">
    <div class="header">
      Token <TokenIdDisplay v-bind:value="tok[0].token_id" />
    </div>
    <div class="crypto-xfers">
      <div class="crypto-xfer-list">
        <div class="crypto-xfer-list-header">From</div>
        <template
          v-for="tx in tok.filter((xfer) => xfer.amount < 0)"
          v-bind:key="tx.account"
        >
          <div>
            <AccountIdDisplay v-bind:value="tx.account!" />
            <span v-if="tx.is_approval" class="approval">(via Approval)</span>
          </div>
          <div>
            <AmountDisplay v-bind:value="-tx.amount" />
          </div>
        </template>
      </div>
      <div class="crypto-xfers">
        <div class="crypto-xfer-list">
          <div class="crypto-xfer-list-header">To</div>
          <template
            v-for="tx in tok.filter((xfer) => xfer.amount > 0)"
            v-bind:key="tx.account"
          >
            <div>
              <AccountIdDisplay v-bind:value="tx.account!" />
              <span v-if="tx.is_approval" class="approval">(via Approval)</span>
            </div>
            <div>
              <AmountDisplay v-bind:value="tx.amount" />
            </div>
          </template>
        </div>
      </div>
    </div>
  </template>
</template>

<style scoped>
div.header {
  font-size: 18px;
  font-weight: 100;
  margin: 16px 0 6px 0;
}

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
span.approval {
  font-size: 8px;
  margin-left: 6px;
}
</style>
