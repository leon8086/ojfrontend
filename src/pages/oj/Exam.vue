<script setup>
import XMUTFooter from "@/components/XMUTFooter.vue";
import { useGlobalInfo } from "@/utils/globalInfo";
import utils from "@/utils";
import {ref, onMounted, computed, reactive, onUnmounted, watch, h, resolveComponent} from "vue";
import { Modal } from 'view-ui-plus';
import Highlight from '@/components/Highlight.vue';
import CodeMirror from "@/components/CodeMirror.vue";
import TitledPanel from "@/components/TitledPanel.vue";
import dayjs from 'dayjs';
import {JUDGE_STATUS} from '@/utils/constants';
import api from "@/api";

import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';

const website = ref({
  website_name:"测试",
  allow_register:false,
  website_name_shortcut:"测试"
});

const examInfo = ref({
  id: null,
  name: "测试考试",
  startTime: "2024-05-31T16:00:00Z",
  endTime: "2028-12-31T16:00:00Z",
})

const examProfile = ref({
  score: 0,
  info: [],
  problemConfig:[],
  isEnded:false,
})

const statusVisible = ref(false);
const submissionExists = ref(false);
let submissionId = "";
const result = reactive({ result: 9, });

const submitting = ref(false);
const submitted=ref(false);

const language=ref('C++');
const theme=ref('Clouds');
const problemSubmitDisabled = ref(false);

let refreshTimer = 0;

const copySample = function( t ){
  Copy({text:t});
}

const onResetToTemplate = function(){
  console.log("reset template");
}

const onLanguageChanged = function(new_lang){
  language.value = new_lang;
}

const checkSubmissionStatus = function(submit_problem){
  if( refreshTimer){
    clearTimeout(refreshTimer);
    refreshTimer = 0;
  }
  const checkStatus = () =>{
    let id = submissionId;
    clearTimeout(refreshTimer);  // 清掉timer
    refreshTimer = 0;
    api.getExamSubmissionResult(id)
    .then(resp => {
      result.value = resp.data;
      if( result.value.result == 6 || result.value.result == 7){ // 表示测试没有完成
        refreshTimer = setTimeout(checkStatus, 2000); // 继续检查
        return;
      }
      submit_problem.submissionList.unshift(resp.data);
      submitting.value = false;
      submitted.value = false;
      getProfile();
    }, err =>{
      submitting.value = false;
    })
  }
  setTimeout(checkStatus, 2000);
}

const submitCode = function(){
  if(problem.value.src[language.value].trim() === ""){
    Modal.error({
      title:"错误",
      content:"不能提交空代码！",
    })
    return;
  }
  submissionId = '';
  result.value = {result: 9};
  submitting.value = true;
  let data = {
    problemId:problem.value.id,
    language: language.value,
    code: problem.value.src[language.value],
    examId: examInfo.value.id,
  }
  console.log(data);
  api.submitExamCode(data)
  .then(resp => {
    if( resp.data.id != null ){
      submissionId = resp.data.id;
      submitting.value = false;
      submissionExists.value = true;
      submitted.value = true
      statusVisible.value = true;
      console.log(resp);
      checkSubmissionStatus(problem.value);
    }
    else{
      Modal.warning({
        title: "提交失败",
        content: "考试已结束",
      });
      submitting.value = false;
    }
  })
}

const submissionStatus = computed(()=> {
  return {
    text: JUDGE_STATUS[result.value.result]['name'],
    color: JUDGE_STATUS[result.value.result]['color']
  };
})

const problemList = ref([]);

const problem = ref({
          title: '测试题',
          description: '测试描述',
          hint: '',
          my_status: '',
          template: {},
          languages: [],
          tags: [],
          difficulty: "Low",
          src:"",
          submissionList: [],
        });

const handleQuit = function () {
  Modal.confirm({
    title: "提醒",
    content: "确定要结束考试吗？",
    onOk:()=>{
      quitExam();
    }
  })
};

