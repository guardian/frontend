define([
    'common/$',
    'common/utils/config'
], function(
    $,
    config
) {

function isMatch(yes) {
    var teams = config.referencesOfType('paFootballTeam'),
        footballMatch = config.page.footballMatch;

    if (footballMatch ||
        ((config.hasTone("Match reports") || config.page.isLiveBlog) && teams.length === 2)) {
        return yes(footballMatch || {
            date: config.webPublicationDateAsUrlPart(),
            teams: teams
        });
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
        if (config.page.live) {
            return yes();
        }
    });
}

return {
    isMatch: isMatch,
    isCompetition: isCompetition,
    isClockwatch: isClockwatch,
    isLiveClockwatch: isLiveClockwatch
};

}); // define

