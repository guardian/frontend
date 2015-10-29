var megalog = require('megalog');

/**
 * output megalogs for arguments
 */
switch (process.argv[2]) {
    case 'describeMakefile':
        megalog.info(
            '`watch`        watch and automatically reload all JS/SCSS (uses port 3000)\n' +
            '\n' +
            '`dev-build`    compile all assets for development \n' +
            '`prod-build`   compile all assets for production \n' +
            '\n' +
            '`install`      install all 3rd party dependencies \n' +
            '`reinstall`    remove then install all 3rd party dependencies \n' +
            '`clean`        remove all 3rd party dependencies \n' +
            '\n' +
            '`test`         run the JS test suite \n' +
            '`validate`     lint all assets', {
            heading: 'frontend Make options'
        });
        break;
}
