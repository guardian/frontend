import { initCrosswords } from 'common/modules/crosswords/main';
import { initCrosswordDiscussion } from 'common/modules/crosswords/comments';
import { initSeries } from 'common/modules/crosswords/series';

export const init = () => {
    initCrosswords();
    initCrosswordDiscussion();
    initSeries();
};
