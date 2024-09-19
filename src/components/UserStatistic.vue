<script setup>
import { ref, onMounted, watch } from 'vue';
import { JUDGE_STATUS, DIFFICULTY_COLOR } from '@/utils/constants';
import api from '@/api';


const loadData = function( dataProblem, dataUser ){
  dataProblem.forEach( item=>{
    problems.value.push(item);
    problemMap[item.id] = item;
  })
  for( let key in dataUser ){
    problemMap[key].status = dataUser[key].status
    userStatus.value[key] = dataUser[key];
  }
  getStatistic();
}

const totalStatistic = ref({"total":0,"Low":0, "Mid":0, "High":0})
const acStatistic = ref({"total":0,"Low":0, "Mid":0, "High":0})

const chartDesc = ref([
  {key:"total", title:"总进度", color:"green"},
  {key:"Low", title:"入门", color:"blue"},
  {key:"Mid", title:"普通", color:"green"},
  {key:"High", title:"进阶", color:"red"},
])

const getStatistic = function(){
  problems.value.forEach( item=>{
    totalStatistic.value[item.difficulty]++;
    totalStatistic.value.total ++;
  });
  for( let key in userStatus.value ){
    let p = problemMap[key];
    if( p.status == 0 ){
      acStatistic.value.total++;
      acStatistic.value[p.difficulty] ++;
    }
  }
}
const problems = ref([]);
const problemMap = {};
const userStatus = ref({});


onMounted(()=>{
});

defineExpose({loadData});

</script>

<template>
  <div class="echart-content">
    <Row :gutter="4">
      <Col :span="6" style="text-align: center;" v-for="item, key in chartDesc">
        <div>
          <Circle :percent="100*acStatistic[item.key]/totalStatistic[item.key]" :size="180" :stroke-width="12" :trail-width="10">
            <span class="demo-circle-inner" style="font-size:24px">
              <h3 style="margin-left: 0px">
                <Tag :color="item.color" size="large" style="font-size:80%">
                  {{acStatistic[item.key]}}/{{ totalStatistic[item.key] }}
                </Tag>
              </h3>
              <div style="font-size:70%; margin-top: 4px">
                {{(100*acStatistic[item.key]/totalStatistic[item.key]).toFixed(2)}}%
              </div>
            </span>
          </Circle>
          <h2 style="text-align: center;">{{ item.title }}</h2>
        </div>
      </Col>
    </Row>
  </div>
</template>

<style scoped>
</style>
