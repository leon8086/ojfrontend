
<script setup>
import NavBar from '@/components/NavBar.vue'
import XMUTFooter from '@/components/XMUTFooter.vue'
import TitledPanel from '@/components/TitledPanel.vue';
import Pagination from '@/components/Pagination.vue';
import dayjs from 'dayjs';
import { ref, reactive, onMounted, computed, resolveComponent, watch } from 'vue';
import { isSuperAdmin, isAdmin } from "@/utils/globalInfo.js";
import i18n from '@/i18n';
import api from '@/api';
import utils from '@/utils';
import { id } from 'element-plus/es/locale/index.mjs';
import { Modal } from 'view-ui-plus';

const query = reactive({ courseId:0, keyword:'', page:1, limit:15, total:0 });

const loadings = ref(false);
const examList = ref([])
const examTableColumns = ref([
  {
    title: "#",
    key: "id",
    align: "center",
    width: 80,
  },
  {
    title: "名称",
    slot: "title",
    align: "center",
  },
  {
    title: "所属课程",
    slot: "course",
    align: "center",
  },
  {
    title: "状态",
    slot: "status",
    align: "center",
  },
  {
    title: "时间",
    slot: "time",
    align: "center",
  },
  {
    title:"操作",
    slot:"operation",
    align: "center",
  }
]);

const showRestart = ref(false);

const ownerList = ref({});

const filterByKeyword = function(){
  getExamData();
}

const onReset = function(){
  query.keyword = "";
  getExamData();
}

const userInfo = ref({login:false});

const showAll = ref(true);
const courseList = ref([]);

const getExamData = function(){
  let func = api.getExamList;
  if( isAdmin(userInfo) ){
    func = api.adminGetExamListByOwner; // 只获得自己的考试
  }
  if( isSuperAdmin(userInfo) ){
    func = api.adminGetExamList;
  }
  func( query )
  .then(resp=>{
    query.page = resp.data.pageNumber;
    query.limit = resp.data.pageSize;
    query.total = resp.data.totalRow;
    examList.value = resp.data.records;
  }, err=>{
  })
}

const examToRestart = ref({
  id: null,
  startTime: new Date(),
  endTime: new Date(),
});

const restartExam = function(exam){
  examToRestart.value.startTime = new Date(exam.startTime);
  examToRestart.value.endTime = new Date(exam.endTime);
  examToRestart.value.id = exam.id;
  showRestart.value = true;
}

const doRestartExam = function(){
  api.adminRestartExam(examToRestart.value.id, examToRestart.value.endTime)
  .then(resp=>{
    Modal.info({
      "title":resp.data,
      "content":resp.data,
      onOk(){
        getExamData();
      }
    });
  })
}

const timeLast = computed(()=>{
  if( examToRestart.value.startTime == "" || examToRestart.value.endTime == ""){
    return "";
  }
  let duration = dayjs.duration(dayjs(examToRestart.value.endTime).diff(dayjs(examToRestart.value.startTime), 'seconds'), 'seconds')
  let h = Math.floor(duration.asHours());
  let m = duration.minutes();
  let ret = Math.floor(duration.asHours()).toString() + " 小时 ";
  if( m==0 ){
    return ret;
  }
  ret += m.toString();
  ret += " 分钟 ";
  return ret;
})

const closeExam = function(id){
  api.adminCloseExam( id, true)
  .then(resp=>{
    getExamData();
  }, err=>{
  })
}

const toExamInfo = function( exam ){
  console.log(exam);
  if( isAdmin(userInfo) || exam.isEnded ){
    window.open("./exam-rank.html?id="+exam.id);
  }
  else{
    window.open("./exam.html?id="+exam.id);
  }
}

onMounted(() => {
  watch( ()=>userInfo.value, ()=>{
    if( isSuperAdmin(userInfo) ){
      api.getAdminUserList()
      .then(resp=>{
        resp.data.forEach( item=>{
          ownerList.value[item.id] = item;
        })
      });
    };
    if( isAdmin(userInfo) ){
      api.adminGetAllCourseBrief()
      .then(resp=>{
        for( let key in resp.data ){
          courseList.value.push({name:key, courses:resp.data[key]});
        }
        //console.log(courseList.value);
      }, err=>{
      });
    }
    else{
      api.getAllCourseBrief()
      .then(resp=>{
        for( let key in resp.data ){
          courseList.value = resp.data;
        }
        console.log(courseList.value);
      }, err=>{
      });
    }
    query.courseId = 0;
    getExamData();
  })
})
</script>

