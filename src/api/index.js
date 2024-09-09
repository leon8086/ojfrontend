import axios from 'axios'
import qs from 'qs';
import { Modal } from 'view-ui-plus'
import { getUserLoginInfo } from '@/utils/globalInfo';
import CollapseList from "@/components/CollapseList.vue"

//axios.defaults.baseURL = '//localhost:8081/';
axios.defaults.baseURL = '//localhost/dsapi/';

const RETURN_CODE = {
    SUCCESS:100,
    GENERAL_ERROR:200,
    LOGIN_FAILED:210,
    AUTHENTICATION_FAILED:211,
    ACCESS_DENIED:212,
    EXAM_FAILUE:213,
    WRONG_PARAMS:220,
    INVALID_FILE_CONTENT:230,
    FILE_TOO_LARGE:231,
    UNSUPPORT_FILE:232,
    UPLOAD_FAILED:233,
};

const withToken = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
    timeout: 5000,
})

const withoutToken = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
    timeout: 5000,
})

const errorDealer = function (data) {
    if (data.code == RETURN_CODE.AUTHENTICATION_FAILED) {
        Modal.error({
            title: "请先登录",
            content: "没有登录<br>请点击跳转登录页面",
            okText: "去登录",
            onOk: ()=>{ window.location.href="./login.html"; },
        });
    }
    else if (data.code == RETURN_CODE.ACCESS_DENIED) {
        Modal.error({
            title: "权限不足",
            content: "无法执行操作",
        });
        return data;
    }
    else if( data.code == RETURN_CODE.EXAM_FAILUE){
        Modal.error({
            title: "考试错误",
            content: data.data.message,
            okText: "返回主页",
            onOk: ()=>{ window.location.href="./"; },
        });
    }
    else if( data.code == RETURN_CODE.GENERAL_ERROR){
        let mostSpec = "未知错误";
        if( data.data.localizedMessage != null){
            mostSpec = data.data.localizedMessage;
        }
        if( data.data.message != null){
            mostSpec = data.data.message;
        }
        if( data.data.cause != null && data.data.cause.message != null){
            mostSpec = data.data.cause.message;
        }
        if( data.data.cause != null && data.data.cause.localizedMessage != null){
            mostSpec = data.data.cause.localizedMessage;
        }
        if( data.data.mostSpecificCause != null && data.data.mostSpecificCause.localizedMessage != null){
            mostSpec = data.data.mostSpecificCause.localizedMessage;
        }
        let content = "";
        if( data.data.localizedMessage ){
            let cause = data.data.localizedMessage.split("\n");
            cause = cause.join("</p><p>");
            content = "<p>" + cause + "</p>";
        }
        else{
        }
        let stack = data.data.stackTrace;
        Modal.error({
            title: mostSpec,
            width: 800,
            closable: true,
            render: (h => {
                return h(CollapseList,
                    {
                        title: '调用栈',
                        columns: [
                            {
                                title: "class",
                                key: "className",
                            },
                            {
                                title: "line",
                                key: "lineNumber",
                            },
                            {
                                title: "method",
                                key: "methodName",
                            },
                        ],
                        data: stack,
                    });
            })
        });
        return data;
    }
    return Promise.reject(data);
}

withoutToken.interceptors.response.use(res=>{
    if (res.data.code == RETURN_CODE.SUCCESS) {
        return res.data;
    }
    return errorDealer(res.data);
}, err => {
    return Promise.reject(err);
});


withToken.interceptors.response.use(res=>{
    const resType = Object.prototype.toString.call(res.data);
    const isBlob = resType === '[object Blob]';
    if(isBlob){
        return res.data;
    }
    if (res.data.code == RETURN_CODE.SUCCESS) {
        return res.data;
    }
    return errorDealer(res.data);
}, err => {
    return Promise.reject(err);
});

withToken.interceptors.request.use(config=>{
    let userInfo = getUserLoginInfo();
    config.headers.Authorization = userInfo.token;
    return config;
}, err => {
    console.log(err);
})

