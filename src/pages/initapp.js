import ViewUIPlus from 'view-ui-plus';
import 'view-ui-plus/dist/styles/viewuiplus.css';
import '../styles/index.less'
import { createApp } from 'vue'
import i18n from '../i18n'
import '../assets/main.css'
import VueClipboard from 'vue-clipboard2'
import katex from '../plugins/katex';

//  Object.assign(messages[locale].m, module.m);

const initApp = function(module, element){
    const app = createApp(module);
    return app.use(katex).use(VueClipboard).use(i18n).use(ViewUIPlus).mount(element);
}
export default initApp ;