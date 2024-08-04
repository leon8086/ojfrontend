<script>
import i18n from "@/i18n";
import api from "@/api";
import ImportUsers from "@/components/ImportUsers.vue";
import ImportResult from "./ImportResult.vue";
import SlimPage from "./SlimPage.vue";
import { isSuperAdmin } from "@/utils/globalInfo";
import { USER_TYPE } from "@/utils/constants";

export default{
  components:{
    ImportUsers,
    ImportResult,
    SlimPage,
  },
  props:{
    modelValue:{
      required: true,
      type: Object,
    },
    exists:{
      required: false,
      type: Boolean,
      default: false,
    },
    userInfo:{
      required: true,
      type: Object,
    },
  },
  emits:['update:modelValue'],
  data(){
    return {
      formValue:{
        id:null,
        courseName:"",
        ownerId:"",
        isClosed: false,
      },
      createUsers:[
      ],
      ruleValue:{
        courseName:[
          { required: true, message:'请填入班级名', trigger:"blur"},
        ],
        ownerId:[
          { required: true, message:'必须选择至少一个管理者', trigger:"blur"},
        ],
      },
      adminUserList:[],

    }
  },
  computed:{
    superAdmin(){
      return isSuperAdmin(this.userInfo);
    }
  },
  watch:{
    modelValue(){
      //console.log(this.modelValue);
      this.formValue = this.modelValue;
    },
    formValue(){
      //console.log("emit");
      this.$emit("update:modelValue", this.formValue)
    },
    userInfo(){
      if( !isSuperAdmin(this.userInfo) ){
        this.formValue.ownerId = this.userInfo.id;
      }
    }
  },
  mounted(){
    api.getAdminUserList()
    .then(resp=>{
      this.adminUserList = resp.data;
      this.formValue.ownerId = this.adminUserList[0].id;
    }, err=>{
    })
  }
}

</script>

<template>
  <div>
    <Form ref="formValue" :model="formValue" :rules="ruleValue" label-position="left" :label-width="80">
      <Row>
        <Col :span="1">
        </Col>
        <Col :span="10">
        <FormItem prop="courseName" label="班级名">
          <Input type="text" v-model="formValue.courseName" placeholder="班级名" :disabled="exists"></Input>
        </FormItem>
        </Col>
        <Col :span="1">
        </Col>
        <Col :span="10">
        <template v-if="superAdmin">
          <FormItem prop="ownerId" label="管理者">
            <Select v-model="formValue.ownerId">
              <Option v-for="item, key in adminUserList" :value="item.id">{{ item.username }}</Option>
            </Select>
          </FormItem>
        </template>
        <template v-else>
          <FormItem label="管理者">
            <Input type="text" v-model="userInfo.username" disabled>
            <template #prefix>
              <Icon type="ios-contact" />
            </template>
            </Input>
          </FormItem>
        </template>
        </Col>
        <Col :span="2">
        </Col>
        <Col :span="1">
        </Col>
        <Col :span="10">
        <FormItem prop="isClosed" label="已结课">
          <Switch v-model="formValue.isClosed">
            <template #open>
              是
            </template>
            <template #close>
              否
            </template>
          </Switch>
        </FormItem>
        </Col>
      </Row>
    </Form>
  </div>
</template>

<style lang="less">
.page-right{
  display: flex;
  justify-content: right;
}
</style>
