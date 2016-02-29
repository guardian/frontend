define([
    'common/utils/$',
    'common/utils/config',
    'lodash/objects/assign',
    'lodash/collections/find'
], function (
    $,
    config,
    assign,
    find
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
        var competition = ($('.js-football-competition').attr('data-link-name') || '').replace('keyword: football/', '');
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

    return {
        isMatch: isMatch,
        isCompetition: isCompetition,
        isClockwatch: isClockwatch,
        isLiveClockwatch: isLiveClockwatch,
        isFootballStatsPage: isFootballStatsPage,
        belowArticleVisible: belowArticleVisible
    };

}); // define
