<script setup lang="ts">
import HashpoolCodeDisplay from "@/components/HashpoolCodeDisplay.vue";
import NodeIdDisplay from "@/components/NodeIdDisplay.vue";
import ValidOnDisplay from "@/components/ValidOnDisplay.vue";
import PrecheckCodeDisplay from "@/components/PrecheckCodeDisplay.vue";
import { getTransactions } from "@/models/hashpool";
import {
  HashpoolTransactionStatus,
  type TransactionSummary,
} from "@bugbytes/hapi-hashpool";
import { ResponseCodeEnum } from "@bugbytes/hapi-proto";
import { onMounted, onUnmounted, ref } from "vue";

let loop = 0;
const transactions = ref<TransactionSummary[]>([]);

onMounted(async () => {
  updateList();
});

onUnmounted(() => {
  clearTimeout(loop);
});

async function updateList() {
  transactions.value = await getTransactions();
  loop = setTimeout(updateList, transactions.value.length > 0 ? 30000 : 5000);
}
</script>

<template>
  <div class="header">Hashgraph Memory Pool Explorer</div>
  <table v-if="transactions.length > 0">
    <tr>
      <th>Transaction ID</th>
      <th>Status</th>
      <th>Type</th>
      <th>Node</th>
      <th>Submits</th>
    </tr>
    <tr v-for="tx in transactions" v-bind:key="tx.transaction_id">
      <td>
        <router-link v-bind:to="tx.transaction_id">{{
          tx.transaction_id
        }}</router-link>
      </td>
      <td>
        <template v-if="tx.status === HashpoolTransactionStatus.Completed">
          <span v-if="tx.precheck_code === ResponseCodeEnum.OK">Accepted</span>
          <PrecheckCodeDisplay
            v-else
            class="failed"
            v-bind:value="tx.precheck_code"
          />
        </template>
        <HashpoolCodeDisplay v-else v-bind:value="tx.status" />
      </td>
      <td>{{ tx.type }}</td>
      <td><NodeIdDisplay v-bind:value="tx.node" /></td>
      <td class="submits">
        <ValidOnDisplay
          v-if="tx.status === HashpoolTransactionStatus.Queued"
          v-bind:value="tx.transaction_id"
        />
        <span v-else class="submitted">Submitted</span>
      </td>
    </tr>
  </table>
  <div v-else>
    At this time, it appears the hashpool is not tracking any transactions.
  </div>
</template>

<style scoped>
div.header {
  font-weight: 100;
  font-size: 24px;
  margin-bottom: 24px;
}
table {
  border-collapse: separate;
  border-spacing: 8px 0;
}
td {
  padding: 0 4px;
  vertical-align: top;
}
td.submits {
  white-space: nowrap;
}
th {
  font-weight: 100;
  font-size: 18px;
  border-bottom: 0.5px solid var(--cds-cs-500);
}
span.submitted {
  color: var(--cds-nd-300);
}
.failed {
  color: var(--cds-ui-e-600);
}
</style>
