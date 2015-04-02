import crosswords from './crosswords';
import crosswordThumbnails from 'es6/projects/common/modules/crosswords/thumbnails';
import domReady from 'domready';

domReady(() => {
    crosswords.init();
    crosswordThumbnails.init();
});
