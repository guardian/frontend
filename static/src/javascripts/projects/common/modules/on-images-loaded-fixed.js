import { memoize } from 'lodash-es';

const getFuncId = (rules) => rules.bodySelector || 'document';

const query = (selector, context) => [
	...(context ?? document).querySelectorAll(selector),
];

export const onImagesLoadedFixed = memoize((rules) => {
	const notLoaded = query('img', rules.body).filter(
		(img) => !img.complete && img.loading !== 'lazy',
	);

	return notLoaded.length === 0
		? Promise.resolve()
		: new Promise((resolve) => {
				let loadedCount = 0;
				notLoaded.forEach((img) =>
					img.addEventListener('load', () => {
						loadedCount += 1;
						if (loadedCount === notLoaded.length) {
							resolve();
						}
					}),
				);
		  });
}, getFuncId);
