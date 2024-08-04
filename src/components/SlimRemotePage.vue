<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  pageSize:{
    required: false,
    default: 10,
    type: Number,
  },
  columns:{
    required: true,
    type: Array,
  },
  getFunction:{
    required: true,
    type: Function,
  },
});

const pageDesc = defineModel({default: { page:1, limit:10, total:0 }});

const emit = defineEmits(['update']);

const curPage = ref([]);
const pageChanged = function(){
  props.getFunction(pageDesc.value)
  .then(resp=>{
    curPage.value = resp.data.records;
    pageDesc.value.page = resp.data.pageNumber;
    pageDesc.value.limit = resp.data.pageSize;
    pageDesc.value.total = resp.data.totalRow;
    //console.log(pageDesc.value);
    emit("update", curPage.value);
  }, err=>{
  })
};

onMounted(()=>{
  watch(()=>props.pageSize, (newVal) =>{
    if( newVal != pageDesc.value.limit){
      pageDesc.value.limit = newVal;
      pageChanged();
    }
  });

  watch(()=>pageDesc.value, (newVal) =>{
    if( pageDesc.value == newVal ){
      return;
    }
    pageChanged();
  },{deep:true});

  pageChanged();
})

const refresh = function(){
  pageChanged();
}

defineExpose({
  refresh
})

</script>

<template>
  <!-- <Button @click="pageChanged">看</Button> -->
  <Table v-bind="$attrs" :columns="props.columns" :data="curPage">
    <template v-for="(_,name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}"></slot>
    </template>
  </Table>
  <Page v-model="pageDesc.page" :total="pageDesc.total" :page-size="pageDesc.limit" @on-change="pageChanged" size="small" class-name="page-right"></Page>
</template>

<style>
.page-right{
  display: flex;
  justify-content: right;
}
</style>
