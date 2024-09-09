<script setup>
import NavBarAdmin from '@/components/NavBarAdmin.vue'
import XMUTFooter from '@/components/XMUTFooter.vue'
import TitledPanel from '@/components/TitledPanel.vue';
import {MdEditor} from 'md-editor-v3';
import JSZip from 'jszip';
import {ref, reactive, onMounted, watch } from "vue";
import CodeMirror from '@/components/CodeMirror.vue';
import 'md-editor-v3/lib/style.css';
import i18n from '@/i18n';
import api from '@/api';
import utils from '@/utils';
import { Checkbox, CopyConfig, Message, Modal } from 'view-ui-plus';

const problemId = ref(null);
const userInfo = ref({login:false});
const formValidate = ref(null);

const formData = ref({
  title:"测试题",
  displayId:"C01",
  timeLimit:1000,
  memoryLimit:256,
  difficulty:"Low",
  languages:["C","C++"],
  template:{"C":{code:"", valid:false}, 'C++':{ code:"", valid:false}},
  description:"这是一道测试题",
  inputDescription:"无",
  outputDescription:"无",
  visible:true,
  majorTagId:1,
  subTagId:2,
  hint:"",
  samples:[],
  testCaseScore:[],
  totalScore:0,
});

const ruleData = ref({
  title:[
    { required: true, message: '题目名称不能为空', trigger: 'blur' }
  ],
  displayId:[
    { required: true, message: '题号不能为空', trigger: 'blur' }
  ],
  timeLimit:[
    { required: true, message: '必须给出时间限制', trigger: 'blur' }
  ],
  memoryLimit:[
    { required: true, message: '必须给出内存限制', trigger: 'blur' }
  ],
  languages:[
    { required: true, message: '至少选择一项语言', trigger: 'blur' },
    { type: 'array', min: 1, message: '至少选择一项语言', trigger: 'change' }
  ],
  description:[
    { required: true, message: '题目描述不能为空', trigger: 'blur' }
  ],
  inputDescription:[
    { required: true, message: '输入描述不能为空', trigger: 'blur' }
  ],
  outputDescription:[
    { required: true, message: '输出描述不能为空', trigger: 'blur' }
  ],
  majorTagId:[
    { required: true, message: '请选择一个主类别', trigger: 'blur' },
  ],
  subTagId:[
    { required: true, message: '请选择一个子类别', trigger: 'blur' },
  ],
  samples:[
  { type:'array', required:true, defaultField:{ type:'object', required:true, fields:{
    input:[
      { required: true, message:'需要样例输入', type:'string' },
    ],
    output:[
      { required: true, message:'需要样例输出', type:'string' },
    ]
  }}
  }],
  totalScore:[
    { type:"number", min:100, max:100 ,message: '总分必须为100', trigger: 'change' }
  ]
});

const delSample = function(index){
  Modal.confirm({
    title: "删除样例",
    content: "确认要删除样例"+(index+1)+"吗？",
    onOk:()=>{ formData.value.samples.splice(index,1);},
  });
}

const newSample = function(){
  formData.value.samples.push({input:'',output:''});
}

const transforTagLists = function( data ){
  let ret = {};
  data.forEach( item =>{
    let sub = {};
    item.subTags.forEach( subItem =>{
      sub[subItem.id] = subItem;
    });
    item.subTags = sub;
    ret[item.id] = item;
  })
  return ret;
}

const readingProblem = function(data){
  let ret = data;
  ret.languages.forEach( item =>{
    if( !(item in ret.template) ){
      ret.template[item] = {code:"",valid:false};
    }
    else{
      ret.template[item] = {code:ret.template[item],valid:true};
    }
  })
  return ret;
}

const tagLists = ref({
  "1":{name:"C语言", id:1, subTags:{"2":{ name:"入门", id:2 }}}
});

const languageChanged = function(lang){
  // not in
  formData.value.languages.forEach( item=>{
    if( item in formData.value.template ){
      formData.value.template[item].value = true;
    }
    else{
      formData.value.template[item] = { code:"", valid:false};
    }
  })
}

watch(()=>formData.value.testCaseScore, ()=>{
  formData.value.totalScore = 0;
  formData.value.testCaseScore.forEach( item =>{
    formData.value.totalScore += item.score;
  })
},{deep:true});

const testCaseFile = ref(null);

