import fetchJSON from 'lib/fetch-json';

class MatchInfo {
    constructor(match: Object, whosCalling: string): void {
        const base = '/football/api/match-nav';
        const slug = match.id || [match.date].concat(match.teams).join('/');
        const page = encodeURIComponent(whosCalling);
        this.endpoint = `${base}/${slug}.json?page=${page}`;
    }

    endpoint: string;

    fetch(): Promise<any> {
        return fetchJSON(this.endpoint, {
            mode: 'cors',
        });
    }
}

export { MatchInfo };
