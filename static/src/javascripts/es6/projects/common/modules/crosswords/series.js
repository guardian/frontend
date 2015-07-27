/*eslint-disable no-new*/

import qwery from 'qwery';
import config from 'common/utils/config';
import proximityLoader from 'common/utils/proximity-loader';
import Series from 'common/modules/onward/onward-content';

function insertOrProximity(selector, insert) {
    if (window.location.href) {
        insert();
    } else {
        const el = qwery(selector)[0];

        if (el) {
            proximityLoader(el, 1500, insert);
        }
    }
}


export default() => {

    insertOrProximity('.js-onwards', function () {
        if (config.page.seriesId && config.page.showRelatedContent) {
            new Series(qwery('.js-onward'));
        }
    });
};
