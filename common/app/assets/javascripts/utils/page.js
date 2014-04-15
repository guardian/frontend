define([
    'common/$',
    'common/utils/config',
    'lodash/objects/assign',
    'lodash/collections/find'
],
function(
    $,
    config,
    assign,
    find
) {

    function isMatch(yes) {
        var teams = config.referencesOfType('paFootballTeam'),
            match = config.page.footballMatch || {};

        // the order of this is important as, on occasion,
        // "minbymin" is tagged with "match reports" but should be considered "minbymin".
        assign(match, {
            date: config.webPublicationDateAsUrlPart(),
            teams: teams,
            pageType: find([
                ['minbymin', config.page.isLiveBlog],
                ['report', config.hasTone('Match reports')],
                ['preview', config.hasSeries('Match previews')],
                ['stats', match.id],
                [null, true] // We need a default
            ], function(type) {
                return type[1] === true;
            })[0]
        });

        if (match.id || (match.pageType && match.teams.length === 2)) {
            return yes(match);
        }
    }

    function isCompetition(yes) {
        var competition = ($('.js-football-competition').attr('data-link-name') || '').replace('keyword: football/', '');
        if (competition) {
            return yes(competition);
        }
    }

    function isClockwatch(yes) {
        if (config.hasSeries('Clockwatch')) {
            return yes();
        }
    }

    function isLiveClockwatch(yes) {
        isClockwatch(function() {
            if (config.page.isLive) {
                return yes();
            }
        });
    }

    function rightHandComponentVisible(yes, no) {
        var el = $('.js-right-hand-component')[0],
            vis = el.offsetWidth > 0 && el.offsetHeight > 0;

        if (vis) {
            return yes ? yes(el) : el;
        } else {
            return no ? no() : null;
        }
    }

    return {
        isMatch: isMatch,
        isCompetition: isCompetition,
        isClockwatch: isClockwatch,
        isLiveClockwatch: isLiveClockwatch,
        rightHandComponentVisible: rightHandComponentVisible
    };

}); // define
