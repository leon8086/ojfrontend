<script>
import i18n from "@/i18n";
import api from "@/api";
import { USER_TYPE_INFO } from "../utils/constants";

export default{
  //props:["modelValue","exists"],
  props:{
    modelValue:{
      required: true,
      type: Object,
    },
    exists:{
      required: false,
      type: Boolean,
      default: false,
    }
  },
  emits:['update:modelValue'],
  data(){
    return {
      formUser:{
        id:null,
        username:"",
        password:"",
        email:"",
        realName:"",
        grade:"",
        adminType:"Regular User",
        isDisabled: false,
      },
      ruleUser:{
        username:[
          { required: true, message:'请填入用户名', trigger:"blur"},
        ],
      },
      USER_TYPE_INFO,
    }
  },
  methods:{
  }, // methods
  watch:{
    modelValue(){
      //console.log(this.modelValue);
      this.formUser = this.modelValue;
      this.formUser.adminType = this.modelValue.adminType;
    },
    formUser(){
      //console.log("emit");
      this.$emit("update:modelValue", this.formUser)
    }
  },
  mounted(){
  }
}

</script>

<template>
  <div>
    <Button @click="console.log(formUser)">看</Button>
    <Form ref="formUser" :model="formUser" :rule="ruleUser" label-position="left" :label-width="80">
      <Row>
        <Col :span="11">
          <FormItem prop="id" label="用户id">
            <Input type="text" v-model="formUser.id" placeholder="新用户" disabled></Input>
          </FormItem>
        </Col>
        <Col :span="2">
        </Col>
        <Col :span="11">
          <FormItem prop="username" label="用户名">
            <Input type="text" v-model="formUser.username" placeholder="用户名" :disabled="exists"></Input>
          </FormItem>
        </Col>
        <Col :span="11">
          <FormItem prop="email" label="邮箱">
            <Input type="text" v-model="formUser.email" placeholder="邮箱"></Input>
          </FormItem>
        </Col>
        <Col :span="2">
        </Col>
        <Col :span="11">
          <FormItem prop="realName" label="真名">
            <Input type="text" v-model="formUser.realName" placeholder="真名"></Input>
          </FormItem>
        </Col>
        <Col :span="11">
          <FormItem prop="grade" label="年级">
            <Input type="text" v-model="formUser.grade" placeholder="年级"></Input>
          </FormItem>
        </Col>
        <Col :span="2">
        </Col>
        <Col :span="11">
          <FormItem prop="adminType" label="用户类型">
            <Select v-model="formUser.adminType" :disabled="formUser.id == 1">
              <Option v-for="item, key in USER_TYPE_INFO" :value="item.id"><Tag :color="item.color">{{ item.name }}</Tag></Option>
            </Select>
          </FormItem>
        </Col>
        <Col :span="11">
          <FormItem prop="isDisable" label="已禁用">
            <Switch v-model="formUser.isDisabled">
              <template #open>是</template>
              <template #close>否</template>
            </Switch>
          </FormItem>
        </Col>
        <Col :span="2">
        </Col>
        <Col :span="11">
          <span v-if="!exists" style="color:red"> 新建用户的密码与用户名相同 </span>
        </Col>
      </Row>
    </Form>
  </div>
</template>

<style lang="less">
</style>
