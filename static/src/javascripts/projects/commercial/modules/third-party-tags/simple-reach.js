// @flow
import config from 'lib/config';

const shouldRun =
    !config.get('page.isFront') &&
    config.get('switches.simpleReach') &&
    config.get('page.isPaidContent');

let simpleReachUrl = '';

if (shouldRun) {
    const authors = config.get('page.author').split(',');
    const channels = config.get('page.sectionName').split(',');
    const keywords = config.get('page.keywords').split(',');

    // We can't ditch the dangling underscores as SimpleReach needs this parameter, see:
    // http://docs.simplereach.com/implementation-1/standard-implementation
    // eslint-disable-next-line no-underscore-dangle
    window.__reach_config = {
        pid: '58ff7f3a736b795c10004930',
        title: config.get('page.headline'),
        date: new Date(config.get('page.webPublicationDate')),
        authors,
        channels,
        tags: keywords,
        article_id: config.get('page.pageId'),
        ignore_errors: false,
    };

    simpleReachUrl = '//d8rk54i4mohrb.cloudfront.net/js/reach.js';
}

export const simpleReach: ThirdPartyTag = {
    shouldRun,
    url: simpleReachUrl,
};
