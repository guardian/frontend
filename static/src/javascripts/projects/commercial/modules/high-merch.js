// @flow
import config from 'lib/config';
import fastdom from 'lib/fastdom-promise';
import ab from 'common/modules/experiments/ab';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import createSlot from 'commercial/modules/dfp/create-slot';
import trackAdRender from 'commercial/modules/dfp/track-ad-render';
import commercialFeatures from 'commercial/modules/commercial-features';

const isLuckyBastard = () => {
    const testName = 'PaidContentVsOutbrain2';
    return (
        ab.testCanBeRun(testName) &&
        ab.getTestVariantId(testName) === 'paid-content'
    );
};

const insertAlternativeSlot = isHiResLoaded => {
    if (isHiResLoaded) {
        return;
    }

    const container = document.querySelector(
        !(config.page.seriesId || config.page.blogIds)
            ? '.js-related, .js-outbrain-anchor'
            : '.js-outbrain-anchor'
    );
    const slot = createSlot('high-merch-lucky');

    fastdom
        .write(() => {
            if (container && container.parentNode) {
                container.parentNode.insertBefore(slot, container.nextSibling);
            }
        })
        .then(() => {
            addSlot(slot, true);
        });
};

const init = () => {
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

        if (commercialFeatures.outbrain && isLuckyBastard()) {
            trackAdRender('dfp-ad--merchandising-high').then(
                insertAlternativeSlot
            );
        }

        return fastdom.write(() => {
            if (anchor && anchor.parentNode) {
                anchor.parentNode.insertBefore(container, anchor);
            }
        });
    } else if (commercialFeatures.outbrain && isLuckyBastard()) {
        insertAlternativeSlot(false);
    }

    return Promise.resolve();
};

export default {
    init,
};
