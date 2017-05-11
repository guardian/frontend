// @flow
import config from 'lib/config';

const shouldRun =
    !config.page.isFront &&
    config.switches.simpleReach &&
    config.page.isPaidContent;

let simpleReachUrl = '';

if (shouldRun) {
    const authors = config.page.author.split(',');
    const channels = config.page.sectionName.split(',');
    const keywords = config.page.keywords.split(',');

    // eslint-disable-next-line no-underscore-dangle
    window.__reach_config = {
        pid: '58ff7f3a736b795c10004930',
        title: config.page.headline,
        date: new Date(config.page.webPublicationDate),
        authors,
        channels,
        tags: keywords,
        article_id: config.page.pageId,
        ignore_errors: false,
    };

    simpleReachUrl = '//d8rk54i4mohrb.cloudfront.net/js/reach.js';
}

const url = simpleReachUrl;

export { shouldRun, url };
