import mavonEditor from 'mavon-editor';
import 'mavon-editor/dist/css/index.css';
import initApp from "../initapp";
import Exam from '@/pages/admin/Exam.vue';

const app = initApp(Exam)
app.use(mavonEditor);
app.mount("#app");