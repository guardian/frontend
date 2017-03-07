import fetch from 'lib/fetch';

/**
 * @param {Object} match
 * @param {string} whosCalling (url)
 */

class MatchInfo {
    constructor(match, whosCalling) {
        const urlBase = '/football/api/match-nav';
        const pageSlug = encodeURIComponent(whosCalling);
        let matchSlug = match.id;

        if (match.id) {
            matchSlug = match.id;
        } else {
            matchSlug = [match.date].concat(match.teams).join('/');
        }

        this.endpoint = `${urlBase}/${matchSlug}.json?page=${pageSlug}`;
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