const quitExam = function(){
  api.quitExam(examId.value)
  .then(resp=>{
    window.location.href="./exam-rank?id="+examId.value;
  }, err=>{
  });
}

const timeRemains = ref({});
const examId = ref(null);

const getProfile = function(){
  api.getExamProfile( examId.value )
  .then(resp=>{
    examProfile.value = resp.data;
    //console.log(dayjs().isAfter(examInfo.value.endTime));
    if( dayjs().isAfter(examInfo.value.endTime)){
      examProfile.value.isEnded = true;
    }
    if(examProfile.value.isEnded){
      Modal.confirm({
        title:"考试已结束",
        content:"点击确认跳转排名页面",
        onOk:()=>{
          window.location.href="./exam-rank.html?id="+examId.value;
        }
      });
    }
  }, err=>{
  })
}

onMounted(()=>{
  useGlobalInfo( website );
  examId.value = utils.getUrlKey("id");
  api.getExamBrief(examId.value)
  .then(resp=>{
    examInfo.value = resp.data;
  }, err=>{

  });
  api.getExamProblems(examId.value)
  .then( resp => {
    problemList.value = resp.data;
    for( let i =0; i<problemList.value.length; ++i){
      let p = problemList.value[i];
      p.src = {};
      for( let j in p.languages ){
        p.src[p.languages[j]] = "";
      }
      for( let key in p.template ){
        p.src[key] = p.template[key];
      }
      p.submissionList = [];
      api.getExamSubmission( examId.value, p.id )
      .then(resp => {
        // 不直接赋值以保证vue追踪变动
        p.submissionList.splice(0, p.submissionList.length)
        for( let i=0; i<resp.data.length; ++i ){
          p.submissionList.push(resp.data[i]);
        }
      }, err=>{
      })
    };
    getProfile(); // 放在这里，保证profile必须在problems之后加载。
    problem.value = problemList.value[0];
  });

  window.addEventListener("beforeunload", e=>{
    //e.preventDefault();
  });
  setInterval( ()=>{
    timeRemains.value = utils.duration(dayjs(), examInfo.value.endTime);
  });
});

const activePanel = ref('0');

const onTabClick = function(){
  problem.value = problemList.value[activePanel.value];
  statusVisible.value = false;
}

const toExamRank = function(){
  window.location.href="./exam-rank.html?id="+examId.value;
}

const scoreColor = function(score){
  if( score < 50 ){
    return "error";
  }
  if( score < 100 ){
    return "warning"
  }
  return "success";
}

</script>

