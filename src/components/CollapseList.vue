<template>
  <Collapse>
    <Panel name="1">
      {{ props.title }}
      <template #content>
        <Table :columns="props.columns" :data="props.data"></Table>
      </template>
    </Panel>
  </Collapse>
</template>

<script setup>
import {ref} from "vue";
import { Collapse, Panel, Table } from 'view-ui-plus'

const props = defineProps({
  title:{
    require: true,
    type: String,
  },
  columns:{
    require: true,
    type:Array,
  },
  data:{
    require: true,
    type:Array,
  }
});

</script>

<style scoped lang="less">
</style>
