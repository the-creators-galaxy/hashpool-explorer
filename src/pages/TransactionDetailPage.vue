<script setup lang="ts">
import * as ed from "@noble/ed25519";
import HbarDisplay from "@/components/HbarDisplay.vue";
import HistoryDisplay from "@/components/HistoryDisplay.vue";
import NodeIdDisplay from "@/components/NodeIdDisplay.vue";
import AccountIdDisplay from "@/components/AccountIdDisplay.vue";
import FileIdDisplay from "@/components/FileIdDisplay.vue";
import ContractIdDisplay from "@/components/ContractIdDisplay.vue";
import TopicIdDisplay from "@/components/TopicIdDisplay.vue";
import TokenIdDisplay from "@/components/TokenIdDisplay.vue";
import SignatureMapDisplay from "@/components/SignatureMapDisplay.vue";
import CryptoTransferDisplay from "@/components/transaction/CryptoTransferDisplay.vue";
import MirrorRecordTransactionDisplay from "@/components/transaction/MirrorRecordTransactionDisplay.vue";
import UnknownTransactionBodyDisplay from "@/components/transaction/UnknownTransactionBodyDisplay.vue";
import MirrorRecordCryptoTransfersDisplay from "@/components/transaction/MirrorRecordCryptoTransfersDisplay.vue";
import MirrorRecordAssessedFeesDisplay from "@/components/transaction/MirrorRecordAssessedFeesDisplay.vue";
import {
  type TransactionInfo,
  HashpoolError,
  HashpoolTransactionStatus,
} from "@bugbytes/hapi-hashpool";
import { MirrorError, type TransactionDetail } from "@bugbytes/hapi-mirror";
import { ResponseCodeEnum } from "@bugbytes/hapi-proto";
import {
  SignatureMap,
  type TransactionBody,
  type TransactionReceipt,
} from "@bugbytes/hapi-proto";
import {
  is_transaction_id,
  keyString_to_timestamp,
  timestamp_to_date,
  is_timestamp,
  sequences_are_equal,
} from "@bugbytes/hapi-util";
import { onMounted, onUnmounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import { config } from "@/models/config";
import {
  addSignatures,
  getTransactionData,
  getTransactionReceipt,
} from "@/models/hashpool";
import {
  getMirrorTransactionInfo,
  waitMirrorForMirrorTransactionInfo,
} from "@/models/mirror";
import PrecheckCodeDisplay from "@/components/PrecheckCodeDisplay.vue";

let updateLoop = 0;
let countdownLoop = 0;
let expiration = new Date();

const route = useRoute();
const info = ref<TransactionInfo>();
const bytes = ref<Uint8Array>();
const signatures = ref<SignatureMap>();
const transactionBody = ref<TransactionBody>();
const receipt = ref<TransactionReceipt>();
const record = ref<TransactionDetail>();
const countdown = ref(180);
const notFound = ref(false);
const error = ref("");

onMounted(async () => {
  updateDetails();
});

onUnmounted(() => {
  clearTimeout(updateLoop);
});

const details = computed(() => {
  switch (transactionBody.value?.data?.$case) {
    case "cryptoTransfer":
      return {
        view: CryptoTransferDisplay,
        data: transactionBody.value.data.cryptoTransfer,
      };
    default:
      return {
        view: UnknownTransactionBodyDisplay,
        data: transactionBody.value,
      };
  }
});

const txMirrorUrl = computed(() => {
  if (record.value) {
    return `${config.value.hashscanBaseUrl}/transaction/${record.value.consensus_timestamp}?tid=${record.value.transaction_id}`;
  }
  return null;
});

async function updateDetails() {
  const id = route.params.transactionId as string;
  if (is_transaction_id(id)) {
    try {
      const data = await getTransactionData(id);
      info.value = data.info;
      bytes.value = data.bytes;
      transactionBody.value = data.body;
      signatures.value = data.signatures;
      computeExpiration();
      if (info.value.status === HashpoolTransactionStatus.Completed) {
        receipt.value = await getTransactionReceipt(
          transactionBody.value.transactionID!
        );
        error.value = "";
        record.value = await waitMirrorForMirrorTransactionInfo(id);
      } else {
        updateLoop = setTimeout(updateDetails, 5000);
      }
    } catch (err) {
      if (
        err instanceof HashpoolError &&
        (err.status === 404 || err.status === 400)
      ) {
        try {
          record.value = await getMirrorTransactionInfo(id);
        } catch (err2) {
          if (err2 instanceof MirrorError && err2.status === 404) {
            notFound.value = true;
          } else {
            console.error(err2);
          }
        }
      } else {
        console.error(err);
      }
    }
  }
}

function computeExpiration() {
  clearTimeout(countdownLoop);
  const txid = transactionBody.value?.transactionID;
  if (txid) {
    const seconds = txid.transactionValidStart?.seconds || 0;
    const nanos = txid.transactionValidStart?.nanos || 0;
    expiration = new Date(seconds * 1000 + nanos / 1000000.0);
    updateCoundown();
  }
}

function updateCoundown() {
  const remaining = ~~((expiration.getTime() - new Date().getTime()) / 1000);
  if (remaining > 0) {
    countdown.value = remaining;
    countdownLoop = setTimeout(updateCoundown, 1000);
  } else {
    countdown.value = 0;
  }
}

async function copyTransaction() {
  if (bytes.value) {
    await navigator.clipboard.writeText(ed.utils.bytesToHex(bytes.value));
  }
}

async function pasteSignature() {
  const txid = transactionBody.value?.transactionID;
  if (txid && info.value?.status === HashpoolTransactionStatus.Queued) {
    error.value = "";
    try {
      const text = await navigator.clipboard.readText();
      const bytes = ed.utils.hexToBytes(text);
      const sigMap = SignatureMap.decode(bytes);
      if (signatures.value) {
        for (const sigPair of sigMap.sigPair) {
          for (const existingPair of signatures.value.sigPair) {
            if (
              sequences_are_equal(
                sigPair.pubKeyPrefix,
                existingPair.pubKeyPrefix
              )
            ) {
              error.value =
                sigMap.sigPair.length > 0
                  ? "Transaction is already signed with one of these keys."
                  : "Transaction is already signed with this key.";
              return;
            }
          }
        }
        signatures.value = await addSignatures(txid, bytes);
      }
    } catch (err) {
      error.value =
        err instanceof Error
          ? `Attempt to sign transaction failed: ${err.message}`
          : `Attempt to sign transaction failed: ${err}`;
      console.error(err);
    }
  }
}
</script>

<template>
  <template v-if="!!info && !!transactionBody">
    <div v-if="txMirrorUrl" class="tx-id">
      <a v-bind:href="txMirrorUrl" target="_blank">{{ info.transaction_id }}</a>
    </div>
    <div v-else class="tx-id">{{ info.transaction_id }}</div>
    <section class="status">
      <template v-if="info.status === HashpoolTransactionStatus.Queued">
        <template v-if="countdown > 1">
          <div>
            <span class="code">Queued</span>, Submitting to Hedera Node
            <NodeIdDisplay v-bind:value="transactionBody.nodeAccountID" /> in
            <span class="countdown">{{ countdown }}</span> seconds.
          </div>
          <div class="commands-wrapper">
            <button v-on:click="copyTransaction">
              Copy Transaction to Clipboard
            </button>
            <button v-on:click="pasteSignature">Paste Signature</button>
          </div>
        </template>
        <div v-else>
          <span class="code">Submitting</span> to Hedera Node
          <NodeIdDisplay v-bind:value="transactionBody.nodeAccountID" /> ...
        </div>
      </template>
      <div v-else-if="info.status === HashpoolTransactionStatus.Submitting">
        <span class="code">Submitted</span> to Hedera Node
        <NodeIdDisplay v-bind:value="transactionBody.nodeAccountID" />, Waiting
        for response.
      </div>
      <div v-else-if="receipt">
        <div v-if="receipt.status === ResponseCodeEnum.SUCCESS">
          Transaction <span class="code">Processed</span> by Hedera Network,
          <span class="accepted">Completed</span> with Status
          <span class="accepted">{{ ResponseCodeEnum[receipt.status] }}</span
          >.
        </div>
        <div v-else>
          Transaction <span class="code">Processed</span> by Hedera Network,
          <span class="rejected">Failed</span> with Status
          <span class="rejected">{{ ResponseCodeEnum[receipt.status] }}</span
          >.
        </div>
      </div>
      <template v-else>
        <div v-if="info.precheck_code === ResponseCodeEnum.OK">
          Transaction <span class="code">Accepted</span> by Hedera Node
          <NodeIdDisplay v-bind:value="transactionBody.nodeAccountID" />,
          Waiting for results ...
        </div>
        <div v-else>
          Transaction <span class="rejected">Rejected</span> by Hedera Node
          <NodeIdDisplay v-bind:value="transactionBody.nodeAccountID" />, with
          status
          <span class="rejected">
            <PrecheckCodeDisplay v-bind:value="info.precheck_code" /> </span
          >.
        </div>
      </template>
    </section>
    <div v-if="!!error" class="error">{{ error }}</div>
    <component v-bind:is="details.view" :value="details.data"></component>
    <dl>
      <dt>Memo</dt>
      <dd v-if="!!transactionBody.memo">{{ transactionBody.memo }}</dd>
      <dd v-else class="none">None</dd>
      <dt>Valid Starting</dt>
      <dd>
        {{
          timestamp_to_date(
            transactionBody.transactionID?.transactionValidStart!
          )
        }}
      </dd>
      <dt>Transaction Time to Live</dt>
      <dd>
        {{ transactionBody.transactionValidDuration?.seconds || 0 }} seconds
      </dd>
      <dt>Submit to Hedera Node</dt>
      <dd>
        <NodeIdDisplay v-bind:value="transactionBody.nodeAccountID" />
      </dd>
      <dt>Maximum Allowed Fee</dt>
      <dd>
        <HbarDisplay v-bind:value="transactionBody.transactionFee" />
      </dd>
      <template v-if="!!receipt">
        <dt>Final Status</dt>
        <dd>{{ ResponseCodeEnum[receipt.status] }}</dd>
        <template v-if="!!receipt.accountID">
          <dt>Account Created</dt>
          <dd>
            <AccountIdDisplay v-bind:value="receipt.accountID" />
          </dd>
        </template>
        <template v-if="!!receipt.fileID">
          <dt>File Created</dt>
          <dd>
            <FileIdDisplay v-bind:value="receipt.fileID" />
          </dd>
        </template>
        <template v-if="!!receipt.contractID">
          <dt>Contract Created</dt>
          <dd>
            <ContractIdDisplay v-bind:value="receipt.contractID" />
          </dd>
        </template>
        <template v-if="!!receipt.topicID">
          <dt>Topic Created</dt>
          <dd>
            <TopicIdDisplay v-bind:value="receipt.topicID" />
          </dd>
        </template>
        <template v-if="!!receipt.tokenID">
          <dt>Token Created</dt>
          <dd>
            <TokenIdDisplay v-bind:value="receipt.tokenID" />
          </dd>
        </template>
        <template v-if="!!receipt.scheduleID">
          <dt>Scheduled Transaction Record</dt>
          <dd>{{ receipt.scheduleID }}</dd>
        </template>
        <template v-if="!!receipt.scheduledTransactionID">
          <dt>Scheduled Transaction ID</dt>
          <dd>{{ receipt.scheduledTransactionID }}</dd>
        </template>
        <template v-if="!!receipt.topicSequenceNumber">
          <dt>HCS Message Count</dt>
          <dt>{{ receipt.topicSequenceNumber }}</dt>
        </template>
        <template
          v-if="receipt.topicRunningHash && receipt.topicRunningHash.length > 0"
        >
          <dt>HCS Topic Running Hash</dt>
          <dd>{{ receipt.topicRunningHash }}</dd>
        </template>
        <dt>Applied Exchange Rate</dt>
        <dd>
          {{
            (
              (receipt.exchangeRate?.currentRate?.centEquiv || 0) /
              (receipt.exchangeRate?.currentRate?.hbarEquiv || 1) /
              100.0
            ).toFixed(4)
          }}
          USD/ℏ
        </dd>
        <template v-if="!!receipt.newTotalSupply">
          <dt>Updated Supply</dt>
          <dd>{{ receipt.newTotalSupply }}</dd>
        </template>
        <template
          v-if="receipt.serialNumbers && receipt.serialNumbers.length > 0"
        >
          <dt>Created Serial Numbers</dt>
          <dd>{{ receipt.serialNumbers.join(", ") }}</dd>
        </template>
      </template>
      <template v-if="!!record">
        <template v-if="record.charged_tx_fee">
          <dt>Charged Fee</dt>
          <dd>
            <HbarDisplay v-bind:value="record.charged_tx_fee" />
          </dd>
        </template>
        <template
          v-if="
            record.consensus_timestamp &&
            is_timestamp(record.consensus_timestamp)
          "
        >
          <dt>Consensus Timestamp</dt>
          <dd>
            {{
              timestamp_to_date(
                keyString_to_timestamp(record.consensus_timestamp)
              )
            }}
          </dd>
        </template>
        <dt>Transaction Hash</dt>
        <dd>{{ record.transaction_hash }}</dd>
        <dt>Crypto Transfers (inc. Fees)</dt>
        <dd>
          <MirrorRecordCryptoTransfersDisplay v-bind:value="record.transfers" />
        </dd>
        <template v-if="!!record.assessed_custom_fees">
          <dt>Assessed Fees</dt>
          <dd>
            <MirrorRecordAssessedFeesDisplay
              v-bind:value="record.assessed_custom_fees"
            />
          </dd>
        </template>
      </template>
    </dl>
    <SignatureMapDisplay class="section" v-bind:value="signatures" />
    <HistoryDisplay class="section" v-bind:value="info.history" />
  </template>
  <template v-else-if="!!record">
    <div v-if="txMirrorUrl" class="tx-id">
      <a v-bind:href="txMirrorUrl" target="_blank">{{
        record.transaction_id
      }}</a>
    </div>
    <div v-else class="tx-id">{{ record.transaction_id }}</div>
    <section class="status">
      Displaying information from <span class="code">mirror node</span>, it is
      no longer tracked by the hashpool.
    </section>
    <MirrorRecordTransactionDisplay v-bind:value="record" />
  </template>
  <template v-else-if="notFound">
    <div class="tx-id">{{ route.params.transactionId }}</div>
    <div class="not-found">
      Could not find transaction in hashpool or on mirror node.
    </div>
  </template>
  <div v-else>Finding {{ route.params.transactionId }}...</div>
</template>

<style scoped>
section.status {
  font-weight: 200;
  font-size: 20px;
  margin-bottom: 24px;
}

div.tx-id {
  font-size: 24px;
  font-weight: 100;
  margin-bottom: 12px;
}

span.code {
  color: var(--cds-cp-300);
}

span.accepted {
  color: var(--cds-ui-s-500);
  font-weight: 400;
}

span.rejected {
  color: var(--cds-ui-e-500);
  font-weight: 400;
}

div.not-found {
  color: var(--cds-ui-e-400);
  font-size: 18px;
}

span.countdown {
  color: var(--cds-cp-300);
}

.section {
  margin-top: 16px;
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
div.commands-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: center;
  column-gap: 12px;
  margin-top: 20px;
  margin-bottom: 20px;
}
div.error {
  color: var(--cds-ui-e-500);
  font-weight: 400;
  margin-bottom: 24px;
}
</style>
