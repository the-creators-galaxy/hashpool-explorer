<script setup lang="ts">
import type {
  AccountAmount,
  CryptoTransferTransactionBody,
  TokenTransferList,
} from "@bugbytes/hapi-proto";
import { computed } from "vue";
import AmountDisplay from "@/components/AmountDisplay.vue";
import HbarDisplay from "@/components/HbarDisplay.vue";
import AccountIdDisplay from "@/components/AccountIdDisplay.vue";
import TokenIdDisplay from "@/components/TokenIdDisplay.vue";

const props = defineProps<{
  value: any;
}>();

const info = computed(() => {
  const data = props.value as CryptoTransferTransactionBody;
  if (data) {
    const crypto = data.transfers?.accountAmounts || [];
    const tokens =
      data.tokenTransfers?.filter(
        (xfer) => xfer.transfers && xfer.transfers.length > 0
      ) || [];
    const nfts =
      data.tokenTransfers?.filter(
        (xfer) => xfer.nftTransfers && xfer.nftTransfers.length > 0
      ) || [];
    const kind = computeKind(crypto, tokens, nfts);
    return { kind, crypto, tokens, nfts };
  }
  return { kind: "Unknown", crypto: [], tokens: [], nfts: [] };
});

function computeKind(
  crypto: AccountAmount[],
  tokens: TokenTransferList[],
  nfts: TokenTransferList[]
) {
  const kinds = [];
  if (crypto.length > 0) {
    kinds.push("Crypto");
  }
  if (tokens.length > 0) {
    kinds.push("Token");
  }
  if (nfts.length > 0) {
    kinds.push("NFT");
  }
  switch (kinds.length) {
    case 0:
      return "Transfer";
    case 1:
      if (nfts.length === 1 && nfts[0].nftTransfers.length === 1) {
        return `${kinds[0]} Transfer`;
      }
      return `${kinds[0]} Transfers`;
    case 2:
      return `${kinds[0]} & ${kinds[1]} Transfers`;
    case 3:
      return `${kinds[0]}, ${kinds[1]} & ${kinds[2]} Transfers`;
  }
  return "Unknown Transfer";
}
</script>

<template>
  <h2 class="kind">{{ info.kind }}</h2>
  <template v-if="info.crypto.length > 0">
    <div class="header">Crypto (ℏ)</div>
    <div class="crypto-xfers">
      <div class="crypto-xfer-list">
        <div class="crypto-xfer-list-header">From</div>
        <template
          v-for="tx in info.crypto.filter((xfer) => xfer.amount < 0)"
          v-bind:key="tx.accountID"
        >
          <div>
            <AccountIdDisplay v-bind:value="tx.accountID!" />
            <span v-if="tx.isApproval" class="approval">(via Approval)</span>
          </div>
          <div>
            <HbarDisplay v-bind:value="-tx.amount" />
          </div>
        </template>
      </div>
      <div class="crypto-xfer-list">
        <div class="crypto-xfer-list-header">To</div>
        <template
          v-for="tx in info.crypto.filter((xfer) => xfer.amount > 0)"
          v-bind:key="tx.accountID"
        >
          <div>
            <AccountIdDisplay v-bind:value="tx.accountID!" />
            <span v-if="tx.isApproval" class="approval">(via Approval)</span>
          </div>
          <div>
            <HbarDisplay v-bind:value="tx.amount" />
          </div>
        </template>
      </div>
    </div>
  </template>
  <template v-for="tok in info.tokens" v-bind:key="tok.token">
    <div class="header">Token <TokenIdDisplay v-bind:value="tok.token" /></div>
    <div class="crypto-xfers">
      <div class="crypto-xfer-list">
        <div class="crypto-xfer-list-header">From</div>
        <template
          v-for="tx in tok.transfers.filter((xfer) => xfer.amount < 0)"
          v-bind:key="tx.accountID"
        >
          <div>
            <AccountIdDisplay v-bind:value="tx.accountID!" />
            <span v-if="tx.isApproval" class="approval">(via Approval)</span>
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
            v-for="tx in tok.transfers.filter((xfer) => xfer.amount > 0)"
            v-bind:key="tx.accountID"
          >
            <div>
              <AccountIdDisplay v-bind:value="tx.accountID!" />
              <span v-if="tx.isApproval" class="approval">(via Approval)</span>
            </div>
            <div>
              <AmountDisplay v-bind:value="tx.amount" />
            </div>
          </template>
        </div>
      </div>
    </div>
  </template>
  <template v-for="nft in info.nfts" v-bind:key="nft.token">
    <div class="header">NFT <TokenIdDisplay v-bind:value="nft.token" /></div>
    <div class="nft-xfer-list">
      <div class="nft-header">Serial No.</div>
      <div class="nft-header">From</div>
      <div class="nft-header">To</div>
      <template v-for="tx in nft.nftTransfers" v-bind:key="tx.serialNumber">
        <div>
          {{ tx.serialNumber }}
        </div>
        <div>
          <AccountIdDisplay v-bind:value="tx.senderAccountID!" />
          <span v-if="tx.isApproval" class="approval">(via Approval)</span>
        </div>
        <div>
          <AccountIdDisplay v-bind:value="tx.receiverAccountID!" />
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
