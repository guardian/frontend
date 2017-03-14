/*
 Common functions to simplify access to page data
 */
import pad from 'lib/pad';
import urlUtils from 'lib/url';
import assign from 'lodash/objects/assign';
// eslint-disable-next-line guardian-frontend/global-config
const config = window.guardian.config;

export default assign({
    hasTone(name) {
        return (this.page.tones || '').indexOf(name) > -1;
    },
    hasSeries(name) {
        return (this.page.series || '').indexOf(name) > -1;
    },
    referencesOfType(name) {
        return (this.page.references || []).filter(reference => typeof reference[name] !== 'undefined').map(reference => reference[name]);
    },
    referenceOfType(name) {
        return this.referencesOfType(name)[0];
    },

    // the date nicely formatted and padded for use as part of a url
    // looks like    2012/04/31
    webPublicationDateAsUrlPart() {
        if (this.page.webPublicationDate) {
            const pubDate = new Date(this.page.webPublicationDate);
            return pubDate.getFullYear() + '/' +
                pad(pubDate.getMonth() + 1, 2) + '/' +
                pad(pubDate.getDate(), 2);
        }
    },

    // returns 2014/apr/22
    dateFromSlug() {
        const s = this.page.pageId.match(/\d{4}\/\w{3}\/\d{2}/);
        return s ? s[0] : null;
    },

    isMedia: ['Video', 'Audio'].indexOf(config.page.contentType) > -1

}, config);
