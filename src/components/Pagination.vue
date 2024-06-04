<template>
  <div class="page">
    <Page :total="total"
          :page-size="pageSize"
          @on-change="onChange"
          @on-page-size-change="onPageSizeChange"
          :show-sizer="showSizer"
          :page-size-opts="[10, 30, 50, 100, 200]"
          :current="current"></Page>
  </div>
</template>

<script setup>
defineProps({
    total: {
      required: true,
      type: Number
    },
    pageSize: {
      required: false,
      type: Number
    },
    showSizer: {
      required: false,
      type: Boolean,
      default: false
    },
    current: {
      required: false,
      type: Number
    }
})

const emit = defineEmits(['update:current','update:pageSize','on-change','on-page-size-change']);
let onChange = function(page) {
  if (page < 1) {
    page = 1
  }
  emit('update:current', page)
  emit('on-change', page)
};

let onPageSizeChange = function(pageSize) {
  emit('update:pageSize', pageSize)
  emit('on-page-size-change', pageSize)
}
</script>

<style scoped lang="less">
  .page {
    margin: 20px;
    float: right;
  }
</style>
