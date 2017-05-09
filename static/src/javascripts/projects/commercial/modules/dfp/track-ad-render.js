// @flow
import waitForAdvert from 'commercial/modules/dfp/wait-for-advert';

const trackAdRender = (id: string) =>
    waitForAdvert(id).then(_ => _.whenRendered);

export default trackAdRender;
