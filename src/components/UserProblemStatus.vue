<script setup>
import ProbTag from "@/components/ProbTag.vue";
import { ref, onMounted, watch } from 'vue';
import { JUDGE_STATUS, DIFFICULTY_COLOR } from '@/utils/constants';
import api from '@/api';
import i18n from "@/i18n";

const props = defineProps({
  span: { default: 3, type: Number },
  visible: { default: true },
});

const majorTags = ref([]);
const cardList = ref([]);

const insertToTag = function( problem ){
  for( let i=0; i<majorTags.value.length; ++i ){
    if( majorTags.value[i].id != problem.majorTagId ){
      continue;
    }
    for( let j=0; j<majorTags.value[i].subTags.length; ++j ){
      if( majorTags.value[i].subTags[j].id != problem.subTagId ){
        continue;
      }
      let tag = majorTags.value[i].subTags[j];
      if( tag.problems == null ){
        tag.problems = [problem];
      }
      else{
        tag.problems.push(problem);
      }
    }
  }
}

const loadData = function( dataProblem, dataUser ){
  api.getTags()
  .then(resp=>{
    majorTags.value = resp.data;
    dataProblem.forEach( item=>{
      problems.value.push(item);
      problemMap[item.id] = item;
      insertToTag(item);
    })
    for( let key in dataUser ){
      problemMap[key].ac = dataUser[key].status == 0;
    }
    for( let i=0; i<majorTags.value.length; ++i ){
      for( let j=0; j<majorTags.value[i].subTags.length; ++j ){
        let tag = majorTags.value[i].subTags[j];
        if( tag.problems == null || tag.problems.length == null || tag.problems.length == 0 ){
          continue;
        }
        let card = { major: majorTags.value[i].name, sub: tag.name, problems: tag.problems };
        cardList.value.push(card);
      }
    }
  })
}

const problems = ref([]);
const problemMap = {};

defineExpose({loadData});

</script>

<template>
  <div v-if="props.visible">
    <Card v-for="card, index in cardList" style="margin:10px 0px; padding-bottom: 10px" class="submission">
      <template #title>
        <ProbTag type="sub">{{card.major}}<Icon type="ios-arrow-forward" />{{ card.sub }}</ProbTag>
      </template>
    <Row :gutter="4">
      <Col :span="props.span" v-for="item, key in card.problems" style="text-align: center;">
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
    </Card>
  </div>
</template>

<style>
.not-complete{
  color: #D9D7D4;
}

.submission .ivu-card-head{
  padding: 2px 8px;
  border-bottom: none;
}

.submission .ivu-card-body{
  padding: 2px;
}
</style>
