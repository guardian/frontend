// @flow
import { waitForAdvert } from 'commercial/modules/dfp/wait-for-advert';

export const trackAdRender = (id: string) =>
    waitForAdvert(id).then(_ => _.whenRendered);
