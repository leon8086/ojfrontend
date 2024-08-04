<script setup>

import { ref, onMounted, } from 'vue';

const showResult = defineModel({required:true, default:false});
const props = defineProps({
  insert:{
    required: true,
    default: 0,
  },
  failed:{
    required: true,
    default: [],
  }
});

const emit = defineEmits(['finished']);

const resultColumn = ref([
  {
    title:"项目id",
    align:"center",
    width:200,
    key:"id",
  },
  {
    title:"错误信息",
    slot:"error",
  }
]);

const finished = function(){
  emit("finished");
}

onMounted(() => {
})
</script>

<template>
  <Modal v-model="showResult" :width="800" @on-ok="finished" @on-cancel="finished">
    <template #header>
      <h2>导入结果</h2>
    </template>
    <h2>成功导入 {{ props.insert }} 项</h2>
    <div v-if="props.failed.length != 0">
    <Divider />
      <h2>导入失败项（显示前10个）</h2>
      <Table :columns="resultColumn" :data="props.failed">
        <template #error="{ row }">
          <Collapse>
            <Panel>
              {{ row.title }}
              <template #content>
                {{ row.content }}
              </template>
            </Panel>
          </Collapse>
        </template>
      </Table>
    </div>
  </Modal>
</template>

<style>
.failed td.error-msg{
  color: red;
}

.ivu-btn{
  margin-right: 10px;
  margin-left: 10px;
}

.operation .ivu-btn{
  margin-right: 1px;
  margin-left: 1px;
}

.page-right{
  display: flex;
  justify-content: right;
}

.failed th{
  background-color: #888;
}

.failed td{
  color: #aaa;
}
</style>