const checkCaseZip = function( files ){
  let input = {};
  let output = {};
  for( let key in files ){
    let f = files[key]
    if( f.name == 'info' ){
      continue;
    }
    if( f.dir != false ){
      return { valid:false, message:"格式不正确，zip里不应当包含文件夹"};
    }
    let fn = key.split(".");
    let name = fn[0];
    let ext = fn[1];
    if( ext == "out" &&!( (name + ".in") in files) ){
      return { valid:false, message:"输入输出不匹配，只有输出"+key+"，但缺少输入"+name+".in" };
    }
    if( ext == "in" &&!( (name + ".out") in files) ){
      return { valid:false, message:"输入输出不匹配，只有输入"+key+"，但缺少输出"+name+".out"};
    }
    if( ext!="in" && ext!="out"){
      return { valid:false, message:"格式错误，不能包含info，[1-n].in和[1-n].out之外的文件" };
    }
  }
  return {valid:true};
}

let backupTestCase = [];

const recaculateTestScore = function(files){
  backupTestCase = formData.value.testCaseScore;
  formData.value.testCaseScore=[];
  let newScore = formData.value.testCaseScore;
  for( let i=1; ;++i ){
    if( (i.toString() + ".in") in files && (i.toString() + ".out") in files){
      newScore.push({
        score:0,
        input_name: i.toString() + ".in",
        output_name: i.toString() + ".out",
      })
    }
    else{
      break;
    }
  }
  let score = Math.ceil(100/newScore.length);  // 总分总是100
  let last = 100-score*(newScore.length-1);
  for( let i=0; i<newScore.length-1; ++i){
    newScore[i].score = score;
  }
  newScore[newScore.length-1].score = last;
}

const uploadCase = function(file){
  testCaseFile.value = null;
  let zip = new JSZip();
  zip.loadAsync(file)
  .then( zipData => {
    let passed = checkCaseZip( zipData.files );
    if( passed.valid ){
      testCaseFile.value = file;
      recaculateTestScore(zipData.files);
      return;
    }
    Modal.error({
      title: "文件导入错误！",
      content: passed.message,
    });
  }, err=>{
    Modal.error({
      width: 800,
      title: "zip处理失败！",
      content: "错误原因"+err,
    });
  });
  return false;
}

const removeTestcaseFile = function(){
  testCaseFile.value = null;
  formData.value.testCaseScore = backupTestCase;
}

const uploadProgress = ref(0);
const isUploading = ref(false);

const updateProblem = function(){
  isUploading.value=true;
  let tmp = JSON.parse(JSON.stringify(formData.value));
  let keys = Object.keys(tmp.template);

  for( let i=0;i<keys.length; ++i ) {
    let key = keys[i];
    if(!tmp.template[key].valid){
      delete tmp.template[key];
    }
    else{
      tmp.template[key] = tmp.template[key].code;
    }
  }
  api.adminUpdateProblem(tmp, testCaseFile.value, (pe)=>{
    uploadProgress.value = parseInt((pe.loaded/pe.total * 100).toFixed(2));
   })
  .then( resp=>{
    isUploading.value=false;
    getProblem(problemId.value);
  }, err=>{
  })
}

const newProblem = function(){
  if(testCaseFile.value == null){
    Modal.error({
      title:"错误",
      content:"题目没有测试用例",
    })
    return;
  }
  isUploading.value=true;

  let tmp = JSON.parse(JSON.stringify(formData.value));
  let keys = Object.keys(tmp.template);

  for( let i=0;i<keys.length; ++i ) {
    let key = keys[i];
    if(!tmp.template[key].valid){
      delete tmp.template[key];
    }
    else{
      tmp.template[key] = tmp.template[key].code;
    }
  }
  api.adminNewProblem(tmp, testCaseFile.value, (pe)=>{
   uploadProgress.value = parseInt((pe.loaded/pe.total * 100).toFixed(2));
   })
  .then( resp=>{
    problemId.value = resp.data.id;
    isUploading.value=false;
    getProblem(problemId.value);
  }, err=>{
  })
}

const submit = function(){
  formValidate.value.validate((valid)=>{
    if( !valid ){
      Message.error("请检查填写是否正确");
      return;
    }
    if( problemId.value == null ){
      newProblem();
    }
    else{
      updateProblem();
    }
    });
}

const getProblem = function( id ){
  api.adminGetProblemDetail(problemId.value)
  .then(resp=>{
    formData.value = readingProblem(resp.data);
  }, err=>{
  });
}

onMounted(()=>{
  problemId.value = utils.getUrlKey("id");
  api.adminGetMajorTagList()
  .then( resp => {
    tagLists.value = transforTagLists(resp.data);
    if( problemId.value != null ){
      getProblem(problemId);
    }
  }, err=>{
  })
});

</script>

