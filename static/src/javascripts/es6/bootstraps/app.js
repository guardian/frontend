import crosswords from './crosswords';
import crosswordThumbnails from 'es6/projects/common/modules/crosswords/thumbnails';

var boot = function () {
    crosswords.init();
    crosswordThumbnails.init();
};

// TODO: IE8
if (document.readyState === 'complete') {
    boot();
} else {
    document.addEventListener('DOMContentLoaded', boot);
}
