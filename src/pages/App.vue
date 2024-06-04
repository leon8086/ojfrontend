<script setup>
import {ref} from 'vue';
import NavBar from '../components/NavBar.vue'
import CodeMirror from '../components/CodeMirror.vue';
import XMUTFooter from '../components/XMUTFooter.vue';

let code = ref("console.log");

let look = function(){
  console.log(code.value);
}
</script>

<template>
<Layout>
  <NavBar :website="{website_name:'数据结构2022',allow_register:true}" :activeMenu="'/'" :user="{username:'tom'}"></NavBar>
  <div class="content-app">
      <Content :style="{ padding: '0 50px' }">
          <Card>
              <div style="min-height: 200px;">
                <CodeMirror v-model="code" :language-sets="['C++','Python','JavaScript']"></CodeMirror>
              </div>
          </Card>
      </Content>
  </div>
  <Button @click="look()">看！</Button>
  <XMUTFooter></XMUTFooter>
</Layout>
</template>

<style scoped>
</style>
