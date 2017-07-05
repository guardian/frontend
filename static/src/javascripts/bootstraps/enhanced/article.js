// @flow
/* eslint-disable no-new*/
import qwery from 'qwery';
import $ from 'lib/$';
import detect from 'lib/detect';
import mediator from 'lib/mediator';
import { getUrlVars } from 'lib/url';
import richLinks from 'common/modules/article/rich-links';
import membershipEvents from 'common/modules/article/membership-events';
import { geoMostPopular } from 'common/modules/onward/geo-most-popular';
import quiz from 'common/modules/atoms/quiz';
import storyQuestions from 'common/modules/atoms/story-questions';
import { init as initLiveblogCommon } from 'bootstraps/enhanced/article-liveblog-common';
import trail from 'bootstraps/enhanced/trail';
import ophan from 'ophan/ng';
import { SnippetFeedback } from 'projects/journalism/snippet-feedback';

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
            mainColumn[0] &&
            mainColumn[0].offsetHeight > 1150 &&
            detect.isBreakpoint({
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
};

const init = () => {
    trail();
    initLiveblogCommon();
    modules.initRightHandComponent();
    modules.initCmpParam();
    modules.initQuizListeners();
    richLinks.upgradeRichLinks();
    richLinks.insertTagRichLink();
    membershipEvents.upgradeEvents();
    mediator.emit('page:article:ready');
    quiz.handleCompletion();
    storyQuestions.init();
    SnippetFeedback();
};

export { init };
