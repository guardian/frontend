var megalog = require('megalog');

/**
 * output megalogs for arguments
 */
switch (process.argv[2]) {
  case 'update':
    megalog.info('Dependencies have been updated.\n\nRun `make install`.');
    break;

  case 'shrinkwrap':
    megalog.error('You have changes to `package.json` but havn’t updated `npm-shrinkwrap.json`.\n\nPlease run `make shrinkwrap` and commit the changes to `npm-shrinkwrap.json`.');
    break;
}
