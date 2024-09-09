
<script setup>
import NavBarAdmin from '@/components/NavBarAdmin.vue';
import XMUTFooter from '@/components/XMUTFooter.vue';
import ModifyCourse from '@/components/ModifyCourse.vue';
import TitledPanel from '@/components/TitledPanel.vue';
import ImportResult from '@/components/ImportResult.vue';
import ImportUsers from '@/components/ImportUsers.vue';
import Pagination from '@/components/Pagination.vue';
import SlimPage from '@/components/SlimPage.vue';

import { ref, reactive, onMounted, resolveComponent } from 'vue';
import i18n from '@/i18n';
import api from '@/api';
import utils from '@/utils';
import { isAdmin, isSuperAdmin, pageIndex } from '@/utils/globalInfo';
import { USER_TYPE } from '@/utils/constants';
import { af } from 'element-plus/es/locale/index.mjs';
import { Message, Modal } from 'view-ui-plus';

const filterByKeyword = function(){
}

const onReset = function(){
}

const userInfo = ref({login:false});
const query = reactive({keyword:'', page:1, limit:15, total:0 });

const courseColumn = ref([
  {
    title:"#",
    key:"id",
    align:"center",
    width:60,
  },
  {
    title:"班级名称",
    align:"center",
    key:"courseName",
  },
  {
    title:"学生人数",
    align:"center",
    slot:"count",
  },
  {
    title:"管理人",
    align:"center",
    slot:"manager",
  },
  {
    title:"状态",
    align:"center",
    slot:"finished",
  },
  {
    title:"操作",
    align:"center",
    slot:"operation",
  },
]);

const courseList = ref([
])

const showDetail = ref(false);

const formCourse = ref({
  id:null,
  courseName:"",
  ownerId:"",
  isClosed: false,
  studentList:[],
});

const newCourse = function(){
  formCourse.value = {
    id:null,
    courseName:"",
    ownerId:"",
    isClosed: false,
    studentList:[],
  };
  if(!isSuperAdmin(userInfo)){
    formCourse.value.ownerId = userInfo.value.id;
  }
  showDetail.value = true;
}

const doModify = function(){
  modifyCourseRef.value.validate((valid)=>{
    if( !valid ){
      Message.error("请检查必填项");
      return;
    }
    api.adminModifyCourse( formCourse.value )
    .then( resp=>{
      getCourse();
    }, err=>{
    })
  })
}

const getCourse = function(){
  api.adminGetCourseList(query)
  .then(resp=>{
    query.page = resp.data.pageNumber;
    query.total = resp.data.totalRow;
    query.limit = resp.data.pageSize;
    courseList.value = resp.data.records;
  }, err=>{
  })
}

const isExists = ref(false);

const showStudents = ref(false);
const studentList = ref([]);
const usernameExists = ref([])
const studentPage = ref({page:1, limit:10, total:0});

const editStudents = function( index ){
  studentList.value = [];
  usernameExists.value = [];
  courseList.value[index].students.forEach( item =>{
    studentList.value.push(item);
    usernameExists.value.push(item.username);
  })
  showStudents.value = true;
  editCourseId.value = courseList.value[index].id;
}

const deleteCourse = function(index){
}

const editCourse = function( index ){
  formCourse.value = courseList.value[index];
  showDetail.value = true;
}

const switchStatus = function( index ){
}

const studentColumn = ref([
  {
    title: '#',
    width: 100,
    slot: "id",
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
    title: "昵称",
    align: "center",
    slot: 'nickname',
  },
  {
    title: "Email",
    align: "center",
    slot: 'email',
  },
  {
    title: "操作",
    align: "center",
    slot: 'operation',
  },
]);

const editCourseId = ref(0)

const isUserNameExists = function( name, curList ){
  for( let i=0; i<curList.length; ++i ){
    if( name == curList[i].username ){
      return true;
    }
  }
  return false;
}

const importUsers = function( valid ){
  let failed = [];
  let final = [];
  valid.forEach( item =>{
    item.adminType = USER_TYPE.REGULAR_USER;
    item.isDisabled = false;
    final.push(item);
  });
  let course = { id: editCourseId.value, students:final }
  api.adminImportCourseStudents( course )
  .then(resp=>{
    importResult.value.insert = resp.data.insert;
    importResult.value.failed = failed+resp.data.failed;
    showStudents.value = false;
    showResult.value = true;
  }, err=>{
  });
}

