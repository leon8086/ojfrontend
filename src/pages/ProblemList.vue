<script setup>
import NavBar from '@/components/NavBar.vue'
import TitledPanel from '@/components/TitledPanel.vue'
import Pagination from '@/components/Pagination.vue'
import XMUTFooter from '@/components/XMUTFooter.vue'

import { ref, reactive, onMounted, resolveComponent } from 'vue';
import {DIFFICULTY_COLOR} from '../utils/constants';

import i18n from '../i18n';
import api from '../api'
import utils from '../utils/utils'
const problemList = ref([]);
const query = reactive({difficulty:'',keyword:'',tag:'', page:1, limit:15, total:0 });
const loadings = reactive({table:true, tag:false});
const tagList = ref([]);
const problemTableColumns = reactive([
  {
    title: ' ',
    width: 60,
  },
  {
    title: '#',
    width: 120,
    render: (h, params) => {
      return h('a', {
        href: "/problem?tid=" + params.row.titleId,
      }, {
        default() {
          return params.row.displayId;
        }
      })
    }
  },
  {
    title: i18n.global.t("m.Title"),
    render: (h, params) => {
      return h('a', {
        href: "/problem.html?id=" + params.row.id,
      }, {
        default() {
          return params.row.title;
        }
      })
    }
  },
  {
    title: i18n.global.t("m.Level"),
    width: 120,
    render: (h, params) => {
      let t = params.row.difficulty;
      let color = DIFFICULTY_COLOR[t];
      return h(resolveComponent('Tag'), {
        color: color,
      }, {
        default() {
          return i18n.global.t('m.' + params.row.difficulty);
        }
      })
    },
  },
  {
    title: i18n.global.t('m.Total'),
    key: 'submissionNumber',
    className: 'table-cell-center',
  },
  {
    title: i18n.global.t('m.AC_Rate'),
    className: 'table-cell-center',
    render: (h, params) => {
      return h('span', utils.getACRate(params.row.acceptedNumber, params.row.submissionNumber));
    }
  },
]);

let handleTagsVisible = function (value) {
  if (value) {
    problemTableColumns.push(
      {
        title: i18n.global.t('m.Tags'),
        align: 'center',
        render: (h, params) => {
          let tags = []
          params.row.tags.forEach(tag => {
            tags.push(h(resolveComponent('Tag'), {}, {default(){return tag.name}}))
          })
          return h('div', {
            style: {
              margin: '8px 0'
            }
          }, tags)
        }
      })
  } else {
    problemTableColumns.splice(problemTableColumns.length - 1, 1)
  }
}


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
  query.tag = "";
  query.page = 1;
  query.difficulty = "";
  getProblemList();
};

let filterByTag = function(name){
  query.tag = name;
  getProblemList();
};

let pickone = function(){
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
  })
}

onMounted(() => {
  getTags();
  getProblemList()
})
</script>

<template>
  <Layout>
      <NavBar :activeMenu="'/problemlist.html'"></NavBar>
      <div class="content-app">
      <Content :style="{padding:'0 50px'}">
        <Row type="flex" :gutter="18">
          <Col :span=19>
          <TitledPanel>
            <template #title>
              <div>
                {{$t('m.Problem_List')}}
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
                    <i-switch size="large" @on-change="handleTagsVisible">
                      <template #open>
                        <span>{{$t('m.Tags')}}</span>
                      </template>
                      <template #close>
                      <span>{{$t('m.Tags')}}</span>
                      </template>
                    </i-switch>
                  </li>
                  <li>
                    <Input v-model="query.keyword"
                          @on-enter="filterByKeyword"
                          @on-click="filterByKeyword"
                          placeholder="keyword"
                          icon="ios-search-strong"/>
                  </li>
                  <li>
                    <Button type="primary" @click="onReset">
                      <Icon type="refresh"></Icon>
                      {{$t('m.Reset')}}
                    </Button>
                  </li>
                </ul>
              </div>
            </template>
            <Table style="width: 100%; font-size: 16px;"
                  :columns="problemTableColumns"
                  :data="problemList"
                  :loading="loadings.table"
                  :no-data-text="`<tr>没有题目</tr>`"
                  :no-filtered-data-text="`<tr>没有题目</tr>`"
                  disabled-hover></Table>
          <Pagination @on-page-size-change="pageSizeChanged" :show-sizer="true" :total="query.total" v-model:page-size="query.limit"  @on-change="pageChanged" v-model:current="query.page"></Pagination>
          </TitledPanel>

          </Col>

          <Col :span="5">
          <TitledPanel :padding="10">
            <template #title>
              <div slot="title" class="taglist-title">{{$t('m.Tags')}}</div>
            </template>
            <Button v-for="tag in tagList"
                    :key="tag.name"
                    @click="filterByTag(tag.name)"
                    :disabled="query.tag === tag.name"
                    shape="circle"
                    class="tag-btn">{{tag.name}}
            </Button>
          </TitledPanel>
          <Spin v-if="loadings.tag" fix size="large"></Spin>
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
</style>