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

const emit = defineEmits(['update','on-select', 'on-select-all', 'on-selection-change']);

const curPage = ref([]);
const pageChanged = function(){
  props.getFunction(pageDesc.value)
  .then(resp=>{
    curPage.value = resp.data.records;
    pageDesc.value.page = resp.data.pageNumber;
    pageDesc.value.limit = resp.data.pageSize;
    pageDesc.value.total = resp.data.totalRow;
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

const onSelect = function( selection, row ){
  emit("on-select", selection, row);
  // console.log( "on-select" );
  // console.log( selection, row );
}

const onSelectAll = function( selection ){
  emit("on-select-all", selection);
  // console.log( "on-select-all" );
  // console.log( selection );
}

const onSelectionChange = function( selection ){
  emit("on-selection-change", selection);
  // console.log( "on-selection-change" );
  // console.log( selection );
}

defineExpose({
  refresh
})

</script>

<template>
  <!-- <Button @click="pageChanged">看</Button> -->
  <Table  v-bind="$attrs"
          :columns="props.columns"
          :data="curPage"
          @on-select="onSelect"
          @on-select-all="onSelectAll"
          @on-selection-change="onSelectionChange"
  >
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
