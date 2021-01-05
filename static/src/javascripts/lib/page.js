import $ from 'lib/$';
import config from 'lib/config';
import { getBreakpoint } from 'lib/detect';

// #? this should'nt really be an `any`, but the callbacks themselves are explicit
// about the types they accept.
// that this is required suggests maybe the approach is too generic

// #? this is very hard to understand, what is it's purpose?
const isit = (
    isTrue,
    yes,
    no,
    arg
) => {
    if (isTrue) {
        return yes ? !!yes(arg || isTrue) : arg || !!isTrue;
    }

    return no ? !!no() : false;
};

const isMatch = (yes, no) => {
    const teams = config.referencesOfType('pa-football-team');
    const match = config.get('page.footballMatch', {});
    // the order of this is important as, on occasion,
    // "minbymin" is tagged with "match reports" but should be considered "minbymin".
    const pageTypes = [
        ['minbymin', config.get('page.isLiveBlog')],
        ['report', config.hasTone('Match reports')],
        ['preview', config.hasSeries('Match previews')],
        ['stats', match.id],
    ];
    const pageType = pageTypes.find(type => type[1] === true);

    Object.assign(match, {
        date: config.webPublicationDateAsUrlPart(),
        teams,
        isLive: !!config.get('page.isLive'),
        pageType: pageType && pageType[0],
    });

    return isit(
        match.id || (match.pageType && match.teams.length === 2),
        yes,
        no,
        match
    );
};

const isCompetition = (yes) => {
    const notMobile = getBreakpoint() !== 'mobile';
    const competition = notMobile
        ? ($('.js-football-competition').attr('data-link-name') || '').replace(
              'keyword: football/',
              ''
          )
        : '';

    return isit(competition, yes);
};

const isClockwatch = (yes) =>
    isit(config.hasSeries('Clockwatch'), yes);

const isLiveClockwatch = (yes) =>
    isClockwatch(() => isit(!!config.get('page.isLive'), yes));

const isFootballStatsPage = (yes) =>
    isit(!!config.get('page.footballMatch'), yes);

const belowArticleVisible = (yes, no) => {
    const el = $('.js-after-article')[0];
    const vis = el
        ? window.getComputedStyle(el).getPropertyValue('display') !== 'none'
        : false;

    return isit(vis, yes, no, el);
};

const keywordExists = (keywordArr) => {
    const keywords = config.get('page.keywords', '').split(',');
    return keywordArr.some(kw => keywords.includes(kw));
};

export {
    isMatch,
    isCompetition,
    isClockwatch,
    isLiveClockwatch,
    isFootballStatsPage,
    belowArticleVisible,
    keywordExists,
};
