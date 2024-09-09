//import Vue from 'vue'
import storage from '@/utils/storage'
import { STORAGE_KEY } from '@/utils/constants'
import ojAPI from '@/api'
import papa from 'papaparse';

export default {
  submissionMemoryFormat(memory) {
    if (memory === undefined) return '--'
    // 1048576 = 1024 * 1024
    let t = parseInt(memory) / 1048576
    return String(t.toFixed(0)) + 'MB'
  },

  submissionTimeFormat(time) {
    if (time === undefined) return '--'
    return time + 'ms'
  },

  getACRate(acCount, totalCount) {
    let rate = totalCount === 0 ? 0.00 : (acCount / totalCount * 100).toFixed(2)
    return String(rate) + '%'
  },

  // 去掉值为空的项，返回object
  filterEmptyValue(object) {
    let query = {}
    Object.keys(object).forEach(key => {
      if (object[key] || object[key] === 0 || object[key] === false) {
        query[key] = object[key]
      }
    })
    return query
  },

  // 按指定字符数截断添加换行，非英文字符按指定字符的半数截断
  breakLongWords(value, length = 16) {
    let re
    if (escape(value).indexOf('%u') === -1) {
      // 没有中文
      re = new RegExp('(.{' + length + '})', 'g')
    } else {
      // 中文字符
      re = new RegExp('(.{' + (length / 2 + 1) + '})', 'g')
    }
    return value.replace(re, '$1\n')
  },

  downloadFile(url) {
    return new Promise((resolve, reject) => {
      //Vue.prototype.$http.get(url, { responseType: 'blob' }).then(resp => {
      // let headers = resp.headers
      // if (headers['content-type'].indexOf('json') !== -1) {
      //   let fr = new window.FileReader()
      //   if (resp.data.error) {
      //     Vue.prototype.$error(resp.data.error)
      //   } else {
      //     Vue.prototype.$error('Invalid file format')
      //   }
      //   fr.onload = (event) => {
      //     let data = JSON.parse(event.target.result)
      //     if (data.error) {
      //       Vue.prototype.$error(data.data)
      //     } else {
      //       Vue.prototype.$error('Invalid file format')
      //     }
      //   }
      //   let b = new window.Blob([resp.data], { type: 'application/json' })
      //   fr.readAsText(b)
      //   return
      // }
      // let fileName = ''
      // const contentDisposition = headers['content-disposition']
      // if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
      //   const fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      //   const matches = fileNameRegex.exec(contentDisposition)
      //   if (matches != null && matches[1]) {
      //     fileName = matches[1].replace(/['"]/g, '')
      //   }
      // }
      // let link = document.createElement('a')
      // link.href = window.URL.createObjectURL(new window.Blob([resp.data], { type: headers['content-type'] }))
      // link.download = fileName || 'file'
      // document.body.appendChild(link)
      // link.click()
      // link.remove()
      // resolve()
      //}).catch(() => { })
    })
  },

  getLanguages() {
    return new Promise((resolve, reject) => {
      let languages = storage.get(STORAGE_KEY.languages)
      if (languages) {
        resolve(languages)
      }
      ojAPI.getLanguages().then(res => {
        let languages = res.data.data.languages
        storage.set(STORAGE_KEY.languages, languages)
        resolve(languages)
      }, err => {
        reject(err)
      })
    })
  },

  importUsersCSV( file, exists ){
    return new Promise(( resolve, reject) =>{
      papa.parse(file, {
        complete: (res) => {
          if (res.data[res.data.length - 1].length == 1) {
            res.data.pop();  // 去除最后一个 [""] 的空项
          }
          let failed = [];
          let valid = [];
          res.data.forEach(item => {
            let user = { username: item[0], password: item[1], email: item[2], realName: item[3], grade: item[4] };
            if (user.username == "") {
              user.error = "缺少用户名";
              failed.push(user);
              return;
            }
            if (user.password == "") {
              user.error = "缺少密码";
              failed.push(user);
              return;
            }
            if (exists.includes(user.username)) {
              user.error = "用户名重复";
              failed.push(user);
              return;
            }
            exists.push(user.username);
            valid.push(user);
          })
          resolve({valid, failed});
        },
        error( err ){
          reject(err);
        }
      })
    })
  }
};
