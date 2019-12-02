// @flow
import config, { type Config } from 'lib/config';
import reportError, { type ErrorLogger } from 'lib/report-error';

declare var permutive: any;
type PermutiveSchema = {
    content: {
        premium?: boolean,
        id?: string,
        title?: string,
        type?: string,
        section?: string,
        authors?: Array<string>,
        keywords?: Array<string>,
        publishedAt?: string,
        series: string,
    },
};

const isEmpty = (value: any) =>
    value === '' ||
    value === null ||
    typeof value === 'undefined' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0);

const removeEmpty = <T: Config>(payload: T): T => {
    Object.keys(payload).forEach(key => {
        if (typeof payload[key] === 'object' && payload[key] !== null) {
            removeEmpty(payload[key]);
        }
        if (isEmpty(payload[key])) {
            delete payload[key];
        }
    });
    return payload;
};

const generatePayload = (pageConfig: Config): PermutiveSchema => {
    const {
        isPaidContent,
        pageId,
        headline,
        contentType,
        section,
        author,
        keywords,
        webPublicationDate,
        series,
    } = pageConfig;

    const safeAuthors = (author && typeof author === 'string'
        ? author.split(',')
        : []
    ).map(str => str.trim());
    const safeKeywords = (keywords && typeof keywords === 'string'
        ? keywords.split(',')
        : []
    ).map(str => str.trim());
    const safePublishedAt =
        webPublicationDate && typeof webPublicationDate === 'number'
            ? new Date(webPublicationDate).toISOString()
            : '';

    const cleanPayload = removeEmpty({
        content: {
            premium: isPaidContent,
            id: pageId,
            title: headline,
            type: contentType,
            section,
            authors: safeAuthors,
            keywords: safeKeywords,
            publishedAt: safePublishedAt,
            series,
        },
    });

    return cleanPayload;
};

const runPermutive = (
    pageConfig: Config = {},
    permutiveGlobal: any,
    logger: ErrorLogger
): void => {
    try {
        if (!permutiveGlobal || !permutiveGlobal.addon) {
            throw new Error('Global Permutive setup error');
        }

        const payload = generatePayload(pageConfig);

        if (isEmpty(payload)) {
            throw new Error('Empty Permutive payload');
        }

        permutiveGlobal.addon('web', {
            page: payload,
        });
    } catch (err) {
        logger(err, { feature: 'commercial' }, false);
    }
};

/* eslint-disable */
export const initPermutive = (): Promise<void> =>
    new Promise(resolve => {
        (function(n, e, o, r, i) {
            if (!e) {
                (e = e || {}),
                    (window.permutive = e),
                    (e.q = []),
                    (e.config = i || {}),
                    (e.config.projectId = o),
                    (e.config.apiKey = r),
                    (e.config.environment =
                        e.config.environment || 'production');
                for (
                    let t = [
                            'addon',
                            'identify',
                            'track',
                            'trigger',
                            'query',
                            'segment',
                            'segments',
                            'ready',
                            'on',
                            'once',
                            'user',
                            'consent',
                        ],
                        c = 0;
                    c < t.length;
                    c++
                ) {
                    const f = t[c];
                    e[f] = (function(n) {
                        return function() {
                            const o = Array.prototype.slice.call(arguments, 0);
                            e.q.push({ functionName: n, arguments: o });
                        };
                    })(f);
                }
            }
        })(
            document,
            window.permutive,
            'd6691a17-6fdb-4d26-85d6-b3dd27f55f08',
            '359ba275-5edd-4756-84f8-21a24369ce0b',
            {}
        );
        (window.googletag = window.googletag || {}),
            (window.googletag.cmd = window.googletag.cmd || []),
            window.googletag.cmd.push(() => {
                if (
                    window.googletag.pubads().getTargeting('permutive')
                        .length === 0
                ) {
                    const g = window.localStorage.getItem('_pdfps');
                    window.googletag
                        .pubads()
                        .setTargeting('permutive', g ? JSON.parse(g) : []);
                }
            });
        /* eslint-enable */
        runPermutive(config.get('page'), permutive, reportError);

        return resolve();
    });

export const _ = {
    isEmpty,
    removeEmpty,
    generatePayload,
    runPermutive,
};
