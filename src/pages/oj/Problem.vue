<script setup>
import NavBar from '@/components/NavBar.vue';
import CodeMirror from '@/components/CodeMirror.vue';
import XMUTFooter from '@/components/XMUTFooter.vue';
import TitledPanel from '@/components/TitledPanel.vue';
import Highlight from '@/components/Highlight.vue';
import utils from '@/utils';
import {JUDGE_STATUS, DIFFICULTY_COLOR} from '@/utils/constants';
import {Modal, Copy} from 'view-ui-plus';

import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';

import { ref, reactive, onMounted, computed } from 'vue';
import api from '@/api';
const statusVisible = ref(false);
const submissionExists = ref(false);
const submissionId = ref("");
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
          status: 0,
          template: {},
          languages: [],
          tags: [],
          src:{},
          difficulty: "Low",
          submissionList: [],
        });


let refreshTimer = 0;

const copySample = function( t ){
  Copy({text:t});
}

const onResetToTemplate = function(){
  problem.value.src[language.value] = problem.value.template[language.value];
}

const onLanguageChanged = function(new_lang){
  language.value = new_lang;
}

const loadProblem = function(){
  api.getProblemDetail(problemID.value)
  .then(resp => {
    problem.value = resp.data
    problem.value.src = {};
    for( let key in problem.value.template ){
      problem.value.src[key] = problem.value.template[key];
    }
  });
}

const checkSubmissionStatus = function(){
  if( refreshTimer){
    clearTimeout(refreshTimer);
    refreshTimer = 0;
  }
  const checkStatus = () =>{
    let id = submissionId.value;
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
      // let tmp_code = code.value;
      api.getProblemDetail(problemID.value)
      .then(resp => {
        problem.value.submissionList = resp.data.submissionList;
      });
    }, err =>{
      submitting.value = false;
    })
  }
  setTimeout(checkStatus, 2000);
}

const submitCode = function(){
  let code = problem.value.src[language.value];
  if(code==null || code.trim() === ""){
    Modal.error({
      title:"错误",
      content:"不能提交空代码！",
    })
    return;
  }
  submissionId.value = '';
  result.value = {result: 9};
  submitting.value = true;
  let data = {
    problemId:problemID.value,
    language: language.value,
    code,
  }
  api.submitCode(data)
  .then(resp => {
    submissionId.value = resp.data.id;
    submitting.value = false;
    submissionExists.value = true;
    submitted.value = true
    statusVisible.value = true;
    checkSubmissionStatus();
  });
}

onMounted(() => {
  problemID.value = utils.getUrlKey("id");
  loadProblem();
  // api.getProblemDetail(problemID.value)
  // .then(resp => {
  //   problem.value = resp.data
  //   code.value = problem.value.template[language.value];
  // });
})

const submissionStatus = computed(()=> {
  return {
    text: JUDGE_STATUS[result.value.result]['name'],
    color: JUDGE_STATUS[result.value.result]['color']
  };
});

</script>
<template>
  <NavBar activeMenu="problem-list.html"></NavBar>
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
                <td>
                  <template v-if="problem.status != null">
                    <Tag :color="JUDGE_STATUS[problem.status].color"> {{ $t('m.' + JUDGE_STATUS[problem.status].name.replace(/ /g, '_'))  }} </Tag>
                  </template>
                  <template v-else>
                    <Tag> 未提交 </Tag>
                  </template>
                </td>
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
                  <MdPreview editorId="preview-only" :modelValue="problem.description" :showCodeRowNumber="false" :codeFoldable="false" codeTheme="github" previewTheme="github"/>
                  <p class="title">{{ $t('m.Input') }}</p>
                  <MdPreview editorId="preview-only" :modelValue="problem.inputDescription" :showCodeRowNumber="false" :codeFoldable="false" codeTheme="github" previewTheme="github"/>
                  <p class="title">{{ $t('m.Output') }}</p>
                  <MdPreview editorId="preview-only" :modelValue="problem.outputDescription" :showCodeRowNumber="false" :codeFoldable="false" codeTheme="github" previewTheme="github"/>
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
                      <MdPreview editorId="preview-only" :modelValue="problem.hint" :showCodeRowNumber="false" :codeFoldable="false" codeTheme="github" previewTheme="github"/>
                    </Card>
                  </div>
                </div>
              </Scroll>
            </template>
            <template #right>
              <div id="submit-code" class="split-panel">
                <CodeMirror v-model="problem.src[language]" :languageSets="problem.languages" :defaultLanguage="language" :theme="theme"
                  :resetCode="onResetToTemplate" @language-changed="onLanguageChanged"></CodeMirror>
                <Row type="flex" justify="space-between">
                  <Col :span="10">
                  <div class="status" v-if="statusVisible">
                    <span>{{ $t('m.Status') }}</span>
                    <a :href="'submission.html?id='+submissionId" target="_blank">
                      <Tag :color="submissionStatus.color" size="medium" @click.native="console.log('');">
                        {{ $t('m.' + submissionStatus.text.replace(/ /g, "_")) }}
                      </Tag>
                    </a>
                  </div>
                  <div v-if="problem.status === 0 && !statusVisible" style="width:130px">
                    <Alert type="success" show-icon>已解决</Alert>
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
              <Row :gutter="5">
                <Col :span="10">
                  <Tooltip content="复制代码" placement="top-start">
                    <Button icon="ios-copy" style="margin-left:0px;margin-top:5px;" @click="Copy({text:item.code})"></Button>
                  </Tooltip>
                  <Highlight :code="item.code" :language="item.language"></Highlight>
                </Col>
                <Col :span="14">
                  <template v-if="item.result==-2">
                    <pre class="custom-bg-purple" style="padding: 20px">{{item.statisticInfo.err_info}}</pre>
                  </template>
                  <template v-else>
                    <Collapse accordion style="text-align: left;">
                      <Panel v-for="row, index in item.info.data" :class="'custom-bg-'+JUDGE_STATUS[row.result].color">
                        <div :style="{ display: 'inline-block' }" >
                          <div style="padding-right: 30px; text-align: right; width: 50px; display:inline-block">{{ index+1 }}</div>
                          <Tag :color="JUDGE_STATUS[row.result].color">
                            {{$t('m.' + JUDGE_STATUS[row.result].name.replace(/ /g, '_'))}}
                            {{ utils.submissionTimeFormat(row.cpu_time) }}
                            {{ utils.submissionMemoryFormat(row.memory) }}
                          </Tag>
                        </div>
                        <template #content>
                          <Row :gutter="5">
                            <Col :span="8">
                            <h3>输入</h3>
                            <Input :rows="8" type="textarea" v-model="row.input" class="sample-text" readonly>
                            </Input>
                            </Col>
                            <Col :span="8">
                            <h3>输出</h3>
                            <Input :rows="8" type="textarea" v-model="row.answer" class="sample-text" readonly>
                            </Input>
                            </Col>
                            <Col :span="8">
                            <h3>预计</h3>
                            <Input :rows="8" type="textarea" v-model="row.output" class="sample-text" readonly>
                            </Input>
                            </Col>
                          </Row>
                        </template>
                      </Panel>
                    </Collapse>
                  </template>
                </Col>
              </Row>
            </template>
          </Panel>
        </Collapse>
      </TitledPanel>
    </Content>
  </div>
  <XMUTFooter></XMUTFooter>
</template>


<style lang="less">
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
  pre{
    margin-top: 0px;
  }
</style>