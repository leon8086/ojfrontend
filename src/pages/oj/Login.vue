<script setup>
import {ref, computed} from 'vue';
import {Modal} from 'view-ui-plus';
import api from '@/api';
import XMUTFooter from '@/components/XMUTFooter.vue';

const userInfo = ref({})
const formLogin = ref({ username:'', password: ''});

const rules = computed(()=>{
  return {
    username: [ { required: true, message: '账号不能为空', trigger: 'blur' } ],
    password: [ { required: true, message: '密码不能为空', trigger: 'blur' } ],
  }
})

const btnLoginLoading = ref(false);

const handleSubmit = function(){
  if(formLogin.value.username == ""){
    Modal.error({title:"用户名不能为空"});
    return;
  }
  btnLoginLoading.value = true;
  api.login({username:formLogin.value.username,password:formLogin.value.password})
  .then(resp=>{
    btnLoginLoading.value = false;
    userInfo.value = resp.data;
    userInfo.value.login = true;
    window.localStorage['user_info'] = JSON.stringify(userInfo.value);
    window.location.href="/";
  }, err => {
    console.log(err);
    Modal.error({title:"登录错误", content:err.message});
    btnLoginLoading.value = false;
  })
}

</script>

<template>
  <div class="login">
    <div class="login-con">
      <Card icon="log-in" title="欢迎登录" :bordered="false">
        <div class="form-con">
          <Form ref="loginForm" :model="formLogin" :rules="rules" @keydown.enter.native="handleSubmit">
            <FormItem prop="userName">
              <Input v-model="formLogin.username" placeholder="请输入用户名">
              <span slot="prepend">
                <Icon :size="16" type="ios-person"></Icon>
              </span>
              </Input>
            </FormItem>
            <FormItem prop="password">
              <Input type="password" v-model="formLogin.password" placeholder="请输入密码">
              <span slot="prepend">
                <Icon :size="14" type="md-lock"></Icon>
              </span>
              </Input>
            </FormItem>
            <FormItem>
              <Button @click="handleSubmit" type="primary" long :loading="btnLoginLoading">登录</Button>
            </FormItem>
          </Form>
          <table class="login-tip">
            <tr><td>初始账号：</td><td style="text-align: left;">姓名_学号（庄体育_2200000099）</td></tr>
            <tr><td>初始密码：</td><td style="text-align: left;">学号（2200000099）</td></tr>
          </table>
        </div>
      </Card>
    </div>
  </div>
  <XMUTFooter></XMUTFooter>
</template>

<style scoped lang="less">
.login{
    width: 100%;
    height: 100%;
    min-height: 1200px;
    /*background-image: url('@/assets/login-bg.jpg');*/
    background-size: cover;
    background-position: center;
    position: relative;
    &-con{
        position: absolute;
        right: 15%;
        top: 50%;
        transform: translateY(-60%);
        width: 300px;
        &-header{
            font-size: 16px;
            font-weight: 300;
            text-align: center;
            padding: 30px 0;
        }
        .form-con{
            padding: 10px 0 0;
        }
        .login-tip{
            font-size: 10px;
            text-align: center;
            color: #c3c3c3;
        }
    }
}
</style>
