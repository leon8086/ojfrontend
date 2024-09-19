<script setup>
import NavBar from '@/components/NavBar.vue';
import TitledPanel from '@/components/TitledPanel.vue';
import Pagination from '@/components/Pagination.vue';
import ProbTag from "@/components/ProbTag.vue";
import UserProblemStatus from '@/components/UserProblemStatus.vue';
import XMUTFooter from '@/components/XMUTFooter.vue';

import { ref, computed, reactive, onMounted, watch } from 'vue';
import {DIFFICULTY_COLOR,JUDGE_STATUS} from '@/utils/constants';

import i18n from '@/i18n';
import api from '@/api';
import utils from '@/utils/utils';
import { TagSelect } from 'view-ui-plus';
const query = reactive({difficulty:'',keyword:'',tags:null, page:1, limit:15, total:0 });
const loadings = reactive({table:true, tag:false});

const userInfo = ref({login:false});

const curMajorTag = ref([]);
const curSubTag = ref([]);

const subTagList = computed(()=>{
  let ret = [];
  curMajorTag.value.forEach( major=>{
    let tag = tagMap[major];
    tag.subTags.forEach(sub => {
      ret.push(sub);
    })
  })
  return ret;
});

const majorTagChanged = function(){
  if( curMajorTag.value.length == tagList.length ){
    query.tag = null;
  }
  else{
    curSubTag.value = [];
    query.tags = [];
    curMajorTag.value.forEach( major=>{
      let tag = tagMap[major];
      tag.subTags.forEach(sub => {
        curSubTag.value.push(sub.id);
      });
    });
    query.tags.push(...curSubTag.value);
  }
  getProblemList();
}

const subTagChanged = function(){
  query.tags = [];
  query.tags.push(...curSubTag.value);
  getProblemList();
}

const tagList = ref([]);
let tagMap = {};
const problemList = ref([]);
const problemTableColumns = reactive([
  {
    title: ' ',
    width: 60,
    slot: "status",
  },
  {
    title: '#',
    width: 120,
    slot:"display",
  },
  {
    title: i18n.global.t("m.Title"),
    slot: "title"
  },
  {
    title: i18n.global.t("m.Level"),
    width: 120,
    slot: "level",
  },
  {
    title: i18n.global.t('m.Total'),
    key: 'submissionNumber',
    className: 'table-cell-center',
  },
  {
    title: i18n.global.t('m.AC_Rate'),
    className: 'table-cell-center',
    slot:"acrate",
  },
  {
    title: "分类",
    align: "center",
    slot: "tag",
    width: 280,
  },
]);

let filterByDifficulty = function( difficulty ){
  query.difficulty = difficulty;
  query.page = 1;
  getProblemList();
};

let filterByKeyword = function(){
  query.page = 1;
  getProblemList();
};

let onReset = function(){
  query.keyword = "";
  query.page = 1;
  query.difficulty = "";
  getProblemList();
};


let pageChanged = function(){
  getProblemList();
}

let pageSizeChanged = function(){
  getProblemList();
}

let getProblemList = function(){
  api.getProblemList( query )
  .then((resp)=>{
    problemList.value = resp.data.records;
    query.page = resp.data.pageNumber;
    query.limit = resp.data.pageSize;
    query.total = resp.data.totalRow;
    loadings.table = false;
  });
}

let getTags = function(){
  api.getTags()
  .then( (resp) => {
    tagList.value = resp.data;
    tagList.value.forEach( item=>{
      tagMap[item.id] = item;
      item.subTags.forEach( sub =>{
        tagMap[sub.id] = sub;
      })
    });
  })
};

const statusIcon = ref({
  "0":"md-checkmark-circle",
  "-1":'md-close-circle',
  '8':'md-help-circle',
})

const userStatus = ref(null);

watch(()=>userInfo.value.id, (oldVal, newVal)=>{
  if( newVal != oldVal ){
    api.getProblemAllBrief()
    .then(resp=>{
      api.getUserStatus()
      .then(status=>{
        userStatus.value.loadData( resp.data, status.data );
      });
    });
  }
})

onMounted(() => {
  getTags();
  getProblemList()
})
</script>

