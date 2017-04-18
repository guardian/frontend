define([
    'lib/$',
    'lib/fetch-json'
], function (
    $,
    fetchJSON
) {

    /**
     * @param {Object} match
     * @param {string} whosCalling (url)
     */
    var MatchInfo = function (match, whosCalling) {
        this.endpoint += (match.id ? match.id : [match.date].concat(match.teams).join('/')) +
                '.json?page=' + encodeURIComponent(whosCalling);
    };

    /**
     * @type {string}
     */
    MatchInfo.prototype.endpoint = '/football/api/match-nav/';

    /**
     * @return Promise
     */
    MatchInfo.prototype.fetch = function () {
        return fetchJSON(this.endpoint, {
            mode: 'cors',
        });
    };

    return MatchInfo;

}); // define
