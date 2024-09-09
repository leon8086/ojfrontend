
<script setup>
import NavBarAdmin from '@/components/NavBarAdmin.vue'
import XMUTFooter from '@/components/XMUTFooter.vue'
import TitledPanel from '@/components/TitledPanel.vue';
import ProbTag from '@/components/ProbTag.vue';
import { Message, Modal } from "view-ui-plus";
import { ref, reactive, onMounted, resolveComponent } from 'vue';
import i18n from '@/i18n';
import api from '@/api';
import utils from '@/utils';

const query = reactive({keyword:''});

const filterByKeyword = function(){
}

const onReset = function(){
}

const formValidate = ref(null);
const formData = reactive({
    parentTagName:"无",
    parentId:null,
    tagName:"",
});
const formRule = reactive({
    tagName: [
      { required: true, message: '名字不能为空' },
    ]
});

const isShowNewTag = ref(false)

const parentTag = ref(null);
const currentTag = ref(null);

const showEditDialog = function(){
  if( parentTag.value == null){
    formData.parentTagName = "无";
    formData.parentId = null;
  }
  else{
    formData.parentTagName = parentTag.value.name;
    formData.parentId = parentTag.value.id;
  }

  if( currentTag.value == null ){
    formData.tagName = "";
  }
  else{
    formData.tagName = currentTag.value.name;
  }
  isShowNewTag.value = true;
}

const showAddMajor = function(){
  parentTag.value = null;
  currentTag.value = null;
  showEditDialog();
}

const showAddSubTag = function( parent ){
  parentTag.value = parent;
  currentTag.value = null;
  showEditDialog();
}

const showEditSubTag = function( parent, tag ){
  parentTag.value = parent;
  currentTag.value = tag;
  showEditDialog();
}

const showEditMajorTag = function( tag ){
  parentTag.value = null;
  currentTag.value = tag;
  showEditDialog();
}

const newTag = function(){
  formValidate.value.validate( (valid)=>{
    if( valid ) {
      let param = { name: formData.tagName, parentId: formData.parentId };
      api.adminNewTag(param)
        .then(resp => {
          getTags();
          formData.tagName = "";
          formData.parentTag = "";
          formData.parentId = null;
        }, err => {
        })
    }
    else{
      Modal.error({
        title:"错误",
        content:"<div>标签名不能为空</div>",
        onOk: ()=>{ isShowNewTag.value=true}
      });
    }
  });
}

const tagColumn = ref([
  {
    title:"#",
    key: "id",
    width: 80,
    align: "center",
  },
  {
    title:"主标签",
    slot: "name",
    width: 200,
  },
  {
    title:"子标签",
    slot: "subTags",
    align: "center",
  },
  {
    title:"操作",
    slot: "operation",
    width: 200,
    align:"center",
  },
]);

const tagToDelete = ref({name:""});
const isShowDelete = ref(false);

const majorTags = ref([]);

const deleteTag = function(tag){
  tagToDelete.value = tag;
  isShowDelete.value = true;
}

const getTags = function(){
  api.adminGetMajorTagList(query)
  .then( resp =>{
    majorTags.value = resp.data;
  }, err=>{
  })
};

const gradeColumn = ref([
  {
    title: "#",
    key: "id",
    width: 80,
    align: "center",
  },
  {
    title:"年级",
    key: "name",
    align: "center",
  },
  {
    title:"操作",
    slot: "operation",
    width: 200,
    align:"center"
  },
]);

const gradeList = ref([])

const getGradeList = function(){
  api.getGrade()
  .then(resp=>{
    gradeList.value = resp.data;
  })
}

const userInfo = ref({login:false});

const formGrade = ref({
  name:"",
});

const validGrade = ref(null);

const ruleGrade = ref({
  name:[
    { required:true, message:"请输入新年级的名称"}
  ]
});

const isShowNewGrade = ref(false);

const newGrade = function(){
  validGrade.value.validate((valid)=>{
    if( !valid ){
      Message.error("请检查必填项");
      return;
    }
    api.adminNewGrade(formGrade.name)
    .then(resp=>{
    });
  })
}

