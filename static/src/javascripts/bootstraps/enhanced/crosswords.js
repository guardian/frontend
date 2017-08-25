// @flow
import initCrosswords from 'common/modules/crosswords/main';
import initComments from 'common/modules/crosswords/comments';
import initSeries from 'common/modules/crosswords/series';

export const init = (): void => {
    initCrosswords();
    initComments();
    initSeries();
};
