define(function () {

    var init = function () {
        // turns out Date.parse has problems cross browser, so thank you
        // http://stackoverflow.com/questions/5802461/javascript-which-browsers-support-parsing-of-iso-8601-date-string-with-date-par#answer-5805595
        Date.fromISO= (function(){
            var diso= Date.parse('2011-04-26T13:16:50Z');
            if (diso === 1303823810000) {
                return function(s){
                    return new Date(Date.parse(s));
                };
            } else {
                return function(s){
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
                    return NaN;
                };
            }
        }());
    };

    return {
        init: init
    };

});