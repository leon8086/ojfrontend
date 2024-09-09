64<script setup>
import ResetPassword from "./ResetPassword.vue";
import { useGlobalInfo, useCheckLogin, isAdmin } from "@/utils/globalInfo";
import { ref, onMounted, computed, watch } from 'vue';
import { Modal } from 'view-ui-plus';
import api from '@/api';
defineProps( ['activeMenu'] );

const userInfo = defineModel({default:{}})

const showResetPassword = ref(false);

const website = ref({
  website_name:"测试",
  allow_register:false,
  website_name_shortcut:"测试"
});

const handleRoute = function (route) {
  //console.log(route);
  if( route == "logout"){
    logout();
    return;
  }
  window.location.href = route;
};

const logout = function(){
  api.logout()
  .then(resp=>{
    window.location.href="login.html";
  })
}

watch(()=>userInfo.value, ()=>{
  if( userInfo.value.firstLogin ){
    showResetPassword.value = true;
  }
})

onMounted(()=>{
  useGlobalInfo( website );
  useCheckLogin(userInfo);
});

const isAdminRole = computed(()=>{
  return isAdmin(userInfo);
})

</script>

<template>
  <div id="header">
    <Menu theme="light" mode="horizontal" @on-select="handleRoute" :active-name="activeMenu" class="oj-menu">
      <div class="logo" @click="console.log(userInfo)">
        <img src="/logo.svg" width="80px">
        <span>{{website.website_name}}</span>
      </div>
      <Menu-item name="./">
        <a href="./">
          <Icon type="md-home"></Icon>
          {{$t('m.Home')}}
        </a>
      </Menu-item>
      <Menu-item name="problem-list.html">
        <a href="problem-list.html">
          <Icon type="ios-keypad"></Icon>
          {{$t('m.NavProblems')}}
        </a>
      </Menu-item>
      <Menu-item name="exam-list.html">
        <a href="exam-list.html">
        <Icon type="ios-list-box"></Icon>
          考试
        </a>
      </Menu-item>
      <Menu-item name="homework-list.html">
        <a href="homework-list.html">
        <Icon type="ios-paper-outline"></Icon>
          作业
        </a>
      </Menu-item>
      <Menu-item name="submission-list.html">
        <a href="submission-list.html">
          <Icon type="ios-pulse"></Icon>
          究竟谁在卷
        </a>
      </Menu-item>
      <Menu-item name="rank.html">
        <a href="rank.html">
          <Icon type="md-podium"></Icon>
          {{ $t('m.Rank') }}
        </a>
      </Menu-item>
      <Menu-item name="about.html">
        <a href="about.html">
          <Icon type="ios-information-circle"></Icon>
          {{$t('m.About')}}
        </a>
      </Menu-item>
      <template v-if="isAdminRole">
      <Menu-item name="admin/">
        <a href="admin/">
          <Icon type="ios-redo"></Icon>
          管理端
        </a>
      </Menu-item>
      </template>
      <Dropdown class="drop-menu" @on-click="handleRoute" placement="bottom">
        <Button type="text" class="drop-menu-title">{{ userInfo.username }}
          <Icon type="ios-arrow-down"></Icon>
        </Button>
        <template #list>
          <Dropdown-menu>
            <!-- <Dropdown-item name="user-home">
              {{$t('m.MyHome')}}
            </Dropdown-item>
            <Dropdown-item name="status">
              {{$t('m.MySubmissions')}}
            </Dropdown-item> -->
            <Dropdown-item name="setting.html">
              <a href="setting.html">
                修改密码
              </a>
            </Dropdown-item>
            <Dropdown-item divided name="logout">
              {{$t('m.Logout')}}
            </Dropdown-item>
          </Dropdown-menu>
        </template>
      </Dropdown>
    </Menu>
  </div>
  <Modal v-model="showResetPassword" :closable="false" :mask-closable="false" :footer-hide="true">
    <ResetPassword></ResetPassword>
  </Modal>
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
    span{
      margin-left:20px;
    }
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
