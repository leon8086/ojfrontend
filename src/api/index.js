import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:8081/';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';

export default {
    getProblemList( query ){
        return get('problem/list',{
            params: query,
        });
    },
    getProblemDetail( id ){
        return get('problem/detail',{
            params: {id:id}
        });
    },
    getTags(){
        return get('tag/list');
    },
    submitCode(data){
        return post('submission/submit',{
            data
        });
    }
};

let get = function(url, options){
    return ajax(url, 'get', options);
}

let post = function(url, options){
    return ajax(url, 'post', options);
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
            if(res.data.code != 100 ){
                reject(res);
            }
            else{
                resolve(res.data);
            }
        })
    }, res=>{
        reject(res)
    });
}