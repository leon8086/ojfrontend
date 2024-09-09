<script setup>
import api from '@/api';
import {JUDGE_STATUS} from '@/utils/constants';
import utils from '@/utils';
import NavBar from '@/components/NavBar.vue';
import Highlight from '@/components/Highlight.vue';
import XMUTFooter from '@/components/XMUTFooter.vue';
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';
import TitledPanel from '@/components/TitledPanel.vue';
import CodeMirror from '@/components/CodeMirror.vue';
import { ref, onMounted, computed, resolveComponent } from 'vue';
import i18n from '@/i18n';
import { CENTERED_ALIGNMENT } from 'element-plus/es/components/virtual-list/src/defaults.mjs';

const submission = ref({
  result: '0',
  code: '',
  info: {
    data: []
  },
  statisticInfo: {
    time_cost: '',
    memory_cost: ''
  }
});

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

const isConcat = ref(false);
const loading = ref(false);
const infoHeight = ref(725);

onMounted(()=>{
  api.getSubmission(utils.getUrlKey("id"))
  .then( resp =>{
    submission.value = resp.data;
    problem.value = submission.value.voProblemDetail;
  })
})

const status = computed(() => {
  return {
    type: JUDGE_STATUS[submission.value.result].type,
    statusName: JUDGE_STATUS[submission.value.result].name,
    color: JUDGE_STATUS[submission.value.result].color
  }
})

const isCE = computed(() => {
  return submission.value.result === -2
});

const tableColumns = ref([
  {
    title:"id",
    slot: 'id',
    width: 80,
    align:"center",
  },
  {
    title:"状态",
    slot: 'status',
    align:"center",
    width: 120,
  },
  {
    title:"时间消耗",
    slot:"time",
    align:"center",
    width: 100,
  },
  {
    title:"内存消耗",
    slot:"memory",
    align:"center",
    width: 100,
  },
  {
    title:"详情",
    slot:"info",
    align:"center",
  },
]);

const isAdminRole = computed(() => {
  return true;
})

const submissionTime = computed(()=>{
  return utils.submissionTimeFormat(submission.value.statisticInfo.time_cost);
})

const submissionMemory = computed(()=>{
  return utils.submissionMemoryFormat(submission.value.statisticInfo.memory_cost);
})

const split = ref(0.55)

</script>


<template>
  <NavBar activeMenu="submission-list.html"></NavBar>
  <div class="content-app">
    <Content :style="{padding:'0 50px'}">
      <TitledPanel>
        <template #title>
          <Card class="details" :class="'custom-bg-'+status.color">
            <h1 class="title">{{$t('m.' + status.statusName.replace(/ /g, "_"))}}</h1>
            <template v-if="isCE">
              <pre>{{submission.statisticInfo.err_info}}</pre>
            </template>
            <template v-else>
              <Table :columns="tableColumns" :data="submission.info.data">
                <template #id="{row,index}">
                  {{ index+1 }}
                </template>
                <template #status="{row,index}">
                  <Tag :color="JUDGE_STATUS[row.result].color">
                    {{ $t('m.' + JUDGE_STATUS[row.result].name.replace(/ /g, '_')) }}
                  </Tag>
                </template>
                <template #time="{row,index}">
                  {{ utils.submissionTimeFormat(row.cpu_time) }}
                </template>
                <template #memory="{row,index}">
                  {{ utils.submissionMemoryFormat(row.memory) }}
                </template>
                <template #info="{row,index}">
                  <template v-if="row.result != 0">
                    <Collapse accordion style="text-align: left;">
                      <Panel>
                        详情（只输出前50个字符）
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
                </template>
              </Table>
            </template>
          </Card>
        </template>
        <Row type="flex" :gutter="18">
          <Col :span=13>
          <Scroll :height="infoHeight" style="background-color: white;" class="split-panel">
            <div class="markdown-body" id="problem-content">
              <div class="title">
                {{ problem.displayId }} - {{problem.title}}
              </div>
              <p class="title">{{ $t('m.Description') }}</p>
              <MdPreview editorId="preview-only" :modelValue="problem.description" :showCodeRowNumber="false"
                :codeFoldable="false" codeTheme="github" previewTheme="github" />
              <p class="title">{{ $t('m.Input') }}</p>
              <MdPreview editorId="preview-only" :modelValue="problem.inputDescription" :showCodeRowNumber="false"
                :codeFoldable="false" codeTheme="github" previewTheme="github" />
              <p class="title">{{ $t('m.Output') }}</p>
              <MdPreview editorId="preview-only" :modelValue="problem.outputDescription" :showCodeRowNumber="false"
                :codeFoldable="false" codeTheme="github" previewTheme="github" />
              <div v-if="problem.hint">
                <p class="title">{{ $t('m.Hint') }}</p>
                <Card dis-hover>
                  <div class="content" v-html=problem.hint></div>
                </Card>
              </div>
              <div v-if="problem.source">
                <p class="title">{{ $t('m.Source') }}</p>
                <p class="content">{{ problem.source }}</p>
              </div>
            </div>
          </Scroll>
          </Col>
          <Col :span=11>
          <div style="padding-left:20px;padding-right:20px">
            <Scroll :height="infoHeight" style="background-color: white;" class="split-panel">
              <Highlight :code="submission.code" :language="submission.language" :border-color="status.color">
              </Highlight>
            </Scroll>
          </div>
          </Col>
        </Row>
      </TitledPanel>
    </Content>
    <XMUTFooter></XMUTFooter>
  </div>
</template>


<style lang="less">
.details{
  h1{
    padding-bottom: 15px;
    font-weight: normal;
  }
  pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      word-break: break-all;
  }
}

.sample-text textarea.ivu-input{
  font-family : 'Courier New', Courier, monospace !important;
}

#problem-content {
  background-color: white;
  padding: 10px 40px 40px 40px;

  .title-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;

    th {
      padding-top: 5px;
    }

    td {
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

    &-input,
    &-output {
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
      font-family: "Consolas";
    }
  }
}
.title{
  color: var(--xmut-cs-color);
  font-weight: bolder;
}

</style>