/*global guardian:false */

/*
 Common functions to simplify access to page data
 */
define(['lodash/objects/assign'], function (extend) {

    // thank you http://www.electrictoolbox.com/pad-number-zeroes-javascript/
    var pad = function (number, length) {
        var str = '' + number;
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
    };

    var config = guardian.config;

    return extend({
        hasTone: function (name) {
            return (config.page.tones || '').indexOf(name) > -1;
        },
        hasSeries: function (name) {
            return (config.page.series || '').indexOf(name) > -1;
        },
        referencesOfType: function (name) {
            return (config.page.references || []).filter(function (reference) {
                return typeof reference[name] !== 'undefined';
            }).map(function (reference) {
                    return reference[name];
                });
        },
        referenceOfType: function (name) {
            return this.referencesOfType(name)[0];
        },

        // the date nicely formatted and padded for use as part of a url
        // looks like    2012/04/31
        webPublicationDateAsUrlPart: function () {
            if (this.page.webPublicationDate) {
                var pubDate = new Date(this.page.webPublicationDate);
                return pubDate.getFullYear() + '/' +
                    pad(pubDate.getMonth() + 1, 2) + '/' +
                    pad(pubDate.getDate(), 2);
            }
        },

        // returns 2014/apr/22
        dateFromSlug: function() {
            var s = config.page.pageId.match(/\d{4}\/\w{3}\/\d{2}/);
            return s ? s[0] : null;
        }

    }, config);
});
