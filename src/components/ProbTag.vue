<script>
export default{
  props:{
    type:{
      required: false,
      type: String,
      default:"major",
    },
    closable:{
      required: false,
      type: Boolean,
      default: false,
    },
  },
  methods:{
    doClose(){
      this.$emit("on-close");
    },
    click(){
      this.$emit("click");
    }
  },
  computed:{
    tagClass(){
      if(this.type == "major"){
        return "problem-tag-major";
      }
      else{
        return "problem-tag-sub";
      }
    }
  }
}

</script>

<template>
  <!-- <Button icon="ios-pricetag" size="small" :class="tagClass" @click="click">
    <slot></slot>
  </Button> -->
  <Tag :class="tagClass" @click="click" :closable="closable" size="medium" @on-close="doClose">
    <Icon type="ios-pricetag"></Icon>
    <slot></slot>
  </Tag>
</template>

<style lang="less">
.problem-tag-major{
  margin: 4px;
  background-color: rgb(237,237,255);
  cursor: pointer;
}
.problem-tag-sub{
  margin: 4px;
  background-color: rgb(237,255,237);
  cursor: pointer;
}
</style>
