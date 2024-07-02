import ViewUIPlus from 'view-ui-plus';
import 'view-ui-plus/dist/styles/viewuiplus.css';
import { createApp } from 'vue'
import '@/styles/def.less'
import '@/styles/index.less'
import i18n from '../i18n'
import '@/assets/main.css'
import katex from '@/plugins/katex';
import hljs from 'highlight.js/lib/core';

hljs.highlightAll();

import 'highlight.js/styles/github.css'
import 'highlight.js/lib/common';
import hljsVuePlugin from "@highlightjs/vue-plugin";

const initApp = function(module){
    const app = createApp(module);
    return app.use(hljsVuePlugin).use(katex).use(i18n).use(ViewUIPlus);
}

export default initApp ;