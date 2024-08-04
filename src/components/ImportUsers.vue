
<script setup>
import TitledPanel from "@/components/TitledPanel.vue";
import SlimPage from "./SlimPage.vue";

import { ref, onMounted, } from 'vue';

import utils from '@/utils';
import { watch } from "less";

const USER_PER_PAGE = 10;

const validUserColumn = ref([
  {
    title: "用户名",
    align: "center",
    key: "username",
  },
  {
    title: "密码",
    align: "center",
    key: "password",
  },
  {
    title: "邮箱",
    align: "center",
    key: "email",
  },
  {
    title: "年级",
    align: "center",
    key: "grade",
  },
  {
    title: "真名",
    align: "center",
    key: "realName",
  },
]);
const validUsers = ref([]);
const failedUsers = ref([]);
const props = defineProps({
  exists:{
    default:[],
    type:Array,
  }
});
//const validUsers = defineModel('valid', {default:[]});


const failedUserColumn = ref([ ...validUserColumn.value,
  {
    title: "问题",
    align: "center",
    key: "error",
    className: "error-msg",
  },
]);
//const failedUsers = defineModel('failed', {default:[]});


const emit = defineEmits(['upload']);
const doUpload = function( ){
  emit("upload", validUsers.value);
  validUsers.value = [];
  failedUsers.value = [];
}

const doClear = function( ){
  validUsers.value = [];
  failedUsers.value = [];
}

const handleUpload = function( file ){
  let exists = props.exists;
  validUsers.value.forEach( item =>{
    exists.push( item.username );
  })
  utils.importUsersCSV( file, exists)
  .then( data =>{
    failedUsers.value.push(...data.failed);
    validUsers.value.push(...data.valid);
  });
  return false;
}

onMounted(() => {
})
</script>

<template>
  <TitledPanel style="padding: 0px 20px 20px 20px">
    <template #title>
      导入用户
    </template>
    <div style="display: flex;">
      <Upload action="" :before-upload="handleUpload">
        <Button icon="ios-folder-open" type="primary">选择文件导入</Button>
      </Upload>
      <template v-if="validUsers.length != 0">
        <div>
          <Button icon="ios-cloud-upload" type="primary" @click="doUpload">导入有效用户</Button>
          <Button icon="md-close" type="error" @click="doClear">清除</Button>
        </div>
      </template>
    </div>
    <SlimPage v-if="validUsers.length != 0" style="width: 100%; font-size: 16px;"
        :columns="validUserColumn" :data="validUsers" :page-size="10"
        disabled-hover></SlimPage>
    <SlimPage v-if="failedUsers.length != 0" style="width: 100%; font-size: 16px;"
      :columns="failedUserColumn" :data="failedUsers" :page-size="10"
      disabled-hover class="failed"></SlimPage>
  </TitledPanel>
</template>

<style>
.failed td.error-msg{
  color: red;
}

.ivu-btn{
  margin-right: 10px;
  margin-left: 10px;
}

.operation .ivu-btn{
  margin-right: 1px;
  margin-left: 1px;
}

.page-right{
  display: flex;
  justify-content: right;
}

.failed th{
  background-color: #888;
}

.failed td{
  color: #aaa;
}
</style>
