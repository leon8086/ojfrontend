<script setup>
import NavBar from '@/components/NavBar.vue'
import TitledPanel from '@/components/TitledPanel.vue'
import Pagination from '@/components/Pagination.vue'
import XMUTFooter from '@/components/XMUTFooter.vue'

import { ref, reactive, onMounted, resolveComponent } from 'vue';
import { JUDGE_STATUS, USER_TYPE } from '@/utils/constants'
import utils from '@/utils/utils'
import time from '@/utils/time'
import i18n from '@/i18n';
import api from '@/api'
import { isAdmin } from '@/utils/globalInfo';

const title = ref("提交记录");

const formFilter = reactive({
  myself: false,
  result: '',
  username: ''
});

const userInfo = ref({});

const columns = ref([
  {
    title: i18n.global.t('m.When'),
    align: 'center',
    slot: "submittime",
  },
  {
    title: i18n.global.t('m.ID'),
    align: 'center',
    slot: "id",
  },
  {
    title: i18n.global.t('m.Status'),
    align: 'center',
    slot: "status",
  },
  {
    title: i18n.global.t('m.Problem'),
    align: 'center',
    slot: "problem",
  },
  {
    title: i18n.global.t('m.Time'),
    align: 'center',
    slot: "runtime",
  },
  {
    title: i18n.global.t('m.Memory'),
    align: 'center',
    slot: "memory",
  },
  {
    title: i18n.global.t('m.Language'),
    align: 'center',
    key: 'language'
  },
  {
    title: i18n.global.t('m.Author'),
    align: 'center',
    slot: "author"
  }
])

const loadingTable = ref(false);
const submissions = ref([]);
const total = ref(30);
const limit = ref(15);
const page = ref(1);

function buildQuery() {
  return {
    myself: formFilter.myself === true ? '1' : '0',
    result: formFilter.result,
    username: formFilter.username,
    page: page.value,
    limit: limit.value,
  }
}

function getSubmissions() {
  let params = buildQuery();
  loadingTable.value = true
  api.getSubmissionList(params).then(res => {
    let data = res.data
    for (let v of data.records) {
      v.loading = false
    }
    loadingTable.value = false
    total.value = data.totalRow
    submissions.value = data.records;
    loadingTable.value = false;
  }).catch(() => {
    loadingTable.value = false;
  })
}


function handleResultChange(status) {
  page.value = 1;
  formFilter.result = status;
  getSubmissions();
}

function handleQueryChange() {
  page.value = 1;
  getSubmissions();
}

onMounted(()=>{
  getSubmissions();
})
</script>

<template>
  <NavBar activeMenu="submission-list.html" v-model="userInfo"></NavBar>
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
                  <span>{{ formFilter.result == "" ? $t('m.Status'):$t("m."+JUDGE_STATUS[formFilter.result].name.replace(/ /g,"_")) }}
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
                <Switch size="large" v-model="formFilter.myself" @on-change="handleQueryChange">
                  <template #open>
                    <span>{{ $t('m.Mine') }}</span>
                  </template>
                  <template #close>
                    <span>{{ $t('m.All') }}</span>
                  </template>
                </Switch>
              </li>
              <li>
                <Input v-model="formFilter.username" :placeholder="$t('m.Search_Author')"
                  @on-enter="handleQueryChange"
                  @on-change="handleQueryChange"
                  @on-click="handleQueryChange"
                  />
              </li>
              <li>
                <Button type="primary" icon="md-refresh" @click="getSubmissions">{{ $t('m.Refresh') }}</Button>
              </li>
            </ul>
          </div>
        </template>

        <Table stripe :disabled-hover="true" :columns="columns" :data="submissions" :loading="loadingTable">
          <template #submittime="{row}">
            <span> {{ time.utcToLocal(row.createTime) }} </span>
          </template>
          <template #id="{row}">
            <template v-if="(userInfo.id == row.userId)||(isAdmin(userInfo))">
              <a :href="'./submission.html?id='+row.id">{{ row.id.slice(0,10) }}</a>
            </template>
            <template v-else>
              {{ row.id.slice(0,10) }}
            </template>
          </template>
          <template #status="{row}">
            <Tag :color="JUDGE_STATUS[row.result].color">{{$t('m.' + JUDGE_STATUS[row.result].name.replace(/ /g, '_'))}}</Tag>
          </template>
          <template #problem="{row}">
            <a :href="'./problem.html?id='+row.voProblemBrief.id" :title="row.voProblemBrief.title">{{row.voProblemBrief.displayId}}</a>
          </template>
          <template #runtime="{row}">
            <span>{{ utils.submissionTimeFormat(row.statisticInfo.time_cost) }}</span>
          </template>
          <template #memory="{row}">
            <span>{{ utils.submissionMemoryFormat(row.statisticInfo.memory_cost) }}</span>
          </template>
          <template #author="{row}">
            <template v-if="(userInfo.id == row.userId)||(isAdmin(userInfo))">
              <a :href="'./userInfo.html?id='+row.userId">{{ row.username }}</a>
            </template>
            <template v-else>
              {{ row.username }}
            </template>
          </template>
        </Table>
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