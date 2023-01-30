<script setup lang="ts">
import { computed } from "vue";
import * as ed from "@noble/ed25519";

const props = defineProps<{
  value: any;
}>();

const isBytes = computed(() => {
  return ArrayBuffer.isView(props.value);
});
</script>

<template>
  <span v-if="value === undefined" class="undefined">undefined</span>
  <span v-else-if="value === null" class="null">null</span>
  <span v-else-if="typeof value === 'string'">{{ value }}</span>
  <span v-else-if="typeof value === 'number'">{{ value }}</span>
  <template v-else-if="typeof value === 'boolean'">
    <span v-if="value">True</span>
    <span v-else>False</span>
  </template>
  <span v-else-if="isBytes">{{ ed.utils.bytesToHex(value) }}</span>
  <span v-else-if="Array.isArray(value) && value.length === 0" class="empty"
    >Empty</span
  >
  <ol v-else-if="Array.isArray(value)">
    <li v-for="(record, index) in value" v-bind:key="index">
      <JsonNodeDisplay v-bind:value="record" />
    </li>
  </ol>
  <span
    v-else-if="
      value.shardNum !== undefined &&
      value.realmNum !== undefined &&
      value.account?.$case === 'accountNum'
    "
    >{{ value.shardNum }}.{{ value.realmNum }}.{{
      value.account.accountNum
    }}</span
  >
  <ul v-else>
    <template v-for="(key, index) in Object.keys(value)" v-bind:key="index">
      <li>
        {{ key }}:
        <JsonNodeDisplay v-bind:value="value[key]" />
      </li>
    </template>
  </ul>
</template>

<style scoped>
ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

li ul {
  border-left: 0.5px solid var(--cds-ui-s-500);
  margin-left: 2px;
  padding-left: 10px;
}

ol > li > ul {
  border-left: none;
}

span.empty {
  color: var(--cds-nd-400);
}
</style>
