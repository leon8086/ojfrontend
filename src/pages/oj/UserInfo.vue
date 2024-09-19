
<script setup>
import NavBar from '@/components/NavBar.vue'
import XMUTFooter from '@/components/XMUTFooter.vue'
import TitledPanel from '../../components/TitledPanel.vue';
import UserStatistic from '@/components/UserStatistic.vue';
import UserProblemStatus from '@/components/UserProblemStatus.vue';
import { ref, reactive, onMounted, resolveComponent } from 'vue';
import i18n from '@/i18n';
import api from '@/api';
import dayjs from "dayjs";
import utils from '@/utils';
import { use } from 'echarts/core'
import { BarChart, HeatmapChart } from 'echarts/charts'
import {
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  DatasetComponent,
  GridComponent,
  VisualMapComponent,
  CalendarComponent,
} from 'echarts/components'

import { CanvasRenderer } from 'echarts/renderers'

use([
  LegendComponent,
  TooltipComponent,
  TitleComponent,
  DatasetComponent,
  GridComponent,
  BarChart,
  VisualMapComponent,
  CalendarComponent,
  HeatmapChart,
  CanvasRenderer,
]);

import VChart, { THEME_KEY } from 'vue-echarts';



const userInfo = ref({login:false});

const showUserInfo = ref({username:"",acceptedNumber:0, submissionNumber:0});

const statisticComp = ref(null);
const problemStatusComp = ref(null);
const submissionData = ref(null);

const optionDate = ref({
  title:{text:"提交次数"},
  tooltip: {
    formatter: function (params) {
      return 'all:' + params.value[4] + ' ac:'+ params.value[1]+' pa:'+params.value[2]+' wa:'+params.value[3];
    }
  },
  visualMap: {
    show: false,
    min: 0,
    max: 100,
    inRange: {
      color: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127', '#196127']
    }
  },
  calendar: {
    itemStyle: {
      color: '#ccc',
      borderWidth: 3,
      borderColor: '#fff'
    },
    range: ['2022-5-17', '2023-2-17'],
    splitLine: true,
  },
  series: {
    type: 'heatmap',
    coordinateSystem: 'calendar',
    data: []
  }
});

const dateToString = function( date ){
  return dayjs(date).format("YYYY-MM-DD");
}

const genDateOption = function(){
  let begin = submissionData.value[0].createTime;
  let end = submissionData.value[submissionData.value.length-1].createTime;
  optionDate.value.calendar.range = [dateToString(begin), dateToString(end)];

  let date = begin
  let axis = [];
  let mapAll = {};
  let mapAC = {};
  let mapPA = {};
  let mapWA = {};
  for( ; date<end; date.setDate(date.getDate()+1)){
    axis.push(dateToString(date));
    mapAll[dateToString(date)] = 0;
    mapAC[dateToString(date)] = 0;
    mapPA[dateToString(date)] = 0;
    mapWA[dateToString(date)] = 0;
  }
  axis.push(dateToString(date));
  mapAll[dateToString(date)] = 0;
  mapAC[dateToString(date)] = 0;
  mapPA[dateToString(date)] = 0;
  mapWA[dateToString(date)] = 0;

  submissionData.value.forEach( item=>{
    const day = dateToString(item.createTime);
    mapAll[day] ++;
    switch(item.result){
      case 0:
        mapAC[day] ++;
        break;
      case 8:
        mapPA[day] ++;
        break;
      default:
        mapWA[day] ++;
        break;
    }
  });
  let total = 0;
  let ac = 0;
  let pa = 0;
  let wa = 0;
  let maxnum = 0;
  for( let i=0; i<axis.length; ++i ){
    maxnum = Math.max(mapAll[axis[i]],maxnum);
    total += mapAll[axis[i]];
    ac += mapAC[axis[i]];
    pa += mapPA[axis[i]];
    wa += mapWA[axis[i]];
    optionDate.value.series.data.push([axis[i], mapAC[axis[i]], mapPA[axis[i]], mapWA[axis[i]], mapAll[axis[i]]]);
  }
  optionDate.value.title.text = "共"+total.toString()+"次提交 AC:"+ac.toString()+" PA:"+pa.toString()+" WA:"+wa.toString();
  optionDate.value.visualMap.max = maxnum;
};

