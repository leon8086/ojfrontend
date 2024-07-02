import mavonEditor from 'mavon-editor';
import 'mavon-editor/dist/css/index.css';
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import initApp from "../initapp";
import Exam from '@/pages/admin/Exam.vue';

const app = initApp(Exam)
app.use(mavonEditor);
app.use(ElementPlus);
app.mount("#app");