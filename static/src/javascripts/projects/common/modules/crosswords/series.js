import config from 'lib/config';
import proximityLoader from 'lib/proximity-loader';
import Series from 'common/modules/onward/onward-content';
export default function() {

    var el = document.getElementsByClassName('js-onward');

    if (el.length > 0) {
        proximityLoader.add(el[0], 1500, function() {
            if (config.page.seriesId && config.page.showRelatedContent) {
                new Series.OnwardContent(document.getElementsByClassName('js-onward'));
            }
        });
    }
};
