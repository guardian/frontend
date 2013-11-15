/*global guardian:false */

/*
    Common functions to simplify access to page data
 */
define(['common'], function (common) {

    // thank you http://www.electrictoolbox.com/pad-number-zeroes-javascript/
    var pad = function (number, length) {
        var str = '' + number;
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
    };

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

                // the date nicely formatted and padded for use as part of a url
                // looks like    2012/04/31
                webPublicationDateAsUrlPart: function(){
                    if(this.page.webPublicationDate){
                        var pubDate = new Date(this.page.webPublicationDate);
                        return pubDate.getFullYear() + '/' +
                            pad(pubDate.getMonth() + 1, 2) + '/' +
                            pad(pubDate.getDate(), 2);
                    }
                }
            },
            config);
    };
});