<template>
  <div id="header">
    <Menu theme="light" mode="horizontal" class="oj-menu">
      <div class="logo">
        <Icon type="ios-create-outline" style="padding-right:5px"></Icon>
        <span>{{examInfo.title}}</span>
      </div>
      <template v-if="examProfile.isEnded">
        <div class="time-remain">
          考试已结束
          <Icon type="ios-pie" style="padding-left:10px"></Icon>
          得分：{{ examProfile.score }}
        </div>
      </template>
      <template v-else>
        <div class="time-remain">
          <Icon type="ios-clock-outline"></Icon>
          剩余时间：
          <Tag type="dot" :color="timeRemains.color" large><span class="time-str">{{timeRemains.message}}</span></Tag>
          <Icon type="ios-pie" style="padding-left:10px"></Icon>
          得分：{{ examProfile.score }}
        </div>
      </template>
      <div class="btn-menu">
        <template v-if="examProfile.isEnded">
          <Button type="primary" @click="toExamRank()">打开排名</Button>
        </template>
        <template v-else>
          <Button type="primary" @click="handleQuit()">结束考试</Button>
        </template>
      </div>
    </Menu>
  </div>

  <div class="content-app">
    <Content :style="{padding:'0 50px'}">
      <Row>
        <Col :span="14">
        <Card>
          <Tabs id='tabbody' type='card' value="name1" :animated="false" v-model="activePanel" @on-click="onTabClick">
            <TabPane v-for="item, key in problemList" :label="'第'+(key+1).toString()+'题：'+item.title" :name="key.toString()">
              <Scroll :height="750" style="background-color: white;" class="split-panel">
                <TitledPanel>
                  <template #title>
                    <div class="title">
                      {{item.title}}
                    </div>
                  </template>
                  <template #extra>
                    <div class="info">
                      <table>
                        <tr>
                          <td>{{ $t('m.Time_Limit') }}：{{ item.timeLimit }}MS</td>
                          <td>{{ $t('m.Memory_Limit') }}：{{ item.memoryLimit }}MB</td>
                          <td>{{ $t('m.Score') }}：
                            <Tag :color="scoreColor(examProfile.info[item.id])">{{ examProfile.info[item.id] }}/{{ item.totalScore }}</Tag>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </template>
                  <div class="markdown-body" id="problem-content">
                  <p class="title">{{ $t('m.Description') }}</p>
                  <MdPreview editorId="preview-only" :modelValue="problem.description" :showCodeRowNumber="false" :codeFoldable="false" codeTheme="github" previewTheme="github"/>
                  <p class="title">{{ $t('m.Input') }}</p>
                  <MdPreview editorId="preview-only" :modelValue="problem.inputDescription" :showCodeRowNumber="false" :codeFoldable="false" codeTheme="github" previewTheme="github"/>
                  <p class="title">{{ $t('m.Output') }}</p>
                  <MdPreview editorId="preview-only" :modelValue="problem.outputDescription" :showCodeRowNumber="false" :codeFoldable="false" codeTheme="github" previewTheme="github"/>
                    <div v-for="(sample, index) of item.samples" :key="index">
                      <div class="flex-container sample">
                        <div class="sample-input">
                          <p class="title">{{ $t('m.Sample_Input') }} {{ index + 1 }}
                            <a class="copy" @click="copySample(sample.input)">
                              <Icon type="md-clipboard"></Icon>
                            </a>
                          </p>
                          <pre>{{ sample.input }}</pre>
                        </div>
                        <div class="sample-output">
                          <p class="title">{{ $t('m.Sample_Output') }} {{ index + 1 }}</p>
                          <pre>{{ sample.output }}</pre>
                        </div>
                      </div>
                    </div>
                    <div v-if="item.hint">
                      <p class="title">{{ $t('m.Hint') }}</p>
                      <Card dis-hover>
                        <div class="content" v-html=item.hint></div>
                      </Card>
                    </div>
                  </div>
                </TitledPanel>
              </Scroll>
            </TabPane>
          </Tabs>
        </Card>
        </Col>
        <Col :span="10">
        <Card id="submit-code" class="split-panel">
          <CodeMirror
            v-model="problem.src[language]"
            :languageSets="problem.languages"
            :defaultLanguage="language"
            :theme="theme"
            @resetCode="onResetToTemplate"
            @language-changed="onLanguageChanged"
            :disabled="examProfile.isEnded"
            :style="{height:'673px'}"
          ></CodeMirror>
          <Row type="flex" justify="space-between">
            <Col :span="10">
            <div class="status" v-if="statusVisible">
              <span>{{ $t('m.Status') }}</span>
              <Tag :color="submissionStatus.color" size="medium" @click.native="console.log('');">
                {{ $t('m.' + submissionStatus.text.replace(/ /g, "_")) }}
              </Tag>
            </div>
            </Col>

            <Col :span="12" style="text-align: right;">
            <Button type="primary" icon="edit" :loading="submitting" @click="submitCode"
              :disabled="problemSubmitDisabled || submitted || examProfile.isEnded" class="fl-right">
              <span v-if="submitting">{{ $t('m.Submitting') }}</span>
              <span v-else>{{ $t('m.Submit') }}</span>
            </Button>
            </Col>
          </Row>
        </Card>
        </Col>
      </Row>
      <TitledPanel id="submission">
        <template #title>
          我的提交（ {{ problem.submissionList.length }} ）
        </template>
        <Collapse accordion>
          <Panel v-for="(item,key) in problem.submissionList" :class="'custom-bg-'+JUDGE_STATUS[item.result].color">
            <div :style="{ display: 'inline-block' }" >
              <span style="padding-right: 30px">{{ utils.utcToLocal(item.createTime) }}</span>
              <Tag :color="JUDGE_STATUS[item.result].color">{{$t('m.' + JUDGE_STATUS[item.result].name.replace(/ /g, '_'))}}</Tag>
            </div>
            <template #content>
              <template v-if="item.result==-2">
                <pre class="custom-bg-purple" style="padding: 20px">{{item.statisticInfo.err_info}}</pre>
              </template>
              <template v-else>
                <div>
                  <Tag v-for="(res, k2) in item.info.data" :color="JUDGE_STATUS[res.result].color">
                    {{ $t('m.' + JUDGE_STATUS[res.result].name.replace(/ /g, '_')) }}|
                    {{ utils.submissionTimeFormat(res.cpu_time) }}|
                    {{ utils.submissionMemoryFormat(res.memory) }}
                  </Tag>
                </div>
              </template>
              <Highlight :code="item.code" :language="item.language"></Highlight>
            </template>
          </Panel>
        </Collapse>
      </TitledPanel>
    </Content>
  </div>
  <XMUTFooter></XMUTFooter>
