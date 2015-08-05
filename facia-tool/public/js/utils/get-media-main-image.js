import _ from 'underscore';
import deepGet from 'utils/deep-get';
import * as vars from 'modules/vars';

export default function (contentApiArticle) {
    var mainImage = _.find(
        deepGet(contentApiArticle, '.blocks.main.elements') || [],
        function (element) { return element.type === 'image'; }
    );
    var mediaId = deepGet(mainImage, '.imageTypeData.mediaId');
    if (mediaId && deepGet(mainImage, '.imageTypeData.mediaApiUri')) {
        return vars.pageConfig.mediaBaseUrl + '/images/' + mediaId;
    }
}
