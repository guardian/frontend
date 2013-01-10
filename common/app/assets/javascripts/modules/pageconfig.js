/*global guardian:false */

/*
    Common functions to simplify access to page data
 */
define(['modules/pad', "common"], function (pad, common) {
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
                        return new Date(Date.parse(config.page.webPublicationDate));
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