</template>

<style lang="less">

#tabbody .ivu-tabs-bar{
  margin-bottom: 0px;
}

#tabbody .ivu-tabs-tab:not(.ivu-tabs-tab-active) {
  color: #fdfdfd;
}

#tabbody .ivu-tabs-tab {
  font-size: 120%;
}

#header {
  min-width: 300px;
  position: fixed;
  top: 0;
  left: 0;
  height: auto;
  width: 100%;
  z-index: 1000;
  background-color: #fff;
  box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.1);
  .oj-menu {
    background: #fdfdfd;
    display: flex;
    justify-content: space-between;
  }

  .logo {
    margin-left: 2%;
    margin-right: 2%;
    font-size: 20px;
    line-height: 60px;
    color: var(--xmut-cs-color);
    font-weight: bolder;
  }

  .time-remain{
    font-size: 16px;
  }

  .time-str{
    font-size: 16px;
  }

  .btn-menu {
    font-size: 16px;
    float: right;
    margin-right: 10px;
  }
}

#problem-content {
  background-color: white;
  padding: 10px 40px 40px 20px;
  .title-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    th{
      padding-top:5px;
    }
    td{
      text-align: center;
      border: none;
    }
  }
  .title {
    font-size: 20px;
    font-weight: 400;
    margin: 25px 0 8px 0;
    color: var(--xmut-cs-color);
    .copy {
      padding-left: 8px;
    }
  }
  p.content {
    margin-left: 25px;
    margin-right: 20px;
    font-size: 15px
  }
  .sample {
    align-items: stretch;
    &-input, &-output {
      width: 50%;
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      margin-right: 5%;
    }
    pre {
      flex: 1 1 auto;
      align-self: stretch;
      border-style: solid;
      background: transparent;
      font-family:"Consolas";
    }
  }
}

#submit-code {
  padding-left: 20px;
  padding-top: 10px;
  .status {
    float: left;
    span {
      margin-right: 10px;
      margin-left: 10px;
    }
  }
  .captcha-container {
    display: inline-block;
    .captcha-code {
      width: auto;
      margin-top: -20px;
      margin-left: 20px;
    }
  }
}

.title{
  color: var(--xmut-cs-color);
  font-weight: bolder;
}

.info{
  table{
    td{
      padding-right:5px;
      padding-left:5px;
    }
  }
}

.fl-right {
  float: right;
  text-align: right;
}

#submission{
  margin-top: 20px;
  margin-bottom: 10px;
  padding: 20px 0px;
}
</style>