<template>
  <Layout>
      <NavBar activeMenu="problem-list.html" v-model="userInfo"></NavBar>
      <div class="content-app">
      <Content :style="{padding:'0 50px'}">
        <Row type="flex" :gutter="18">
          <Col :span="18">
            <TitledPanel>
              <template #title>
                <div>
                  {{$t('m.Problem_List')}}
                  <!-- <Button @click="console.log(curMajorTag,curSubTag)">看</Button> -->
                </div>
              </template>
              <template #extra>
                <div>
                  <ul class="filter">
                    <li>
                        <Dropdown @on-click="filterByDifficulty">
                          <span>{{query.difficulty === '' ? $i18n.t('m.Difficulty') : $i18n.t('m.' + query.difficulty)}}
                            <Icon type="ios-arrow-down"></Icon>
                          </span>
                          <template #list>
                            <Dropdown-menu slot="list">
                              <Dropdown-item name="">{{$t('m.All')}}</Dropdown-item>
                              <Dropdown-item name="Low">{{$t('m.Low')}}</Dropdown-item>
                              <Dropdown-item name="Mid" >{{$t('m.Mid')}}</Dropdown-item>
                              <Dropdown-item name="High">{{$t('m.High')}}</Dropdown-item>
                            </Dropdown-menu>
                          </template>
                        </Dropdown>
                    </li>
                    <li>
                      <Input v-model="query.keyword"
                            @on-enter="filterByKeyword"
                            @on-click="filterByKeyword"
                            @on-change="filterByKeyword"
                            placeholder="keyword"
                            icon="ios-search-strong"/>
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
              <div>
                <div class="tag-selector">
                  <div class="tag-selector-title">主类：</div>
                  <TagSelect v-model="curMajorTag" @on-change="majorTagChanged">
                    <TagSelectOption v-for="item, key in tagList" :name="item.id"> {{ item.name }}</TagSelectOption>
                  </TagSelect>
                </div>
                <div class="tag-selector">
                  <div class="tag-selector-title">子类：</div>
                  <TagSelect v-model="curSubTag" @on-change="subTagChanged" expandable>
                    <TagSelectOption v-for="item, key in subTagList" :name="item.id"> {{ item.name }}</TagSelectOption>
                  </TagSelect>
                </div>
              </div>
              <Table style="width: 100%; font-size: 16px;"
                    :columns="problemTableColumns"
                    :data="problemList"
                    :loading="loadings.table"
                    :no-data-text="`<tr>没有题目</tr>`"
                    :no-filtered-data-text="`<tr>没有题目</tr>`"
                    disabled-hover
              >
                <template #status="{ row }">
                  <template v-if="row.status != null">
                    <Tag :color="JUDGE_STATUS[row.status].color" style="font-size:14px">
                      <Icon :type="statusIcon[row.status]" />
                    </Tag>
                  </template>
                </template>
                <template #display="{ row }">
                  <a :href="'./problem.html?id='+row.id">{{ row.displayId }}</a>
                </template>
                <template #title="{ row }">
                  <a :href="'./problem.html?id='+row.id">{{ row.title }}</a>
                </template>
                <template #level="{ row }">
                  <Tag :color="DIFFICULTY_COLOR[row.difficulty]">{{ $i18n.t("m."+row.difficulty) }}</Tag>
                </template>
                <template #acrate="{ row }">
                  <span>{{ utils.getACRate(row.acceptedNumber, row.submissionNumber) }}</span>
                </template>
                <template #tag="{row}">
                  <div style="text-align: left;">
                    <ProbTag type="major">{{ row.majorTag  }}</ProbTag><ProbTag type="sub">{{ row.subTag  }}</ProbTag>
                  </div>
                </template>
              </Table>
            <Pagination @on-page-size-change="pageSizeChanged" :show-sizer="true" :total="query.total" v-model:page-size="query.limit"  @on-change="pageChanged" v-model:current="query.page"></Pagination>
            </TitledPanel>
          </Col>
          <Col :span="6">
            <TitledPanel :padding="10">
              <template #title>
                <div slot="title" class="taglist-title">我的答题</div>
              </template>
              <UserProblemStatus ref="userStatus" :span="8" />
            </TitledPanel>
          </Col>
        </Row>
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

  .tag-selector {
    display: flex;
    align-items: center;
    margin-left: 30px;
    margin-right: 20px;
  }

  .tag-selector-title{
    margin-right: 20px;
    flex-shrink: 0;
  }
</style>