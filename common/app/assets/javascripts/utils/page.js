define([
    'common/$',
    'common/utils/config',
    'lodash/objects/assign'
],
function(
    $,
    config,
    assign
) {

    function isMatch(yes) {
        var teams = config.referencesOfType('paFootballTeam'),
            match = config.page.footballMatch || {};

        // the order of this is important as, on occasion,
        // "minbymin" is tagged with "match reports" but should be considered "minbymin".
        assign(match, {
            date: config.webPublicationDateAsUrlPart(),
            teams: teams,
            pageType: (function() {
                if (config.page.isLiveBlog) {
                    return 'minbymin';
                } else if (config.hasTone('Match reports')) {
                    return 'report';
                } else if (config.hasSeries('Match previews')) {
                    return 'preview';
                } else if (match.id) {
                    return 'stats';
                }
            }())
        });

        if (match.id || (match.pageType && match.teams.length === 2)) {
            return yes(match);
        }
    }

    function isCompetition(yes) {
        var competition = ($('.js-football-competition').attr('data-link-name') || '').replace('keyword: ', '');
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
