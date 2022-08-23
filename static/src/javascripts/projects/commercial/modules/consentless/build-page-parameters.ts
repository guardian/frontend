import { getCookie } from '@guardian/libs';

type PartialWithNulls<T> = { [P in keyof T]?: T[P] | null };

type PageParameters = PartialWithNulls<{
	keyword: string;
	section: string;
}>;

const buildPageParameters = (): PageParameters => {
	const adtest = getCookie({ name: 'adtest', shouldMemoize: true });

	// at the moment only the keyword is used for targeting
	if (adtest) {
		return {
			keyword: adtest,
		};
	}
	return {};
};

export { buildPageParameters };
