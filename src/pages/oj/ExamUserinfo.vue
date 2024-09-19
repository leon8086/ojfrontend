
<script setup>
import NavBar from '@/components/NavBar.vue'
import XMUTFooter from '@/components/XMUTFooter.vue'
import TitledPanel from '@/components/TitledPanel.vue';
import { watch, ref, reactive, onMounted, resolveComponent } from 'vue';
import { JUDGE_STATUS } from '@/utils/constants';
import Highlight from "@/components/Highlight.vue";
import i18n from '@/i18n';
import dayjs from "dayjs";
import api from '@/api';
import utils from '@/utils';

const userInfo = ref({login:false});

const examUser = ref({username:""});
const examProfile = ref({name:""});
const submissionList = ref([]);
const submissionMap = ref({});

const processSubmission = function(){
  submissionList.value.forEach( item=>{
    item.createTime = new Date(item.createTime);
  });
  submissionList.value.sort((v1,v2)=>{ return v1.createTime - v2.createTime });
  submissionList.value.forEach( item=>{
    if(submissionMap.value[item.problemId]==null){
      submissionMap.value[item.problemId] = [item];
    }
    else{
      submissionMap.value[item.problemId].push(item);
    }
  });
  examProfile.value.problemConfig.forEach( item=>{
    item.submissionList = submissionMap.value[item.id];
  })
}

const scoreColor = function(score){
  let color="error";
  if( score == 100 ){
    color = "success";
  }
  else if( score >= 50){
    color = "warning";
  }
  return color;
}

watch( ()=>userInfo.value, ()=>{
  examUser.value = userInfo.value;
});

onMounted(() => {
  examProfile.value.examId  = utils.getUrlKey("id");
  examUser.value.id  = utils.getUrlKey("user");
  if( examUser.value.id != null ){
    api.adminGetUser(examUser.value.id)
    .then(resp=>{
      examUser.value = resp.data;
      api.adminGetUserExamProfile( examProfile.value.id, examUser.value.id )
      .then( profile=>{
        examProfile.value = profile.data;
        api.adminGetExamSubmisssion( profile.data.examId, profile.data.userId )
        .then( submit=>{
          submissionList.value = submit.data;
          processSubmission();
        })
      })
    })
  }
  else{
    examUser.value = userInfo.value;
    api.getExamProfile( examProfile.value.examId )
    .then( profile=>{
      examProfile.value = profile.data;
      api.getExamSubmission( profile.data.examId )
      .then( submit=>{
        submissionList.value = submit.data;
        processSubmission();
      })
    })
  }
})

</script>

<template>
  <Layout>
    <NavBar :activeMenu="'exam-userinfo.html'" v-model="userInfo"></NavBar>
    <div class="content-app">
      <Content :style="{padding:'0 50px'}">
        <TitledPanel>
          <template #title>
            {{ examUser.username }} 的考试详情 ( {{ examProfile.score }} )
          </template>
          <Card v-for="item, key in examProfile.problemConfig">
            <template #title>
              <h2>
                {{ item.title }}
                <Tag :color="scoreColor(examProfile.info[item.id])" style="font-size: 18px" size="large"> {{ examProfile.info[item.id] }} </Tag>
              </h2>
            </template>
            <Collapse accordion v-if="item.submissionList != null && item.submissionList.length != 0 ">
              <Panel v-for="row, key in item.submissionList" :class="'custom-bg-'+JUDGE_STATUS[row.result].color">
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
            <div v-else>
              没有提交
            </div>
          </Card>
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
</style>
