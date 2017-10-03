// @flow
import config from 'lib/config';
import proximityLoader from 'lib/proximity-loader';
import { OnwardContent } from 'common/modules/onward/onward-content';

export const initSeries = () => {
    const el = document.getElementsByClassName('js-onward');

    if (el.length > 0) {
        proximityLoader.add(el[0], 1500, () => {
            if (
                config.get('page.seriesId') &&
                config.get('page.showRelatedContent')
            ) {
                // eslint-disable-next-line no-new
                new OnwardContent(document.getElementsByClassName('js-onward'));
            }
        });
    }
};
