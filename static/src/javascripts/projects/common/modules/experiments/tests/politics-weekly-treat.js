// @flow
import template from 'lodash/utilities/template';
import treatHtml from 'raw-loader!journalism/views/politicsWeeklyTreat.html';
import config from 'lib/config';
import { getBreakpoint } from 'lib/detect';

const runTest = function(variant: String): () => void {
    return () => {
        const container = document.querySelector('.facia-page section:first-child'); // headlines container

        if (container) {
            const treats = container.querySelector('.treats__container');
            if (treats) {
                const newTreat = template(treatHtml, { variant } );
                treats.innerHTML = newTreat;
            }
        }
    }
};

const trackClick = function(complete: () => void) {
    const treat = document.querySelector('.politics-weekly-treat');
    if (treat) {
        treat.onclick = () => {
            complete();
        };
    }
};

const trackImpression = function(track: () => void) {
    const treat = document.querySelector('.politics-weekly-treat');
    if (treat) {
        const observer = new window.IntersectionObserver(
            (entries, self) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        self.disconnect();
                        track();
                    }
                });
            },
            { threshold: 1.0 }
        );
        observer.observe(treat);
    }
};

export const PoliticsWeeklyTreat = {
    id: 'PoliticsWeeklyTreat',
    start: '2018-05-05',
    expiry: '2018-06-01',
    author: 'Tom Forbes',
    description:
        'Test linking to Politics Weekly podcast latest episode using a treat in the Headlines container',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'Measure click-through across the variants',
    audienceCriteria: '',
    showForSensitive: true,
    canRun() {
        return config.page.pageId === 'uk' && getBreakpoint() !== 'mobile';
    },

    variants: [
        {
            id: 'a',
            test: runTest('a'),
            impression: trackImpression,
            success: trackClick,
        },
        {
            id: 'b',
            test: runTest('b'),
            impression: trackImpression,
            success: trackClick,
        },
    ],
};
