<script setup>
import { ref, onMounted, watch } from 'vue';
import { JUDGE_STATUS, DIFFICULTY_COLOR } from '@/utils/constants';
import api from '@/api';
import i18n from "@/i18n";

const props = defineProps({
  span: { default: 3, type: Number },
  visible: { default: true },
})

const loadData = function( dataProblem, dataUser ){
  dataProblem.forEach( item=>{
    problems.value.push(item);
    problemMap[item.id] = item;
  })
  for( let key in dataUser ){
    problemMap[key].ac = dataUser[key].status == 0;
  }
}

const problems = ref([]);
const problemMap = {};

defineExpose({loadData});

</script>

<template>
  <div v-if="props.visible" style="margin: 10px">
    <Row :gutter="4">
      <Col :span="props.span" v-for="item, key in problems" style="text-align: center;">
        <Tooltip placement="top" theme="light">
          <template #content>
            <Tag :color="DIFFICULTY_COLOR[item.difficulty]">{{ $t("m."+item.difficulty)}}</Tag>
            {{ item.title }}
          </template>
          <a :href="'./problem.html?id='+item.id" target="_blank">
            <Tag :color="!item.ac?'default':DIFFICULTY_COLOR[item.difficulty]" style="min-width:78px">
              <span :class="!item.ac?'not-complete':''">
                {{ item.displayId }}
              </span>
            </Tag>
          </a>
        </Tooltip>
      </Col>
    </Row>
  </div>
</template>

<style scoped>
.not-complete{
  color: #D9D7D4;
}
</style>
