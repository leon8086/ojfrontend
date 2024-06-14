<template>
  <div style="margin: 0px 0px 15px 0px">
    <Row type="flex" justify="space-between" class="header">
      <Col :span=12>
      <div>
        <span>{{$t('m.Language')}}:</span>
        <Select v-model="language" @on-change="optChanged" class="adjust">
          <Option v-for="(item, index) in props.languageSets" :key="index" :value="item">{{item}}
          </Option>
        </Select>

        <Tooltip :content="this.$i18n.t('m.Reset_to_default_code_definition')" placement="top" style="margin-left: 10px">
          <Button icon="ios-refresh" @click="onResetClick"></Button>
        </Tooltip>

      </div>
      </Col>
      <Col :span=12>
      <div class="fl-right">
        <span>{{$t('m.Theme')}}:</span>
        <Select v-model="theme" @on-change="optChanged" class="adjust">
          <Option v-for="(item, index) in theme_options" :key="item.id" :value="item.id">{{item.title}}
          </Option>
        </Select>
      </div>
      </Col>
    </Row>
    <codemirror
      v-model="code"
      placeholder=""
      :style="style"
      :indent-with-tab="true"
      :tab-size="4"
      :extensions="extensions"
      @ready="handleReady"
      @change="codeChanged"
      @input="codeChanged"
    />
  </div>
</template>
<script>
  //import utils from '@/utils/utils'
  import { defineComponent, ref, watch, shallowRef } from 'vue';
  import { Codemirror } from 'vue-codemirror';
  import { Compartment } from '@codemirror/state';
  import { javascript } from '@codemirror/lang-javascript';
  import { cpp } from '@codemirror/lang-cpp';
  import { python } from '@codemirror/lang-python';
  import { java } from '@codemirror/lang-java';
  import { clouds, tomorrow, dracula, cobalt, boysAndGirls } from 'thememirror';
  import {githubLight} from '@ddietr/codemirror-themes/github-light';
  import {githubDark} from '@ddietr/codemirror-themes/github-dark';
  export default defineComponent({
    components: {
      Codemirror
    },
    props:{
      modelValue:{
        type: String,
      },
      languageSets:{
        type: Object,
        default:[
          'C',
          'C++',
          'Java',
          'Python',
          'JavaScript',
        ]
      },
      defaultLanguage:{
        type:String,
        default:"C++",
      },
      style:{
        type:Object,
        default:{height:'830px'}
      }
    },
    setup(props, ctx) {
      const FULL_LANG_OPTION = {
        "C": cpp(),
        "C++": cpp(),
        "Java": java(),
        "Python": python(),
        "JavaScript": javascript(),
      };
      let lang_comp = new Compartment;
      let theme_comp = new Compartment;
      const style = {
        fontSize: '100%',
      }
      Object.assign(style, props.style);
      let theme_options = [
        { id:'0',title:'Clouds',theme:clouds},
        { id:'1',title:'Tomorrow',theme:tomorrow},
        { id:'2',title:'Dracular(dark)',theme:dracula},
        { id:'3',title:'Cobalt(dark)',theme:cobalt},
        { id:'4',title:'Boys And Girls(dark)',theme:boysAndGirls},
        { id:'5',title:'Github',theme:githubLight},
        { id:'6',title:'Github(dark)',theme:githubDark},
      ]
      const code = ref(props.modelValue);
      const extensions = [lang_comp.of(cpp()), theme_comp.of(clouds)]

      let getDefaultLanguage = function( defLang, LangSet){
        let default_lang = LangSet[0];
        for( let i=0; i<LangSet.length; ++i ){
          if(LangSet[i] == defLang){
            return defLang;
          }
        }
        return default_lang;
      }
      const language = ref(getDefaultLanguage(props.defaultLanguage, props.languageSets));
      const theme = ref(`0`);

      watch(()=>props.defaultLanguage,(newVal, oldVal)=>{
        language.value = getDefaultLanguage(newVal, props.languageSets);
      })

      watch(()=>props.languageSets,(newVal, oldVal)=>{
        language.value = getDefaultLanguage(props.defaultLanguage, props.languageSets);
      })

      watch(()=>props.modelValue,(newVal, oldVal) =>{
        code.value = newVal;
      })

      watch(code,(newVal, oldVal) =>{
        ctx.emit("update:modelValue", code.value);
      })

      watch(language, (newVal, oldVal) =>{
        ctx.emit("languageChanged", language.value)
      })
      
      let codeChanged = function(){
        ctx.emit("update:modelValue", code.value);
      }

      // Codemirror EditorView instance ref
      const view = shallowRef()
      const handleReady = (payload) => {
        view.value = payload.view
      }

      const optChanged = () =>{
        let lang = FULL_LANG_OPTION[language.value];
        view.value.dispatch({ effects:lang_comp.reconfigure(lang)});
        let theme_op = theme_options[theme.value].theme;
        view.value.dispatch({ effects:theme_comp.reconfigure(theme_op)});
      }
      const onResetClick = () =>{
      }

      return {
        props,
        code,
        extensions,
        optChanged,
        handleReady,
        style,
        language,
        theme,
        theme_options,
        onResetClick,
        codeChanged,
      }
    }
  });
</script>

<style lang="less" scoped>
  .header {
    margin: 5px 5px 15px 5px;
    .adjust {
      width: 150px;
      margin-left: 10px;
    }
    .fl-right {
      float: right;
    }
  }
</style>

<style>
  .cm-line{
    font-family: Menlo,Monaco,Consolas,'Courier New',monospace;
  }
  .cm-editor{
    border: solid lightgray thin;
  }
  .fl-right{
    margin-right: 20px;
  }
</style>