const optionHours = ref({
  title:{ text:"时间段分布" },
  legend: { padding:[40,0,0,0] },
  tooltip: {},
  dataset: {
    source: [
    ]
  },
  grid: {
    left: 40,
    bottom:40,
    right: 40,
  },
  xAxis: { type: 'category' },
  yAxis: {},
  series: [
    { type: 'bar', label:{show:true,position:"top"}, itemStyle:{ color: "#52C41A"}},
    { type: 'bar', label:{show:true,position:"top"}, itemStyle:{ color: "#FA8C16"}},
    { type: 'bar', label:{show:true,position:"top"}, itemStyle:{ color: "#F5222D"}},
  ]
});

const getDateHours = function( date ){
  return date.getHours();
}
const genTimeOption = function(){
  let axis = [];
  let mapAC = {};
  let mapPA = {};
  let mapWA = {};
  for( let i=0; i<24; ++i){
    let key = i.toString()+":00";
    axis.push(key);
    mapAC[i.toString()] = 0;
    mapPA[i.toString()] = 0;
    mapWA[i.toString()] = 0;
  }

  submissionData.value.forEach( item=>{
    const hours = getDateHours(item.createTime);
    switch(item.result){
      case 0:
        mapAC[hours] ++;
      case 8:
        mapPA[hours] ++;
      default:
        mapWA[hours] ++;
    }
  });
  optionHours.value.dataset = { source:[] }
  optionHours.value.dataset.source.push(["提交","正确","部分","错误"]);
  for( let i=0; i<axis.length; ++i ){
    optionHours.value.dataset.source.push([axis[i],mapAC[i.toString()],mapPA[i.toString()],mapWA[i.toString()]]);
  }
};

const dispatchFunc = function(id){
  if( id == null ){
    return {
      userStatus: api.getUserStatus,
      submission: api.getMySubmissionAll,
      getUser: () => {showUserInfo.value = userInfo.value},
    }
  }
  else{
    return {
      userStatus: ()=> api.adminGetUserStatus(id),
      submission: ()=> api.adminGetUserAllSubmissions(id),
      getUser: () => api.adminGetUser(id).then(resp=>{showUserInfo.value=resp.data;}),
    }
  }
}

onMounted(() => {
  let id = utils.getUrlKey("id");
  let ret = dispatchFunc(id);
  ret.getUser();
  api.getProblemAllBrief()
  .then( resp =>{
    ret.userStatus()
    .then(status=>{
      statisticComp.value.loadData( resp.data, status.data );
      problemStatusComp.value.loadData( resp.data, status.data );
      ret.submission()
      .then( submission =>{
        submissionData.value = submission.data;
        submissionData.value.forEach( item=>{
          item.createTime = new Date(item.createTime);
        });
        submissionData.value.sort((v1,v2)=>{return v1.createTime-v2.createTime});
        genDateOption();
        genTimeOption();
      });
    });
  });
});

const showDetail = ref(false);
</script>

<template>
  <Layout>
    <NavBar :activeMenu="'user-info.html'" v-model="userInfo"></NavBar>
    <div class="content-app">
      <Content :style="{padding:'0 50px'}">
        <TitledPanel>
          <template #title>
            <h2>
              {{ showUserInfo.username }} 的提交信息
            </h2>
          </template>
          <h2>进度</h2>
          <UserStatistic ref="statisticComp"></UserStatistic>
          <Divider></Divider>
          <h2>
            完成情况
            <Switch size="large" style="margin-left: 10px" v-model="showDetail">
              <template #open>显示</template>
              <template #close>关闭</template>
            </Switch>
          </h2>
          <div style="margin: 0px 20px">
            <UserProblemStatus ref="problemStatusComp" :span="2" :visible="showDetail" />
          </div>
          <Divider></Divider>
          <h2 style="margin-bottom:20px"> 提交统计 </h2>
          <div class="charts" style="height: 280px">
            <v-chart :autoresize="true" :option="optionDate" />
          </div>
          <div class="charts">
            <v-chart :autoresize="true" :option="optionHours" />
          </div>
        </TitledPanel>
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

.panel-title h2{
  color: var(--xmut-cs-color);
}

.panel-default h2{
  color: var(--xmut-cs-color);
  margin-left: 20px;
}

.charts{
  height: 400px;
  margin-left: 40px;
  margin-right: 20px;
}
</style>
