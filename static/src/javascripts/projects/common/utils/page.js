define([
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'lodash/objects/assign',
    'lodash/collections/find',
    'lodash/arrays/intersection'
], function (
    $,
    config,
    detect,
    assign,
    find,
    intersection
) {

    function isit(isTrue, yes, no, arg) {
        if (isTrue) {
            return yes ? yes((arg || isTrue)) : (arg || isTrue);
        } else {
            return no ? no() : false;
        }
    }

    function isMatch(yes, no) {
        var teams = config.referencesOfType('pa-football-team'),
            match = config.page.footballMatch || {};

        // the order of this is important as, on occasion,
        // "minbymin" is tagged with "match reports" but should be considered "minbymin".
        assign(match, {
            date: config.webPublicationDateAsUrlPart(),
            teams: teams,
            isLive: config.page.isLive,
            pageType: find([
                ['minbymin', config.page.isLiveBlog],
                ['report', config.hasTone('Match reports')],
                ['preview', config.hasSeries('Match previews')],
                ['stats', match.id],
                [null, true] // We need a default
            ], function (type) {
                return type[1] === true;
            })[0]
        });

        return isit((match.id || (match.pageType && match.teams.length === 2)), yes, no, match);
    }

    function isCompetition(yes, no) {
        var notMobile = detect.getBreakpoint() !== 'mobile',
            competition =  notMobile ? ($('.js-football-competition').attr('data-link-name') || '').replace('keyword: football/', '') : '';
        return isit(competition, yes, no);
    }

    function isClockwatch(yes, no) {
        return isit(config.hasSeries('Clockwatch'), yes, no);
    }

    function isLiveClockwatch(yes, no) {
        return isClockwatch(function () {
            return isit(config.page.isLive, yes, no);
        }, no);
    }

    function isFootballStatsPage(yes, no) {
        return isit(config.page.hasOwnProperty('footballMatch'), yes, no);
    }

    function belowArticleVisible(yes, no) {
        var el = $('.js-after-article')[0],
            vis = el ? window.getComputedStyle(el).getPropertyValue('display') !== 'none' : false;

        return isit(vis, yes, no, el);
    }

    function keywordExists(keyword) {
        var keywords = config.page.keywords ? config.page.keywords.split(',') : '';
        // Compare page keywords with passed in array
        return !!intersection(keywords, keyword).length;
    }

    return {
        isMatch: isMatch,
        isCompetition: isCompetition,
        isClockwatch: isClockwatch,
        isLiveClockwatch: isLiveClockwatch,
        isFootballStatsPage: isFootballStatsPage,
        belowArticleVisible: belowArticleVisible,
        keywordExists: keywordExists
    };

}); // define
