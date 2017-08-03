// @flow
import bean from 'bean';
import bonzo from 'bonzo';
import qwery from 'qwery';
import $ from 'lib/$';

const truncateBlockShareIcons = (blockShareEl: HTMLElement): void => {
    const truncated = qwery('> *', blockShareEl).slice(2);

    bonzo(truncated).addClass('u-h');
    $('.js-blockshare-expand', blockShareEl).removeClass('u-h');
};
const initBlockSharing = (): void => {
    bean.on(document.body, 'click', '.js-blockshare-expand', e => {
        const expandButton = bonzo(e.currentTarget);
        const container = expandButton.parent()[0];

        $('> *', container).removeClass('u-h');
        expandButton.addClass('u-h');
    });
    $.forEachElement('.block-share', truncateBlockShareIcons);
};

export default {
    init: initBlockSharing,
    truncateBlockShareIcons,
};
