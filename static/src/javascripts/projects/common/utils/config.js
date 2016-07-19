/*global guardian:false */

/*
 Common functions to simplify access to page data
 */
define([
    'common/utils/pad',
    'common/utils/url',
    'common/utils/assign'
], function (pad, urlUtils, assign) {
    var config         = guardian.config,
        adUnitOverride = urlUtils.getUrlVars()['ad-unit'];

    if (adUnitOverride) {
        config.page.adUnit = ['/', config.page.dfpAccountId, '/', adUnitOverride].join('');
    }

    return assign({
        hasTone: function (name) {
            return (this.page.tones || '').indexOf(name) > -1;
        },
        hasSeries: function (name) {
            return (this.page.series || '').indexOf(name) > -1;
        },
        referencesOfType: function (name) {
            return (this.page.references || []).filter(function (reference) {
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
        dateFromSlug: function () {
            var s = this.page.pageId.match(/\d{4}\/\w{3}\/\d{2}/);
            return s ? s[0] : null;
        },

        isMedia: ['Video', 'Audio'].indexOf(config.page.contentType) > -1,

        isHosted: config.page.tones === 'Hosted'

    }, config);
});
