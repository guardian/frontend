import init from 'es6/projects/common/modules/crosswords/main';
import thumbnails from 'es6/projects/common/modules/crosswords/thumbnails';
import initComments from 'es6/projects/common/modules/crosswords/comments';
import initSeries from 'es6/projects/common/modules/crosswords/series';

export default {
    init: function () {
        init();
        thumbnails.init();
        initComments();
        initSeries();
    }
};
