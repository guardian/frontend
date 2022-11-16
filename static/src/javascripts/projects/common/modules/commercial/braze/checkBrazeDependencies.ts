import config from '../../../../../lib/config';
import { getBrazeUuid } from './getBrazeUuid';
import { hasRequiredConsents } from './hasRequiredConsents';

type SuccessResult = {
	isSuccessful: true;
	data: ResultData;
};

type FailureResult = {
	isSuccessful: false;
	failure: {
		field: string;
		data: DependencyResultValue;
	};
	data: ResultData;
};

type DependenciesResult = SuccessResult | FailureResult;

type ResultData = Record<string, string | boolean>;

type DependencyResultValue = string | boolean | null | undefined | void;

type DependencyResult = {
	name: string;
	value: Promise<DependencyResultValue>;
};

const buildFailureResponse = (
	name: string,
	value: DependencyResultValue,
	data: ResultData,
) => ({
	isSuccessful: false,
	failure: {
		field: name,
		data: value,
	},
	data,
});

const buildDependencies = (): DependencyResult[] => {
	return [
		{
			name: 'apiKey',
			value: Promise.resolve(config.get('page.brazeApiKey')),
		},
		{
			name: 'brazeSwitch',
			value: Promise.resolve(config.get('switches.brazeSwitch')),
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
			name: 'isNotPaidContent',
			value: Promise.resolve(!config.get('page.isPaidContent')),
		},
	];
};

const checkBrazeDependencies = async (): Promise<DependenciesResult> => {
	const dependencies = buildDependencies();

	const data: ResultData = {};

	for (const { name, value } of dependencies) {
		try {
			const result = await value;

			if (result) {
				data[name] = result;
			} else {
				return buildFailureResponse(name, result, data);
			}
		} catch (error) {
			return buildFailureResponse(
				name,
				error instanceof Error ? error.message : 'Unknown error',
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
