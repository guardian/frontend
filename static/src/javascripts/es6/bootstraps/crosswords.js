import init from 'es6/projects/common/modules/crosswords/main';
import thumbnails from 'es6/projects/common/modules/crosswords/thumbnails';

export default {
    init: function () {
        init();
        thumbnails.init();
    }
};
