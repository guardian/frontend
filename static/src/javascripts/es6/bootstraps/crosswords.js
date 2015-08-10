import init from 'es6/projects/common/modules/crosswords/main';
import thumbnails from 'es6/projects/common/modules/crosswords/thumbnails';
import config from 'common/utils/config';


export default {
    init: function () {
        console.log("Wotchara! " + config.page.isBlind);
        if(!config.page.isBlind) {
            init();
        }
        thumbnails.init();
    }
};
