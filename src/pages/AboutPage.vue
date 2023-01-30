<script setup lang="ts">
import { config } from "@/models/config";
import { computed } from "vue";
const hashpoolUrl = computed(() => config.value.hashpoolEndpoint + "/swagger");
const mirrorUrl = computed(() => config.value.mirrorEndpoint + "/api/v1/docs/");
</script>

<template>
  <dl>
    <dt>About</dt>
    <dd>
      The Creator&rsquo;s Galaxy Hashpool Explorer provides a user interface for
      exploring the in-memory state of an Hedera Hashpool instance.
    </dd>
    <dt>Hedera Network</dt>
    <dd>{{ config.network }}</dd>
    <dt>Hashpool</dt>
    <dd>
      <a v-bind:href="hashpoolUrl" target="_blank">{{
        config.hashpoolEndpoint
      }}</a>
    </dd>
    <dt>Mirror Node</dt>
    <dd>
      <a v-bind:href="mirrorUrl" target="_blank">{{ config.mirrorEndpoint }}</a>
    </dd>
    <dt>UI Version</dt>
    <dd>{{ config.uiVersion }}</dd>
  </dl>
</template>

<style scoped>
dl {
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: max-content 1fr;
  row-gap: 12px;
  column-gap: 12px;
}
dt {
  margin: 0;
  padding: 0;
  text-align: end;
  color: var(--cds-nd-200);
  overflow: hidden;
}

dd {
  margin: 0;
  padding: 0;
  color: var(--cds-nl-500);
  overflow: hidden;
  user-select: text;
}
</style>
