import { waitForAdvert } from './wait-for-advert';

export const trackAdRender = (id: string): Promise<boolean> =>
	waitForAdvert(id).then((advert) => advert.whenRendered);
