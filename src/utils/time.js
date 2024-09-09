import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration';
import utc from "dayjs/plugin/utc";
dayjs.extend(duration);
dayjs.extend(utc);

// convert utc time to localtime
function utcToLocal (utcDt, format = 'YYYY-M-D  HH:mm:ss') {
  return dayjs.utc(utcDt).local().format(format)
}

// get duration from startTime to endTime, return like 3 days, 2 hours, one year ..
function timeDuration (startTime, endTime) {
  let start = dayjs(startTime)
  let end = dayjs(endTime)
  let duration = dayjs.duration(end.diff(start, 'seconds'), 'seconds')
  if( duration.asSeconds() <0 ){
    return {color:"default",message:"已结束"};
  }
  if (duration.days() !== 0) {
    return {color:"success",message:duration.days().toString()+"天"};
  }
  let color = "success";
  if( duration.asMinutes()<30 ){
    color = "warning";
  }
  if( duration.asMinutes()<10 ){
    color = "error";
  }
  return {color:color, message:dayjs.utc(duration.asMilliseconds()).format("HH:mm:ss")};
  //return duration.asMilliseconds().format("HH:mm:ss");
  //return duration.format("HH:mm:ss");
}

function secondFormat (seconds) {
  let m = dayjs.duration(seconds, 'seconds')
  return Math.floor(m.asHours()) + ':' + m.minutes() + ':' + m.seconds()
}

export default {
  utcToLocal: utcToLocal,
  duration: timeDuration,
  secondFormat: secondFormat
}
