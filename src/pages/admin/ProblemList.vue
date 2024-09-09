
<script setup>
import NavBarAdmin from '@/components/NavBarAdmin.vue'
import XMUTFooter from '@/components/XMUTFooter.vue'
import TitledPanel from '@/components/TitledPanel.vue';
import SlimRemotePage from "@/components/SlimRemotePage.vue";
import ImportResult from "@/components/ImportResult.vue";
import ProblemSelector from "@/components/ProblemSelector.vue";
import ProbTag from "@/components/ProbTag.vue";
import { DIFFICULTY_COLOR } from '@/utils/constants';
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';
import i18n from '@/i18n';
import api from '@/api';
import utils from '@/utils';
import { ref, reactive, onMounted, resolveComponent } from 'vue';
import { TagSelect } from 'view-ui-plus';

const query = reactive({keyword:'', page:1, limit:10, total:0 });

const problemList = ref([]);
const problemTableColumns = ref([
  {
    type:"selection",
    width: 60,
  },
  {
    title: 'id',
    width: 80,
    key: "id",
  },
  {
    title: '题目id',
    width: 120,
    slot:"display",
  },
  {
    title: "题目",
    width:300,
    slot: "title",
    tooltip:true,
    tooltipTheme:"light",
  },
  {
    title: "难度",
    width: 100,
    slot: "level",
  },
  {
    title: "类型",
    slot: 'templated',
    width: 100,
    align: 'center',
  },
  {
    title: "发布",
    slot: 'enable',
    width: 80,
  },
  {
    title: "限制",
    slot: 'limitation',
    align:"center",
    width: 200,
  },
  {
    title: "分类",
    slot: 'tags',
    align:'center',
    width: 280,
  },
  {
    title: "AC",
    slot: 'ac_rate',
    align:"center",
  },
  {
    title: "操作",
    slot: 'operation',
    align:"center",
    className:"operation",
  },
]);

const filterByKeyword = function(){
}

const onReset = function(){
  query.keyword = "";
  query.page = 1;
  query.limit = 10;
}
const userInfo = ref({login:false});

const newProblem = function(){
  window.open("./problem.html","_blank");
}

const curProblem = ref({ title:"", description:"" });
const isShowDesc = ref(false);
const showDesc = function( index ){
  curProblem.value = problemList.value[index];
  isShowDesc.value = true;
}


const selectionItems = ref([])
const visibleChanged = function(index, visible){
  let id = problemList.value[index].id;
  api.adminSetVisibility( [id], visible )
  .then(resp=>{
    pageRef.value.refresh();
  });
}
const onSelectionChange = function( selection ){
  selectionItems.value = selection;
}
const switchOn = function(){
  let params = []
  selectionItems.value.forEach( item=>{
    params.push(item.id);
  });
  api.adminSetVisibility(params, true)
  .then(resp=>{
    pageRef.value.refresh();
    selectionItems.value = [];
  });
}

const switchOff = function(){
  let params = []
  selectionItems.value.forEach( item=>{
    params.push(item.id);
  });
  api.adminSetVisibility(params, false)
  .then(resp=>{
    pageRef.value.refresh();
    selectionItems.value = [];
  });
}

const switchOnAll = function(){
  api.adminSetAllVisibility(true)
  .then(resp=>{
    pageRef.value.refresh();
    selectionItems.value = [];
  });
}

const switchOffAll = function(){
  api.adminSetAllVisibility(false)
  .then(resp=>{
    pageRef.value.refresh();
    selectionItems.value = [];
  });
}


const modifyProblem = function(index){
  let id = problemList.value[index].id;
  window.location.href="./problem.html?id="+id;
}

const deleteProblem = function(index){
}

const isUploading = ref(false);
const isUploadSuccess = ref(false);
const uploadProgress = ref(0);

const showImportResult = ref(false);
const importResult = ref({
  insert:0,
  failed:[],
});

const pageRef = ref();

const handleUpload = function( file ){
  isUploading.value = true;
  isUploadSuccess.value = false;
  api.adminImportProblems( file, (pe)=>{
    uploadProgress.value = parseInt((pe.loaded/pe.total * 100).toFixed(2));
    isUploading.value = false;
    isUploadSuccess.value = true;
  })
  .then( resp=>{
    importResult.value.insert = resp.data.insert;
    resp.data.failed.forEach( item=>{
      importResult.value.failed.push( {
        id: item.displayId,
        title: item.title,
        content: item.difficulty,
      })
    });
    showImportResult.value = true;
    pageRef.value.refresh();
  },err=>{
    console.log(err);
    isUploading.value = false;
    uploadProgress.value = 0;
  })
  return true;
}

const onFinished = function(){
  importResult.value.insert =0;
  importResult.value.failed =[];
}

const isShowExport = ref(false);
const exportList = ref([]);
const isExporting = ref(false);

const saveBlob = function(resp){
  const blob = new Blob([resp]);//处理文档流
  const fileName = 'problems.zip';
  const elink = document.createElement('a');
  elink.download = fileName;
  elink.style.display = 'none';
  elink.href = URL.createObjectURL(blob);
  console.log(elink.href);
  document.body.appendChild(elink);
  elink.click();
  URL.revokeObjectURL(elink.href); // 释放URL 对象
  document.body.removeChild(elink);
  exportList.value = [];
}

