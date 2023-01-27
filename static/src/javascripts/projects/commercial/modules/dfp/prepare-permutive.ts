import { reportError } from '../../../../lib/report-error';

interface PermutivePageConfig {
	page: Pick<
		PageConfig,
		| 'isPaidContent'
		| 'pageId'
		| 'headline'
		| 'contentType'
		| 'section'
		| 'author'
		| 'keywords'
		| 'webPublicationDate'
		| 'series'
		| 'edition'
		| 'toneIds'
	>;
	user?: UserConfig;
	ophan?: Config['ophan'];
}

type PermutiveSchema = {
	content: {
		premium?: boolean;
		id?: string;
		title?: string;
		type?: string;
		section?: string;
		authors?: string[];
		keywords?: string[];
		publishedAt?: string;
		series?: string;
		tone?: string[];
	};
	user: {
		edition?: string;
		identity?: boolean;
	};
};

type PermutiveConfigValue = string | string[] | boolean | null | undefined;

const isEmpty = (
	value:
		| PermutiveConfigValue
		| PermutiveSchema['content']
		| PermutiveSchema['user'],
): boolean =>
	value === '' ||
	value === null ||
	typeof value === 'undefined' ||
	(Array.isArray(value) && value.length === 0) ||
	(typeof value === 'object' && Object.keys(value).length === 0);

const removeEmpty = <
	T = PermutiveSchema | PermutiveSchema['content'] | PermutiveSchema['user'],
>(
	payload: T,
): T => {
	let key: keyof typeof payload;
	for (key in payload) {
		if (typeof payload[key] === 'object') {
			removeEmpty(payload[key]);
		}
		if (isEmpty(payload[key] as PermutiveConfigValue)) {
			delete payload[key];
		}
	}
	return payload;
};

const generatePayload = ({
	page,
	user,
}: PermutivePageConfig): PermutiveSchema => {
	const {
		isPaidContent,
		pageId,
		headline,
		contentType,
		section,
		author,
		keywords,
		webPublicationDate,
		series,
		edition,
		toneIds,
	} = page;

	const safeAuthors = (
		author && typeof author === 'string' ? author.split(',') : []
	).map((str) => str.trim());
	const safeKeywords = (
		keywords && typeof keywords === 'string' ? keywords.split(',') : []
	).map((str) => str.trim());
	const safePublishedAt =
		webPublicationDate && typeof webPublicationDate === 'number'
			? new Date(webPublicationDate).toISOString()
			: '';
	const safeToneIds = (
		toneIds && typeof toneIds === 'string' ? toneIds.split(',') : []
	).map((str) => str.trim());
	const cleanPayload = removeEmpty({
		content: {
			premium: isPaidContent,
			id: pageId,
			title: headline,
			type: contentType,
			section,
			authors: safeAuthors,
			keywords: safeKeywords,
			publishedAt: safePublishedAt,
			series,
			tone: safeToneIds,
		},
		user: {
			edition,
			identity: isEmpty(user) ? false : !isEmpty(user?.id),
		},
	});

	return cleanPayload;
};

const generatePermutiveIdentities = (
	config: PermutivePageConfig,
): Array<{ tag: 'ophan'; id: string }> => {
	if (
		typeof config.ophan === 'object' &&
		typeof config.ophan.browserId === 'string' &&
		config.ophan.browserId.length > 0
	) {
		return [{ tag: 'ophan', id: config.ophan.browserId }];
	}
	return [];
};

const runPermutive = (
	pageConfig: PermutivePageConfig,
	permutiveGlobal: Permutive | undefined,
	logger: typeof reportError,
): void => {
	try {
		if (!permutiveGlobal?.addon) {
			throw new Error('Global Permutive setup error');
		}

		const permutiveIdentities = generatePermutiveIdentities(pageConfig);
		if (permutiveGlobal.identify && permutiveIdentities.length > 0) {
			permutiveGlobal.identify(permutiveIdentities);
		}

		const payload = generatePayload(pageConfig);
		permutiveGlobal.addon('web', {
			page: payload,
		});
	} catch (err) {
		logger(err, { feature: 'commercial' }, false);
	}
};

/**
 * Initialise Permutive user segmentation - reads data stored by third-party-tags permutive script for ad targeting
 * https://permutive.com/audience-platform/publishers/
 * @returns Promise
 */
export const initPermutive = (): Promise<void> => {
	/* eslint-disable -- permutive code */
	// From here until we re-enable eslint is the Permutive code
	// that we received from them.
	// Please do not change unless you've consulted with Permutive
	// and confirmed the change is safe.
	(function (n, e, o, r, i) {
		if (!e) {
			(e = e || {}),
				(window.permutive = e),
				(e.q = []),
				(e.config = i || {}),
				(e.config.projectId = o),
				(e.config.apiKey = r),
				(e.config.environment = e.config.environment || 'production');
			for (
				let t = [
						'addon',
						'identify',
						'track',
						'trigger',
						'query',
						'segment',
						'segments',
						'ready',
						'on',
						'once',
						'user',
						'consent',
					],
					c = 0;
				c < t.length;
				c++
			) {
				const f = t[c];
				// @ts-expect-error -- best not to change this code from permutive
				e[f] = (function (n) {
					return function () {
						const o = Array.prototype.slice.call(arguments, 0);
						// @ts-expect-error -- best not to change this code from permutive
						e.q.push({ functionName: n, arguments: o });
					};
				})(f);
			}
		}
	})(
		document,
		window.permutive,
		'd6691a17-6fdb-4d26-85d6-b3dd27f55f08',
		'359ba275-5edd-4756-84f8-21a24369ce0b',
		{},
	);
	/* eslint-enable */
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- this is a stub
	(window.googletag = window.googletag || {}),
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- this is a stub
		(window.googletag.cmd = window.googletag.cmd || []),
		window.googletag.cmd.push(() => {
			if (
				window.googletag.pubads().getTargeting('permutive').length === 0
			) {
				const g = window.localStorage.getItem('_pdfps');
				window.googletag
					.pubads()
					.setTargeting('permutive', g ? JSON.parse(g) : []);
			}
		});
	const permutiveConfig: PermutivePageConfig = {
		user: window.guardian.config.user,
		page: window.guardian.config.page,
		ophan: window.guardian.config.ophan,
	};
	runPermutive(permutiveConfig, window.permutive, reportError);

	return Promise.resolve();
};

export const _ = {
	isEmpty,
	removeEmpty,
	generatePayload,
	generatePermutiveIdentities,
	runPermutive,
};
