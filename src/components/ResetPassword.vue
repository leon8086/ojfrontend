
<script setup>
import { ref, reactive, onMounted, resolveComponent } from 'vue';
import i18n from '@/i18n';
import api from '@/api';
import utils from '@/utils';
import { Message, Modal } from 'view-ui-plus'

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
  else if( value.length < 6 ||
          value.search(/\d/) == -1 ||
          value.search(/[A-Z]/) == -1 ||
          value.search(/[a-z]/) == -1 )
  {
    callback(new Error('密码需大于6位，且包含大写字母、小写字母和数字'));
  }
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
  formValidate.value.validate((valid)=>{
    if( valid ){
      api.resetPassword(formData.value)
        .then(resp => {
          Modal.info({
            title: "修改成功",
            content: "修改成功",
            onOk() {
              window.location.href = "login.html";
            }
          })
        }, err => {
          Modal.error({
            title: "错误",
            content: err.data,
          })
        });
    }
    else{
      Message.error("请检查必填项");
    }
  });
}

onMounted(() => {
})
</script>

<template>
    <Form ref="formValidate" :model="formData" :rules="ruleData" label-position="top" class="form">
        <FormItem label="原密码" prop="original">
            <Input type="password" v-model="formData.original" placeholder="原密码"></Input>
        </FormItem>
        <FormItem label="新密码" prop="password">
            <Input type="password" v-model="formData.password" placeholder="新密码"></Input>
        </FormItem>
        <FormItem label="重复密码" prop="repeat">
            <Input type="password" v-model="formData.repeat" placeholder="重复密码"></Input>
        </FormItem>
        <Button type="primary" long @click="resetPSW()">重置</Button>
    </Form>
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
