import utils from './utils';
import time from './time'
import { util } from 'echarts';

export default {
    getUrlKey: function (name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || [, ""])[1].replace(/\+/g, '%20')) || null
    },
    submissionMemoryFormat:utils.submissionMemoryFormat,
    submissionTimeFormat: utils.submissionTimeFormat,
    getACRate: utils.getACRate,
    filterEmptyValue: utils.filterEmptyValue,
    breakLongWords: utils.breakLongWords,
    downloadFile: utils.downloadFile,
    getLanguages: utils.getLanguages,
    utcToLocal: time.utcToLocal,
    duration: time.duration,
    secondFormat: time.secondFormat,
    importUsersCSV: utils.importUsersCSV,
}