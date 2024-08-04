<template>
  <Card :padding="padding" :shadow="shadow" :dis-hover="disHover" :bordered="bordered" style="margin-bottom:20px">
    <template v-for="(value, name) in slots" #[name]="scope">
      <div :class="'panel-'+name">
        <slot :name="name" v-bind="scope || {}"></slot>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { useSlots } from 'vue';
defineProps({
      shadow: {
        required: false,
        type: Boolean,
        default: false
      },
      padding: {
        required: false,
        type: Number,
        default: 0
      },
      disHover: {
        required: false,
        type: Boolean,
        default: false
      },
      bordered: {
        required: false,
        type: Boolean,
        default: true
      },
})
const slots = useSlots();
</script>

<style lang="less">
  @import (reference) '../styles/common.less';

  .panel-title {
    .section-title;
    padding: 5px 15px;
  }

  .panel-extra {
    line-height: 40px;
    .ivu-input-icon {
      line-height: 40px;
    }
    ul.filter {
      > li {
        display: inline-block;
        padding: 0 10px;
      }
    }
  }
  .panel-default {
    word-break: break-all;
    word-wrap: break-word;
  }
</style>
