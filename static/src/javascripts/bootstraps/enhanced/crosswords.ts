import { initCrosswordDiscussion } from 'common/modules/crosswords/comments';
import { initCrosswords } from 'common/modules/crosswords/main';
import { initSeries } from 'common/modules/crosswords/series';

export const init = (): void => {
    initCrosswords();
    initCrosswordDiscussion();
    initSeries();
};
