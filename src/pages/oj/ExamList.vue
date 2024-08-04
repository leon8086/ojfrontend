
<script setup>
import NavBarAdmin from '@/components/NavBarAdmin.vue'
import NavBar from '@/components/NavBar.vue'
import XMUTFooter from '@/components/XMUTFooter.vue'

import { ref, reactive, onMounted, resolveComponent } from 'vue';

import i18n from '@/i18n';
import api from '@/api';
import utils from '@/utils';

onMounted(() => {
})
</script>

<template>
  <Layout>
    <NavBar :activeMenu="'/exam-list.html'"></NavBar>
    <div class="content-app">
      <Content :style="{padding:'0 50px'}">
      </Content>
    </div>
    <XMUTFooter></XMUTFooter>
  </Layout>
</template>

<style>
</style>
