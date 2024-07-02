<script>
import XMUTFooter from "@/components/XMUTFooter.vue";
import TitledPanel from "../../components/TitledPanel.vue";
import ProblemSelector from "../../components/ProblemSelector.vue";
import NavBarAdmin from "../../components/NavBarAdmin.vue";
import { DIFFICULTY_COLOR } from "../../utils/constants";
import api from "@/api";
import utils from "@/utils"
import moment from 'moment';

export default{
  components:{
    XMUTFooter,
    TitledPanel,
    ProblemSelector,
    NavBarAdmin,
  },
  data() {
    return{
      DIFFICULTY_COLOR,
      id:null,
      content :"",
      formValue : {title:"",description:"",timeRange:["",""], ipRange:""},
      formRule : {
        title:[
          { required: true, message:"请输入考试名称", trigger:'blur' },
        ],
        timeRange:[
          { required: true, type:'array', message:"请设置考试时间",
            fields:{
              0:{ required: true, type:'date', message:'起始时间不能为空',trigger:'change'},
              1:{ required: true, type:'date', message:'结束时间不能为空',trigger:'change'},
            }
          },
        ]
      },
      problemSetColumns: [
        {
          title: '#',
          slot: 'no',
          width: 100,
          align: 'center'
        },
        {
          title: '抽题数',
          slot: 'quantity',
          width: 150,
          align: 'center'
        },
        {
          title: '抽题范围',
          slot: 'range',
          align: 'center'
        },
        {
          title: '操作',
          slot: 'action',
          width: 150,
          align: 'center'
        }
      ],
      problemSet: [
      ],
      currentProblem: 0,
      selectVisible: false,
    }
  },
  methods: {
    show(i) {
      this.currentProblem = i;
      this.selectVisible = true;
    },
    remove(i) {
      this.currentProblem = 0;
      this.problemSet.splice(i,1);
    },
    addProblem(){
      this.problemSet.push({quantity:1,problems:{}});
      this.currentProblem = 0;
    },
    checkProblemsValidation(){
      if( this.problemSet.length == 0 ){
        this.$Message.error("题目不能为空！");
        return false;
      }
      for( let i=0; i<this.problemSet.length; ++i ){
        let p = this.problemSet[i];
        console.log(p.quantity, p.problems);
        if(p.quantity > Object.keys(p.problems)){
          this.$Message.error("第"+(i+1).toString()+"题，未提供足够的抽题范围");
          return false;
        }
      }
      return true;
    },
    saveExam(name){
      this.$refs[name].validate((valid)=>{
        if(!valid) {
          this.$Message.error("字段填写不完整!");
          return;
        }
        if (!this.checkProblemsValidation()) {
          return;
        }
        let params = {
          id: this.id,
          title: this.formValue.title,
          description: this.formValue.description,
          createdById: 1,
          startTime: this.formValue.timeRange[0],
          endTime: this.formValue.timeRange[1],
          problemConfig: [],
        }
        for (let i = 0; i < this.problemSet.length; ++i) {
          let problems = [];
          for (let j in this.problemSet[i].problems ) {
            problems.push(j)
          }
          params.problemConfig.push({ quantity: this.problemSet[i].quantity, problems: problems });
        }
        api.adminUpdateExam(params)
        .then( resp=>{
          console.log(resp.data);
        }, err=>{
          console.log(err.data);
        })
      })
    },
  },
  computed:{
    timeLast(){
      if( this.formValue.timeRange[0] == "" || this.formValue.timeRange[1] == ""){
        return "";
      }
      let duration = moment.duration(moment(this.formValue.timeRange[1]).diff(moment(this.formValue.timeRange[0]), 'seconds'), 'seconds')
      let h = Math.floor(duration.asHours());
      let m = duration.minutes();
      let ret = Math.floor(duration.asHours()).toString() + " 小时 ";
      if( m==0 ){
        return ret;
      }
      ret += m.toString();
      ret += " 分钟 ";
      return ret;
    }
  },
  mounted(){
    this.id = utils.getUrlKey("id");
    if( this.id != null ){
      api.adminGetExam( this.id )
      .then(resp=>{
        console.log(resp);
        this.formValue.title = resp.data.title;
        this.formValue.description = resp.data.description;
        this.formValue.timeRange = [new Date(resp.data.startTime), new Date(resp.data.endTime)];
        this.formRule.ipRange = resp.data.ipRange;
        let config = resp.data.problemConfig;
        for( let i=0; i< config.length; ++i){
          let tmp = {quantity:config[i].quantity, problems:{}};
          for( let j=0; j<config[i].problems.length; ++j){
            tmp.problems[config[i].problems[j].id] = config[i].problems[j];
          }
          this.problemSet.push(tmp);
        }
      },err=>{
      })
    }
  }
}
</script>


