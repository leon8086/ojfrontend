import axios from 'axios'
import { Modal } from 'view-ui-plus'
import { getUserLoginInfo } from '@/utils/globalInfo';
import CollapseList from "@/components/CollapseList.vue"

axios.defaults.baseURL = '//localhost:8081/';

const RETURN_CODE = {
    SUCCESS:100,
    GENERAL_ERROR:200,
    LOGIN_FAILED:210,
    AUTHENTICATION_FAILED:211,
    ACCESS_DENIED:212,
    WRONG_PARAMS:220,
    INVALID_FILE_CONTENT:230,
    FILE_TOO_LARGE:231,
    UNSUPPORT_FILE:232,
    UPLOAD_FAILED:233,
};

const withToken = axios.create({
    baseURL: "//192.168.1.103:8081",
    timeout: 5000,
})

const withoutToken = axios.create({
    baseURL: "//192.168.1.103:8081",
    timeout: 5000,
})

const errorDealer = function (data) {
    console.log(data);
    if (data.code == RETURN_CODE.AUTHENTICATION_FAILED) {
        Modal.error({
            title: "请先登录",
            content: "没有登录<br>请点击跳转登录页面",
            okText: "去登录",
            onOk: ()=>{ window.location.href="/login.html"; },
        });
    }
    else if (data.code == RETURN_CODE.ACCESS_DENIED) {
        Modal.error({
            title: "权限不足",
            content: "无法执行操作",
        });
        return data;
    }
    else if( data.code == RETURN_CODE.GENERAL_ERROR){
        //let mostSpec = data.data.mostSpecificCause==null?"未知错误":data.data.mostSpecificCause.localizedMessage;
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
    adminSetVisibility( id, visible ){
        return post("admin/problem/visible", { id, visible });
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
        return post("admin/problem/export", idList, {responseType:'blob'});
    },
    adminExportAllProblems(){
        return post("admin/problem/export-all", {}, {responseType:'blob'});
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
        return get('problem/list', query);
    },
    getProblemDetail( id ){
        return get('problem/detail', {id});
    },
    getTags(){
        return get('tag/list');
    },

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

    // info
    getWebsiteInfo(){
        return get('opt_info/list');
    },

    // login
    login( data ){
        return post("user/login", data);
    },
    logout(){
        return post("user/logout");
    },
    check(){
        return get("user/check");
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

    // exam
    getExamList(){
        return get("exam/list");
    },
    getExamBrief( id ){
        return get("exam/get", {id});
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

    // user admin
    getUserList( query ){
        return get("admin/user/list", query);
    },
    importUserList( query ){
        return post("admin/user/import", query);
    },
    getAdminUserList(){
        return get("admin/user/list-admin");
    },
    adminUpdateUser( query ){
        return post("admin/user/update", query);
    },
    //importCourseUser( query ){
    //    return post("admin/user/update", query);
    //},

    // course admin
    adminModifyCourse( query ){
        return post("admin/course/update", query);
    },
    adminGetCourseList( query ){
        return get("admin/course/list", query );
    },
    adminImportCourseStudents( query ){
        return post("admin/course/import-students", query);
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
                    content:"<div style='font-size:120%'><a href='/login.html'>跳转登录页面</a></div>",
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