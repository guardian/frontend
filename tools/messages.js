const fs = require('fs');

const takeWhile = require('lodash.takewhile');

function notify(message, options, type) {
    options = options || {};
    type = type || 'log';

    // Set the default text colour for info to black as white was hard to see
    if (type === 'info') {
       options = Object.assign({
           colour: 'black'
       }, options);
    }

    try {
        require('megalog')[type](message, options);
    } catch (e) {
        console.log((options.heading ? '\n' + options.heading + ':\n\n' : '') + message + '\n\n(hint: you probably want to run `make install`)\n');
    };
}


switch (process.argv[2]) {
    case 'describeMakefile':
        const message = fs.readFileSync('makefile', 'utf8')
            .split('\n')
            .reduce((messages, line, lineNumber, makefile) => {
                const message = [];

                // if this line is a target...
                if (line.match(/^[^\s#]/)) {
                    // see if there are any comments immediately before it
                    const comments = takeWhile(makefile.slice(0, lineNumber).reverse(), line => line.match(/^#/))
                        // format the comments for output to CLI
                        .map(comment => comment.replace(/#\s+/, ''))
                        // put them back into correct order
                        .reverse();

                   // format the target name for output to CLI
                    const targetName = line.split(':')[0];

                    // if we have comments for this target...
                    if (comments.length) {
                        // add the target name with the first comment following it
                        message.push(`\`${targetName}\`${new Array(20 - targetName.length).join(' ')}${comments.shift()}`);
                        // then add any other comments
                        [].push.apply(message, comments.map(comment => new Array(20).join(' ') + comment));
                    } else {
                        // just output the target name
                        message.push(`\`${targetName}\``);
                    }
                }
                // if we've got a divider, just add space to create a line break
                if (line.match(/^# \*{3,}/)) message.push(' ');
                return messages.concat(message);
            }, []).join('\n');

        notify(message, {
            heading: 'Frontend make options'
        }, 'info');
        break;

    case 'install':
        notify(
            'All 3rd party dependencies have been installed.', {
            heading: 'make install'
        }, 'info');
        break;

    case 'should-shrinkwrap':
        notify('Run `make shrinkwrap` and include the changes to `/npm-shrinkwrap.json` in your commit.', {
            heading: 'Dependencies have changed'
        }, 'error');
        break;

    case 'did-shrinkwrap':
        notify(
            'NPM packages have been shrinkwrapped.', {
            heading: 'make shrinkwrap'
        }, 'info');
        break;

    case 'dependency-update':
        notify('Run `make install`.', {
            heading: 'Dependencies have changed'
        }, 'warn');
        break;

    case 'pasteup':
        notify('You will need to release a new version of pasteup to NPM once you’ve merged this branch to master.\n\nTo begin a new release, run `make pasteup`.', {
            heading: 'Pasteup files have changed'
        }, 'info');
        break;


    case 'install-steps':
      notify('Please run the following to complete your installation:', {
        heading: 'Additional steps'
      }, 'info');
      break;
}

