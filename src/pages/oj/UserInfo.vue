
<script setup>
import NavBar from '@/components/NavBar.vue'
import XMUTFooter from '@/components/XMUTFooter.vue'
import TitledPanel from '../../components/TitledPanel.vue';
import UserStatistic from '@/components/UserStatistic.vue';
import UserSubmission from '@/components/UserSubmission.vue';
import { ref, reactive, onMounted, resolveComponent } from 'vue';
import i18n from '@/i18n';
import api from '@/api';
import utils from '@/utils';

const userInfo = ref({login:false});

const userToShow = ref({username:""});

const statistic = ref(null);
const submission = ref(null);

onMounted(() => {
  let id = utils.getUrlKey("id");
  if( id == null ){
    userToShow.value = userInfo.value;
    api.getProblemAllBrief()
    .then(resp=>{
      api.getUserStatus()
      .then(status=>{
        statistic.value.loadData( resp.data, status.data );
        submission.value.loadData( resp.data, status.data );
      });
    });
  }
  else{
    api.getProblemAllBrief()
    .then(resp=>{
      api.adminGetUserStatus(id)
      .then(status=>{
        userToShow.value = status.data;
        statistic.value.loadData( resp.data, status.data.problemsStatus );
        submission.value.loadData( resp.data, status.data.problemsStatus );
      })
    });
  }
})
</script>

<template>
  <Layout>
    <NavBar :activeMenu="'user-info.html'" v-model="userInfo"></NavBar>
    <div class="content-app">
      <Content :style="{padding:'0 50px'}">
        <TitledPanel>
          <template #title>
            <h3>
              {{ userToShow.username }} 的提交信息
            </h3>
          </template>
          <Divider></Divider>
          <h3>进度</h3>
          <UserStatistic ref="statistic"></UserStatistic>
          <Divider></Divider>
          <h3>提交详情</h3>
          <UserSubmission ref="submission" :span="2"></UserSubmission>
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

.panel-title h3{
  color: var(--xmut-cs-color);
}

.panel-default h3{
  color: var(--xmut-cs-color);
  margin-left: 20px;
}
</style>
