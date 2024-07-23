import tcpp from 'tcp-ping';
import pify from 'pify';

/** @type {(domain: string, port: number) => import('listr2').ListrTask} */
const createTask = (domain, port) => ({
	title: `Probing ${domain} on port ${port}...`,
	task: () =>
		pify(tcpp.probe, { multiArgs: true })(domain, port).then((result) => {
			if (!result[0]) {
				throw new Error(
					`Cannot reach ${domain}:${port} - is your server running?`,
				);
			}
		}),
});

module.exports = createTask;
