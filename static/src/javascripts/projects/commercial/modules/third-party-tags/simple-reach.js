import config from 'lib/config';

var shouldRun = !config.page.isFront && config.switches.simpleReach &&
    config.page.isPaidContent;

var simpleReachUrl = '';

if (shouldRun) {
    var authors = config.page.author.split(',');
    var channels = config.page.sectionName.split(',');
    var keywords = config.page.keywords.split(',');

    window.__reach_config = {
        pid: '58ff7f3a736b795c10004930',
        title: config.page.headline,
        date: new Date(config.page.webPublicationDate),
        authors: authors,
        channels: channels,
        tags: keywords,
        article_id: config.page.pageId,
        ignore_errors: false
    };

    simpleReachUrl = '//d8rk54i4mohrb.cloudfront.net/js/reach.js';
}

export default {
    shouldRun: shouldRun,
    url: simpleReachUrl
};
