
<script setup>
import NavBarAdmin from '@/components/NavBarAdmin.vue';
import XMUTFooter from '@/components/XMUTFooter.vue';
import TitledPanel from "@/components/TitledPanel.vue";
import ImportUsers from '@/components/ImportUsers.vue';
import ImportResult from '@/components/ImportResult.vue';
import SlimRemotePage from '@/components/SlimRemotePage.vue';
import dayjs from 'dayjs';
import { USER_TYPE } from '@/utils/constants';

import { ref, onMounted } from 'vue';

import i18n from '@/i18n';
import api from '@/api';
import utils from '@/utils';
import { Cascader, Message, Modal } from 'view-ui-plus';
import { USER_TYPE_INFO } from '@/utils/constants';

const query = ref({page:1,limit:10,total:0,keyword:""});
const userInfo = ref({login:false});
const loadings = ref(false);
const userTableColumn = ref([
  {
    title: '#',
    width: 100,
    key: "id",
    align: "center",
  },
  {
    title: "用户名",
    slot: "username",
    align: "center",
  },
  {
    title: "年级",
    slot: "grade",
    align: "center",
  },
  {
    title: "创建时间",
    slot: "createTime",
    align: "center",
  },
  {
    title: "最后登录",
    align: "center",
    slot: "lastLogin"
  },
  {
    title: "昵称",
    align: "center",
    slot: 'nickname',
  },
  {
    title: "Email",
    align: "center",
    key: 'email',
  },
  {
    title: "用户类型",
    align: "center",
    slot: 'userType',
  },
  {
    title: "操作",
    align: "center",
    slot: 'operation',
  },
]);
const userList = ref([]);

const filterByKeyword = function(){
  pageRef.value.refresh();
};

const onReset = function(){
}

const deleteUser = function(index){
}

const modifyUser = function(index){
  formUser.value = {};
  formUser.value = {...userList.value[index]};
  showModify.value = true;
}

const modifyFinished = function(){
  formValidator.validate((valid)=>{
    if( !valid ){
      Message.error("请检查必填项");
      return;
    }
    if( formUser.value.id == null ){ // add new user
      console.log(formUser.value)
      api.adminNewUser( formUser.value )
      .then(resp=>{
        console.log(resp);
      })
    }
    else{  // update user
      api.adminUpdateUser( formUser.value )
      .then(resp =>{
        console.log(resp.data);
        query.value.total = 0;
        showModify.value = false;
        pageRef.value.refresh();
      }, err=>{
      })
    }
    })
}

const resetPassword = function(id){
  api.adminResetUserPSW(id)
  .then(resp=>{
    Modal.info({
      title:"操作",
      content:resp.data,
    });
  })
}

const showModify = ref(false);

const formUser = ref({
  id: null,
  username:"",
  password:"",
  email:"",
  realName:"",
  grade:null,
  adminType:"Regular User",
  isDisabled: false,
});

const ruleUser = ref({
      username:[
          { required: true, message:'请填入用户名', trigger:"blur"},
        ],
      grade: [
          { required: true, message:'请选择一个年级', trigger:"blur"},
      ]
    });

const formValidator = ref(null);


const newUser = function(){
  formUser.value = {
    id: null,
    username:"",
    email:"",
    realName:"",
    grade:"",
    adminType:9,
    isDisabled: false,
  }
  showModify.value = true;
}

const uploadResult = ref({insert:0,failed:[]});
const showResult = ref(false);

const doUpload = function( valid ){
  valid.forEach( item=>{
    item.adminType = USER_TYPE.REGULAR_USER; // 默认为普通用户
  })
  api.importUserList( valid )
  .then(resp=>{
    uploadResult.value.insert = resp.data.insert;
    resp.data.failed.forEach( item=>{
      uploadResult.value.failed.push({
        id: item.username,
        title: item.realName,
        content: item.token,
      })
    })
    showResult.value = true;
  })
}

const gradeList = ref([])

const getGradeList = function(){
  api.getGrade()
  .then(resp =>{
    gradeList.value = resp.data;
  })
}

const pageRef = ref(null)

const onFinished = function(){
  query.value.total = 0;
  pageRef.value.refresh();
}

onMounted(() => {
  getGradeList();
})

</script>

