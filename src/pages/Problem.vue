<script setup>
import NavBar from '@/components/NavBar.vue'
import CodeMirror from '@/components/CodeMirror.vue'
import XMUTFooter from '@/components/XMUTFooter.vue'
import TitledPanel from '@/components/TitledPanel.vue'
import utils from '@/utils'
import {JUDGE_STATUS, DIFFICULTY_COLOR} from '../utils/constants'
import {Modal, Copy} from 'view-ui-plus';

import { ref, reactive, onMounted, computed } from 'vue';
import api from '../api';
const statusVisible = ref(false);
const submissionExists = ref(false);
let submissionId = "";
const result = reactive({ result: 9, });

const submitting = ref(false);
const submitted=ref(false);

const split = ref(0.55);
const problemID = ref('');
const code = ref('');
const language=ref('C++');
const theme=ref('Clouds');
const problemSubmitDisabled = ref(false);
const problem = ref({
          title: '测试题',
          description: '测试描述',
          hint: '',
          my_status: '',
          template: {},
          languages: [],
          tags: [],
          difficulty: "Low",
        });

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

const checkSubmissionStatus = function(){
  if( refreshTimer){
    clearTimeout(refreshTimer);
    refreshTimer = 0;
  }
  const checkStatus = () =>{
    let id = submissionId;
    clearTimeout(refreshTimer);  // 清掉timer
    refreshTimer = 0;
    api.getSubmissionResult(id)
    .then(resp => {
      result.value = resp.data;
      if( result.value.result == 6 || result.value.result == 7){ // 表示测试没有完成
        refreshTimer = setTimeout(checkStatus, 2000); // 继续检查
        return;
      }
      submitting.value = false;
      submitted.value = false;
      return;
    }, err =>{
      submitting.value = false;
    })
  }
  setTimeout(checkStatus, 2000);
}

const submitCode = function(){
  if(code.value.trim() === ""){
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
    problemId:problemID.value,
    language: language.value,
    code: code.value,
  }
  api.submitCode(data)
  .then(resp => {
    submissionId = resp.data.id;
    submitting.value = false;
    submissionExists.value = true;
    submitted.value = true
    statusVisible.value = true;
    checkSubmissionStatus();
  })
}

const changeLanguage = function( new_lang ){
  language.value = new_lang;
}

onMounted(() => {
  problemID.value = utils.getUrlKey("id");
  api.getProblemDetail(problemID.value)
  .then(resp => {
    problem.value = resp.data
    code.value = problem.value.template[language.value];
  });
})

const submissionStatus = computed(()=> {
  return {
    text: JUDGE_STATUS[result.value.result]['name'],
    color: JUDGE_STATUS[result.value.result]['color']
  };
})

</script>
<template>
  <NavBar :activeMenu="'/problemlist.html'"></NavBar>
  <div class="content-app">
    <Content :style="{padding:'0 50px'}">
      <TitledPanel>
        <template #title>
          <div class="title">
            {{ problem.displayId }} - {{problem.title}}
          </div>
        </template>
        <template #extra>
          <div class="info">
            <table>
              <tr>
                <td>{{ $t('m.Time_Limit') }}：{{ problem.timeLimit }}MS</td>
                <td>{{ $t('m.Memory_Limit') }}：{{ problem.memoryLimit }}MB</td>
                <td>{{ $t('m.Level') }}：
                  <Tag :color="DIFFICULTY_COLOR[problem.difficulty]">{{ $t('m.' + problem.difficulty) }}</Tag>
                </td>
                <td>{{ $t('m.Score') }}：{{ problem.totalScore }}</td>
                <td>{{ $t('m.HaveACed') }}</td>
              </tr>
            </table>
          </div>
        </template>
        <div class="split">
          <Split v-model="split">
            <template #left>
              <Scroll :height="780" style="background-color: white;" class="split-panel">
                <div class="markdown-body" id="problem-content">
                  <p class="title">{{ $t('m.Description') }}</p>
                  <p class="content" v-html=problem.description></p>
                  <p class="title">{{ $t('m.Input') }}</p>
                  <p class="content" v-html=problem.inputDescription></p>
                  <p class="title">{{ $t('m.Output') }}</p>
                  <p class="content" v-html=problem.outputDescription></p>
                  <div v-for="(sample, index) of problem.samples" :key="index">
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
                  <div v-if="problem.hint">
                    <p class="title">{{ $t('m.Hint') }}</p>
                    <Card dis-hover>
                      <div class="content" v-html=problem.hint></div>
                    </Card>
                  </div>
                </div>
              </Scroll>
            </template>
            <template #right>
              <div id="submit-code" class="split-panel">
                <CodeMirror v-model="code" :languageSets="problem.languages" :defaultLanguage="language" :theme="theme"
                  @resetCode="onResetToTemplate" @language-changed="onLanguageChanged"></CodeMirror>
                <Row type="flex" justify="space-between">
                  <Col :span="10">
                  <div class="status" v-if="statusVisible">
                    <span>{{ $t('m.Status') }}</span>
                    <Tag :color="submissionStatus.color" size="medium" @click.native="console.log('');">
                      {{ $t('m.' + submissionStatus.text.replace(/ /g, "_")) }}
                    </Tag>
                  </div>
                  <div v-if="problem.my_status === 0">
                    <Alert type="success" show-icon>{{ $t('m.You_have_solved_the_problem') }}</Alert>
                  </div>
                  </Col>

                  <Col :span="12">
                  <Button type="primary" icon="edit" :loading="submitting" @click="submitCode"
                    :disabled="problemSubmitDisabled || submitted" class="fl-right">
                    <span v-if="submitting">{{ $t('m.Submitting') }}</span>
                    <span v-else>{{ $t('m.Submit') }}</span>
                  </Button>
                  </Col>
                </Row>
              </div>
            </template>
          </Split>
        </div>
      </TitledPanel>
    </Content>
  </div>
  <XMUTFooter></XMUTFooter>
</template>


<style lang="less" scoped>
  .split {
    height: 780px;
    border: 1px solid #dcdee2;
  }

  .split-panel {
    padding: 0px 10px;
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

  #info {
    margin-bottom: 20px;
    ul {
      list-style-type: none;
      li {
        border-bottom: 1px dotted #e9eaec;
        margin-bottom: 10px;
        padding-bottom: 10px;
        p {
          display: inline-block;
        }
        p:first-child {
          width: 90px;
        }
        p:last-child {
          float: right;
        }
      }
    }
  }
  .fl-right {
    float: right;
  }
</style>