const fs = require('fs');

const takeWhile = require('lodash.takewhile');

const notify = (message, userOptions = {}, type = 'log') => {
    // Set the default text colour for info to black as white was hard to see
    const options =
        type === 'info'
            ? Object.assign(
                  {
                      colour: 'black',
                      codeColour: 'white',
                  },
                  userOptions
              )
            : userOptions;

    try {
        // eslint-disable-next-line global-require
        require('megalog')[type](message, options);
    } catch (e) {
        console.log(
            `${(options.heading ? `\n${options.heading}:\n\n` : '') +
                message}\n\n(hint: you probably want to run \`make install\`)\n`
        );
    }
};

switch (process.argv[2]) {
    case 'describeMakefile': {
        const messageLines = [];
        const gutterWidth = 27;

        // this flag could be anything, but the `--` makes it look real
        const listAll = process.argv[3] === '--all';

        // for all the lines in the makefile, construct the message
        fs.readFileSync('makefile', 'utf8')
            .split('\n')
            .forEach((line, lineNumber, makefile) => {
                // if this line is a target...
                if (
                    line.match(/^[^.\s#]/) &&
                    (listAll || !line.match(/# PRIVATE$/))
                ) {
                    // see if there are any comments immediately before it
                    const comments = takeWhile(
                        makefile.slice(0, lineNumber).reverse(),
                        testLine => testLine.match(/^#/)
                    )
                        // format the comments for output to CLI
                        .map(comment => comment.replace(/#\s+/, ''))
                        // put them back into correct order
                        .reverse();

                    // format the target name for output to CLI
                    const targetName = line.split(':')[0];

                    if (comments.length) {
                        // add the target name with the first comment following it
                        messageLines.push(
                            `\`${targetName}\`${new Array(
                                gutterWidth - targetName.length
                            ).join('.')}${comments.join(' ')}`
                        );
                    } else {
                        // just add the target name
                        messageLines.push(`\`${targetName}\``);
                    }
                }

                // if we've got a divider, just add space to create a line break
                if (line.match(/^# \*{3,}/)) {
                    if (listAll) {
                        messageLines.push(
                            `\n${line.replace(/#|\*/g, '').trim()}`
                        );
                    } else {
                        messageLines.push(' ');
                    }
                }
            });

        if (!listAll) {
            messageLines.push('\nTo see the full set, run `make list`.');
        }

        notify(
            messageLines.join('\n').trim(),
            {
                heading: `${listAll ? 'All' : 'Common'} Frontend make tasks`,
            },
            'info'
        );
        break;
    }

    case 'should-yarn': {
        notify(
            'Run `make install` and include any changes to `/yarn.lock` in your commit.',
            {
                heading: 'Dependencies have changed',
            },
            'error'
        );
        break;
    }

    case 'pasteup': {
        notify(
            'You will need to release a new version of pasteup to NPM once you’ve merged this branch to main.\n\nTo begin a new release, run `make pasteup`.',
            {
                heading: 'Pasteup files have changed',
            },
            'info'
        );
        break;
    }
    case 'install-steps': {
        notify(
            'Please run the following to complete your installation:',
            {
                heading: 'Additional steps',
            },
            'info'
        );
        break;
    }
    default: {
        // do nothing
    }
}
