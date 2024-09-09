<script setup>
import NavBarAdmin from '@/components/NavBarAdmin.vue'
import TitledPanel from '@/components/TitledPanel.vue'
import XMUTFooter from '@/components/XMUTFooter.vue'

import { ref, reactive, onMounted, resolveComponent } from 'vue';

import dayjs from 'dayjs';
import api from '@/api';
import { Message } from 'view-ui-plus';

const formValidate = ref({
});

const formData = ref({
  baseUrl:"",
  siteName:"",
  siteShortcut:"",
  siteFooter:"",
});

const ruleData = ref({
  baseUrl:[
    { required: true, message:'url必填', trigger:"blur" },
  ],
  siteName:[
    { required: true, message:'网站名称必填', trigger:"blur" },
  ],
  siteShortcut:[
    { required: true, message:'网站简称必填', trigger:"blur" },
  ],
  siteFooter:[
    { required: true, message:'网站页脚必填', trigger:"blur" },
  ],
});

const judgerServerColumns = ref([
  {
    title:"id",
    key: 'hostname',
    align: "center",
  },
  {
    title:"ip",
    key: 'ip',
    align: "center",
  },
  {
    title:"版本",
    key: 'judgerVersion',
    align: "center",
  },
  {
    title:"cpu（核）",
    key: 'cpuCore',
    align: "center",
  },
  {
    title:"内存占用",
    slot: 'memory',
    align: "center",
  },
  {
    title:"cpu占用",
    slot: 'cpu',
    align: "center",
  },
  {
    title:"心跳",
    slot: 'heartbeat',
    align: "center",
  },
  {
    title:"任务",
    key: 'taskNumber',
    align: "center",
  },
  {
    title:"url",
    key: 'serviceUrl',
    align: "center",
    width:260,
  },
  {
    title:"状态",
    slot: 'status',
    align: "center",
  },
]);

const judgerList = ref([]);

const updateSiteInfo = function(){
  formValidate.value.validate((valid)=>{
    if( !valid ){
      Message.error("请填写必填项");
      return;
    }
    let params = {};
    params.website_base_url = formData.value.baseUrl;
    params.website_name = formData.value.siteName;
    params.website_footer = formData.value.siteFooter;
    params.website_name_shortcut = formData.value.siteShortcut;
    api.adminUpdateOptions( params )
    .then(resp=>{
      window.location.href="./";
    });
  });
}

onMounted(() => {
  api.getWebsiteInfo()
  .then(resp=>{
    formData.value.baseUrl = resp.data.website_base_url;
    formData.value.siteName = resp.data.website_name;
    formData.value.siteFooter = resp.data.website_footer;
    formData.value.siteShortcut = resp.data.website_name_shortcut;
  });
  api.adminGetJudgerList()
  .then(resp=>{
    judgerList.value = resp.data;
  });
})
</script>

<template>
  <Layout>
    <NavBarAdmin :activeMenu="'./'"></NavBarAdmin>
    <div class="content-app">
      <Content :style="{padding:'0 50px'}">
      <Row :gutter="10">
        <Col :span="6">
        <TitledPanel>
          <template #title>
            全局配置
          </template>
          <template #extra>
          </template>
          <div style="padding: 10px 40px">
            <Form ref="formValidate" :model="formData" :rules="ruleData" label-position="top">
              <FormItem label="网站URL" prop="baseUrl">
                <Input v-model="formData.baseUrl" placeholder="url"></Input>
              </FormItem>
              <FormItem label="网站名称" prop="siteName">
                <Input v-model="formData.siteName" placeholder="网站名称"></Input>
              </FormItem>
              <FormItem label="网站简称" prop="siteShortcut">
                <Input v-model="formData.siteShortcut" placeholder="网站简称"></Input>
              </FormItem>
              <FormItem label="网站页脚" prop="siteFooter">
                <Input v-model="formData.siteFooter" placeholder="网站页脚"></Input>
              </FormItem>
              <Button type="primary" @click="updateSiteInfo" long> 更新 </Button>
            </Form>
          </div>
        </TitledPanel>
        </Col>
        <Col :span="18">
        <TitledPanel style="min-height:447px">
          <template #title>
            判题服务器
          </template>
          <template #extra>
          </template>
            <Table style="width: 100%; font-size: 16px;"
                  :columns="judgerServerColumns"
                  :data="judgerList"
                  disabled-hover
            >
              <template #memory="{row}">
                {{ row.memoryUsage }}%
              </template>
              <template #cpu="{row}">
                {{ row.cpuUsage }}%
              </template>
              <template #heartbeat="{row}">
                {{ dayjs(row.lastHeartbeat).format("YYYY-MM-DD HH:mm") }}
              </template>
              <template #status="{row}">
                <template v-if="row.isDisabled || dayjs().diff(dayjs(row.lastHeartbeat),'second')>10 ">
                  <Tag color="error">离线</Tag>
                </template>
                <template v-else>
                  <Tag color="success">在线</Tag>
                </template>
              </template>
            </Table>
        </TitledPanel>
        </Col>
      </Row>
      <TitledPanel>
        <template #title>
          公告管理
        </template>
      </TitledPanel>
      </Content>
    </div>
    <XMUTFooter></XMUTFooter>
  </Layout>
</template>

<style scoped>
  .taglist-title {
    margin-left: -10px;
    margin-bottom: -10px;
  }

  .tag-btn {
    margin-right: 5px;
    margin-bottom: 10px;
  }

  #pick-one {
    margin-top: 10px;
  }

  .subtitle{
    font-weight: normal;
    margin-bottom: 20px;
    border-bottom: solid thin lightslategray;
  }
</style>