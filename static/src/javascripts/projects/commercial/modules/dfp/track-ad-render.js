import waitForAdvert from 'commercial/modules/dfp/wait-for-advert';
export default trackAdRender;

function trackAdRender(id) {
    return waitForAdvert(id).then(_ => _.whenRendered);
}
