import axios from 'axios'
import { Modal, Message } from 'view-ui-plus'
import { getUserLoginInfo } from '../utils/globalInfo';

axios.defaults.baseURL = 'http://localhost:8081/';

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
    baseURL: "http://localhost:8081",
    timeout: 5000,
})

const withoutToken = axios.create({
    baseURL: "http://localhost:8081",
    timeout: 5000,
})

withoutToken.interceptors.response.use(res=>{
    if (res.data.code == RETURN_CODE.SUCCESS) {
        return res.data;
    }
    else{
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
        Promise.reject(res);
    }
}, err => {
    Promise.reject(err);
});

withToken.interceptors.response.use(res=>{
    if (res.data.code == RETURN_CODE.SUCCESS) {
        return res.data;
    }
    else{
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
        Promise.reject(res);
    }
}, err => {
    Promise.reject(err);
});

withToken.interceptors.request.use(config=>{
    let userInfo = getUserLoginInfo();
    config.headers.Authorization = userInfo.token;
    return config;
}, err => {
    console.log(err);
})

export default {
    getProblemList( query ){
        return get('problem/list', query);
    },
    getProblemDetail( id ){
        return get('problem/detail', {id});
    },
    getTags(){
        return get('tag/list');
    },
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
    getWebsiteInfo(){
        return get('opt_info/list');
    },
    login( data ){
        return post("user/login", data);
    },

    // exam admin
    adminUpdateExam( params ){
        return post("admin/exam/update_exam", params);
    },
    adminGetExam( id ){
        return get("admin/exam/get", {id});
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
    }

};

const get = function(url, options){
    return withToken.get(url, {params:options});
}

const post = function(url, options){
    return withToken.post(url, options);
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
                resolve(res.data);
            }
            else{
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
                reject(res);
            }
        })
    }, res=>{
        console.log(res);
        reject(res)
    });
}