var justNow = new Date();
var minutesAgo = new Date();
minutesAgo.setMinutes(minutesAgo.getMinutes() - 5);
var hourAgo = new Date();
hourAgo.setHours(hourAgo.getHours() - 1);
var yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
var lastWeek = new Date();
lastWeek.setDate(lastWeek.getDate() - 7);
var lastMonth = new Date();
lastMonth.setMonth(lastMonth.getMonth() - 1);

export default {
    justNow,
    minutesAgo,
    hourAgo,
    yesterday,
    lastWeek,
    lastMonth
};
