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
        )
        .filter(Boolean);
};

const mainAppTests = ['commercial', 'common', 'facia'].map(set => ({
    description: `Run ${set} tests`,
    task: () =>
        exec('karma', [
            'start',
            `./static/test/javascripts-legacy/conf/${set}.js`,
            '--single-run',
        ]),
}));

module.exports = {
    description: 'Test JS app',
    task: [
        require('../../compile/inline-svgs'),
        require('../../compile/javascript/clean'),
        require('../../compile/javascript/copy'),
        require('../../compile/javascript/babel'),
        {
            description: 'Run tests',
            task: [
                {
                    description: 'Test eslint rules',
                    task: 'jest tools/eslint-plugin-guardian-frontend/__tests__/*',
                },
                ...mainAppTests,
            ],
            concurrent: true,
        },
    ],
};
