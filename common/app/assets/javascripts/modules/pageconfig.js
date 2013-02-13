/*global guardian:false */

/*
    Common functions to simplify access to page data
 */
define(['modules/pad', "common"], function (pad, common) {

    // turns out Date.parse has problems cross browser, so thank you
    // http://stackoverflow.com/questions/5802461/javascript-which-browsers-support-parsing-of-iso-8601-date-string-with-date-par#answer-5805595
    function parseDate(d) {
        var diso= Date.parse('2011-04-26T13:16:50Z');
        if(diso === 1303823810000){
            return new Date(Date.parse(d));
        } else {
            var day, tz,
                rx= /^(\d{4}\-\d\d\-\d\d([tT][\d:\.]*)?)([zZ]|([+\-])(\d\d):(\d\d))?$/,
                p= rx.exec(d) || [];
            if(p[1]){
                day= p[1].split(/\D/).map(function(itm){
                    return parseInt(itm, 10) || 0;
                });
                day[1]-= 1;
                day= new Date(Date.UTC.apply(Date, day));
                if(!day.getDate()) return NaN;
                if(p[5]){
                    tz= parseInt(p[5], 10)*60;
                    if(p[6]) tz += parseInt(p[6], 10);
                    if(p[4]== "+") tz*= -1;
                    if(tz) day.setUTCMinutes(day.getUTCMinutes()+ tz);
                }
                return day;
            }
            return NaN;
        }
    }

    return function(config){
        return common.extend(
            {
                hasTone: function(name){ return (config.page.tones || "").indexOf(name) > -1; },
                hasSeries: function(name){ return (config.page.series || "").indexOf(name) > -1; },
                referencesOfType: function(name){
                    return (config.page.references || []).filter(function(reference){
                        return typeof reference[name] !== 'undefined';
                    }).map(function(reference){
                        return reference[name];
                    });
                },
                referenceOfType: function(name){
                    return this.referencesOfType(name)[0];
                },
                webPublicationDate: function(){
                    // assumes an 'internet' date such as 2012-12-23T22:30:00.000Z
                    // http://www.ietf.org/rfc/rfc3339.txt
                    if(config.page.webPublicationDate){
                        return parseDate(config.page.webPublicationDate)
                    }
                },

                // the date nicely formatted and padded for use as part of a url
                // looks like    2012/04/31
                webPublicationDateAsUrlPart: function(){
                    if(this.webPublicationDate()){
                        return this.webPublicationDate().getFullYear() + '/' +
                            pad(this.webPublicationDate().getMonth() + 1, 2) + '/' +
                            pad(this.webPublicationDate().getDate(), 2);
                    }
                }
            },
            config);
    };
});