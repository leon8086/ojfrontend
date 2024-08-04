
<script setup>
import NavBarAdmin from '@/components/NavBarAdmin.vue';
import XMUTFooter from '@/components/XMUTFooter.vue';
import TitledPanel from "@/components/TitledPanel.vue";
import Pagination from "@/components/Pagination.vue";
import ModifyUser from '@/components/ModifyUser.vue';
import ImportUsers from '@/components/ImportUsers.vue';
import ImportResult from '@/components/ImportResult.vue';
import SlimRemotePage from '@/components/SlimRemotePage.vue';
import moment from 'moment';
import { USER_TYPE } from '@/utils/constants';

import { ref, onMounted } from 'vue';

import i18n from '@/i18n';
import api from '@/api';
import utils from '@/utils';
import { Cascader } from 'view-ui-plus';
import { USER_TYPE_INFO } from '../../utils/constants';

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
};

const onReset = function(){
}

const deleteUser = function(index){
}

const modifyUser = function(index){
  curUser.value = {};
  curUser.value = {...userList.value[index]};
  exists.value = true;
  showModify.value = true;
}

const modifyFinished = function(){
  if( curUser.value.id == null ){ // add new user
  }
  else{  // update user
    api.adminUpdateUser( curUser.value )
    .then(resp =>{
      console.log(resp.data);
      query.value.total = 0;
      showModify.value = false;
    }, err=>{
    })
  }
}

const resetPassword = function(index){
}

const exists = ref(false);
const showModify = ref(false);

const curUser = ref({
  id: null,
  username:"",
  password:"",
  email:"",
  realName:"",
  grade:"",
  adminType:"Regular User",
  isDisabled: false,
});

const newUser = function(){
  curUser.value = {
    id: null,
    username:"",
    password:"",
    email:"",
    realName:"",
    grade:"",
    adminType:"Regular User",
    isDisabled: false,
  }
  exists.value = false;
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

const onFinished = function(){
  query.value.total = 0;
  //getUserList();
}


//const getUserList = function(){
//  api.getUserList( query.value )
//  .then( resp => {
//    //console.log(resp);
//    query.value.page = resp.data.page;
//    query.value.limit = resp.data.pageSize;
//    query.value.total = resp.data.totalRow;
//    userList.value = resp.data.records;
//  })
//}

onMounted(() => {
  //getUserList();
})
</script>

<template>
  <Layout>
    <NavBarAdmin :activeMenu="'/admin/user-list.html'" v-model="userInfo"></NavBarAdmin>
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
                    placeholder="keyword" icon="ios-search-strong" />
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

          <!-- <Table style="width: 100%; font-size: 16px;" :columns="userTableColumn" :data="userList" :loading="loadings"
            :no-data-text="`<tr>没有用户</tr>`" :no-filtered-data-text="`<tr>没有用户</tr>`" disabled-hover> -->
          <SlimRemotePage style="width: 100%; font-size: 16px;" :columns="userTableColumn" :get-function="api.getUserList" v-model="query" :loading="loadings"
                    @update="(e)=>userList = e"
                    disabled-hover>
            <template #username="{row}">
              <a :href="'/admin/user?id='+row.id.toString()" target="_blank">{{row.username}}</a>
            </template>
            <template #grade="{row}">
              <template v-if="row.grade!=null">
                {{row.grade}}
              </template>
              <template v-else>
                -
              </template>
            </template>
            <template #createTime="{row}">
              {{ moment(row.createTime).format("YYYY-MM-DD HH:mm:ss") }}
            </template>
            <template #lastLogin="{row}">
              {{ moment(row.lastLogin).format("YYYY-MM-DD HH:mm:ss") }}
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
                  <Button icon="ios-refresh" @click="resetPassword(index)">
                  </Button>
                </Tooltip>
              </div>
            </template>
          </SlimRemotePage>
          <!-- </Table> -->
          <!-- <Pagination @on-page-size-change="getUserList" :total="query.total" size="small"
            v-model:page-size="query.limit" @on-change="getUserList" v-model:current="query.page"></Pagination> -->
        </TitledPanel>
        <ImportUsers @upload="doUpload"></ImportUsers>
      </Content>
    </div>
    <Modal v-model="showModify" :width="900" @on-ok="modifyFinished">
      <template #header>
        <h2>用户信息编辑</h2>
      </template>
      <ModifyUser v-model="curUser" :exists="exists"></ModifyUser>
    </Modal>
    <ImportResult v-model="showResult" :insert="uploadResult.insert" :failed="uploadResult.failed" @finished="onFinished"></ImportResult>
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
