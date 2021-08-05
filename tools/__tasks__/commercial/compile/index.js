module.exports = {
	description: 'Compile Commercial JS Bundle',
	task: [require('./clean'), require('./webpack-commercial')],
};
