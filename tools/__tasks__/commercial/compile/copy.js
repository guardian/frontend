const path = require('path');
const cpy = require('cpy');

const { root, target } = require('../../config').paths;

module.exports = {
	description: 'Copy files',
	task: () => cpy(
      'build/**/*',
      path.resolve(target, 'javascripts', 'commercial'),
      {
          cwd: path.resolve(root, 'node_modules/@guardian/commercial-standalone'),
          parents: true,
          nodir: true,
      },
  ),
};