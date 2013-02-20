define((function () {

    if (!Date.parse || Date.parse("2012-01-01T01:01:01") !== 1325379661000) {
       
        // fix inconsistent Date.parse implementations
        Date.prototype.parse = function (s) {
            var day, tz,
                rx= /^(\d{4}\-\d\d\-\d\d([tT][\d:\.]*)?)([zZ]|([+\-])(\d\d):(\d\d))?$/,
                p= rx.exec(s) || [];
            if (p[1]) {
                day= p[1].split(/\D/).map(function(itm){
                    return parseInt(itm, 10) || 0;
                });
                day[1]-= 1;
                day= new Date(Date.UTC.apply(Date, day));
                if (!day.getDate()) { return NaN; }
                if (p[5]) {
                    tz = parseInt(p[5], 10)*60;
                    if (p[6]) { tz += parseInt(p[6], 10); }
                    if (p[4] === "+") { tz*= -1; }
                    if (tz) { day.setUTCMinutes(day.getUTCMinutes()+ tz); }
                }
                return day;
            }
            return ""; // best to fail silently here
        };

    }
}()));
