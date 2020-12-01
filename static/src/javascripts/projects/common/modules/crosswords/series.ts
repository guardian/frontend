import { OnwardContent } from 'common/modules/onward/onward-content';
import config from 'lib/config';
import { addProximityLoader } from 'lib/proximity-loader';

export const initSeries = (): void => {
    const els = document.getElementsByClassName('js-onward');

    if (els.length > 0) {
        const el = els[0];

        addProximityLoader(el, 1500, () => {
            if (
                config.get('page.seriesId') &&
                config.get('page.showRelatedContent')
            ) {
                // eslint-disable-next-line no-new
                new OnwardContent(el);
            }
        });
    }
};
