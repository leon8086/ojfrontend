<template>
  <div>
    <highlightjs autodetect :code="code" />
  </div>
</template>

<script>
  export default {
    name: 'highlight',
    data () {
      return {
        styleObject: {
          'border-left': '2px solid green'
        }
      }
    },
    props: {
      language: {
        type: String
      },
      code: {
        required: true,
        type: String
      },
      borderColor: {
        type: String,
        default: 'green'
      }
    },
    watch: {
      'borderColor' (newVal, oldVal) {
        this.styleObject['border-left'] = '2.5px solid ' + newVal
      }
    }
  }
</script>

<style scoped lang="less">
  pre {
    padding: 0;
    display: block;
    code {
      padding: 20px;
      font-size: 1.1em;
    }
  }
</style>
