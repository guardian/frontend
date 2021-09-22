import { Component } from 'common/modules/component';

const factory = (url) => {
    const c = new Component();
    c.endpoint = url;
    return c;
};

const matchDayFor = (competition, date) =>
    factory(`/football/match-day/${competition}/${date}.json`);

const tableFor = (competition) =>
    factory(`/football/${competition}/table.json`);

const statsFor = (url) => factory(`${url}.json`);

export { matchDayFor, tableFor, statsFor };
