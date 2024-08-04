
<script setup>
import NavBarAdmin from '@/components/NavBarAdmin.vue';
import XMUTFooter from '@/components/XMUTFooter.vue';
import ModifyCourse from '../../components/ModifyCourse.vue';
import TitledPanel from '../../components/TitledPanel.vue';
import ImportResult from '../../components/ImportResult.vue';
import ImportUsers from '../../components/ImportUsers.vue';
import SlimPage from '../../components/SlimPage.vue';

import { ref, reactive, onMounted, resolveComponent } from 'vue';
import i18n from '@/i18n';
import api from '@/api';
import utils from '@/utils';
import { isAdmin, pageIndex } from '../../utils/globalInfo';
import { USER_TYPE } from '../../utils/constants';

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
  if(isAdmin(userInfo)){
    formCourse.value.ownerId = userInfo.value.id;
  }
  showDetail.value = true;
}

const doModify = function(){
  api.adminModifyCourse( formCourse.value )
  .then( resp=>{
    getCourse();
  }, err=>{
  })
}

const getCourse = function(){
  api.adminGetCourseList(query)
  .then(resp=>{
    query.page = resp.data.pageNumber;
    query.total = resp.data.totalRow;
    query.limit = resp.data.pageSize;
    courseList.value = resp.data.records;
    //console.log(courseList.value);
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
  courseImportId.value = courseList.value[index].id;
}

const deleteCourse = function(index){
}

const editCourse = function( index ){
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
    key: "grade",
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

const courseImportId = ref(0)

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
  let course = { id: courseImportId.value, students:final }
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

const doImport = function(){
  // studentList.value.forEach( item =>{
  //   item.adminType = USER_TYPE.REGULAR_USER;
  //   item.isDisabled = false;
  // })
  // let course = { id: courseImportId.value, students:studentList.value }
  // api.adminImportCourseStudents( course )
  // .then(resp=>{
  //   importResult.value = resp.data;
  //   showResult.value = true;
  // }, err=>{
  // })
}

const onFinished = function(){
  getCourse();
}

const deleteUser = function( index ){
}

const deleteNewUser = function( index ){
  let curIndex = pageIndex( index, query );
  console.log(query);
  console.log(curIndex);
  studentList.value.splice( curIndex, 1 );
}

const resetPassword = function( index ){
}

onMounted(() => {
  getCourse();
})
</script>

<template>
  <Layout>
    <NavBarAdmin :activeMenu="'/admin/course-list.html'" v-model="userInfo"></NavBarAdmin>
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
            （新用户）
          </template>
          <template v-else>
            （{{formCourse.id}}）
          </template>
        </h2>
      </template>
      <ModifyCourse v-model="formCourse" :exists="isExists" :user-info="userInfo"></ModifyCourse>
    </Modal>
    <Modal v-model="showStudents" :width="1200" :style="{top:'20px'}">
      <template #header>
        <h2>编辑学生</h2>
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
          <template v-if="row.grade != null">
            {{ row.grade }}
          </template>
          <template v-else>
            -
          </template>
        </template>
        <template #email="{ row }">
          {{ row.email }}
        </template>
        <template #nickname="{ row }">
          {{ row.realName }}
        </template>
        <template #operation="{ row, index }">
          <div class="operation" v-if="row.id != null">
            <Tooltip content="移除用户" placement="top-start">
              <Button icon="ios-trash" @click="deleteUser(index)">
              </Button>
            </Tooltip>
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
