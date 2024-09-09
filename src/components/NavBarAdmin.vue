<script setup>
import api from "@/api/index.js";
import { useGlobalInfo, useCheckAdminLogin } from "@/utils/globalInfo";
import utils from "@/utils";
import { ref, onMounted } from 'vue';
defineProps( ['activeMenu'] );

const userInfo = defineModel({default:{}})

const website = ref({
  website_name:"测试",
  allow_register:false,
  website_name_shortcut:"测试"
});

const checkRole = function(){
}

const handleRoute = function(route){
  window.location.href = route;
}

onMounted(()=>{
  useGlobalInfo( website );
  useCheckAdminLogin(userInfo);
});

</script>

<template>
  <div id="header">
    <Menu theme="light" mode="horizontal" @on-select="handleRoute" :active-name="activeMenu" class="oj-menu">
      <div class="logo" @click="console.log(userInfo)">
        <img src="/logo.svg" width="80px">
        <span>{{website.website_name}}</span>
      </div>
      <Menu-item name="../">
        <a href="../">
          <Icon type="ios-undo"></Icon>
          返回正常模式
        </a>
      </Menu-item>
      <Menu-item name="./">
        <a href="./">
        <Icon type="ios-settings"></Icon>
         全局配置
        </a>
      </Menu-item>
      <Menu-item name="./course-list.html">
        <a href="./course-list.html">
          <Icon type="ios-contacts"></Icon>
          班级管理
        </a>
      </Menu-item>
      <Menu-item name="./user-list.html">
        <a href="./user-list.html">
          <Icon type="ios-contacts"></Icon>
          用户管理
        </a>
      </Menu-item>
      <Menu-item name="./problem-list.html">
        <a href="./problem-list.html">
          <Icon type="ios-menu"></Icon>
          题目管理
        </a>
      </Menu-item>
      <Menu-item name="./tag-list.html">
        <a href="./tag-list.html">
          <Icon type="ios-pricetags-outline"></Icon>
          标签和年级管理
        </a>
      </Menu-item>
      <Menu-item name="./exam-list.html">
        <a href="./exam-list.html">
          <Icon type="ios-paper"></Icon>
          考试管理
        </a>
      </Menu-item>
      <Menu-item name="./homework-list.html">
        <a href="./homework-list.html">
          <Icon type="ios-paper-outline"></Icon>
          作业管理
        </a>
      </Menu-item>
    </Menu>
  </div>
</template>

<style lang="less" scoped>
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
  }

  .logo {
    margin-left: 2%;
    margin-right: 2%;
    font-size: 20px;
    float: left;
    line-height: 60px;
    color: var(--xmut-cs-color);
    font-weight: bolder;
    display: flex;
    align-items: center;
  }

  .drop-menu {
    float: right;
    margin-right: 30px;
    position: absolute;
    right: 10px;
    &-title {
      font-size: 18px;
    }
  }
  .btn-menu {
    font-size: 16px;
    float: right;
    margin-right: 10px;
  }
}

.modal {
  &-title {
    font-size: 18px;
    font-weight: 600;
  }
  &-body{
    padding-bottom: 20px;
  }
}

.ivu-menu-item a{
  color: #515a6e
}
.ivu-dropdown-item a{
  color: #515a6e
}
</style>
