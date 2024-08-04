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

const newExam = function(){
  window.open("/admin/exam.html", "_blank");
}

onMounted(() => {
  getExamList()
})
</script>

<template>
  <Layout>
    <NavBarAdmin :activeMenu="'/admin/exam-list.html'"></NavBarAdmin>
    <div class="content-app">
      <Content :style="{padding:'0 50px'}">
        <TitledPanel>
          <template #title>
            <div>
              考试管理 <Button icon="md-add" type="primary" @click="newExam">添加考试</Button>
            </div>
          </template>
          <template #extra>
            <div>
              <ul class="filter">
                <li>
                  <Input v-model="query.keyword" @on-enter="filterByKeyword" @on-click="filterByKeyword"
                    placeholder="keyword" icon="ios-search-strong" />
                </li>
                <li>
                  <Button type="primary" @click="onReset">
                    <Icon type="md-refresh"></Icon>
                    {{$t('m.Reset')}}
                  </Button>
                </li>
              </ul>
            </div>
          </template>
          <Table style="width: 100%; font-size: 16px;" :columns="examTableColumns" :data="examList"
            :loading="loadings.table" :no-data-text="`<tr>没有考试</tr>`" :no-filtered-data-text="`<tr>没有考试</tr>`"
            disabled-hover>
            <template #title="{row}">
              <a :href="'/admin/exam?id='+row.id.toString()" target="_blank">{{row.title}}</a>
            </template>
            <template #problem="{row}">
              <div style="text-align: left">
                <Collapse>
                  <Panel name="1">
                      题目总数： {{ countProblems(row.problemConfig) }} 题
                    <template #content>
                      <Row>
                        <Col :span="12" v-for="item, key in row.problemConfig">
                          <Card :title="'&nbsp;'+(key+1).toString()+'. 选 '+item.quantity.toString()+' 题'" icon="ios-options" :padding="0" style="margin-right:5px;">
                            <CellGroup>
                              <Cell v-for="p,k in item.problems">
                                <a :href='"/problem?id="+p.id' target="_blank">{{ p.title }}</a>
                                <template #extra>
                                  <Tag :color="DIFFICULTY_COLOR[p.difficulty]">{{ $t("m."+p.difficulty) }}</Tag>
                                </template>
                              </Cell>
                            </CellGroup>
                          </Card>
                        </Col>
                      </Row>
                    </template>
                  </Panel>
                </Collapse>
              </div>
            </template>
            <template #startTime="{row}">
              {{ moment(row.startTime).format("YYYY年MM月DD日") }}
            </template>
            <template #endTime="{row}">
              {{ moment(row.endTime).format("YYYY年MM月DD日") }}
            </template>
            <template #duration="{row}">
              {{ utils.duration(row.startTime, row.endTime).message }}
            </template>
          </Table>
          <Pagination @on-page-size-change="pageSizeChanged" :show-sizer="true" :total="query.total"
            v-model:page-size="query.limit" @on-change="pageChanged" v-model:current="query.page"></Pagination>
        </TitledPanel>
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
  .ivu-btn{
    margin-right: 10px;
    margin-left: 10px;
  }

  .operation .ivu-btn{
    margin-right: 1px;
    margin-left: 1px;
  }
</style>