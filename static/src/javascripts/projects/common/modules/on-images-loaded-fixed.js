import { memoize } from 'lodash-es';

const getFuncId = (rules) => rules.bodySelector || 'document';

const query = (selector, context) => [
	...(context ?? document).querySelectorAll(selector),
];

export const onImagesLoadedFixed = memoize((rules) => {
	const notLoaded = query('img', rules.body).filter(
		(img) => !img.complete && img.loading !== 'lazy',
	);

	const imgPromises = notLoaded.map(
		(img) =>
			new Promise((resolve) => {
				img.addEventListener('load', resolve);
			}),
	);
	return Promise.all(imgPromises);
}, getFuncId);