const doExport = function(){
  let idList = [];
  isExporting.value = true;
  exportList.value.forEach( item=>{
    idList.push(item.id);
  });
  api.adminExportProblems( idList )
  .then(resp=>{
    saveBlob(resp);
    isExporting.value = false;
  },err=>{
  })
}

const exportAll = function(){
  isExporting.value = true;
  api.adminExportAllProblems()
  .then(resp=>{
    saveBlob(resp);
    isExporting.value = false;
  },err=>{
  })
}

onMounted(() => {
})
</script>

<template>
  <Layout>
    <NavBarAdmin :activeMenu="'./problem-list.html'" v-model="userInfo"></NavBarAdmin>
    <div class="content-app">
      <Content :style="{padding:'0 50px'}">
        <TitledPanel>
          <template #title>
            题目管理
            <Button icon="md-add" type="primary" @click="newProblem">添加题目</Button>
            <Button icon="md-checkmark" type="primary" @click="switchOn" :disabled="selectionItems.length==0">发布选中</Button>
            <Button icon="md-checkmark-circle-outline" type="primary" @click="switchOnAll">发布全部</Button>
            <Button icon="md-close" type="primary" @click="switchOff" :disabled="selectionItems.length==0">取消选中</Button>
            <Button icon="md-close-circle" type="primary" @click="switchOffAll">取消全部</Button>
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
          <SlimRemotePage style="width: 100%; font-size: 16px;"
                    :columns="problemTableColumns" :get-function="api.adminGetProblemList" v-model="query"
                    @update="(e) =>problemList = e" ref="pageRef"
                    @on-selection-change="onSelectionChange"
                    disabled-hover>
            <template #display="{row}">
              {{ row.displayId }}
            </template>
            <template #title="{row, index}">
              <div @click="showDesc(index)">
                {{ row.title }}
              </div>
            </template>
            <template #level="{row}">
              <Tag :color="DIFFICULTY_COLOR[row.difficulty]" >{{ $i18n.t("m."+row.difficulty) }}</Tag>
            </template>
            <template #templated="{row}">
              <Tag :color="Object.keys(row.template) != 0 ? 'success':'default'">{{ Object.keys(row.template) != 0 ? '模板':'普通' }}</Tag>
            </template>
            <template #enable="{row, index}">
              <Switch v-model="row.visible" @on-change="visibleChanged(index, row.visible)" size="large">
                <template #open>
                  发布
                </template>
                <template #close>
                  隐藏
                </template>
              </Switch>
            </template>
            <template #limitation="{row}">
              <Tag>{{ row.timeLimit }} ms</Tag>
              <Tag>{{ row.memoryLimit }}M</Tag>
            </template>
            <template #tags = "{row}">
              <div style="text-align: left">
                <ProbTag>{{row.majorTag}}</ProbTag>
                <ProbTag type="sub">{{row.subTag}}</ProbTag>
              </div>
            </template>
            <template #ac_rate="{row}">
              {{ row.acceptedNumber }}/{{ row.submissionNumber }}
            </template>
            <template #operation="{row, index}">
              <Tooltip content="修改" placement="top-start">
                <Button icon="ios-create" style="margin-right: 5px" @click="modifyProblem(index)">
                </Button>
              </Tooltip>
              <Tooltip content="删除" placement="top-start">
                <Button icon="ios-trash" @click="deleteProblem(index)">
                </Button>
              </Tooltip>
            </template>
          </SlimRemotePage>
        </TitledPanel>
        <TitledPanel style="padding: 0px 20px 20px 20px">
          <template #title>
            导入题目
          </template>
          <div style="display: flex;">
            <Upload action="" :before-upload="handleUpload" :show-upload-list="false">
              <Button icon="ios-folder-open" type="primary">导入题目</Button>
            </Upload>
            <Button icon="ios-arrow-round-down" type="primary" @click="isShowExport=true" :loading="isExporting">导出题目...</Button>
            <Button icon="md-arrow-round-down" type="primary" @click="exportAll" :loading="isExporting">导出所有题目</Button>
          </div>
          <div style="margin-left:10px;margin-top:10px">
            <Progress  v-if="isUploading" :percent="uploadProgress" :stroke-width="20" text-inside></Progress>
            <Alert type="success" show-icon v-if="isUploadSuccess">上传成功</Alert>
          </div>
        </TitledPanel>
        <template>
          <Modal v-model="isShowDesc" :width="900" footer-hide>
            <template #header>
              <h2>{{ curProblem.title }}</h2>
            </template>
              <div class="markdown-body" id="problem-content">
                  <MdPreview editorId="preview-only" :modelValue="curProblem.description" :codeFoldable="false" codeTheme="github" previewTheme="github"/>
              </div>
          </Modal>
        </template>
        <template>
          <Modal v-model="isShowExport" :width="900" :style="{top:'20px'}" @onOk="doExport">
            <template #header>
              <h2>题目选择 <Button @click="()=>exportList=[]" icon="md-trash" type="primary">清空选择</Button></h2>
            </template>
            <ProblemSelector v-model="exportList"></ProblemSelector>
          </Modal>
        </template>
        <template>
          <ImportResult v-model="showImportResult" :insert="importResult.insert" :failed="importResult.failed" @finished="onFinished"></ImportResult>
        </template>
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
#problem-content {
  background-color: white;
  max-height:500px;
  overflow-y:auto;
  overflow-x:hidden;
  p.content {
    font-size: 12px
  }
}

.operation .ivu-btn{
  margin-right: 1px;
  margin-left: 1px;
}

.modal-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