const showResult = ref(false);
const importResult = ref({ insert:0, failed:[] });

const onFinished = function(){
  getCourse();
}

const deleteUser = function( index ){
}

const deleteNewUser = function( index ){
  let curIndex = pageIndex( index, query );
  //console.log(query);
  //console.log(curIndex);
  studentList.value.splice( curIndex, 1 );
}

const resetPassword = function( index ){
}

const gradeMap = ref({});

const getGradeMap = function(){
  api.getGrade()
  .then(resp=>{
    resp.data.forEach( item=>{
      gradeMap.value[item.id] = item;
    })
  })
}

onMounted(() => {
  getCourse();
  getGradeMap();
});

const showAddStudent = ref(false);

const addExistStudent = function(){
  userQuery.id = editCourseId.value;
  loadUserSelection();
  showAddStudent.value = true;
}

const userQuery = reactive({keyword:'', id:null });
const totalUsers = ref([]);
let totalUserMap = {};
const targetKeys = ref([]);
let beforeMap = {};
let afterMap = {};

const handleUserChange = function (newKeys, direction, moveKeys){
  targetKeys.value = newKeys;
  if( direction == "right"){ // 添加
    moveKeys.forEach( item=>{
      afterMap[item] = totalUserMap[item];
    });
  }
  if( direction == "left"){ // 删除
    moveKeys.forEach( item=>{
      delete afterMap[item];
    });
  }
};

const loadUserSelection = function(){
  beforeMap = {};
  afterMap = {};
  totalUserMap = {};
  totalUsers.value = [];
  api.getNoAdmin()
  .then(resp=>{
    resp.data.forEach( item=>{
      item.key = item.id.toString();
      totalUserMap[item.key] = item;
    });
    api.adminGetCourseStudents( userQuery.id )
    .then(exists=>{
      targetKeys.value=[];
      exists.data.forEach( item=>{
        targetKeys.value.push( item.id.toString())
        beforeMap[item.id.toString()] = totalUserMap[item.id.toString()];
        afterMap[item.id.toString()] = totalUserMap[item.id.toString()];
      })
      totalUsers.value = resp.data;
    });
  })
};

const renderUser = function(item){
  return (item.gradeName)+" -- "+(item.username);
}

const doModifyStudent = function(){
  let newAdd = [];
  let remove = [];
  for( let key in afterMap ){
    if( key in beforeMap ){
      continue;
    }
    newAdd.push(afterMap[key].id);
  }
  for( let key in beforeMap ){
    if( key in afterMap ){
      continue;
    }
    remove.push(beforeMap[key].id);
  }
  api.adminUpdateCourseStudents( userQuery.id, newAdd, remove )
  .then(resp=>{
    if( resp.data.length==0 ){
      Modal.success({
        title:"调用成功",
        content: "调用成功",
      });
      return;
    }
    else{
      let s = "<h1>处理"+resp.data.length.toString()+"条失败</h1>";
      s += "<ul>";
      for( let i=0; i<resp.data.length; ++i ){
        s += "<li>"+resp.data[i].id+":"+resp.data[i].error+"</li>";
      }
      s += "</ul>"
      Modal.success({
        title:"调用结果",
        content: s,
      });
    }
  })
}

const modifyCourseRef = ref(null);

