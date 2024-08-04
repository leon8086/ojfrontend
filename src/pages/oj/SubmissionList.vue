<script setup>
import NavBar from '@/components/NavBar.vue'
import TitledPanel from '@/components/TitledPanel.vue'
import Pagination from '@/components/Pagination.vue'
import XMUTFooter from '@/components/XMUTFooter.vue'

import { ref, reactive, onMounted, resolveComponent } from 'vue';
import { JUDGE_STATUS, USER_TYPE } from '../../utils/constants'
import utils from '../../utils/utils'
import time from '../../utils/time'
import i18n from '../../i18n';
import api from '../../api'

const title = ref("提交记录");

const formFilter = reactive({
  myself: false,
  result: '',
  username: ''
})

const columns = ref([
  {
    title: i18n.global.t('m.When'),
    align: 'center',
    render: (h, params) => {
      return h('span', { style: { "font-size":'12px', }}, time.utcToLocal(params.row.createTime));
    }
  },
  {
    title: i18n.global.t('m.ID'),
    align: 'center',
    render: (h, params) => {
        return h('a',{ href:"/submission.html?id="+params.row.id}, params.row.id.slice(0, 10));
    }
  },
  {
    title: i18n.global.t('m.Status'),
    align: 'center',
    render: (h, params) => {
      return h(resolveComponent('Tag'), {
          color: JUDGE_STATUS[params.row.result].color
      },
      () => i18n.global.t('m.' + JUDGE_STATUS[params.row.result].name.replace(/ /g, '_')))
    }
  },
  {
    title: i18n.global.t('m.Problem'),
    align: 'center',
    render: (h, params) => {
      return h('a',
        {
          href:"/problem.html?id="+params.row.voProblemBrief.id,
          title:params.row.voProblemBrief.title,
        },
        params.row.voProblemBrief.displayId );
    }
  },
  {
    title: i18n.global.t('m.Time'),
    align: 'center',
    render: (h, params) => {
      return h('span', utils.submissionTimeFormat(params.row.statisticInfo.time_cost))
    }
  },
  {
    title: i18n.global.t('m.Memory'),
    align: 'center',
    render: (h, params) => {
      return h('span', utils.submissionMemoryFormat(params.row.statisticInfo.memory_cost))
    }
  },
  {
    title: i18n.global.t('m.Language'),
    align: 'center',
    key: 'language'
  },
  {
    title: i18n.global.t('m.Author'),
    align: 'center',
    render: (h, params) => {
      return h('a', {
        style: {
          'display': 'inline-block',
          'max-width': '150px'
        },
      }, params.row.username)
    }
  }
])

const loadingTable = ref(false);
const submissions = ref([]);
const total = ref(30);
const limit = ref(15);
const page = ref(1);
const contestId = ref('');
const problemId = ref('');
const rejudge_column = ref(false);
const isAuthenticated = ref(true);

function buildQuery() {
  return {
    myself: formFilter.myself === true ? '1' : '0',
    result: formFilter.result,
    username: formFilter.username,
    page: page.value
  }
}
function getSubmissions() {
  let params = buildQuery();
  //params.problemId = roblemId.value;
  loadingTable.value = true
  api.getSubmissionList({page:page.value, limit:limit.value}).then(res => {
    let data = res.data
    for (let v of data.records) {
      v.loading = false
    }
    adjustRejudgeColumn()
    loadingTable.valuefalse = false
    total.value = data.totalRow
    submissions.value = data.records;
    loadingTable.value = false;
    //console.log(data);
  }).catch(() => {
    loadingTable.value = false;
  })
}

function adjustRejudgeColumn() {
  return;
  if (!rejudgeColumnVisible.value || rejudge_column.value) {
    return
  }
  const judgeColumn = {
    title: i18n.global.t('m.Option'),
    fixed: 'right',
    align: 'center',
    width: 90,
    render: (h, params) => {
      return h('Button', {
        props: {
          type: 'primary',
          size: 'small',
          loading: params.row.loading
        },
        on: {
          click: () => {
            handleRejudge(params.row.id, params.index)
          }
        }
      }, i18n.global.t('m.Rejudge'))
    }
  }
  columns.push(judgeColumn)
  rejudge_column.value = true
}

function handleResultChange(status) {
  page.value = 1;
  formFilter.result = status;
}
function handleQueryChange() {
  page.value = 1;
}
function handleRejudge(id, index) {
  // this.submissions[index].loading = true
  // api.submissionRejudge(id).then(res => {
  //   this.submissions[index].loading = false
  //   this.$success('Succeeded')
  //   this.getSubmissions()
  // }, () => {
  //   this.submissions[index].loading = false
  // })
}

onMounted(()=>{
  getSubmissions();
})
</script>

<template>
  <NavBar :activeMenu="'/submission-list.html'"></NavBar>
  <div class="content-app">
    <Content :style="{ padding: '0 50px' }">
      <TitledPanel shadow class="main">
        <template #title>
          <div>
            {{ title }}
          </div>
        </template>
        <template #extra>
          <div>
            <ul class="filter">
              <li>
                <Dropdown @on-click="handleResultChange">
                  <span>{{ $t('m.Status') }}
                    <Icon type="md-arrow-dropdown"></Icon>
                  </span>
                  <template #list>
                    <Dropdown-menu>
                      <Dropdown-item name="">{{ $t('m.All') }}</Dropdown-item>
                      <Dropdown-item v-for="status in Object.keys(JUDGE_STATUS)" :key="status" :name="status">
                        {{ $t('m.' + JUDGE_STATUS[status].name.replace(/ /g, "_")) }}
                      </Dropdown-item>
                    </Dropdown-menu>
                  </template>
                </Dropdown>
              </li>
              <li>
                <i-switch size="large" v-model="formFilter.myself" @on-change="handleQueryChange"
                  v-if="isAuthenticated">
                  <template #open>
                    <span>{{ $t('m.Mine') }}</span>
                  </template>
                  <template #close>
                    <span>{{ $t('m.All') }}</span>
                  </template>
                </i-switch>
              </li>
              <li>
                <Input v-model="formFilter.username" :placeholder="$t('m.Search_Author')"
                  @on-enter="handleQueryChange" />
              </li>

              <li>
                <Button type="primary" icon="md-refresh" @click="getSubmissions">{{ $t('m.Refresh') }}</Button>
              </li>
            </ul>
          </div>
        </template>

        <Table stripe :disabled-hover="true" :columns="columns" :data="submissions" :loading="loadingTable"></Table>
        <Pagination @on-page-size-change="getSubmissions" @on-change="getSubmissions" :total="total"
          v-model:page-size="limit" v-model:current.sync="page" :show-sizer=true>
        </Pagination>
      </TitledPanel>
    </Content>
  </div>
  <XMUTFooter></XMUTFooter>
</template>

<style scoped lang="less">
.ivu-btn-text {
  color: #57a3f3;
}

.flex-container {
  #main {
    flex: auto;
    margin-right: 18px;
    margin-top: 55px;

    .filter {
      margin-right: -10px;
    }
  }

  #contest-menu {
    flex: none;
    width: 210px;
  }
}

.main{
  padding-bottom: 5px;
}
</style>