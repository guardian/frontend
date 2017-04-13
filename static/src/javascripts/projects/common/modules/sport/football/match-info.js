import fetch from 'lib/fetch';

/**
 * @param {Object} match
 * @param {string} whosCalling (url)
 */

class MatchInfo {
    constructor(match, whosCalling) {
        const urlBase = '/football/api/match-nav';
        const pageSlug = encodeURIComponent(whosCalling);
        const endpoint = match.id || [match.date].concat(match.teams).join('/');

        this.endpoint = `${urlBase}/${endpoint}.json?page=${pageSlug}`;
    }

    /**
     * @return Reqwest
     */

    fetch() {
        return fetch(this.endpoint, {
            mode: 'cors',
        });
    }
}

export default MatchInfo;
