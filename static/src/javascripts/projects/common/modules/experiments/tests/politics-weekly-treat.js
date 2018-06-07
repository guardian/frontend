// @flow
import template from 'lodash/utilities/template';
import treatHtml from 'raw-loader!journalism/views/politicsWeeklyTreat.html';
import config from 'lib/config';
import { getBreakpoint } from 'lib/detect';
import { addClassesAndTitle } from 'common/views/svg';

import logo from 'svgs/journalism/politics-weekly-treat/UK-Politics-420.svg';
import aButton from 'svgs/journalism/politics-weekly-treat/a-play-btn-black.svg';
import aWave from 'svgs/journalism/politics-weekly-treat/a-wave.svg';
import aWaveSmall from 'svgs/journalism/politics-weekly-treat/a-wave-small.svg';
import bIcon from 'svgs/journalism/politics-weekly-treat/b-AudioIcon.svg';
import bWave from 'svgs/journalism/politics-weekly-treat/b-wave.svg';
import bWaveSmall from 'svgs/journalism/politics-weekly-treat/b-wave-small.svg';

const runTest = (variant: string) => (): void => {
    const headlinesContainer = document.querySelector('.facia-page #headlines');

    if (headlinesContainer) {
        const treats = headlinesContainer.querySelector('.treats__container');
        if (treats) {
            const newTreat = template(treatHtml, {
                variant,
                logo: logo.markup,
                aButton: addClassesAndTitle(aButton.markup, [
                    'politics-weekly-treat__player-button',
                ]),
                aWave: addClassesAndTitle(aWave.markup, [
                    'politics-weekly-treat__player-wave',
                    'politics-weekly-treat__player-wave-large',
                ]),
                aWaveSmall: addClassesAndTitle(aWaveSmall.markup, [
                    'politics-weekly-treat__player-wave',
                    'politics-weekly-treat__player-wave-small',
                ]),
                bIcon: addClassesAndTitle(bIcon.markup, [
                    'politics-weekly-treat__player-button',
                ]),
                bWave: addClassesAndTitle(bWave.markup, [
                    'politics-weekly-treat__player-wave',
                    'politics-weekly-treat__player-wave-large',
                ]),
                bWaveSmall: addClassesAndTitle(bWaveSmall.markup, [
                    'politics-weekly-treat__player-wave',
                    'politics-weekly-treat__player-wave-small',
                ]),
            });
            treats.innerHTML = newTreat;
        }
    }
};

const trackClick = (complete: () => void): void => {
    const treat = document.querySelector('.politics-weekly-treat');
    if (treat) {
        treat.onclick = () => {
            complete();
        };
    }
};

const trackImpression = (track: () => void): void => {
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
    // TODO - correct dates
    start: '2018-06-07',
    expiry: '2018-06-13',
    author: 'Tom Forbes',
    description:
        'Test linking to latest episode of Politics Weekly podcast using a treat in the Headlines container',
    audience: 0.5,
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
