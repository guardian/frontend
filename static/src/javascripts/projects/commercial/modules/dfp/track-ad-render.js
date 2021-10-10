import { waitForAdvert } from './wait-for-advert';

export const trackAdRender = (id) =>
	waitForAdvert(id).then((_) => _.whenRendered);
