import moment from 'moment'

// convert utc time to localtime
function utcToLocal (utcDt, format = 'YYYY-M-D  HH:mm:ss') {
  return moment.utc(utcDt).local().format(format)
}

// get duration from startTime to endTime, return like 3 days, 2 hours, one year ..
function duration (startTime, endTime) {
  let start = moment(startTime)
  let end = moment(endTime)
  let duration = moment.duration(end.diff(start, 'seconds'), 'seconds')
  if (duration.days() !== 0) {
    return duration.days().toString()+"天";
  }
  let texts = [Math.floor(duration.asHours()), duration.minutes(), duration.seconds()];
  return texts.join(":");
}

function secondFormat (seconds) {
  let m = moment.duration(seconds, 'seconds')
  return Math.floor(m.asHours()) + ':' + m.minutes() + ':' + m.seconds()
}

export default {
  utcToLocal: utcToLocal,
  duration: duration,
  secondFormat: secondFormat
}
