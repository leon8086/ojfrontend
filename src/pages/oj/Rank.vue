
<script setup>
import NavBar from '@/components/NavBar.vue'
import XMUTFooter from '@/components/XMUTFooter.vue'
import TitledPanel from '@/components/TitledPanel.vue';
import Pagination from '@/components/Pagination.vue';
import { ref, reactive, onMounted, resolveComponent, watch } from 'vue';
import util from "@/utils"
import dayjs from 'dayjs';
import i18n from '@/i18n';
import api from '@/api';
import utils from '@/utils';
import { isAdmin } from '@/utils/globalInfo';

const query = reactive({keyword:'', page:1, limit:15, total:0, grade:1, tag:0 });

const onReset = function(){
}

const userInfo = ref({login:false});

const columnBefore = [
  {
    title:"名次",
    slot:"rank",
    width:80,
    align:"center",
  },
  {
    title:"用户",
    slot:"username",
    align:"center",
  },
  {
    title:"年级",
    key:"gradeName",
    align:"center",
  }
];

const columnAfter = [
  {
    title:"总 AC",
    slot:"ac",
    align:"center",
  },
  {
    title:"达成时间",
    slot:"time",
    align:"center",
  },
];

const rankTableColumnsFull = ref([]);
const rankTableColumnsTag = ref([
  {
    title:"名次",
    slot:"rank",
    width:80,
    align:"center",
  },
  {
    title:"用户",
    slot:"username",
    align:"center",
  },
  {
    title:"年级",
    key:"gradeName",
    align:"center",
  },
  {
    title:"AC",
    slot:"ac",
    align:"center",
  },
  {
    title:"达成时间",
    slot:"time",
    align:"center",
  },
]);

const rankData = ref([]);
const gradeData = ref([]);
const majorTag = ref([]);

const loadings = ref(false);

const getData = function(){
  loadings.value = true;
  rankData.value = [];
  if( query.tag == 0 ){
    api.getUserRank( query )
    .then(resp=>{
      rankData.value = resp.data.records;
      rankData.value.forEach( item =>{
        utils.usePageSet(query, resp.data);
        let tmp = [];
        majorTag.value.forEach( tag =>{
          tmp.push("-");
        })
        for( let i=0; i<item.scoreList.length; ++i ){
          let t = tagMap[item.scoreList[i].majorTag];
          tmp[t.index] = item.scoreList[i].score;
        }
        item.scoreList = tmp;
      })
      loadings.value = false;
    });
  }
  else{
    api.getUserRankTag( query )
    .then(resp=>{
      rankData.value = resp.data.records;
      loadings.value = false;
    });
  }
}

const getGrade = function(){
  api.getGrade()
  .then( resp => {
    gradeData.value = [{id:1, name:"全部"}];
    gradeData.value.push(...resp.data);
  })
}

let tagMap = {};

const getTag = function(){
  api.getTags()
  .then( resp =>{
    majorTag.value = [{id:0, name:"全部"}]
    majorTag.value.push(...resp.data );
    for( let i=0; i<majorTag.value.length; ++i ){
      let tag = majorTag.value[i];
      tag.index = i;
      tagMap[tag.id] = tag;
    }
    rankTableColumnsFull.value = [];
    rankTableColumnsFull.value.push(...columnBefore);
    for( let i=0; i<resp.data.length; ++ i){
      rankTableColumnsFull.value.push(
        {
          title:resp.data[i].name,
          align: "center",
          render(h, params){
            // 这里必须跳过第一个“全部”的标记
            return h("span", params.row.scoreList[i+1]);
          },
        }
      )
    }
    rankTableColumnsFull.value.push(...columnAfter);
    // 数据依赖于标签的读取
    getData();
  })
}

watch( ()=>userInfo.value, ()=>{
  query.grade = userInfo.value.grade;
}, {deep:true} )

watch( ()=>query, ()=>{
  getData();
}, {deep: true})

onMounted(() => {
  getTag();
  getGrade();
})
</script>

<template>
  <Layout>
    <NavBar activeMenu="rank.html" v-model="userInfo"></NavBar>
    <div class="content-app">
      <Content :style="{padding:'0 50px'}">
        <TitledPanel>
          <template #title>
            排名
          </template>
          <template #extra>
            <table>
            <tr>
              <td class="td-title">年级：</td>
              <td>
                <Select v-model="query.grade">
                  <Option v-for="item, key in gradeData" :value="item.id"> {{ item.name }}</Option>
                </Select>
              </td>
              <td class="td-title">类别：</td>
              <td>
                <Select v-model="query.tag">
                  <Option v-for="item, key in majorTag" :value="item.id"> {{ item.name }}</Option>
                </Select>
              </td>
              <td>
                <Button type="primary" @click="onReset">
                  <Icon type="md-refresh"></Icon>
                   重置
                </Button>
              </td>
            </tr>
            </table>
          </template>
          <Table style="width: 100%; font-size: 16px;"
                :columns="query.tag==0?rankTableColumnsFull:rankTableColumnsTag"
                :data="rankData"
                :loading="loadings"
                disabled-hover
          >
            <template #rank="{row, index}">
              <template v-if="row.score != 0">
                {{ index+1 }}
              </template>
              <template v-else>
                -
              </template>
            </template>
            <template #username="{row}">
              <template v-if="row.id == userInfo.id || isAdmin(userInfo)">
                <a :href="'user-info.html?id='+row.id">
                  {{ row.username }}
                </a>
              </template>
              <template v-else>
                  {{ row.username }}
              </template>
            </template>
            <template #ac="{row}">
              {{ row.score }}
            </template>
            <template #time="{row}">
              <template v-if="row.lastAccept != null">
                {{ dayjs(row.lastAccept).format("YYYY-MM-DD HH:mm:ss") }}
              </template>
              <template v-else>
                -
              </template>
            </template>
          </Table>
          <Pagination
            :show-sizer="true"
            v-model:current="query.page"
            v-model:page-size="query.limit"
            :total="query.total"
            @on-change="getData"
            @on-page-size-change="getData"
          >
          </Pagination>
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

.td-title{
  padding-left: 10px;
}
</style>
