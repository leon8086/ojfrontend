import ViewUIPlus from 'view-ui-plus';
import 'view-ui-plus/dist/styles/viewuiplus.css';
import { createApp } from 'vue'
import '../styles/index.less'
import i18n from '../i18n'
import '../assets/main.css'
import katex from '../plugins/katex';
import '../styles/def.less'

const initApp = function(module, element){
    const app = createApp(module);
    return app.use(katex).use(i18n).use(ViewUIPlus).mount(element);
}
export default initApp ;