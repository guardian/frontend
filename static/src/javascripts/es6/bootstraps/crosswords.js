import init from 'es6/projects/common/modules/crosswords/main';
import thumbnails from 'es6/projects/common/modules/crosswords/thumbnails';
import config from 'common/utils/config';
import loadComments from 'es6/projects/common/modules/crosswords/comments';
import renderSeries from 'es6/projects/common/modules/crosswords/series';

export default {
    init: function () {
        console.log("Wotchara! " + config.page.isBlind);
        if(!config.page.isBlind) {
            init();
        }
        console.log("Otchera");
        thumbnails.init();
        loadComments();
        renderSeries();
    }
};
