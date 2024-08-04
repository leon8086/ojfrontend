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

const handleRoute = function (route) {
  if( route == "/logout"){
    logout();
    return;
  }
  window.location.href = route;
};

const logout = function(){
  api.logout()
  .then(resp=>{
    window.location.href="/login.html";
  })
}

const checkRole = function(){
}

onMounted(()=>{
  useGlobalInfo( website );
  useCheckAdminLogin(userInfo);
  //userInfo.value = getUserLoginInfo();
});

</script>

<template>
  <div id="header">
    <Menu theme="light" mode="horizontal" @on-select="handleRoute" :active-name="activeMenu" class="oj-menu">
      <div class="logo"><span>{{website.website_name}}</span></div>
      <Menu-item name="/">
        <Icon type="ios-undo"></Icon>
         返回正常模式
      </Menu-item>
      <Menu-item name="/admin/global-config.html">
        <Icon type="ios-settings"></Icon>
         全局管理
      </Menu-item>
      <Menu-item name="/admin/course-list.html">
        <Icon type="ios-contacts"></Icon>
         班级管理
      </Menu-item>
      <Menu-item name="/admin/user-list.html">
        <Icon type="ios-contacts"></Icon>
         用户管理
      </Menu-item>
      <Menu-item name="/admin/problem-list.html">
        <Icon type="ios-menu"></Icon>
         题目管理
      </Menu-item>
      <Menu-item name="/admin/tag-list.html">
        <Icon type="ios-pricetags-outline"></Icon>
         标签管理
      </Menu-item>
      <Menu-item name="/admin/exam-list.html">
        <Icon type="ios-paper"></Icon>
         考试管理
      </Menu-item>
      <Menu-item name="/admin/hw-list.html">
        <Icon type="ios-paper-outline"></Icon>
        作业管理
      </Menu-item>
      <Dropdown class="drop-menu" @on-click="handleRoute" placement="bottom">
        <Button type="text" class="drop-menu-title">{{ userInfo.username }}
          <Icon type="ios-arrow-down"></Icon>
        </Button>
        <template #list>
          <Dropdown-menu>
            <Dropdown-item name="/setting/profile">{{$t('m.Settings')}}</Dropdown-item>
            <Dropdown-item divided name="/logout">{{$t('m.Logout')}}</Dropdown-item>
          </Dropdown-menu>
        </template>
      </Dropdown>
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
</style>