<template>
<Layout>
  <NavBarAdmin :activeMenu="'./problem-list.html'" v-model="userInfo"></NavBarAdmin>
  <div class="content-app">
  <Content :style="{padding:'0 50px'}">
    <TitledPanel>
      <template #title>
        <template v-if="problemId==null">新建题目</template>
        <template v-else>编辑题目({{ problemId }})</template>
        <!-- <Button @click="console.log(formData,tagLists)">看</Button> -->
      </template>
      <template #extra>
        <Form ref="formValidate" :model="formData" :rules="ruleData" label-position="left" :label-width="80">
          <Row>
            <FormItem label="难度" prop="difficulty">
              <RadioGroup v-model="formData.difficulty" type="button" button-style="solid" size="small">
                <Radio label="Low" class="low-level">入门</Radio>
                <Radio label="Mid" class="mid-level">普通</Radio>
                <Radio label="High" class="high-level">进阶</Radio>
              </RadioGroup>
            </FormItem>
            <FormItem label="时间限制" prop="timeLimit">
              <Input v-model="formData.timeLimit" placeholder="时间限制" number>
                <template #append>ms</template>
              </Input>
            </FormItem>
            <FormItem label="内存限制" prop="memoryLimit">
              <Input v-model="formData.memoryLimit" placeholder="内存限制" number>
                <template #append>MB</template>
              </Input>
            </FormItem>
          </Row>
        </Form>
      </template>
      <div style="padding:10px 20px">
        <Form ref="formValidate" :model="formData" :rules="ruleData" label-position="top">
          <Row>
            <Col :span="8">
              <FormItem label="题号（唯一）" prop="displayId">
                <Input v-model="formData.displayId" placeholder="显示ID"></Input>
              </FormItem>
            </Col>
            <Col :span="16">
              <FormItem label="题目名称" prop="title">
                <Input v-model="formData.title" placeholder="题目名"></Input>
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="可见" prop="visible">
                <Switch v-model="formData.visible"></Switch>
              </FormItem>
            </Col>
            <Col :span="4">
              <FormItem label="主标签" prop="majorTagId">
                <Select v-model="formData.majorTagId">
                  <Option v-for="item in tagLists" :value="item.id">{{ item.name }}</Option>
                </Select>
              </FormItem>
            </Col>
            <Col :span="4">
              <FormItem label="副标签" prop="subTagId">
                <Select v-model="formData.subTagId" :disabled="formData.majorTagId == null">
                  <template v-if="formData.majorTagId != null">
                    <Option v-for="item in tagLists[formData.majorTagId].subTags" :value="item.id">{{ item.name }}</Option>
                  </template>
                </Select>
              </FormItem>
            </Col>
            <Col :span="10">
              <FormItem label="支持语言" prop="languages">
                <CheckboxGroup v-model="formData.languages" size="small" @on-change="languageChanged" >
                  <Checkbox label="C"></Checkbox>
                  <Checkbox label="C++"></Checkbox>
                  <Checkbox label="Java"></Checkbox>
                  <Checkbox label="JavaScript"></Checkbox>
                  <Checkbox label="Python3">Python(3)</Checkbox>
                  <Checkbox label="Golang"></Checkbox>
                </CheckboxGroup>
              </FormItem>
            </Col>
          </Row>
          <Divider></Divider>
          <FormItem label="题目描述" prop="description">
            <MdEditor v-model="formData.description" :codeFoldable="false" codeTheme="github"
              previewTheme="github" />
          </FormItem>
          <FormItem label="输入描述" prop="inputDescription">
            <MdEditor v-model="formData.inputDescription" :codeFoldable="false" codeTheme="github"
              previewTheme="github" />
          </FormItem>
          <FormItem label="输出描述" prop="outputDescription">
            <MdEditor v-model="formData.outputDescription" :codeFoldable="false" codeTheme="github"
              previewTheme="github" />
          </FormItem>
          <FormItem label="提示" prop="hint">
            <MdEditor v-model="formData.hint" :codeFoldable="false" codeTheme="github"
              previewTheme="github" />
          </FormItem>
          <Divider></Divider>
          <h2>输入输出样例 <Button @click="newSample" size="large" type="primary" icon="md-add">添加新样例</Button></h2>
          <Row :gutter="10">
            <template v-if="formData.samples!=0">
              <Col :span="8" v-for="sample, index in formData.samples">
              <div style="display:flex; justify-content: space-between; margin: 0 5px;">
                <h2 class="sample-title">{{'样例'+(index+1)}}</h2>
                <Button type="primary" size="default" @click="delSample(index)">删除</Button>
              </div>
              <Row>
                <Col :span="12">
                <FormItem label="输入" :prop="'samples.'+index+'.input'" :rules="[{ required:true, message:'需要样例输入', trigger:'blur'}]" class="sample-label">
                  <Input  :rows="8"
                          type="textarea"
                          v-model="sample.input" placeholder="输入" class="sample-text"></Input>
                </FormItem>
                </Col>
                <Col :span="12">
                <FormItem label="输出" :prop="'samples.'+index+'.output'"  :rules="[{ required:true, message:'需要样例输出', trigger:'blur' }]" class="sample-label">
                  <Input  :rows="8"
                          type="textarea"
                          v-model="sample.output" placeholder="输出" class="sample-text"></Input>
                </FormItem>
                </Col>
              </Row>
              </Col>
            </template>
            <template v-else>
            <Col :span="24">
              <div style="text-align: center; height:50px">
                <h1>没有样例</h1>
              </div>
            </Col>
            </template>
          </Row>
          <Divider></Divider>
          <h2>代码模板</h2>
          <div v-for="lang in formData.languages" class="code-template">
            <Checkbox v-model="formData.template[lang].valid" style="margin-bottom:5px">{{ lang }}</Checkbox>
            <CodeMirror :defaultLanguage="lang"
                        v-model="formData.template[lang].code"
                        v-if="formData.template[lang].valid"
                        :noHeader="true"
                        :style="{minHeight:'400px'}"
            ></CodeMirror>
          </div>
          <Divider></Divider>
          <div style="display:flex; align-items: center">
            <h2>
              用例&分数分布
            </h2>
            <div style="display:flex; align-items: center;">
              <Upload action="" :before-upload="uploadCase" :show-upload-list="false">
                <Button icon="ios-folder-open" type="primary">上传用例</Button>
              </Upload>
              <Tag v-if="testCaseFile != null" closable size="large" @on-close="removeTestcaseFile">
                <Icon type="ios-document-outline" />
                {{ testCaseFile.name }}
              </Tag>
            </div>
          </div>
          <div  v-if="formData.testCaseScore!=null && formData.testCaseScore.length!=0" 
                class="result-detail"
                style="margin-top:10px;
                margin-bottom:20px;
                display:flex; flex-flow: row wrap"
          >
            <div v-for="item, index in formData.testCaseScore" style="flex: 0 0 10%" class="test-score">
                <h3>{{ '用例'+(index+1) }}</h3>
                <FormItem class="sample-label">
                  <InputNumber v-model="item.score" number :min="1" :max="99" :controls-outside="true" size="small" class="score-input">
                  </InputNumber>
                </FormItem>
            </div>
          </div>
          <div v-else>
            <div style="text-align: center;"> <h1>没有用例</h1></div>
          </div>
          <div class="test-score" style="flex: 0 0 20%">
            <h3>总分</h3>
            <FormItem prop="totalScore" class="sample-label">
              <Input v-model="formData.totalScore" disabled class="score-input">
              </Input>
            </FormItem>
          </div>
        </Form>
      </div>
    </TitledPanel>
    <Progress  v-if="isUploading" :percent="uploadProgress" :stroke-width="20" text-inside></Progress>
    <Button class="submit-btn" long type="primary" @click="submit">{{ (problemId==null)?"创建问题":"更新问题" }}</Button>
  </Content>
  </div>
  <XMUTFooter></XMUTFooter>
