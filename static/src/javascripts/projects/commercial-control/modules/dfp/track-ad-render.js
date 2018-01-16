// @flow
import waitForAdvert from 'commercial-legacy/modules/dfp/wait-for-advert';

export const trackAdRender = (id: string) =>
    waitForAdvert(id).then(_ => _.whenRendered);
