/* eslint-disable no-new */
import config from 'lib/config';
import qwery from 'qwery';
import $ from 'lib/$';
import { catchErrorsWithContext } from 'lib/robust';
import { isBreakpoint } from 'lib/detect';
import { mediator } from 'lib/mediator';
import { getUrlVars } from 'lib/url';
import {
    upgradeRichLinks,
} from 'common/modules/article/rich-links';
import { upgradeMembershipEvents } from 'common/modules/article/membership-events';
import { geoMostPopular } from 'common/modules/onward/geo-most-popular';
import { handleCompletion as handleQuizCompletion } from 'common/modules/atoms/quiz';
import { init as initLiveblogCommon } from 'bootstraps/enhanced/article-liveblog-common';
import { initTrails } from 'bootstraps/enhanced/trail';
import { initCampaign } from 'journalism/modules/render-campaign';

import ophan from 'ophan/ng';

const modules = {
    initCmpParam() {
        const allvars = getUrlVars();

        if (allvars.CMP) {
            $('.element-pass-cmp').each(el => {
                el.src = `${el.src}?CMP=${allvars.CMP}`;
            });
        }
    },

    initRightHandComponent() {
        const mainColumn = qwery('.js-content-main-column');
        // only render when we have >1000px or more (enough space for ad + most popular)
        if (
            !config.hasTone('Match reports') &&
            mainColumn[0] &&
            mainColumn[0].offsetHeight > 1150 &&
            isBreakpoint({
                min: 'desktop',
            })
        ) {
            geoMostPopular.render();
        } else {
            mediator.emit('modules:onward:geo-most-popular:cancel');
        }
    },

    initQuizListeners() {
        // This event is for older-style quizzes implemented as interactives. See https://github.com/guardian/quiz-builder
        mediator.on('quiz/ophan-event', ophan.record);
    },

    emitReadyEvent() {
        mediator.emit('page:article:ready');
    },
};

const init = () => {
    catchErrorsWithContext([
        ['article-trails', initTrails],
        ['article-liveblog-common', initLiveblogCommon],
        ['article-righthand-component', modules.initRightHandComponent],
        ['article-cmp-param', modules.initCmpParam],
        ['article-quiz-listeners', modules.initQuizListeners],
        ['article-rich-links', upgradeRichLinks],
        ['article-upgrade-membership-events', upgradeMembershipEvents],
        ['article-mediator-emit-event', modules.emitReadyEvent],
        ['article-handle-quiz-completion', handleQuizCompletion],
        ['article-campaign', initCampaign],
    ]);
};

export { init };
