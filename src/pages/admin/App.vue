<script setup>
import NavBarAdmin from '@/components/NavBarAdmin.vue'
import TitledPanel from '@/components/TitledPanel.vue'
import Pagination from '@/components/Pagination.vue'
import XMUTFooter from '@/components/XMUTFooter.vue'

import { ref, reactive, onMounted, resolveComponent } from 'vue';
import { DIFFICULTY_COLOR } from '../../utils/constants';

import i18n from '@/i18n';
import moment from 'moment';
import api from '@/api';
import utils from '@/utils';
const examList = ref([]);
const query = reactive({keyword:'', page:1, limit:15, total:0 });
const loadings = reactive({table:true, tag:false});
const examTableColumns = reactive([
  {
    title: '#',
    width: 120,
    key: "id",
  },
  {
    title: "考试名称",
    width: 240,
    slot: "title",
  },
  {
    title: "题目配置",
    slot: "problem",
    align: "center",
  },
  {
    title: "开始时间",
    width: 150,
    align: "center",
    slot: "startTime"
  },
  {
    title: "结束时间",
    width: 150,
    align: "center",
    slot: 'endTime',
  },
  {
    title: "考试时长",
    width: 120,
    align: "center",
    slot: 'duration',
  },
]);

let filterByKeyword = function(){
  query.page = 1;
  getExamList();
};

let onReset = function(){
  query.keyword = "";
  query.tag = "";
  query.page = 1;
  getExamList();
};

let pageChanged = function(){
  getExamList();
}

let pageSizeChanged = function(){
  getExamList();
}

let getExamList = function(){
  api.adminGetExamList( query )
  .then((resp)=>{
    examList.value = resp.data.records;
    query.page = resp.data.pageNumber;
    query.limit = resp.data.pageSize;
    query.total = resp.data.totalRow;
    loadings.table = false;
  });
}

const countProblems = function(item){
  let count = 0;
  for( let i in item ){
    count += item[i].quantity;
  }
  return count;
}

onMounted(() => {
  getExamList()
})
</script>

<template>
  <Layout>
    <NavBarAdmin :activeMenu="'/admin/global-config.html'"></NavBarAdmin>
    <div class="content-app">
      <Content :style="{padding:'0 50px'}">
        <Card title="管理端">
          管理后台
        </Card>
      </Content>
    </div>
    <XMUTFooter></XMUTFooter>
  </Layout>
</template>

<style scoped>
  .taglist-title {
    margin-left: -10px;
    margin-bottom: -10px;
  }

  .tag-btn {
    margin-right: 5px;
    margin-bottom: 10px;
  }

  #pick-one {
    margin-top: 10px;
  }
</style>