function notify(message, options, type) {
    options = options || {};
    type = type || 'log';
    try {
        require('megalog')[type](message, options);
    } catch (e) {
        console.log((options.heading ? '\n' + options.heading + ':\n\n' : '') + message + '\n\n(hint: you probably want to run `make install`)\n');
    };
}


switch (process.argv[2]) {
    case 'describeMakefile':
        notify(
            '`watch`           Watch and automatically reload all JS/SCSS.\n' +
            '                Uses port 3000 insead of 9000.\n' +
            '\n' +
            '`compile`         Compile all assets for production. \n' +
            '`compile-dev`     Compile all assets for development. \n' +
            '\n' +
            '`validate`        Lint all assets.\n' +
            '`validate-sass`   Lint all SCSS.\n' +
            '`validate-js`     Lint all JS.\n' +
            '\n' +
            '`test`            Run the JS test suite. \n'+
            '\n' +
            '`install`         Install all 3rd party dependencies. \n' +
            '`uninstall`       Uninstall all 3rd party dependencies. \n' +
            '`reinstall`       Alias for `make uninstall install`. \n' +
            '\n' +
            '`shrinkwrap`      Shrinkwrap NPM packages.', {
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
        }, 'info');
        break;
}

