import { initCrosswords } from 'common/modules/crosswords/main';
import { initCrosswordDiscussion } from 'common/modules/crosswords/comments';
import { initSeries } from 'common/modules/crosswords/series';
import {initAccessibleCrosswordSolutionsDisclosure} from "common/modules/crosswords/accessible-crossword-solutions";

export const init = () => {
    initCrosswords();
    initCrosswordDiscussion();
    initAccessibleCrosswordSolutionsDisclosure()
    initSeries();
};
