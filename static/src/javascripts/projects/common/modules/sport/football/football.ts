import { Component } from 'common/modules/component';

const factory = (url: string): Component => {
    const c = new Component();
    c.endpoint = url;
    return c;
};

const matchDayFor = (competition: string, date: string): Component =>
    factory(`/football/match-day/${competition}/${date}.json`);

const tableFor = (competition: string): Component =>
    factory(`/football/${competition}/table.json`);

const statsFor = (url: string): Component => factory(`${url}.json`);

export { matchDayFor, tableFor, statsFor };
