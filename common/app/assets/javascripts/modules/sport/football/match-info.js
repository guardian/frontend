define([
    'common/$',
    'common/utils/ajax'
], function(
    $,
    ajax
) {

/**
 * @param {Object} match
 * @param {string} whoscalling (url)
 */
var MatchInfo = function(match, whosCalling) {
    this.endpoint +=
            (match.id ? match.id : [match.date].concat(match.teams).join('/')) +
            '.json?page=' + encodeURIComponent(whosCalling);
};

/**
 * @type {string}
 */
MatchInfo.prototype.endpoint = '/football/api/match-nav/';

/**
 * @return Reqwest
 */
MatchInfo.prototype.fetch = function() {
    return ajax({
        crossOrigin: true,
        url: this.endpoint
    });
};

return MatchInfo;

}); // define
