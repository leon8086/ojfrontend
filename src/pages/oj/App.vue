<script setup>
import NavBar from '@/components/NavBar.vue';
import XMUTFooter from "@/components/XMUTFooter.vue";
import UserStatistic from '@/components/UserStatistic.vue';
import UserSubmission from '@/components/UserSubmission.vue';
import api from '@/api';
import utils from "@/utils";
import { useCheckLogin, isAdmin  } from '@/utils/globalInfo';
import { watch, ref, reactive, onMounted, resolveComponent } from 'vue';
import { Switch } from 'view-ui-plus';

const exams = ref([]);
const homeworks = ref([]);
const whenEnter = ref(false);
const selectedExam = ref(null);
const examTitle = ref("我的考试");
const examHomework = ref("我的作业")
const userInfo = ref({ id:null, login:false});

const confirmExam = function(id) {
  this.selectedExam = id;
  if (!isAdmin(this.userInfo)) {
    this.whenEnter = true;
  }
  else {
    window.location.href = "./exam-rank.html?id=" + this.selectedExam.toString();
  }
};

const enterExam = function(id){
  window.location.href = "./exam.html?id=" + this.selectedExam.toString();
}

const statistic = ref(null);
const submission = ref(null);

watch(()=>userInfo.value.id, (oldVal, newVal)=>{
  if( newVal != oldVal ){
    api.getProblemAllBrief()
    .then(resp=>{
      api.getUserStatus()
      .then(status=>{
        statistic.value.loadData( resp.data, status.data );
        submission.value.loadData( resp.data, status.data );
      });
    });
  }
})

onMounted(()=>{
  useCheckLogin(userInfo);
  api.getExamListValid()
    .then(resp => {
      //console.log(resp.data);
      exams.value = resp.data;
      exams.value.forEach((item) => {
        let start = new Date(item.startTime);
        if (Date.now() < start) {
          item.remains = { color: "default", message: "尚未开始" };
        }
        else {
          item.remains = utils.duration(Date.now(), item.endTime);
          item.remains.message = "剩余:" + item.remains.message;
        }
      });
    });
});

const showDetail = ref(false);
</script>

<template>
  <Layout>
    <NavBar activeMenu="./" v-model="userInfo"></NavBar>
    <div class="content-app">
      <Content :style="{ padding: '0 50px' }">
        <Row :gutter="20">
          <Col :span="14">
          <Card>
            <template #title>
              <h2>
              我的信息
              </h2>
              <!-- <Button @click="console.log(exams)">看</Button> -->
            </template>
            <div style="min-height: 300px;">
              <UserStatistic ref="statistic"></UserStatistic>
              <Divider></Divider>
              显示详细提交记录：
              <Switch v-model="showDetail" size="large">
                <template #open>
                  显示
                </template>
                <template #close>
                  关闭
                </template>
              </Switch>
              <UserSubmission ref="submission" :visible="showDetail"></UserSubmission>
            </div>
          </Card>
          </Col>
          <Col :span="10">
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
              <Col :span="12" v-for=" item, key in exams">
              <Card class="exam-card" @click="confirmExam(item.id)">
                <template #title>
                  <h3>
                    {{ item.title }}
                  </h3>
                </template>
                <template #extra>
                  <Tag :color="item.remains.color">{{ item.remains.message }}</Tag>
                </template>
                <div class="content">
                  <p>
                    {{ item.description }}
                  </p>
                  <p style="text-align: right;">
                    共{{ item.problemCount }}题
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
            没做完，请感谢<a href="https://store.steampowered.com/app/2358720/_/" style="font-size:200%; color:red; font-weight: bold;">黑神话：悟空</a>
          </Card>
          </Col>
        </Row>
        <Modal v-model="whenEnter" title="考试须知" ok-text="进入考试" cancel-text="返回"
          @on-ok="enterExam(selectedExam)">
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
.exam-card {
  cursor: pointer;
  border: solid thin var(--xmut-cs-mid);

  .ivu-card-head {
    background-color: var(--xmut-cs-color);
    color: white;
  }

  .ivu-card-extra {
    color: white;
  }

  margin: 10px 10px;
}


.ivu-card-head {
  color: var(--xmut-cs-color);
  border-bottom: thin solid var(--xmut-cs-color);
}

.exam-card:hover {
  box-shadow: 0 1px 6px 2px var(--xmut-cs-color);
}

.section {
  margin-bottom: 20px;
}
</style>
