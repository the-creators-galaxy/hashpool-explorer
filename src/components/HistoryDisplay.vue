<script setup lang="ts">
import {
  keyString_to_localeDateTimeString,
  type TimestampKeyString,
} from "@bugbytes/hapi-util";
import { computed, defineProps } from "vue";

interface HistoryRecord {
  timestamp: TimestampKeyString;
  description: string;
}

const props = defineProps<{
  value: HistoryRecord[] | undefined;
}>();

const list = computed(() => {
  if (props.value) {
    return props.value.map((r) => {
      return {
        timestamp: keyString_to_localeDateTimeString(r.timestamp),
        description: r.description,
      };
    });
  }
  return [];
});
</script>

<template>
  <section>
    <h2>Hashpool History</h2>
    <div class="none" v-if="list.length === 0">None</div>
    <div v-else>
      <div
        v-for="record in list"
        v-bind:key="record.timestamp"
        class="hist-row"
      >
        <div class="hist-date">{{ record.timestamp }}</div>
        <div class="hist-desc">{{ record.description }}</div>
      </div>
    </div>
  </section>
</template>

<style scoped>
h2 {
  margin: 0 0 12px 0;
  padding: 0;
}

div.hist-row {
  display: grid;
  grid-template-columns: max-content 1fr;
  column-gap: 12px;
}

div.hist-date {
  font-size: 12px;
  color: var(--cds-cs-700);
}
div.hist-desc {
  overflow: hidden;
  word-wrap: break-word;
}

div.none {
  color: var(--cds-nd-200);
}
</style>
