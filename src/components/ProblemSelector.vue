<script>
import {reactive, watch, ref, onMounted} from "vue";
import Pagination from "@/components/Pagination.vue";
import ProbTag from "@/components/ProbTag.vue";
import { DIFFICULTY_COLOR } from "@/utils/constants";
import i18n from "@/i18n";
import api from "@/api";

export default{
  components:{
    Pagination,
    ProbTag,
  },
  props:["modelValue"],
  emits:['update:modelValue'],
  data(){
    return {
      DIFFICULTY_COLOR,
      query:{difficulty:'',keyword:'',tag:'', page:1, limit:15, total:0 },
      loadings:{table:true, tag:false},
      problemData: {
        columns: [
          {
            title: '选',
            slot: 'checked',
            width: 60,
          },
          {
            title: 'id',
            key: 'id',
            width: 80,
            align:'center',
          },
          {
            title: '#',
            slot: 'id',
            width: 120,
          },
          {
            title: i18n.global.t("m.Title"),
            slot: 'title',
          },
          {
            title: i18n.global.t("m.Level"),
            width: 100,
            slot: 'level',
          },
          {
            title: "分类",
            align: "center",
            slot: "tag",
            width: 280,
          },
        ],
        data: []
      },
      selected: this.modelValue,
    }
  },
  methods:{
    selectProblem(item) {
      item.selected = !item.selected;
      if (item.selected) {
        this.selected[item.id] = item;
      }
      else {
        delete this.selected[item.id];
      }
      this.dealwithSelected();
    },
    rowClassName(row, index) {
      if (row.selected) {
        return "row-selected";
      }
      return "";
    },
    dealwithSelected() {
      for (let i = 0; i < this.problemData.data.length; ++i) {
        let p = this.problemData.data[i];
        if (p.id in this.selected) {
          p.selected = true;
        }
        else {
          p.selected = false;
        }
      }
    },
    filterByKeyword(){
      this.query.page = 1;
      this.getProblemList();
    },
    getProblemList() {
      let self = this;
      api.adminGetProblemListBrief(this.query)
        .then((resp) => {
          self.problemData.data = resp.data.records;
          self.dealwithSelected();
          self.query.page = resp.data.pageNumber;
          self.query.limit = resp.data.pageSize;
          self.query.total = resp.data.totalRow;
          self.loadings.table = false;
        }, err => {
          self.loadings.table = false;
        });
    },
  }, // methods
  watch:{
    selected(){
      this.dealwithSelected();
      this.$emit("update:modelValue", this.selected);
    },
    modelValue(){
      this.dealwithSelected();
      this.selected = this.modelValue;
    },
    query:{
      handler( newVal ){
        if( this.query == newVal ){
          return;
        }
        this.getProblemList();
      },
      deep: true,
    },
  },
  mounted(){
    this.getProblemList();
  }
}

</script>

<template>
  <div>
    <Space direction="vertical" type="flex">
      <Input v-model="query.keyword" prefix="md-search"
          placeholder="筛选关键字"
          @on-enter="filterByKeyword" @on-click="filterByKeyword" @on-change="filterByKeyword"/>
    <Table style="width: 100%; font-size: 16px;" :columns="problemData.columns" :data="problemData.data" :row-class-name="rowClassName"
      :loading="loadings.table" :no-data-text="`<tr>没有题目</tr>`" :no-filtered-data-text="`<tr>没有题目</tr>`" disabled-hover>
      <template #checked="{row}">
        <Checkbox @click="selectProblem(row)" v-model="row.selected"></Checkbox>
      </template>
      <template #id="{row}">
        <a :href="'../problem.html?id=' + row.id" target="_blank">
          {{ row.displayId }}
        </a>
      </template>
      <template #title="{row}">
        <a :href="'../problem.html?id=' + row.id" target="_blank">
          {{ row.title }}
        </a>
      </template>
      <template #level="{row}">
        <Tag :color="DIFFICULTY_COLOR[row.difficulty]">
          {{ $t("m."+row.difficulty) }}
        </Tag>
      </template>
      <template #tag="{row}">
        <div style="text-align: left;">
          <ProbTag type="major">{{ row.majorTag  }}</ProbTag><ProbTag type="sub">{{ row.subTag  }}</ProbTag>
        </div>
      </template>
    </Table>
    <Pagination @on-page-size-change="getProblemList" :show-sizer="false" :total="query.total" size="small"
      v-model:page-size="query.limit" @on-change="getProblemList" v-model:current="query.page"></Pagination>
    </Space>
  </div>
</template>

<style lang="less">
.ivu-table .row-selected td{
  background-color: #fbf4f5;
}
</style>
