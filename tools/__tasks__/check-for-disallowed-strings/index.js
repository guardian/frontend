const execa = require('execa');
const { root } = require('../config').paths;

const checkForDisallowedStrings = {
    description: 'Do it',
    task: () => {
        // execa.stdout('git', ['branch', '-r']);

        return execa
            .stdout('git', [
                'grep',
                '-Ein',
                `"membership\\.theguardian\\.com"`,
                '.'
                // ...['"*.js"', '"*.scala"'],
            ], {cwd: root})
            .then(stdout => {
                // console.log('OUTPUT!');
                // console.log(o.split('\n').length);

                console.log(stdout);
                // return Promise.resolve('GOOD');
            })
            .catch(err => {
                // console.log('ERR!', err);
                // console.log('No results!');
                return Promise.reject(new Error(err));
            })

        // disallowedStrings.forEach(({regex, message, maxOccurrences, paths}) => {
        //     execa
        //         .stdout('git', [
        //             'grep',
        //             '-Ein',
        //             `'${regex}'`,
        //             ...paths.map(p => `'${p}'`),
        //         ])
        //         .then(matches => matches.split('\n'))
        //         .then(matches => {
        //             if (matches.length > maxOccurrences) {
        //                 console.log(`ERROR! More than ${maxOccurences} of regex ${regex}`);
        //                 console.log(message);
        //                 matches.forEach(m => {console.log(m)});
        //             }
        //         })
        //
        // })
    }
};

module.exports = {
    description: 'Check for disallowed strings',
    task: [checkForDisallowedStrings],
    concurrent: true,
};
