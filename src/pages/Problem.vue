<template>
  <Layout>
      <NavBar :website="{website_name:'数据结构2022',allow_register:true}" :activeMenu="'/problems'" :user="{username:'tom'}"></NavBar>
      <div class="flex-container">
        <div class="content-app" id="problem-main">
          <Panel :padding="40">
            <template #title>
              <div>{{problem.title}}</div>
            </template>
          <div id="problem-content" class="markdown-body" v-katex>
            <p class="title">{{$t('m.Description')}}</p>
            <p class="content" v-html=problem.description></p>
            <p class="title">{{$t('m.Input')}} <span v-if="problem.ioMode.io_mode=='File IO'">({{$t('m.FromFile')}}: {{ problem.ioMode.input }})</span></p>
            <p class="content" v-html=problem.inputDescription></p>

            <p class="title">{{$t('m.Output')}} <span v-if="problem.ioMode.io_mode=='File IO'">({{$t('m.ToFile')}}: {{ problem.ioMode.output }})</span></p>
            <p class="content" v-html=problem.outputDescription></p>

            <div v-for="(sample, index) of problem.samples" :key="index">
              <div class="flex-container sample">
                <div class="sample-input">
                  <p class="title">{{$t('m.Sample_Input')}} {{index + 1}}
                    <a class="copy"
                      v-clipboard:copy="sample.input"
                      v-clipboard:success="onCopy"
                      v-clipboard:error="onCopyError">
                      <Icon type="md-clipboard"></Icon>
                    </a>
                  </p>
                  <pre>{{sample.input}}</pre>
                </div>
                <div class="sample-output">
                  <p class="title">{{$t('m.Sample_Output')}} {{index + 1}}</p>
                  <pre>{{sample.output}}</pre>
                </div>
              </div>
            </div>
              <div v-if="problem.hint">
                <p class="title">{{$t('m.Hint')}}</p>
                <Card dis-hover>
                  <div class="content" v-html=problem.hint></div>
                </Card>
              </div>

              <div v-if="problem.source">
                <p class="title">{{$t('m.Source')}}</p>
                <p class="content">{{problem.source}}</p>
              </div>
            </div>
        </Panel>
          <Card :padding="20" id="submit-code" dis-hover>
            <CodeMirror v-model="code"
                        :languageSets="problem.languages"
                        :defaultLanguage="language"
                        :theme="theme"
                        @resetCode="onResetToTemplate"
                        ></CodeMirror>
            <Row type="flex" justify="space-between">
              <Col :span="10">
                <div v-if="problem.my_status === 0">
                  <Alert type="success" show-icon>{{$t('m.You_have_solved_the_problem')}}</Alert>
                </div>
              </Col>

              <Col :span="12">
                <template v-if="captchaRequired">
                  <div class="captcha-container">
                    <Tooltip v-if="captchaRequired" content="Click to refresh" placement="top">
                      <img :src="captchaSrc" @click="getCaptchaSrc"/>
                    </Tooltip>
                    <Input v-model="captchaCode" class="captcha-code"/>
                  </div>
                </template>
                <Button type="warning" icon="edit" :loading="submitting" @click="submitCode"
                        :disabled="problemSubmitDisabled || submitted"
                        class="fl-right">
                  <span v-if="submitting">{{$t('m.Submitting')}}</span>
                  <span v-else>{{$t('m.Submit')}}</span>
                </Button>
              </Col>
            </Row>
          </Card>
        </div>

        <div id="right-column">
          <Card id="info">
            <template #title>
              <div class="header">
                <Icon type="ios-information-circle"></Icon>
                <span class="card-title">{{$t('m.Information')}}</span>
              </div>
            </template>
            <ul>
              <li>
                <p>ID</p>
                <p>{{problem.titleId}}</p>
              </li>
              <li>
                <p>{{$t('m.Time_Limit')}}</p>
                <p>{{problem.timeLimit}}MS</p>
              </li>
              <li>
                <p>{{$t('m.Memory_Limit')}}</p>
                <p>{{problem.memoryLimit}}MB</p></li>
              <li>
                <p>{{$t('m.IOMode')}}</p>
                <p>{{problem.ioMode.io_mode}}</p>
              </li>
              <li v-if="problem.difficulty">
                <p>{{$t('m.Level')}}</p>
                <p><Tag :color="({Low:'success',High:'warning',Mid:'primary'})[problem.difficulty]">{{$t('m.' + problem.difficulty)}}</Tag></p></li>
              <li v-if="problem.total_score">
                <p>{{$t('m.Score')}}</p>
                <p>{{problem.total_score}}</p>
              </li>
              <li v-if="problem.totalScore">
                <p>{{$t('m.Score')}}</p>
                <p>{{problem.totalScore}}</p>
              </li>
            </ul>
          </Card>
        </div>
      </div>
      <XMUTFooter></XMUTFooter>
  </Layout>
