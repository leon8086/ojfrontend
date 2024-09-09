
<script setup>
import NavBar from '@/components/NavBar.vue'
import XMUTFooter from '@/components/XMUTFooter.vue';
import Highlight from "@/components/Highlight.vue";
import TitledPanel from '@/components/TitledPanel.vue';
import { ref, reactive, onMounted, resolveComponent } from 'vue';
import { JUDGE_STATUS } from '@/utils/constants';
import i18n from '@/i18n';
import api from '@/api';
import utils from '@/utils';
import dayjs from 'dayjs';

const query = reactive({keyword:'', page:1, limit:15, total:0 });

const filterByKeyword = function(){
}

const onReset = function(){
}

const userInfo = ref({login:false});

const submissionData = ref([]);

const userName = ref("");
const problemInfo = ref({});

onMounted(() => {
  let examId = utils.getUrlKey("exam");
  let userId = utils.getUrlKey("user");
  let problemId = utils.getUrlKey("problem");
  api.adminGetExamSubmisssion( examId, userId, problemId )
  .then(resp=>{
    console.log(resp.data);
    submissionData.value = resp.data;
    if(submissionData.value.length>0){
      userName.value = submissionData.value[0].username;
      problemInfo.value = submissionData.value[0].voProblemDetail;
    }
  })
})
</script>

<template>
  <Layout>
    <NavBar activeMenu="exam-submission.html" v-model="userInfo"></NavBar>
    <div class="content-app">
      <Content :style="{padding:'0 50px'}">
        <TitledPanel>
          <template #title>
            {{ userName }} - {{ problemInfo.title }}
          </template>
          <template #extra>
            <ul class="filter">
              <li>
                <Input v-model="query.keyword" @on-enter="filterByKeyword" @on-click="filterByKeyword"
                  placeholder="关键字" icon="ios-search-strong" />
              </li>
              <li>
                <Button type="primary" @click="onReset">
                  <Icon type="md-refresh"></Icon>
                   重置
                </Button>
              </li>
            </ul>
          </template>
          <Collapse accordion>
            <Panel v-for="row, key in submissionData" :class="'custom-bg-'+JUDGE_STATUS[row.result].color">
              <div style="display: inline-block;">
                <div style="display: flex">
                    <span class="submission-title">得分：</span><span> {{row.statisticInfo.score }} </span>
                    <span class="submission-title">语言：</span><span> {{row.language}} </span>
                    <span class="submission-title">ip：</span><span> {{row.ip}} </span>
                    <span class="submission-title">提交时间：</span><span> {{ dayjs(row.createTime).format("YYYY-MM-DD HH:mm:ss") }} </span>
                    <span class="submission-title">结果：</span> <span><Tag :color="JUDGE_STATUS[row.result].color">{{$t('m.' + JUDGE_STATUS[row.result].name.replace(/ /g, '_'))}}</Tag></span>
                </div>
              </div>
              <template #content>
                <template v-if="row.result==-2">
                  <pre class="custom-bg-purple" style="padding: 20px">{{row.statisticInfo.err_info}}</pre>
                </template>
                <template v-else>
                  <div>
                    <Tag v-for="(res, k2) in row.info.data" :color="JUDGE_STATUS[res.result].color">
                      {{ $t('m.' + JUDGE_STATUS[res.result].name.replace(/ /g, '_')) }}|
                      {{ utils.submissionTimeFormat(res.cpu_time) }}|
                      {{ utils.submissionMemoryFormat(res.memory) }}
                    </Tag>
                  </div>
                </template>
                <Highlight :code="row.code" :language="row.language"></Highlight>
              </template>
            </Panel>
          </Collapse>
        </TitledPanel>
      </Content>
    </div>
    <XMUTFooter></XMUTFooter>
  </Layout>
</template>

<style>
.ivu-btn{
  margin-right: 10px;
  margin-left: 10px;
}

.operation .ivu-btn{
  margin-right: 1px;
  margin-left: 1px;
}

.submission-title{
  margin-left: 30px;
}
</style>
