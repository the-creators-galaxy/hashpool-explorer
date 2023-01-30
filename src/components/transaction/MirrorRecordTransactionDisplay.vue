<script setup lang="ts">
import { computed } from "vue";
import type { TransactionDetail } from "@bugbytes/hapi-mirror";
import {
  keyString_to_localeDateTimeString,
  is_timestamp,
  type EntityIdKeyString,
} from "@bugbytes/hapi-util";
import MirrorRecordCryptoTransfersDisplay from "./MirrorRecordCryptoTransfersDisplay.vue";
import MirrorRecordTokenTransfersDisplay from "./MirrorRecordTokenTransfersDisplay.vue";
import MirrorRecordNftTransfersDisplay from "./MirrorRecordNftTransfersDisplay.vue";
import MirrorRecordAssessedFeesDisplay from "./MirrorRecordAssessedFeesDisplay.vue";
import NodeIdDisplay from "@/components/NodeIdDisplay.vue";
import HbarDisplay from "@/components/HbarDisplay.vue";
import AccountIdDisplay from "../AccountIdDisplay.vue";
import type { TimestampKeyString } from "@bugbytes/hapi-util";

const props = defineProps<{
  value: any;
}>();

const record = computed(() => {
  return (props.value as TransactionDetail) || { name: "UNKNOWN" };
});
</script>

<template v-if="info">
  <h2 class="kind">{{ record.name }}</h2>
  <dl>
    <dt>Memo</dt>
    <dd v-if="!!record.memo_base64">{{ record.memo_base64 }}</dd>
    <dd v-else class="none">None</dd>
    <dt>Valid Starting</dt>
    <dd>
      {{
        keyString_to_localeDateTimeString(
          record.valid_start_timestamp as unknown as TimestampKeyString
        )
      }}
    </dd>
    <dt>Transaction Time to Live</dt>
    <dd>{{ record.valid_duration_seconds || 0 }} seconds</dd>
    <dt>Submit to Hedera Node</dt>
    <dd>
      <NodeIdDisplay v-bind:value="(record.node as EntityIdKeyString)" />
    </dd>
    <template v-if="record.scheduled">
      <dt>Scheduled</dt>
      <dd>Yes</dd>
    </template>
    <template v-if="record.nonce">
      <dt>Nonce</dt>
      <dd>{{ record.nonce }}</dd>
    </template>
    <dt>Maximum Allowed Fee</dt>
    <dd>
      <HbarDisplay v-bind:value="parseInt(record.max_fee!, 10)" />
    </dd>
    <dt>Final Status</dt>
    <dd>{{ record.result }}</dd>
    <template v-if="record.charged_tx_fee">
      <dt>Charged Fee</dt>
      <dd>
        <HbarDisplay v-bind:value="record.charged_tx_fee" />
      </dd>
    </template>
    <template v-if="!!record.entity_id">
      <dt>Entity</dt>
      <dd>
        <AccountIdDisplay
          v-bind:value="(record.entity_id as EntityIdKeyString)"
        />
      </dd>
    </template>
    <template
      v-if="
        record.consensus_timestamp && is_timestamp(record.consensus_timestamp)
      "
    >
      <dt>Consensus Timestamp</dt>
      <dd>
        {{ keyString_to_localeDateTimeString(record.consensus_timestamp) }}
      </dd>
    </template>
    <template
      v-if="
        record.parent_consensus_timestamp &&
        is_timestamp(record.parent_consensus_timestamp)
      "
    >
      <dt>Parent Consensus Timestamp</dt>
      <dd>
        {{
          keyString_to_localeDateTimeString(record.parent_consensus_timestamp)
        }}
      </dd>
    </template>
    <dt>Transaction Hash</dt>
    <dd>{{ record.transaction_hash }}</dd>
    <template v-if="!!record.transfers">
      <dt>Crypto Transfers (inc. Fees)</dt>
      <dd>
        <MirrorRecordCryptoTransfersDisplay v-bind:value="record.transfers" />
      </dd>
    </template>
    <template v-if="!!record.token_transfers">
      <dt>Token Transfers</dt>
      <dd>
        <MirrorRecordTokenTransfersDisplay
          v-bind:value="record.token_transfers"
        />
      </dd>
    </template>
    <template v-if="!!record.nft_transfers">
      <dt>NFT Transfers</dt>
      <dd>
        <MirrorRecordNftTransfersDisplay v-bind:value="record.nft_transfers" />
      </dd>
    </template>
    <template v-if="!!record.assessed_custom_fees">
      <dt>Assessed Fees</dt>
      <dd>
        <MirrorRecordAssessedFeesDisplay
          v-bind:value="record.assessed_custom_fees"
        />
      </dd>
    </template>
    <template v-if="!!record.bytes">
      <dt>Bytes</dt>
      <dd>{{ record.bytes }}</dd>
    </template>
  </dl>
</template>

<style scoped>
h2 {
  margin: 16px 0 6px 0;
}

dl {
  display: grid;
  grid-template-columns: max-content 1fr;
  column-gap: 12px;
  margin: 16px 0 0 0;
  padding: 0;
  overflow: hidden;
}

dt {
  margin: 0;
  padding: 0;
  font-weight: 100;
  color: var(--cds-nl-500);
}

dd {
  margin: 0;
  padding: 0;
  user-select: text;
  overflow: hidden;
}

dd.none {
  color: var(--cds-nd-300);
  word-wrap: break-word;
}
</style>
