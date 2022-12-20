module.exports = {
	description: 'Copy Commercial JS Bundle',
	task: [
		require('./clean'),
		require('./copy'),
	],
};
