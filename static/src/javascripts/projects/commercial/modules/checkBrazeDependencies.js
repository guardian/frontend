import { getBrazeUuid } from './getBrazeUuid';
import config from '../../../lib/config';
import { hasRequiredConsents } from './hasRequiredConsents.js';
import { shouldNotBeShownSupportMessaging } from 'common/modules/commercial/user-features';

const buildFailureResponse = (name, value, data) => ({
	isSuccessful: false,
	failure: {
		field: name,
		data: value,
	},
	data,
});

const buildDependencies = () => {
	return [
		{
			name: 'brazeSwitch',
			value: Promise.resolve(config.get('switches.brazeSwitch')),
		},
		{
			name: 'apiKey',
			value: Promise.resolve(config.get('page.brazeApiKey')),
		},
		{
			name: 'brazeUuid',
			value: getBrazeUuid(),
		},
		{
			name: 'consent',
			value: hasRequiredConsents(),
		},
		{
			name: 'userIsGuSupporter',
			value: Promise.resolve(shouldNotBeShownSupportMessaging()),
		},
		{
			name: 'isNotPaidContent',
			value: Promise.resolve(!config.get('page').isPaidContent),
		},
	];
};

const checkBrazeDependencies = async () => {
	const dependencies = buildDependencies();

	const data = {};

	for (const { name, value } of dependencies) {
		try {
			// eslint-disable-next-line no-await-in-loop
			const result = await value;

			if (result) {
				data[name] = result;
			} else {
				return buildFailureResponse(name, result, data);
			}
		} catch (e) {
			return buildFailureResponse(
				name,
				e && e.message ? e.message : e,
				data,
			);
		}
	}

	return {
		isSuccessful: true,
		data,
	};
};

export { checkBrazeDependencies };
