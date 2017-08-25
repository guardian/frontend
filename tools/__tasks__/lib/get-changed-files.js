const execa = require('execa');

const getCurrentBranchName = () =>
    execa.stdout('git', ['symbolic-ref', '--short', 'HEAD']);

const getRemoteBranches = () => execa.stdout('git', ['branch', '-r']);

const diffAgainstRemote = branch =>
    execa
        .stdout('git', [
            'diff',
            '--name-only',
            'HEAD',
            `origin/${branch}`,
            '^origin/master', // excluding changes already in origin/master
        ])
        .then(diffs => diffs.split('\n'));

const diffAgainstMaster = () =>
    execa
        .stdout('git', ['diff', '--name-only', 'HEAD', 'origin/master'])
        .then(diffs => diffs.split('\n'));

const getChangedFiles = () =>
    getCurrentBranchName().then(branch =>
        getRemoteBranches().then(branches => {
            if (branches.includes(branch)) {
                // remote branch exists, return files that have changed locally
                // compared to remote feature branch
                return diffAgainstRemote(branch);
            }

            // remote branch doesn't exist, return files that have changed
            // compared to local master branch
            return diffAgainstMaster();
        })
    );

module.exports = getChangedFiles;