</template>

<script setup>
import NavBar from '../components/NavBar.vue'
import Panel from '../components/Panel.vue'
import CodeMirror from '../components/CodeMirror.vue'
import VerticalMenu from "../components/verticalMenu/verticalMenu.vue"
import VerticalMenuItem from "../components/verticalMenu/verticalmenu-item.vue"
import XMUTFooter from '../components/XMUTFooter.vue'
import utils from '../utils'

import { ref, reactive, onMounted } from 'vue';
import {pie, largePie} from '../utils/chartData'
import i18n from '../i18n';
import api from '../api';
const statusVisible = ref(false);
const captchaRequired = ref(false);
const graphVisible = ref(false);
const submissionExists = ref(false);
const captchaCode = ref('');
const captchaSrc = ref('');
const contestID = ref('');
const problemID = ref('');
const submitting = ref(false);
let code = ref('');
const language=ref('C++');
const theme=ref('Clouds');
const submissionId=ref('');
const submitted=ref(false);
const result = reactive({ result: 9, });
const problemSubmitDisabled = ref(false);
const problem = ref({
          title: '测试题',
          description: '测试描述',
          hint: '',
          my_status: '',
          template: {},
          languages: [],
          created_by: {
            username: ''
          },
          tags: [],
          ioMode: {'io_mode': 'Standard IO'}
        });
const pieOption = reactive(pie);
const largePieOption = reactive(largePie);
const largePieInitOpts = reactive({
          width: '500',
          height: '480' });

const onCopy = function(){
  console.log("copied");
}

const onCopyError = function( ){
  console.log("error");
}

const onResetToTemplate = function(){
  console.log("reset template");
}

const submitCode = function(){
  //console.log(code.value);
  let data = {
    problemId:problemID.value,
    language: language.value,
    code: code.value,
  }
  api.submitCode(data)
  .then(resp => {
    console.log(resp.data);
  })
}

onMounted(() => {
  problemID.value = utils.getUrlKey("id");
  api.getProblemDetail(problemID.value)
  .then(resp => {
    problem.value = resp.data;
  });
})
</script>

<style lang="less" scoped>
  .card-title {
    margin-left: 8px;
  }

  .flex-container {
    #problem-main {
      flex: auto;
      //margin-right: 18px;
      margin-right: 300px;
      margin-left: 40px;
    }
    #right-column {
      flex: none;
      position: fixed;
      right: 0px;
      width: 220px;
      margin-top: 80px;
      margin-right:40px;
    }
  }

  #problem-content {
    margin-top: -50px;
    .title {
      font-size: 20px;
      font-weight: 400;
      margin: 25px 0 8px 0;
      color: #3091f2;
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
      }
    }
  }

  #submit-code {
    margin-top: 20px;
    margin-bottom: 20px;
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

  #pieChart {
    .echarts {
      height: 250px;
      width: 210px;
    }
    #detail {
      position: absolute;
      right: 10px;
      top: 10px;
    }
  }

  #pieChart-detail {
    margin-top: 20px;
    width: 500px;
    height: 480px;
  }
</style>