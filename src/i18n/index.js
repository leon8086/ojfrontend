//import {Vue} from 'vue'
import {createI18n} from 'vue-i18n'
import zh from 'view-ui-plus/dist/locale/zh-CN';
import en from 'view-ui-plus/dist/locale/en-US';
import tw from 'view-ui-plus/dist/locale/zh-TW';

const languages = [
  {value: 'en-US', label: 'English'},
  {value: 'zh-CN', label: '简体中文'},
  {value: 'zh-TW', label: '繁體中文'}
]
const messages = {}

let glob = import.meta.glob('./oj/*.js');
for( const key in glob ){
  let module = await glob[key]();
  let locale = key.replace(/\.\/oj\/(.*)\.js/,'$1');
  messages[locale] = {m: module.m}
}

glob = import.meta.glob('./admin/*.js');
for( const key in glob ){
  let module = await glob[key]();
  let locale = key.replace(/\.\/admin\/(.*)\.js/,'$1');
  Object.assign(messages[locale].m, module.m);
}

// iview i18n;
messages['zh-CN'].i = zh.i;
messages['en-US'].i = en.i;
messages['zh-TW'].i = tw.i;

let i18n = new createI18n({
  locale: 'zh-CN',
  messages: messages
});

export default i18n;
export {languages};