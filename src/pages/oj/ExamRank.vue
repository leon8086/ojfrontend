
<script setup>
import XMUTFooter from '@/components/XMUTFooter.vue'
import TitledPanel from '@/components/TitledPanel.vue';
import moment from "moment";
import { useCheckLogin  } from '@/utils/globalInfo';

import { ref, reactive, onMounted, resolveComponent } from 'vue';

import i18n from '@/i18n';
import api from '@/api';
import utils from '@/utils';
import { DIFFICULTY_COLOR } from '@/utils/constants';

const userInfo = ref({
  login:false,
})

let queryTimer = 0;

const examInfo = ref({
  id: null,
  name: "测试考试",
  start_time: "2024-05-31T16:00:00Z",
  end_time: "2028-12-31T16:00:00Z",
})

const timeRemains = ref({});

const getExamRank = function(){
  api.getExamRank( examInfo.id )
  .then( resp =>{
    rankList.value = resp.data;
  }, err => {
  })
}

onMounted(()=>{
  useCheckLogin( userInfo );
  let id = utils.getUrlKey("id");
  api.getExamBrief(id)
  .then(resp=>{
    examInfo.value = resp.data;
    let count = 0;
    let config = examInfo.value.problemConfig;
    for( let i=0; i<config.length; ++i ){
      count += config[i].quantity;
    }
    examInfo.value.count = count;
    rankTableColumns.value.push({
     title: '#',
     width: 120,
     align: "center",
     slot: "rank",
    },{
     title: "用户",
     width: 240,
     align: "center",
     slot: "user",
    });
    for( let i=0; i<count; ++i){
      rankTableColumns.value.push({
        title: "第 "+(i+1).toString()+" 题",
        width: 300,
        align: 'center',
        render: (h, params)=>{
          let p = params.row.problemConfig[i];
          let score = params.row.info[p.id];
          let color="error";
          if( score == 100 ){
            color = "success";
          }
          else if( score >= 50){
            color = "warning";
          }
          return h("div", {style:"display:flex; justify-content:space-around; align-items:center"},
                    [
                      h("div", [
                        h(resolveComponent("Tag"),{color:DIFFICULTY_COLOR[p.difficulty]},()=>{return i18n.global.t("m."+p.difficulty);}),
                        h("a",{ href:"/problem?id="+p.id , target:"_blank"},p.title),
                      ]),
                      h(resolveComponent("Tag"),{color:color},()=>{return score.toString();})
                    ]);
        }// render
      });
    }
    rankTableColumns.value.push({
      title: "总分",
      slot: "score",
      align: "center",
    },
      {
        title: "结束时间",
        align: "center",
        slot: 'endTime',
      });
  }, err=>{

  });

  setInterval( ()=>{
    timeRemains.value = utils.duration(moment.now(), examInfo.value.endTime);
    if( realtimeUpdate.value ){
      timeCounter = (timeCounter+1)%timeSpan;
      if( timeCounter == 0)
        getExamRank();
    }
  }, 1000);

  getExamRank();
});

const rankTableColumns = ref([]);

const rankList = ref([]);
const isLoading = ref(false);

const realtimeUpdate = ref(true);
const timeSpan = 5;
let timeCounter = 0;

const backToHome = function(){
  window.location.href="/";
}

</script>

<template>
  <div id="header">
    <Menu theme="light" mode="horizontal" class="oj-menu">
      <div class="logo">
        <Icon type="ios-create-outline" style="padding-right:5px"></Icon>
        <span>{{examInfo.title}}</span>
      </div>
      <div class="time-remain">
        <Icon type="ios-clock-outline"></Icon>
        剩余时间：
        <Tag type="dot" :color="timeRemains.color" large><span class="time-str">{{timeRemains.message}}</span></Tag>
      </div>
      <div class="btn-menu">
        <Button type="primary" @click="backToHome">返回主页
        </Button>
      </div>
    </Menu>
  </div>

  <div class="content-app">
    <Content :style="{padding:'0 50px'}">
      <TitledPanel id="submission">
        <template #title>
          排名
        </template>
        <template #extra>
          实时更新：
          <Switch v-model="realtimeUpdate">
            <template #open>
              <span>开</span>
            </template>
            <template #close>
            <span>关</span>
            </template>
          </Switch>
        </template>
        <Table style="width: 100%; font-size: 16px;" :columns="rankTableColumns" :data="rankList"
          :loading="isLoading" :no-data-text="`<tr>尚无排名</tr>`" :no-filtered-data-text="`<tr>尚无排名</tr>`"
          disabled-hover>
          <template #rank="{row, index}">
            {{ index+1 }}
          </template>
          <template #user="{row, index}">
            {{ row.user.username }}
          </template>
          <template #score="{row, index}">
            {{ row.score }}
          </template>
          <template #endTime="{row, index}">
            {{ row.examId }}
          </template>
        </Table>
      </TitledPanel>
    </Content>
  </div>
  <XMUTFooter></XMUTFooter>
</template>

<style lang="less">

#tabbody .ivu-tabs-bar{
  margin-bottom: 0px;
}

#tabbody .ivu-tabs-tab:not(.ivu-tabs-tab-active) {
  color: #fdfdfd;
}

#tabbody .ivu-tabs-tab {
  font-size: 120%;
}

#header {
  min-width: 300px;
  position: fixed;
  top: 0;
  left: 0;
  height: auto;
  width: 100%;
  z-index: 1000;
  background-color: #fff;
  box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.1);
  .oj-menu {
    background: #fdfdfd;
    display: flex;
    justify-content: space-between;
  }

  .logo {
    margin-left: 2%;
    margin-right: 2%;
    font-size: 20px;
    line-height: 60px;
    color: var(--xmut-cs-color);
    font-weight: bolder;
  }

  .time-remain{
    font-size: 16px;
  }

  .time-str{
    font-size: 16px;
  }

  .btn-menu {
    font-size: 16px;
    float: right;
    margin-right: 10px;
  }
}

#problem-content {
  background-color: white;
  padding: 10px 40px 40px 20px;
  .title-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    th{
      padding-top:5px;
    }
    td{
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
      font-family:"Consolas";
    }
  }
}

#submit-code {
  padding-left: 20px;
  padding-top: 10px;
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

.title{
  color: var(--xmut-cs-color);
  font-weight: bolder;
}

.info{
  table{
    td{
      padding-right:5px;
      padding-left:5px;
    }
  }
}

.fl-right {
  float: right;
  text-align: right;
}

#submission{
  margin-top: 20px;
  margin-bottom: 10px;
  padding: 20px 0px;
}
</style>