onMounted( () => {
  getTags();
  getGradeList();
})
</script>

<template>
  <Layout>
    <NavBarAdmin :activeMenu="'./tag-list.html'" v-model="userInfo"></NavBarAdmin>
    <div class="content-app">
      <Content :style="{padding:'0 50px'}">
        <TitledPanel>
          <template #title>
            标签列表
            <Button type="primary" @click="showAddMajor">
              <Icon type="md-add"></Icon>
                新建主标签
            </Button>
          </template>
          <Table :columns = "tagColumn" :data="majorTags">
            <template #name="{row}">
               <ProbTag type="major"> {{ row.name }}</ProbTag>
            </template>
            <template #subTags="{row}">
               <ProbTag v-for="tag in row.subTags" type="sub" closable @click="showEditSubTag(row, tag)" @on-close="deleteTag(tag)"> {{ tag.name }}</ProbTag>
            </template>
            <template #operation="{row, index}">
              <div class="operation">
                <Tooltip content="编辑标签" placement="top-start">
                  <Button icon="ios-create" @click="showEditMajorTag(row)">
                  </Button>
                </Tooltip>
                <Tooltip content="删除主标签" placement="top-start">
                  <Button icon="ios-trash" @click="deleteTag(row)">
                  </Button>
                </Tooltip>
                <Tooltip content="添加子标签" placement="top-start">
                  <Button icon="md-add" @click="showAddSubTag(row)">
                  </Button>
                </Tooltip>
              </div>
            </template>
          </Table>
        </TitledPanel>
        <TitledPanel>
          <template #title>
            年级列表
            <Button type="primary" @click="()=>isShowNewGrade=true">
              <Icon type="md-add"></Icon>
                新建年级
            </Button>
          </template>
          <Table :columns = "gradeColumn" :data="gradeList">
            <template #operation>
                <Tooltip content="编辑年级" placement="top-start">
                  <Button icon="ios-create" @click="showEditGrade(row)">
                  </Button>
                </Tooltip>
                <Tooltip content="删除年级" placement="top-start">
                  <Button icon="ios-trash" @click="deleteGrade(row)">
                  </Button>
                </Tooltip>
            </template>
          </Table>
        </TitledPanel>
      </Content>
    </div>
    <Modal v-model="isShowDelete">
      <template #header>
        <h2>删除标签</h2>
      </template>
      <div>
        确认删除标签 <ProbTag :type="tagToDelete.subTags!=null?'major':'sub'">{{ tagToDelete.name }}</ProbTag> 吗？
        <template v-if="tagToDelete.subTags!=null">
          下列标签会被同步删除：<br>
          <ProbTag type="sub" v-for="item in tagToDelete.subTags"> {{ item.name }}</ProbTag>
        </template>
      </div>
    </Modal>
    <Modal v-model="isShowNewTag" @onOk="newTag" :width="800">
      <template #header>
        <h2>新建主标签</h2>
      </template>
      <Form ref="formValidate" :model="formData" :rules="formRule" label-position="left">
      <Row>
        <Col :span="1"></Col>
        <Col :span="10">
          <FormItem prop="parentTag" label="父母标签">
            <Input type="text" v-model="formData.parentTagName" disabled/>
          </FormItem>
        </Col>
        <Col :span="2"></Col>
        <Col :span="10">
          <FormItem prop="tagName" label="新标签名">
            <Input type="text" v-model="formData.tagName"></Input>
          </FormItem>
        </Col>
        <Col :span="1"></Col>
      </Row>
      </Form>
    </Modal>
    <Modal v-model="isShowNewGrade" @onOk="newGrade">
      <Form ref="validGrade" :model="formGrade" :rules="ruleGrade" label-position="top">
        <FormItem prop="name" label="新年级名">
          <Input type="text" v-model="formGrade.name"></Input>
        </FormItem>
      </Form>
    </Modal>
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
