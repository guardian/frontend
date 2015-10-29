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
            '`watch`        watch and automatically reload all JS/SCSS (use port 3000)\n' +
            '\n' +
            '`build`        compile all assets for production \n' +
            '`build-dev`    compile all assets for development \n' +
            '\n' +
            '`install`      install all 3rd party dependencies \n' +
            '`reinstall`    uninstall then install all 3rd party dependencies \n' +
            '`clean`        uninstall all 3rd party dependencies \n' +
            '\n' +
            '`test`         run the JS test suite \n' +
            '`validate`     lint all assets', {
            heading: 'Frontend make options'
        }, 'info');
        break;

    case 'install':
        notify(
            'All 3rd party dependencies have been installed.', {
            heading: 'make install'
        }, 'info');
        break;
}

