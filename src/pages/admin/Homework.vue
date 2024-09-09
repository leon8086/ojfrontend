
<script setup>
import NavBarAdmin from '@/components/NavBarAdmin.vue'
import XMUTFooter from '@/components/XMUTFooter.vue'
import TitledPanel from '@/components/TitledPanel.vue';
import { ref, reactive, onMounted, resolveComponent } from 'vue';
import i18n from '@/i18n';
import api from '@/api';
import utils from '@/utils';

const query = reactive({keyword:'', page:1, limit:15, total:0 });

const filterByKeyword = function(){
}

const onReset = function(){
}

const userInfo = ref({login:false});

onMounted(() => {
})
</script>

<template>
  <Layout>
    <NavBarAdmin :activeMenu="'/admin/homework.html'" v-model="userInfo"></NavBarAdmin>
    <div class="content-app">
      <Content :style="{padding:'0 50px'}">
        <TitledPanel>
          <template #title>
            还没做
          </template>
          <template #extra>
            <ul class="filter">
              <li>
                <Input v-model="query.keyword" @on-enter="filterByKeyword" @on-click="filterByKeyword"
                  placeholder="关键字" icon="ios-search-strong" />
              </li>
              <li>
                <Button type="primary" @click="onReset">
                  <Icon type="md-refresh"></Icon>
                   重置
                </Button>
              </li>
            </ul>
          </template>
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
</style>
