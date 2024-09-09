import api from "@/api";
import { ref, isRef } from 'vue';
import { Modal } from 'view-ui-plus';

export function getUserLoginInfo( ){
    if(!("user_info" in window.localStorage)){
      return {login:false,token:''};
    }
    else{
      return JSON.parse(window.localStorage['user_info']);
    }
}

export function useGlobalInfo( website ) {
  if (!("website" in window.sessionStorage)) {
    api.getWebsiteInfo()
      .then(resp => {
        window.sessionStorage['website'] = JSON.stringify(resp.data);
        website.value = JSON.parse(window.sessionStorage['website']);
      })
  }
  else {
    website.value = JSON.parse(window.sessionStorage['website']);
    return website;
  }
}

export function useCheckLogin( userInfo ){
  if (!("user_info" in window.localStorage)) {
    window.location.href = "./login.html";
  }
  else {
    api.check()
      .then(resp => {
        //console.log(resp.data);
        if (resp.data.isDisabled == true) {
          Modal.error({
            title: "账号被禁用",
            content: "你的账号被禁用，联系管理员解决或重新登陆。",
            okText: "返回",
            onOk: () => { window.location.href = "./login.html" }
          });
        }
        userInfo.value = resp.data;
      }, err => {
    })
  }
}

export function useCheckAdminLogin( userInfo ){
  if (!("user_info" in window.localStorage)) {
    window.location.href = "./login.html";
  }
  else {
    api.check()
      .then(resp => {
        if (resp.data.isDisabled == true) {
          Modal.error({
            title: "账号被禁用",
            content: "你的账号被禁用，联系管理员解决或重新登陆。",
            okText: "返回",
            onOk: () => { window.location.href = "./login.html" }
          });
        }
        if ( !isAdmin(resp.data) ) {
          Modal.error({
            title: "权限不足",
            content: "你的不是管理员，请重新登陆。",
            okText: "返回",
            onOk: () => { window.location.href = "./login.html" }
          });
        }
        userInfo.value = resp.data;
      }, err => {
    })
  }
}

export function usePageSet( query, data ){
  if( isRef(query)){
    query.value.page = data.pageNumber;
    query.value.limit = data.pageSize;
    query.value.total = data.totalRow
  }
  else{
    query.page = data.pageNumber;
    query.limit = data.pageSize;
    query.total = data.totalRow
  }
}

export function isAdmin( userInfo ){
  if( isRef(userInfo)){
    return userInfo.value.adminType <= 2;
  }
  else{
    return userInfo.adminType <= 2;
  }
}

export function isSuperAdmin( userInfo ){
  if( isRef(userInfo)){
    return userInfo.value.adminType == 1;
  }
  else{
    return userInfo.adminType == 1;
  }
}

export function pageIndex( index, pageDesc ){
  return index+(pageDesc.page-1)*pageDesc.limit;
}