<template>
  <NavBarAdmin></NavBarAdmin>
  <div class="content-app">
    <Content :style="{ padding: '0 50px' }">
      <TitledPanel id="problem-info">
        <template #title>
          <div>
            编辑考试
            <Button @click="console.log(problemSet)">查看</Button>
          </div>
        </template>
        <Form ref="formValue" :model="formValue" :rules="formRule" :label-width="80">
          <Row>
            <Col span="12">
            <FormItem label="考试名称" prop="title">
              <Input v-model="formValue.title" placeholder="考试名称"></Input>
            </FormItem>
            </Col>
          </Row>
          <FormItem label="考试描述" prop="description">
            <Input v-model="formValue.description" type="textarea" :rows="10"></Input>
          </FormItem>
          <FormItem label="考试时间" prop="timeRange">
            <DatePicker type="datetimerange" format="yyyy年MM月dd日 HH:mm"
            placeholder="选择考试时间" style="width: 350px" v-model="formValue.timeRange"/>
            <span style="padding-left:20px">考试时长：{{ timeLast }}</span>
          </FormItem>
          <Row>
            <Col span="12">
            <FormItem label="ip限制" prop="ip_range">
              <Input v-model="formValue.ipRange" placeholder="ip限制"></Input>
            </FormItem>
            </Col>
          </Row>
        </Form>
      </TitledPanel>
      <TitledPanel id="problem-set">
        <template #title>
          <div style="display: flex; justify-content: space-between;">
            <div>
              题目设置
            </div>
            <div>
              <Button type="primary" @click="addProblem()">
                <Icon type="md-add"></Icon>
                增加
              </Button>
            </div>
          </div>
        </template>
        <Table :columns="problemSetColumns" :data="problemSet" disabled-hover>
          <template #no="{ row, index }">
            {{ index+1 }}
          </template>
          <template #quantity="{ row, index }">
            <span style="margin-right:5px">抽</span>
            <InputNumber v-model="problemSet[index].quantity" :min="1" :max="10" :style="{width:'50px'}"></InputNumber>
            <span style="margin-left: 5px">题</span>
          </template>
          <template #range="{ row }">
            <template v-if="Object.keys(row.problems).length == 0">
              未选择
            </template>
            <template v-else>
              <Row>
                <Col :span="8" v-for="item, key in row.problems">
                  <div class="problem-info">
                    <a :href="'/problem?id='+item.id" target="_blank">
                      {{ item.title }}
                    <Tag :color="DIFFICULTY_COLOR[item.difficulty]">
                      {{ $t("m."+item.difficulty) }}
                    </Tag>
                    </a>
                  </div>
                </Col>
              </Row>
            </template>
          </template>
          <template #action="{ row, index }">
            <Button type="primary" ghost size="small" style="margin-right: 5px" @click="show(index)">
              <Icon type="ios-create" color="primary"></Icon>
            </Button>
            <Button type="primary" ghost size="small" @click="remove(index)">
              <Icon type="md-trash" color="primary"></Icon>
            </Button>
          </template>
        </Table>
      </TitledPanel>
      <div style="margin: 20px auto; width:60%">
        <Button type="primary" long @click="saveExam('formValue')"> 保存并发布考试 </Button>
      </div>
    </Content>
  </div>
  <Modal v-model="selectVisible" width="700" style="top:20px">
    <template #header>
      <div style="text-align: center;">
        <h2>选择抽题范围</h2>
      </div>
    </template>
    <template v-if="problemSet.length == 0">
      <div>空</div>
    </template>
    <template v-else>
      <ProblemSelector v-model="problemSet[currentProblem].problems"></ProblemSelector>
    </template>
  </Modal>
  <XMUTFooter></XMUTFooter>
</template>

<style lang="less">
#problem-info{
  padding: 10px 20px 20px 20px;
}

#problem-set{
  margin-top: 20px;
  padding: 10px 20px 20px 20px;
}

.problem-info{
  padding: 5px;
}
</style>
