<script setup lang="ts">
import type { SignaturePair, SignatureMap } from "@bugbytes/hapi-proto";
import { computed, defineProps } from "vue";
import SignaturePairDisplay from "./SignaturePairDisplay.vue";
const props = defineProps<{
  value: SignatureMap | undefined;
}>();
const list = computed<SignaturePair[]>(() => {
  return props.value?.sigPair || [];
});
</script>

<template>
  <section>
    <h2>Signed By</h2>
    <div class="none" v-if="list.length === 0">No Signatures</div>
    <div v-else>
      <SignaturePairDisplay
        v-for="(sig, index) in list"
        v-bind:key="index"
        v-bind:value="sig"
      />
    </div>
  </section>
</template>

<style scoped>
h2 {
  margin: 0 0 12px 0;
  padding: 0;
}
div.none {
  color: var(--cds-nd-200);
}
</style>
