// @flow
import config from 'lib/config';
import fastdom from 'lib/fastdom-promise';
import createSlot from 'commercial/modules/dfp/create-slot';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';

const init = (): Promise<void> => {
    if (commercialFeatures.highMerch) {
        const anchorSelector = config.page.commentable
            ? '#comments + *'
            : '.content-footer > :first-child';
        const anchor = document.querySelector(anchorSelector);
        const container = document.createElement('div');

        container.className = 'fc-container fc-container--commercial';
        container.appendChild(
            createSlot(
                config.page.isPaidContent ? 'high-merch-paid' : 'high-merch'
            )
        );

        return fastdom.write(() => {
            if (anchor && anchor.parentNode) {
                anchor.parentNode.insertBefore(container, anchor);
            }
        });
    }

    return Promise.resolve();
};

export default {
    init,
};