</script>
<template>
  <Layout>
    <NavBarAdmin :activeMenu="'./course-list.html'" v-model="userInfo"></NavBarAdmin>
    <div class="content-app">
      <Content :style="{padding:'0 50px'}">
        <TitledPanel>
          <template #title>
            <div>
              班级管理 <Button icon="md-add" type="primary" @click="newCourse">添加班级</Button>
            </div>
          </template>
          <template #extra>
            <ul class="filter">
              <li>
                <Input v-model="query.keyword" @on-enter="filterByKeyword" @on-click="filterByKeyword" placeholder="关键字"
                  icon="ios-search-strong" />
              </li>
              <li>
                <Button type="primary" @click="onReset">
                  <Icon type="md-refresh"></Icon>
                  {{$t('m.Reset')}}
                </Button>
              </li>
            </ul>
          </template>
          <Table :columns="courseColumn" :data="courseList">
            <template #id="{row}">
              {{ row.id }}
            </template>
            <template #name="{row}">
              {{ row.courseName }}
            </template>
            <template #count="{row}">
              {{ row.students.length }}
            </template>
            <template #manager="{row}">
              {{ row.owner }}
            </template>
            <template #finished="{row}">
              <template v-if="row.isDisabled">
                <Tag color="default" size="large">已结课</Tag>
              </template>
              <template v-else>
                <Tag color="success" size="large">进行中</Tag>
              </template>
            </template>
            <template #operation="{row, index}">
              <div class="operation">
                <Tooltip content="学生编辑" placement="top-start">
                  <Button icon="ios-contact" @click="editStudents(index)">
                  </Button>
                </Tooltip>
                <Tooltip content="删除课程" placement="top-start">
                  <Button icon="ios-trash" @click="deleteCourse(index)">
                  </Button>
                </Tooltip>
                <Tooltip content="编辑课程" placement="top-start">
                  <Button icon="ios-create" @click="editCourse(index)">
                  </Button>
                </Tooltip>
                <Tooltip content="切换状态" placement="top-start">
                  <Button icon="ios-switch" @click="switchStatus(index)">
                  </Button>
                </Tooltip>
              </div>
            </template>
          </Table>
        </TitledPanel>
      </Content>
    </div>
    <Modal v-model="showDetail" :width="800" @on-ok="doModify">
      <template #header>
        <h2>
          班级编辑
          <template v-if="formCourse.id == null">
            （新班级）
          </template>
          <template v-else>
            （{{formCourse.id}}）
          </template>
        </h2>
      </template>
      <ModifyCourse ref="modifyCourseRef" v-model="formCourse" :exists="isExists" :user-info="userInfo"></ModifyCourse>
    </Modal>
    <Modal v-model="showStudents" :width="1200" :style="{top:'20px'}">
      <template #header>
        <h2>
          编辑学生
          <Button type="primary" icon="md-add" @click="addExistStudent">编辑班级学生</Button>
        </h2>
      </template>
      <SlimPage :columns="studentColumn" :data="studentList" :page-size="10" v-model="studentPage">
        <template #id="{ row }">
          <template v-if="row.id != null">
            {{ row.id }}
          </template>
          <template v-else>
            待生成
          </template>
        </template>
        <template #username="{ row }">
            {{ row.username }}
        </template>
        <template #grade="{ row }">
          {{ row.gradeName }}
        </template>
        <template #email="{ row }">
          {{ row.email }}
        </template>
        <template #nickname="{ row }">
          {{ row.realName }}
        </template>
        <template #operation="{ row, index }">
          <div class="operation" v-if="row.id != null">
            <Tooltip content="重置用户密码" placement="top-start">
              <Button icon="ios-refresh" @click="resetPassword(index)">
              </Button>
            </Tooltip>
          </div>
          <template v-else>
            <Tooltip content="移除用户" placement="top-start">
              <Button icon="ios-trash" @click="deleteNewUser(index)">
              </Button>
            </Tooltip>
          </template>
        </template>
      </SlimPage>
      <ImportUsers @upload="importUsers" :exists="usernameExists"></ImportUsers>
      <ImportResult v-model="showResult" :insert="importResult.insert" :failed="importResult.failed" @finished="onFinished"></ImportResult>
    </Modal>
    <Modal v-model="showAddStudent" :width="1000" :style="{top:'20px'}" @on-ok="doModifyStudent">
      <h2>请选择学生</h2>
       <Transfer
        :data="totalUsers"
        :target-keys="targetKeys"
        :titles="['可添加学生','已有学生']"
        filterable
        :filter-method="(data, query) => data.username.indexOf(query) > -1"
        :render-format="renderUser"
        :list-style="{width:'440px', height:'800px'}"
        @on-change="handleUserChange"/>
    </Modal>
    <XMUTFooter></XMUTFooter>
  </Layout>
</template>

<style>
.ivu-btn{
  margin-left: 10px;
  margin-right: 10px;
}

.operation .ivu-btn{
  margin-right: 1px;
  margin-left: 1px;
}
</style>