</Layout>
</template>

<style lang="less">
.result-detail{
  th, td{
    height: auto;
    padding: 5px 5px;
  }
  th{
    text-align: center;
  }
  td{
    text-align: center;
    border: thin solid #dddddd;
  }
}

.ivu-btn{
  margin-right: 10px;
  margin-left: 10px;
}

.ivu-btn.submit-btn{
  margin-left: 0px;
  margin-right: 0px;
}

.operation .ivu-btn{
  margin-right: 1px;
  margin-left: 1px;
}

.ivu-form-item {
  margin-left: 10px;
  margin-right: 10px;
}

.ivu-form-label-top .ivu-form-item .ivu-form-item-label{
  font-size: 18px;
  font-weight: bold;
  padding-left: 5px;
  color: var(--xmut-cs-color);
}

.test-score{
  border-radius: 4px;
  box-sizing: border-box;
  border: 1px solid #dcdee2;
  border-color: #e8eaec;
  padding: 15px;
  margin-top: 10px;
}

h2{
  padding-left: 10px;
  font-size: 18px;
  color: var(--xmut-cs-color);
}

h3{
  padding-left: 10px;
  font-weight: normal;
  color: var(--xmut-cs-color);
}

.code-template{
  margin: 40px 10px;
}

.score-input .ivu-input-number-input-wrap input.ivu-input-number-input{
  text-align: center;
}

.ivu-input-number-small.ivu-input-number-controls-outside.score-input{
  width: 100px;
}

.sample-text textarea{
  font-family : 'Courier New', Courier, monospace;
}

.ivu-radio-wrapper-checked.low-level{
  background-color : rgb(240, 245, 255) !important;
  color: rgb(47, 84, 235) !important;
}

.ivu-radio-wrapper-checked.mid-level{
  background-color : rgb(246, 255, 237) !important;
  color: rgb(82, 196, 26) !important;
}
.ivu-radio-wrapper-checked.high-level{
  background-color : rgb(255, 241, 240) !important;
  color: rgb(245, 34, 45) !important;
}
</style>
