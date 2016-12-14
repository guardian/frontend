const execa = require('execa');
const split = require('split');
// eslint-disable-next-line import/no-unassigned-import
require('any-observable/register/rxjs-all');
const Observable = require('any-observable');
const streamToObservable = require('stream-to-observable');

const exec = (cmd, args) => {
    const cp = execa(cmd, args);

    return Observable.merge(
        streamToObservable(cp.stdout.pipe(split()), { await: cp }),
        streamToObservable(cp.stderr.pipe(split()), { await: cp })
    ).filter(Boolean);
};

module.exports = {
    description: 'Test JS app',
    task: [
        require('../../compile/inline-svgs'),
        {
            description: 'Run tests',
            task: [
                'commercial',
                'common',
                'facia',
            ].map(set => ({
                description: `Run ${set} tests`,
                task: () => exec('karma', ['start', `./static/test/javascripts/conf/${set}.js`, '--single-run']),
            })).concat([require('./eslint')]),
            concurrent: true,
        },
    ],
};
