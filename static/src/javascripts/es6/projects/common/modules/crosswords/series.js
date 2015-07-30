/*eslint-disable no-new*/

import qwery from 'qwery';
import config from 'common/utils/config';
import proximityLoader from 'common/utils/proximity-loader';
import Series from 'common/modules/onward/onward-content';
import mediator from 'common/utils/mediator';
import thumbnails from 'es6/projects/common/modules/crosswords/thumbnails';


export default() => {

    const el = qwery('.js-onward')[0];

    if (el) {
        proximityLoader.add(el, 1500, function () {
            if (config.page.seriesId && config.page.showRelatedContent) {
                new Series(qwery('.js-onward'));
            }
        });

        mediator.once('modules:onward:loaded', function () {
            thumbnails.init();
        });
    }
};