export default {
    // admin tag
    adminNewTag( param ){
        return post("admin/tag/new", param);
    },
    adminGetMajorTagList( param ){
        return get("admin/tag/list-major", param );
    },

    // tag

    // admin problem
    adminGetProblemList( query ){
        return get("admin/problem/list", query);
    },
    adminGetProblemListBrief( query ){
        return get('admin/problem/list_brief', query);
    },
    adminSetVisibility( ids, visible ){
        return post("admin/problem/visible", { ids, visible });
    },
    adminSetAllVisibility( visible ){
        return post("admin/problem/all-visible", { visible });
    },
    adminImportProblems( file, progress ){
        //return withToken.request();
        return withToken.request("admin/problem/import",
            {
                method:'POST',
                upload:true,
                data:{file},
                timeout: 900000,
                headers: {'Content-Type': 'multipart/form-data'},
                maxBodyLength: 10000000000,
                maxContentLength: 10000000000,
                onUploadProgress:progress,
            });
    },
    adminExportProblems( idList ){
        return post("admin/problem/export", idList, {responseType:'blob',timeout:900000});
    },
    adminExportAllProblems(){
        return post("admin/problem/export-all", {}, {responseType:'blob', timeout:900000});
    },
    adminGetProblemDetail( id ){
        return get("admin/problem/detail", {id});
    },
    adminNewProblem( data, file, progress ){
        let formData = new window.FormData();
        formData.append("form", new Blob([JSON.stringify(data)],{type:"application/json"}));
        formData.append("file", file);
        return withToken.request("admin/problem/new",
            {
                method:'POST',
                upload:true,
                data:formData,
                timeout: 900000,
                headers: {'Content-Type': 'multipart/form-data'},
                onUploadProgress:progress,
            });
    },
    adminUpdateProblem( data, file, progress ){
        let formData = new window.FormData();
        let url = "admin/problem/update";
        if( file ){
            formData.append("file", file);
            url = "admin/problem/update-with-cases";
        }
        formData.append("form", new Blob([JSON.stringify(data)],{type:"application/json"}));
        return withToken.request(url,
            {
                method:'POST',
                upload:true,
                data:formData,
                timeout: 900000,
                headers: {'Content-Type': 'multipart/form-data'},
                onUploadProgress:progress,
            });
    },

    // problem
    getProblemList( query ){
        return withToken.get( "problem/list", {params:query, paramsSerializer: params =>{
            return qs.stringify(params, {indices: false});
        }})
        //return get('problem/list', query);
    },
    getProblemDetail( id ){
        return get('problem/detail', {id});
    },
    getTags(){
        return get('tag/list');
    },
    getProblemAllBrief(){
        return get('problem/brief-all');
    }
    ,

    // submission
    submitCode(data){
        return post('submission/submit',data);
    },
    getSubmission(id){
        return get('submission/get',{id});
    },
    getSubmissionResult(id){
        return get('submission/result',{id});
    },
    getSubmissionList( query ){
        return get('submission/list',query);
    },

    // user
    login( data ){
        return withoutToken.post("user/login", data);
    },
    logout(){
        return post("user/logout");
    },
    check(){
        return get("user/check");
    },
    getProblemsStatus(){
        return get("user/problem-status");
    },
    resetPassword( data ){
        return post("user/reset-psw", data);
    },

    // exam admin
    adminUpdateExam( params ){
        return post("admin/exam/update_exam", params);
    },
    adminGetExam( id ){
        return get("admin/exam/get", {id});
    },
    adminGetExamList( query ){
        return get("admin/exam/list", query);
    },
    adminGetExamListByOwner( query ){
        return get("admin/exam/list-by-owner", query);
    },
    adminCloseExam( id, isEnded ){
        return post("admin/exam/close", {id, isEnded});
    },
    adminGetExamSubmisssion( examId, userId, problemId ){
        return get("admin/exam/submission", {examId, userId, problemId});
    },
    adminRestartExam( id, endTime ){
        return post("admin/exam/restart", {id,endTime});
    },

    // exam
    getExamListValid(){
        return get("exam/list-valid");
    },
    getExamList( query ){
        return get("exam/list", query);
    },
    getExamBrief( id ){
        return get("exam/get-brief", {id});
    },
    getExamProblems( id ){
        return post('exam/problems', {id});
    },
    submitExamCode(data){
        return post('exam/submit',data);
    },
    getExamSubmissionResult(id){
        return get('exam/submit_result', {id});
    },
    getExamSubmission( examId, problemId){
        return get('exam/submission_list', {examId, problemId});
    },
    getExamProfile( examId ){
        return get("exam/profile", { examId });
    },
    getExamRank( examId ){
        return get("exam/rank", { examId });
    },
    quitExam( examId ){
        return post("exam/quit", {examId});
    },

    // user admin
    getUserList( query ){
        return get("/admin/user/list", query);
    },
    getNoAdmin(){
        return get("/admin/user/no-admin");
    },
    getCourseAddStudentList( keyword, id ){
        return get("/admin/user/list-course-add-user", {keyword, id});
    },
    importUserList( query ){
        return post("/admin/user/import", query);
    },
    getAdminUserList(){
        return get("/admin/user/list-admin");
    },
    adminUpdateUser( query ){
        return post("/admin/user/update", query);
    },
    getUserStatus( id ){
        return get("/user/user-status", {id})
    },
    adminGetUserStatus( id ){
        return get("/admin/user/user-status", {id})
    },
    adminResetUserPSW(id){
        return post("/admin/user/reset-psw", {id});
    },
    adminNewUser(user){
        return post("/admin/user/new-user", user)
    },
    //importCourseUser( query ){
    //    return post("admin/user/update", query);
    //},

    // course admin
    adminModifyCourse( query ){
        return post("admin/course/update", query);
    },
    adminGetCourseStudents( id ){
        return get("admin/course/students", {id});
    },
    adminUpdateCourseStudents( id, add, remove ){
        return post("admin/course/update-students", {id, add, remove})
    },
    adminGetUserCourseList( query ){
        return get("admin/course/list-by-user", query );
    },
    adminGetCourseList( query ){
        return get("admin/course/list", query );
    },
    adminGetAllCourseBrief(){
        return get("admin/course/all");
    },
    adminImportCourseStudents( query ){
        return post("admin/course/import-students", query);
    },

    // course
    getAllCourseBrief(){
        return get("course/all");
    },

    // rank
    getUserRank( query ){
        return get("user/rank", query );
    },
    getUserRankTag(query){
        return get("user/rank-tag", query );
    },

    // grade
    getGrade(){
        return get("grade/all");
    },

    // admin new grade
    adminNewGrade( name ){
        return post("admin/user/new-grade", {name})
    },

    adminUpdateGrade( id, name ){
        return post("admin/user/update-grade", {id, name})
    },

    // options
    getWebsiteInfo(){
        return withoutToken.get('opt/list');
    },

    // admin options
    adminGetJudgerList(){
        return get("admin/judger/list");
    },

    adminUpdateOptions( params ){
        return post("admin/opt/update", params);
    }
};

