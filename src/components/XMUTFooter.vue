<template>
    <div>
        <Footer class="layout-footer-center">{{ website.website_footer }}</Footer>
    </div>
</template>

<script setup>
import { useGlobalInfo } from "@/utils/globalInfo";
import { onMounted, ref } from 'vue';

const website = ref({
  website_footer:"测试"
});

onMounted(()=>{
    useGlobalInfo(website);
})
</script>

<style scoped lang="less">
.layout-footer-center{
    color: var(--xmut-cs-color);
}
</style>
