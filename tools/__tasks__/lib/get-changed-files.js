const execa = require('execa');

const getCurrentBranchName = () =>
    execa.stdout('git', ['symbolic-ref', '--short', 'HEAD']);

const hasRemoteBranch = branch =>
    execa
        .stdout('git', ['status', '--porcelain', '-b'])
        .then(status => status.includes(`...origin/${branch}`));

// return files that have changed locally
// compared to remote feature branch
const diffAgainstRemote = branch =>
    execa
        .stdout('git', [
            'diff',
            '--name-only',
            'HEAD',
            `origin/${branch}`,
            '^origin/main', // excluding changes already in origin/main
        ])
        .then(diffs => diffs.split('\n'));

// return files that have changed
// compared to local main branch
const diffAgainstMain = () =>
    execa
        .stdout('git', ['diff', '--name-only', 'HEAD', 'origin/main'])
        .then(diffs => diffs.split('\n'));

const getChangedFiles = () =>
    getCurrentBranchName().then(localBranch =>
        hasRemoteBranch(localBranch).then(remoteBranchExists => {
            if (remoteBranchExists) {
                return diffAgainstRemote(localBranch);
            }

            return diffAgainstMain();
        })
    );

module.exports = getChangedFiles;
