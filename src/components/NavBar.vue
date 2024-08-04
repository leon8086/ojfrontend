<script setup>
import { useGlobalInfo, useCheckLogin, isAdmin } from "@/utils/globalInfo";
import { ref, onMounted, computed } from 'vue';
import { Modal } from 'view-ui-plus';
import api from '../api';
defineProps( ['activeMenu'] );

const userInfo = defineModel({default:{}})

const modalVisible = ref(false);
const website = ref({
  website_name:"测试",
  allow_register:false,
  website_name_shortcut:"测试"
});

const formLogin = ref({ username:'', password: ''});

const btnLoginLoading = ref(false);

const loginable = ref(true);

const handleRoute = function (route) {
  //console.log(route);
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

const handleBtnClick = function (name) {
  if(modalVisible.value){
    return;
  }
  modalVisible.value = true;
};

const handleLogin = function(e) {
  if(formLogin.value.username == ""){
    Modal.error({title:"用户名不能为空"});
    return;
  }
  btnLoginLoading.value = true;
  api.login({username:formLogin.value.username,password:formLogin.value.password})
  .then(resp=>{
    btnLoginLoading.value = false;
    modalVisible.value = false;
    userInfo.value = resp.data;
    userInfo.value.login = true;
    window.localStorage['user_info'] = JSON.stringify(userInfo.value);
  }, err => {
    Modal.error({title:"登录错误",content:err.data.message});
    btnLoginLoading.value = false;
  })
};

const validCheck = function(){
  if(formLogin.value.username == ""){
    loginable.value = false;
  }
  else{
    loginable.value = true;
  }
}

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
      <div class="logo" @click="console.log(userInfo)"><span>{{website.website_name}}</span></div>
      <Menu-item name="/">
        <Icon type="md-home"></Icon>
        {{$t('m.Home')}}
      </Menu-item>
      <Menu-item name="/problem-list.html">
        <Icon type="ios-keypad"></Icon>
        {{$t('m.NavProblems')}}
      </Menu-item>
      <Menu-item name="/exam-list">
        <Icon type="ios-list-box"></Icon>
         考试
      </Menu-item>
      <Menu-item name="/submission-list.html">
        <Icon type="ios-pulse"></Icon>
        {{ $t('m.NavStatus') }}
      </Menu-item>
      <Menu-item name="rank">
        <Icon type="md-podium"></Icon>
        {{ $t('m.Rank') }}
      </Menu-item>
      <Submenu name="about">
        <template #title>
          <Icon type="ios-information-circle"></Icon>
          {{$t('m.About')}}
        </template>
        <Menu-item name="/about">
          {{$t('m.Judger')}}
        </Menu-item>
        <Menu-item name="/FAQ">
          {{$t('m.FAQ')}}
        </Menu-item>
      </Submenu>
      <template v-if="isAdminRole">
        <Menu-item name="/admin/">
          <Icon type="ios-redo"></Icon>
          管理端
        </Menu-item>
      </template>
      <Dropdown class="drop-menu" @on-click="handleRoute" placement="bottom">
        <Button type="text" class="drop-menu-title">{{ userInfo.username }}
          <Icon type="ios-arrow-down"></Icon>
        </Button>
        <template #list>
          <Dropdown-menu>
            <Dropdown-item name="/user-home">{{$t('m.MyHome')}}</Dropdown-item>
            <Dropdown-item name="/status?myself=1">{{$t('m.MySubmissions')}}</Dropdown-item>
            <Dropdown-item name="/setting/profile">{{$t('m.Settings')}}</Dropdown-item>
            <Dropdown-item divided name="/logout">{{$t('m.Logout')}}</Dropdown-item>
          </Dropdown-menu>
        </template>
      </Dropdown>
    </Menu>
    <Modal v-model="modalVisible" :width="400" :mask-closable="false" :footer-hide="true">
      <template #header>
        <div class="modal-title">{{ $t('m.Welcome_to') }} {{ website.website_name_shortcut }}</div>
      </template>
      <Form ref="formLogin" :model="formLogin">
        <FormItem prop="username">
          <Input type="text" v-model="formLogin.username" :placeholder="$t('m.LoginUsername')" size="large" @input="validCheck">
          <template #prepend>
            <Icon type="ios-person-outline"></Icon>
          </template>
          </Input>
        </FormItem>
        <FormItem prop="password">
          <Input type="password" required v-model="formLogin.password" :placeholder="$t('m.LoginPassword')" size="large">
          <template #prepend>
            <Icon type="ios-lock-outline"></Icon>
          </template>
          </Input>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleLogin('formLogin')" class="btn" long :loading="btnLoginLoading" :disabled="!loginable">
            {{ $t('m.UserLogin') }}
          </Button>
        </FormItem>
      </Form>
      <div class="footer">
        <a v-if="website.allow_register" @click.stop="handleRegister()">{{$t('m.No_Account')}}</a>
        <a @click.stop="goResetPassword" style="float: right">{{$t('m.Forget_Password')}}</a>
      </div>
    </Modal>
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