<template>
  <Layout>
    <NavBarAdmin :activeMenu="'./user-list.html'" v-model="userInfo"></NavBarAdmin>
    <div class="content-app">
      <Content :style="{padding:'0 50px'}">
        <TitledPanel>
          <template #title>
            用户管理 <Button icon="md-add" type="primary" @click="newUser">添加用户</Button>
          </template>
          <template #extra>
            <div>
              <ul class="filter">
                <li>
                  <Input v-model="query.keyword" @on-enter="filterByKeyword" @on-click="filterByKeyword"
                    @on-change="filterByKeyword" placeholder="keyword" icon="ios-search-strong" />
                </li>
                <li>
                  <Button type="primary" @click="onReset">
                    <Icon type="md-refresh"></Icon>
                    {{$t('m.Reset')}}
                  </Button>
                </li>
              </ul>
            </div>
          </template>

          <SlimRemotePage style="width: 100%; font-size: 16px;" :columns="userTableColumn"
            :get-function="api.getUserList" v-model="query" :loading="loadings" @update="(e)=>userList = e"
            ref="pageRef" disabled-hover>
            <template #username="{row}">
              <a :href="'./user?id='+row.id.toString()" target="_blank">{{row.username}}</a>
            </template>
            <template #grade="{row}">
              {{ row.gradeName }}
            </template>
            <template #createTime="{row}">
              {{ dayjs(row.createTime).format("YYYY-MM-DD HH:mm:ss") }}
            </template>
            <template #lastLogin="{row}">
              {{ dayjs(row.lastLogin).format("YYYY-MM-DD HH:mm:ss") }}
            </template>
            <template #nickname="{row}">
              {{ row.realName }}
            </template>
            <template #userType="{row}">
              <Tag :color="USER_TYPE_INFO[row.adminType].color">{{ USER_TYPE_INFO[row.adminType].name }}</Tag>
            </template>
            <template #operation="{row, index}">
              <div class="operation">
                <Tooltip content="修改用户" placement="top-start">
                  <Button icon="ios-create" style="margin-right: 5px" @click="modifyUser(index)">
                  </Button>
                </Tooltip>
                <Tooltip content="删除用户" placement="top-start">
                  <Button icon="ios-trash" @click="deleteUser(index)">
                  </Button>
                </Tooltip>
                <Tooltip content="重置用户密码" placement="top-start">
                  <Button icon="ios-refresh" @click="resetPassword(row.id)">
                  </Button>
                </Tooltip>
              </div>
            </template>
          </SlimRemotePage>
        </TitledPanel>
        <ImportUsers @upload="doUpload"></ImportUsers>
      </Content>
    </div>
    <Modal v-model="showModify" :width="900" @on-ok="modifyFinished">
      <template #header>
        <h2>用户信息编辑</h2>
      </template>
      <div>
        <Form ref="formValidator" :model="formUser" :rules="ruleUser" label-position="left" :label-width="80">
          <Row>
            <Col :span="11">
            <FormItem prop="id" label="用户id">
              <Input type="text" v-model="formUser.id" placeholder="新用户" disabled></Input>
            </FormItem>
            </Col>
            <Col :span="2">
            </Col>
            <Col :span="11">
            <FormItem prop="username" label="用户名">
              <Input type="text" v-model="formUser.username" placeholder="用户名" :disabled="formUser.id != null"></Input>
            </FormItem>
            </Col>
            <Col :span="11">
            <FormItem prop="email" label="邮箱">
              <Input type="text" v-model="formUser.email" placeholder="邮箱"></Input>
            </FormItem>
            </Col>
            <Col :span="2">
            </Col>
            <Col :span="11">
            <FormItem prop="realName" label="真名">
              <Input type="text" v-model="formUser.realName" placeholder="真名"></Input>
            </FormItem>
            </Col>
            <Col :span="11">
            <FormItem prop="grade" label="年级">
              <Select v-model="formUser.grade">
                <Option v-for="item, key in gradeList" :value="item.id"> {{  item.name }}</Option>
              </Select>
              <!-- <Input type="text" v-model="formUser.grade" placeholder="年级"></Input> -->
            </FormItem>
            </Col>
            <Col :span="2">
            </Col>
            <Col :span="11">
            <FormItem prop="adminType" label="用户类型">
              <Select v-model="formUser.adminType" :disabled="formUser.id == 1">
                <Option v-for="item, key in USER_TYPE_INFO" :value="item.id">
                  <Tag :color="item.color">{{ item.name }}</Tag>
                </Option>
              </Select>
            </FormItem>
            </Col>
            <Col :span="11">
            <FormItem prop="isDisable" label="已禁用">
              <Switch v-model="formUser.isDisabled">
                <template #open>是</template>
                <template #close>否</template>
              </Switch>
            </FormItem>
            </Col>
            <Col :span="2">
            </Col>
            <Col :span="11">
            <div v-if="formUser.id == null">
              新建用户的密码为<span style="color:red"> 123456 </span>
            </div>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
    <ImportResult v-model="showResult" :insert="uploadResult.insert" :failed="uploadResult.failed"
      @finished="onFinished"></ImportResult>
    <XMUTFooter></XMUTFooter>
  </Layout>
</template>

<style>
.failed td.error-msg{
  color: red;
}

.ivu-btn{
  margin-right: 10px;
  margin-left: 10px;
}

.operation .ivu-btn{
  margin-right: 1px;
  margin-left: 1px;
}

.failed th{
  background-color: #888;
}

.failed td{
  color: #aaa;
}
</style>
