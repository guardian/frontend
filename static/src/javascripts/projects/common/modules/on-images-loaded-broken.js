import bean from 'bean';
import { memoize } from 'lodash-es';

const getFuncId = (rules) => rules.bodySelector || 'document';

const query = (selector, context) => [
	...(context ?? document).querySelectorAll(selector),
];

export const onImagesLoadedBroken = memoize((rules) => {
	const notLoaded = query('img', rules.body).filter((img) => !img.complete);

	return notLoaded.length === 0
		? Promise.resolve()
		: new Promise((resolve) => {
				let loadedCount = 0;
				bean.on(rules.body, 'load', notLoaded, function onImgLoaded() {
					loadedCount += 1;
					if (loadedCount === notLoaded.length) {
						bean.off(rules.body, 'load', onImgLoaded);
						notLoaded.length = 0;
						resolve();
					}
				});
		  });
}, getFuncId);
