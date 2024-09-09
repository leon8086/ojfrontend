
<script setup>
import NavBar from '@/components/NavBar.vue'
import ResetPassword from '@/components/ResetPassword.vue';
import XMUTFooter from '@/components/XMUTFooter.vue'
import TitledPanel from '@/components/TitledPanel.vue';
import { ref, reactive, onMounted, resolveComponent } from 'vue';
import i18n from '@/i18n';
import api from '@/api';
import utils from '@/utils';
import { Modal } from 'view-ui-plus'

const userInfo = ref({login:false});

const formData = ref({
  original:"",
  password:"",
  repeat:"",
});

const formValidate = ref(null);

const validatorPSW = function( rule, value, callback ){
  if( value === "" ){
    callback(new Error('请输入密码'));
  }
  // else if( value.length < 6 ||
  //         value.search(/\d/) == -1 ||
  //         value.search(/[A-Z]/) == -1 ||
  //         value.search(/[a-z]/) == -1 )
  // {
  //   callback(new Error('密码需大于6位，且包含大写字母、小写字母和数字'));
  // }
  else if(formData.value.repeat !== "" ){
    formValidate.value.validateField('repeat');
  }
  callback();
}

const ruleData = ref({
  original:[
    { required: true, message: "请填入密码" },
  ],
  password:[
    {
      validator:validatorPSW,
    },
  ],
  repeat:[
    {
      validator( rule, value, callback){
        if( value != formData.value.password ){
          callback(new Error('两次密码不相同'));
        }
        callback();
      },
    },
  ]
});

const resetPSW = function(){
  api.resetPassword( formData.value )
  .then(resp=>{
    Modal.info({
      title:"修改成功",
      content:"修改成功",
      onOk(){
        window.location.href="login.html";
      }
    })
  }, err=>{
    Modal.error({
      title:"错误",
      content:err.data,
    })
  });
}

onMounted(() => {
})
</script>

<template>
  <Layout>
    <NavBar activeMenu="setting.html" v-model="userInfo"></NavBar>
    <div class="content-app">
      <Content :style="{padding:'0 50px'}">
        <TitledPanel>
          <template #title>
            设置
          </template>
          <Row :gutter="10">
            <Col :span="6">
              <ResetPassword></ResetPassword>
            </Col>
            <Col :span="18">
              <div class="todo">这里还没有做！</div>
            </Col>
          </Row>
        </TitledPanel>
      </Content>
    </div>
    <XMUTFooter></XMUTFooter>
  </Layout>
</template>

<style>
.ivu-btn{
  margin-right: 10px;
  margin-left: 10px;
}

.operation .ivu-btn{
  margin-right: 1px;
  margin-left: 1px;
}

.form{
  padding: 20px;
}

.form .ivu-btn{
  margin-left: 0px;
}

.todo {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 400%;
}
</style>
