// @flow

// This should be the only module accessing the window config object directly
// because this is the one that gets imported to all other modules
// eslint-disable-next-line guardian-frontend/global-config
const config = window.guardian.config;

const hasTone = (name: string): boolean =>
    (config.page.tones || '').includes(name);

const hasSeries = (name: string): boolean =>
    (config.page.series || '').includes(name);

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
        return `${pubDate.getFullYear()}/${(pubDate.getMonth() + 1)
            .toString()
            .padStart(
                2,
                '0'
            )}/${pubDate.getDate().toString().padStart(2, '0')}`;
    }

    return null;
};

// returns 2014/apr/22
const dateFromSlug = (): ?string => {
    const s = config.page.pageId.match(/\d{4}\/\w{3}\/\d{2}/);
    return s ? s[0] : null;
};

const isMedia: boolean = ['Video', 'Audio'].includes(config.page.contentType);

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
