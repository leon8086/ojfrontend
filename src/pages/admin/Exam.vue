<script>
import XMUTFooter from "@/components/XMUTFooter.vue";
import TitledPanel from "@/components/TitledPanel.vue";
import ProblemSelector from "@/components/ProblemSelector.vue";
import NavBarAdmin from "@/components/NavBarAdmin.vue";
import ProbTag from "@/components/ProbTag.vue";
import { DIFFICULTY_COLOR } from "@/utils/constants";
import { isAdmin, isSuperAdmin } from "@/utils/globalInfo";
import api from "@/api";
import utils from "@/utils"
import dayjs from 'dayjs';

export default{
  components:{
    XMUTFooter,
    TitledPanel,
    ProblemSelector,
    NavBarAdmin,
    ProbTag,
  },
  data() {
    return{
      DIFFICULTY_COLOR,
      id:null,
      userInfo : {login:false},
      content :"",
      formValue : {
        title:"",
        description:"",
        timeRange:[new Date(), new Date()],
        ipRange:"",
        examCourse:null
      },
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
        ],
        examCourse:[
          { required: true, message:"请设置考试课程" }
        ],
        ipRange:[
          { validator:this.validateIpRange }
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
      courseList:[],
    }
  },
  methods: {
    validateIpRange(rule, value, callback) {
      if (value === "") {
        callback();
        return;
      }
      else {
        value = value.split(";");
        value.forEach( item =>{
          if( item.search(/^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/) == -1 ){
            callback(new Error("格式错误"))
            return;
          }
        })
      }
      callback();
    },

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
        let ipRange=[];
        if(this.formValue.ipRange != ""){
          ipRange = this.formValue.ipRange.split(";");
        }
        let params = {
          id: this.id,
          title: this.formValue.title,
          description: this.formValue.description,
          createdById: 1,
          startTime: this.formValue.timeRange[0],
          endTime: this.formValue.timeRange[1],
          problemConfig: this.problemSet,
          courseId: this.formValue.examCourse,
          allowedIpRanges: ipRange,
        }
        api.adminUpdateExam(params)
        .then( resp=>{
          this.$Message.success("保存成功");
          window.location.href="./exam-list.html";
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
      let duration = dayjs.duration(dayjs(this.formValue.timeRange[1]).diff(dayjs(this.formValue.timeRange[0]), 'seconds'), 'seconds')
      let h = Math.floor(duration.asHours());
      let m = duration.minutes();
      let ret = Math.floor(duration.asHours()).toString() + " 小时 ";
      if( m==0 ){
        return ret;
      }
      ret += m.toString();
      ret += " 分钟 ";
      return ret;
    },
    isModifyExam(){
      return (this.id != null);
    }
  },
  watch:{
  },
  mounted(){
    this.id = utils.getUrlKey("id");
    api.adminGetAllCourseBrief()
    .then(resp=>{
      // console.log(resp.data);
      for( let key in resp.data ){
        this.courseList.push({name:key, courses:resp.data[key]});
      }
      if( this.formValue.examCourse == null ){
        this.formValue.examCourse = this.courseList[0].courses[0].id;
      }
    }, err=>{
    })
    if( this.id != null ){
      api.adminGetExam( this.id )
      .then(resp=>{
        this.formValue.title = resp.data.title;
        this.formValue.description = resp.data.description;
        this.formValue.timeRange = [new Date(resp.data.startTime), new Date(resp.data.endTime)];
        this.formValue.ipRange = (resp.data.allowedIpRanges).join(";");
        this.formValue.examCourse = resp.data.courseId;
        this.problemSet = resp.data.problemConfig;
      },err=>{
      })
    }
  }
}
</script>


<template>
  <NavBarAdmin active-menu="./exam-list.html" v-model="userInfo"></NavBarAdmin>
  <div class="content-app">
    <Content :style="{ padding: '0 50px' }">
      <TitledPanel id="problem-info">
        <template #title>
          <div>
            <template v-if="isModifyExam">
              编辑考试 ({{ id }})
            </template>
            <template v-else>
              新建考试
            </template>
            <!-- <Button @click="console.log(problemSet)">看</Button> -->
          </div>
        </template>
        <Form ref="formValue" :model="formValue" :rules="formRule" :label-width="80">
          <Row :gutter="20">
            <Col span="6">
            <FormItem label="考试课程" prop="examCourse">
              <Select v-model="formValue.examCourse" :disabled="isModifyExam">
                <OptionGroup v-for="owner, key in courseList" :label="owner.name">
                  <Option v-for="item,k1 in owner.courses" :value="item.id">{{ item.courseName+" -  "+item.owner }}</Option>
                </OptionGroup>
              </Select>
            </FormItem>
            </Col>
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
            <Col span="10">
            <FormItem label="ip限制" prop="ipRange">
              <Input v-model="formValue.ipRange" placeholder="ip限制"></Input>
              <span>格式：网段/掩码，以英文分号<code>;</code>分割。例如（192.168.1.0/24;192.169.0.0/16）</span>
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
                    <a :href="'../problem.html?id='+item.id" target="_blank">
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
        <Button type="primary" long @click="saveExam('formValue')">
          <template v-if="id==null">
            新建并发布考试
          </template>
          <template v-else>
            保存并发布考试
          </template>
        </Button>
      </div>
    </Content>
  </div>
  <Modal v-model="selectVisible" width="1200" style="top:20px">
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
