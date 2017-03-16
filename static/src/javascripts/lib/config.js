// @flow

import pad from 'lib/pad';

// This should be the only module accessing the window config object directly
// because this is the one that gets imported to all other modules
// eslint-disable-next-line guardian-frontend/global-config
const config = window.guardian.config;

const hasTone = (name: string): boolean =>
    (config.page.tones || '').indexOf(name) > -1;

const hasSeries = (name: string): boolean =>
    (config.page.series || '').indexOf(name) > -1;

const referencesOfType = (name: string): Array<string> =>
    (config.page.references || [])
        .filter(reference => typeof reference[name] !== 'undefined')
        .map(reference => reference[name]);

const referenceOfType = (name: string): string => referencesOfType(name)[0];

// the date nicely formatted and padded for use as part of a url
// looks like    2012/04/31
const webPublicationDateAsUrlPart = (): ?string => {
    if (config.page.webPublicationDate) {
        const pubDate = new Date(config.page.webPublicationDate);
        return `${pubDate.getFullYear()}/${pad(pubDate.getMonth() + 1, 2)}/${pad(pubDate.getDate(), 2)}`;
    }

    return null;
};

// returns 2014/apr/22
const dateFromSlug = (): ?string => {
    const s = config.page.pageId.match(/\d{4}\/\w{3}\/\d{2}/);
    return s ? s[0] : null;
};

const isMedia: boolean = ['Video', 'Audio'].indexOf(config.page.contentType) >
    -1;

export default Object.assign(
    {
        hasTone,
        hasSeries,
        referencesOfType,
        referenceOfType,
        webPublicationDateAsUrlPart,
        dateFromSlug,
        isMedia,
    },
    config
);
