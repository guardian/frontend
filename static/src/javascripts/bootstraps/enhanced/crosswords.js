import init from 'common/modules/crosswords/main';
import initComments from 'common/modules/crosswords/comments';
import initSeries from 'common/modules/crosswords/series';
export default {
    init: function() {
        init();
        initComments();
        initSeries();
    }
};
