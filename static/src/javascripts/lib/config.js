// @flow

import pad from 'lib/pad';
// eslint-disable-next-line guardian-frontend/global-config
const config = window.guardian.config;

function hasTone(name: string): boolean {
    return (config.page.tones || '').indexOf(name) > -1;
}

function hasSeries(name: string): boolean {
    return (config.page.series || '').indexOf(name) > -1;
}

function referencesOfType(name: string): Array<string> {
    return (config.page.references || [])
        .filter(reference => typeof reference[name] !== 'undefined')
        .map(reference => reference[name]);
}

function referenceOfType(name: string): string {
    return referencesOfType(name)[0];
}

// the date nicely formatted and padded for use as part of a url
// looks like    2012/04/31
function webPublicationDateAsUrlPart(): ?string {
    if (config.page.webPublicationDate) {
        const pubDate = new Date(config.page.webPublicationDate);
        return `${pubDate.getFullYear()}/${pad(pubDate.getMonth() + 1, 2)}/${pad(pubDate.getDate(), 2)}`;
    }

    return null;
}

// returns 2014/apr/22
function dateFromSlug(): ?string {
    const s = config.page.pageId.match(/\d{4}\/\w{3}\/\d{2}/);
    return s ? s[0] : null;
}

export default Object.assign(
    {
        hasTone,
        hasSeries,
        referencesOfType,
        referenceOfType,
        webPublicationDateAsUrlPart,
        dateFromSlug,
        isMedia: ['Video', 'Audio'].some(config.page.contentType),
    },
    config
);