<template>
  <Layout>
    <NavBar activeMenu="exam-list.html" v-model="userInfo"></NavBar>
    <div class="content-app">
      <Content :style="{padding:'0 50px'}">
        <TitledPanel>
          <template #title>
            考试列表
          </template>
          <template #extra>
            <ul class="filter">
              <!-- <li>
                显示已关闭：
                <Switch v-model="showAll">
                  <template #open>是</template>
                  <template #close>否</template>
                </Switch>
              </li> -->
              <li v-if="isAdmin(userInfo)">
                <Select v-model="query.courseId" @on-change="getExamData">
                  <Option :value="0">全部课程</Option>
                  <OptionGroup v-for="owner, key in courseList" :label="owner.name">
                    <Option v-for="item,k1 in owner.courses" :value="item.id">{{ item.courseName+" -  "+item.owner }}</Option>
                  </OptionGroup>
                </Select>
              </li>
              <li v-else>
                <Select v-model="query.courseId" @on-change="getExamData">
                  <Option :value="0">全部课程</Option>
                  <Option v-for="item,key in courseList" :value="item.id">{{ item.courseName+" -  "+item.owner }}</Option>
                </Select>
              </li>
              <li>
                <Input v-model="query.keyword"
                  @on-enter="filterByKeyword" @on-click="filterByKeyword"
                  @on-change="filterByKeyword"
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
          <Table style="width: 100%; font-size: 16px;"
                :columns="examTableColumns"
                :data="examList"
                :loading="loadings"
                disabled-hover
          >
            <template #title="{row}">
              {{ row.title }}
            </template>
            <template #course="{row}">
              {{ row.course }}
            </template>
            <template #status="{row}">
              <template v-if="row.isEnded">
                <Tag color="error" > {{ "已结束" }}</Tag>
              </template>
              <template v-else>
                <Tag color='success' > {{ "进行中..." }}</Tag>
              </template>
            </template>
            <template #time="{row}">
              {{dayjs(row.startTime).format("YY-MM-DD HH:mm")}} -
              {{dayjs(row.endTime).format("YY-MM-DD HH:mm")}}
            </template>
            <template #operation="{row, index}">
              <template v-if="isAdmin(userInfo)">
                <template v-if="row.isEnded">
                  <Tooltip content="重启" placement="top-start">
                    <Button type="primary" @click="restartExam(row)" icon="md-sync"></Button>
                  </Tooltip>
                </template>
                <template v-else>
                  <Tooltip content="手动关闭" placement="top-start">
                    <Button type="primary" @click="closeExam(row.id)" icon="md-close"></Button>
                  </Tooltip>
                </template>
              </template>
              <Tooltip content="查看考试状态" placement="top-start">
                <Button icon="md-podium" @click="toExamInfo(row)"></Button>
              </Tooltip>
            </template>
          </Table>
          <Pagination @on-page-size-change="getExamData"
                      v-model:current="query.page"
                      v-model:page-size="query.limit"
                      :total="query.total"
                      :show-sizer="true"
                      @on-change="getExamData"
          >
          </Pagination>
        </TitledPanel>
      </Content>
    </div>
    <Modal v-model="showRestart" :width="650" @onOk="doRestartExam">
      <template #header><h1>选择结束时间</h1></template>
        <DatePicker type="datetime" format="yyyy年MM月dd日 HH:mm"
          placeholder="" v-model="examToRestart.startTime" disabled
          style="width: 200px"
        />
          -
        <DatePicker type="datetime" format="yyyy年MM月dd日 HH:mm"
          placeholder="结束时间" v-model="examToRestart.endTime"
          style="width: 200px"
        />
        <span style="padding-left:20px">考试时长：{{ timeLast }}</span>
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
