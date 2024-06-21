import tcpp from 'tcp-ping';
import pify from 'pify';

export default (domain, port) => ({
	description: `Probing ${domain} on port ${port}...`,
	task: () =>
		pify(tcpp.probe, { multiArgs: true })(domain, port).then((result) => {
			if (!result[0]) {
				throw new Error(
					`Cannot reach ${domain}:${port} - is your server running?`,
				);
			}
		}),
});