const get = function(url, options, ...others){
    return withToken.get(url, {params:options}, ...others );
}

const post = function(url, options, ...others){
    return withToken.post(url, options, ...others);
}

let ajax = function( url, method, options){
    let params = {};
    let data = {};
    if(options !== undefined){
        if( 'params' in options )
            params = options.params;
        if( 'data' in options )
            data = options.data;
    }
    return new Promise((resolve, reject) =>{
        axios({
            url,
            method,
            params,
            data
        }).then( res=>{
            if(res.data.code == RETURN_CODE.SUCCESS ){
                return resolve(res.data);
            }
            if( res.data.code == RETURN_CODE.AUTHENTICATION_FAILED){
                Modal.error({
                    title:"请先登录",
                    content:"<div style='font-size:120%'><a href='login.html'>跳转登录页面</a></div>",
                    okText: "返回",
                })
            }
            else if( res.data.code == RETURN_CODE.ACCESS_DENIED ){
                Modal.error({
                    title:"权限不足",
                    content:"无法执行操作",
                })
            }
            else if( res.data.code == RETURN_CODE.GENERAL_ERROR){
                let mostSpec = resp.data.data.mostSpecificCause.localizedMessage;
                let cause = resp.data.data.cause.localizedMessage;
                let stack = resp.data.data.stackTrace;
                Modal.error({
                    title: mostSpec,
                    content: '<p>'+cause+'</p>'
                });
            }
            return reject(res);
        })
    }, res=>{
        console.log(res);
        reject(res)
    });
}