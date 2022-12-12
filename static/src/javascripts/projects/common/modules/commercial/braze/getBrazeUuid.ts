import { getUserIdentifiersFromApi } from 'common/modules/identity/api';

export const getBrazeUuid = (): Promise<string | undefined> =>
	new Promise((resolve) => {
		getUserIdentifiersFromApi((userIdentifiers) => {
			if (userIdentifiers?.brazeUuid) {
				resolve(userIdentifiers.brazeUuid);
			} else {
				resolve(undefined);
			}
		});
	});
