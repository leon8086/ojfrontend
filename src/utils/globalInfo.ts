import api from "../api";
import { ref } from 'vue';

export function useGlobalInfo( website ) {
    if(!("website" in window.localStorage)){
      api.getWebsiteInfo()
      .then( resp => {
        window.localStorage['website'] = JSON.stringify(resp.data);
        website.value = JSON.parse(window.localStorage['website']);
      })
    }
    else{
      website.value = JSON.parse(window.localStorage['website']);
      return website;
    }
}

export function getUserLoginInfo( ){
    if(!("user_info" in window.localStorage)){
      return {login:false,token:''};
    }
    else{
      return JSON.parse(window.localStorage['user_info']);
    }
}