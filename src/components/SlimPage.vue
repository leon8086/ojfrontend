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
  data:{
    required: true,
    type: Array,
  }
});

const emit = defineEmits(["page-changed"]);

const pageDesc = defineModel({default: { page:1, limit:10, total:0 }});

const curPage = ref([]);
const pageChanged = function(){
  pageDesc.value.total = props.data.length;
  if( props.data.length <= props.pageSize ){
    curPage.value = props.data;
  }
  else{
    curPage.value = props.data.slice( (pageDesc.value.page-1)*props.pageSize, (pageDesc.value.page)*props.pageSize );
  }
  emit("page-changed", curPage.value);
};

onMounted(()=>{
  pageChanged();
  watch(()=>props.data, () =>{
    pageChanged();
  });
  watch(()=>props.pageSize, ( newVal ) =>{
    pageDesc.limit = newVal;
    pageChanged();
  });
})
</script>

<template>
  <!-- <Button @click="pageChanged">看</Button> -->
  <Table v-bind="$attrs" :columns="props.columns" :data="curPage">
    <template v-for="(_,name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}"></slot>
    </template>
  </Table>
  <Page v-model="pageDesc.page" :total="pageDesc.total" @on-change="pageChanged" size="small" class-name="page-right"></Page>
</template>

<style>
.page-right{
  display: flex;
  justify-content: right;
}
</style>
