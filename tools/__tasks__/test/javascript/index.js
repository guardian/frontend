const execa = require('execa');
const split = require('split');

require('any-observable/register/rxjs-all');
const streamToObservable = require('stream-to-observable');
const rxjs = require('rxjs');
// rxjs6 operators are now packaged separately
const rxjsOperators = require('rxjs/operators');

const exec = (cmd, args) => {
    const cp = execa(cmd, args);

    return rxjs.merge(
        streamToObservable(cp.stdout.pipe(split()), { await: cp }),
        streamToObservable(cp.stderr.pipe(split()), { await: cp })
    ).pipe(rxjsOperators.filter(Boolean));
};

module.exports = {
    description: 'Test JS app',
    task: [
        {
            description: 'Run tests',
            task: [
                {
                    description: 'JS tests',
                    task: () => exec('jest'),
                },
            ],
            concurrent: true,
        },
    ],
};
