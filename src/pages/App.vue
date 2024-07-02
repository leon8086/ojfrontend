<script>
import NavBar from '@/components/NavBar.vue';
import XMUTFooter from "@/components/XMUTFooter.vue";
import api from '@/api';
import utils from "@/utils"

export default{
    components:{
        NavBar,
        XMUTFooter,
    },
    data(){
        return {
            message:"Hello",
            exams:[],
            homeworks:[],
            whenEnter: false,
            selectedExam: null,
        };
    },
    methods:{
        confirmExam(id){
            this.selectedExam = id;
            this.whenEnter=true;
        },
        enterExam(id){
            window.location.href="/exam.html?id="+this.selectedExam.toString();
        }
    },
    mounted(){
        let self = this;
        api.getExamList()
        .then(resp=>{
            console.log(resp.data);
            self.exams = resp.data;
            self.exams.forEach( (item) =>{
                item.time_remains = utils.duration(Date.now(), item.endTime);
                let count = 0;
                item.problemConfig.forEach((i)=>{
                    count += i.quantity;
                })
                item.count = count;
            })
        }, err=>{
            console.log(err)
        })

        setInterval(()=>{
            self.exams.forEach( (item) =>{
                item.time_remains = utils.duration(Date.now(), item.endTime);
            })
        }, 1000)
    }
}
</script>

<template>
  <Layout>
    <NavBar :activeMenu="'/'"></NavBar>
    <div class="content-app">
    <Content :style="{ padding: '0 50px' }">
        <Card class="section">
            <template #title>
                <h2>
                    我的考试
                </h2>
            </template>
            <template #extra>
                <h4>
                    {{ exams.length }} 场
                </h4>
            </template>
            <Row>
                <Col :span="8">
                <Card v-for=" item, key in exams" class="exam-card" @click="confirmExam(item.id)">
                    <template #title>
                        <h3>
                            {{ item.title }}
                        </h3>
                    </template>
                    <template #extra>
                        剩余时间：{{ item.time_remains }}
                    </template>
                    <div class="content">
                        <p>
                            {{ item.description }}
                        </p>
                        <p style="text-align: right;">
                            共{{ item.count }}题
                        </p>
                    </div>
                </Card>
                </Col>
            </Row>
        </Card>
        <Card class="section">
            <template #title>
                <h2>
                    我的作业
                </h2>
            </template>
            <Row>
                <Col :span="6">
                <Card class="exam-card" @click="enterExam()">
                    开始作业
                </Card>
                </Col>
            </Row>
        </Card>
        <Modal v-model="whenEnter" title="考试须知" ok-text="进入考试" cancel-text="返回" @on-ok="enterExam(selectedExam)">
            <p style="padding-left:20px">
                <ol>
                    <li>考试途中<span style="font-weight: bold;">不要关闭页面</span>，有可能导致数据错误或丢失你的代码</li>
                    <li>考试途中<span style="font-weight: bold;">不要中途退出登录，可能会被判为作弊！</span></li>
                    <li>每个人的考题都是<span style="font-weight: bold;">随机抽取</span>的，请勿作弊</li>
                    <li>考试过程中将关闭提交代码的查询功能，直至结束考试。</li>
                    <li>请注意提交时间，避免超时</li>
                    <li>每道题的得分以<span style="font-weight: bold;">最高得分</span>为准</li>
                    <li>点击下方按钮开始考试</li>
                </ol>
            </p>
        </Modal>
    </Content>
    </div>
    <XMUTFooter></XMUTFooter>
    </Layout>
</template>

<style lang="less">
.exam-card{
    cursor:pointer;
    border: solid thin var(--xmut-cs-mid);
    .ivu-card-head{
        background-color:var(--xmut-cs-color);
        color: white;
    }
    .ivu-card-extra{
        color: white;
    }
    margin: 10px 50px;
}


.ivu-card-head{
    color:var(--xmut-cs-color);
    border-bottom: thin solid var(--xmut-cs-color);
}

.exam-card:hover{
    box-shadow: 0 1px 6px 2px var(--xmut-cs-color);
}

.section{
    margin-bottom: 20px;
}
</style>
