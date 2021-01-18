import fetchJSON from 'lib/fetch-json';

class MatchInfo {
    constructor(match, whosCalling) {
        const base = '/football/api/match-nav';
        const slug = match.id || [match.date].concat(match.teams).join('/');
        const page = encodeURIComponent(whosCalling);
        this.endpoint = `${base}/${slug}.json?page=${page}`;
    }

    endpoint;

    fetch() {
        return fetchJSON(this.endpoint, {
            mode: 'cors',
        });
    }
}

export { MatchInfo };
