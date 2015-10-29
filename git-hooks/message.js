var megalog = require('megalog');

/**
 * output megalogs for arguments
 */
switch (process.argv[2]) {
  case 'update':
    megalog.info('Dependencies have been updated.\n\nRun `make install`.');
    break;

  case 'shrinkwrap':
    megalog.error('This commit changes `package.json`, but doesn\'t include `npm-shrinkwrap.json`.\n\nIf you\'re updating npm packages, please run `npm shrinkwrap && node dev/clean-shrinkwrap.js` to write the new dependencies to `npm-shrinkwrap.json` and add that file before committing.');
    break;
}
