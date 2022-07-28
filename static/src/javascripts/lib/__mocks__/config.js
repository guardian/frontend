export default {
	get(path, defaultValue) {
		const value = path.split('.').reduce((acc, prop) => {
			if (acc[prop]) {
				return acc[prop];
			}

			return defaultValue;
		}, this);

		if (typeof value !== 'undefined') {
			return value;
		}

		return defaultValue;
	},
};
