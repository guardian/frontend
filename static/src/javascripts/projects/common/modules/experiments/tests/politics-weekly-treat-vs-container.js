// @flow
import template from 'lodash/utilities/template';
import treatHtml from 'raw-loader!journalism/views/politicsWeeklyTreat.html';
import containerHtml from 'raw-loader!journalism/views/politicsWeeklyContainer.html';
import config from 'lib/config';
import { getBreakpoint } from 'lib/detect';
import { addClassesAndTitle } from 'common/views/svg';

import logo from 'svgs/journalism/politics-weekly-treat/UK-Politics-420.svg';
import button from 'svgs/journalism/politics-weekly-treat/a-play-btn-black.svg';
import wave from 'svgs/journalism/politics-weekly-treat/wave.svg';
import waveSmall from 'svgs/journalism/politics-weekly-treat/wave-small.svg';

import containerWave from 'svgs/journalism/politics-weekly-container/waveform.svg';
import containerButton from 'svgs/journalism/politics-weekly-container/play-btnbig.svg';

const runTreatTest = (): void => {
    const headlinesContainer = document.querySelector('.facia-page #headlines');
    if (headlinesContainer) {

        const newTreat = template(treatHtml, {
            logo: logo.markup,
            button: addClassesAndTitle(button.markup, [
                'politics-weekly-treat__player-button',
            ]),
            wave: addClassesAndTitle(wave.markup, [
                'politics-weekly-treat__player-wave',
                'politics-weekly-treat__player-wave-large',
            ]),
            waveSmall: addClassesAndTitle(waveSmall.markup, [
                'politics-weekly-treat__player-wave',
                'politics-weekly-treat__player-wave-small',
            ]),
        });

        const breakpoint = getBreakpoint(true);
        if (breakpoint === 'leftCol' || breakpoint === 'wide') {
            //In the headlines container's treat spot
            const html = `<div>${newTreat}</div>`;
            
            const treats = headlinesContainer.querySelector('.treats__container');
            if (treats) {
                treats.innerHTML = html;
            }
        } else {
            //As a new section under headlines
            const html = `<section class='fc-container'><div class='fc-container__inner politics-weekly-treat__container'>${newTreat}</div></section>`;
            headlinesContainer.insertAdjacentHTML('afterend', html);
        }
    }
};

const runContainerTest = (): void => {
    const spotlightContainer = document.querySelector('.facia-page #spotlight');

    if (spotlightContainer) {
        const newContainer = template(containerHtml, {
            logo: logo.markup,
            button: addClassesAndTitle(containerButton.markup, [
                'politics-weekly-container__button',
            ]),
            wave: addClassesAndTitle(containerWave.markup, [
                'politics-weekly-container__wave',
            ]),
        });
        spotlightContainer.insertAdjacentHTML('beforebegin', newContainer);
    }
};

const trackClick = (name: string) => (complete: () => void): void => {
    const treat = document.querySelector(`.${name}`);
    if (treat) {
        treat.onclick = () => {
            complete();
        };
    }
};

const trackImpression = (name: string) => (track: () => void): void => {
    const treat = document.querySelector(`.${name}`);
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

export const PoliticsWeeklyTreatVsContainer = {
    id: 'PoliticsWeeklyTreatVsContainer',
    // TODO - correct dates
    start: '2018-06-20',
    expiry: '2018-07-13',
    author: 'Tom Forbes',
    description:
        'Test linking to latest episode of Politics Weekly podcast using a treat in the Headlines container',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'Measure click-through across the variants',
    audienceCriteria: '',
    showForSensitive: true,
    canRun() {
        return config.page.pageId === 'uk';
    },

    variants: [
        {
            id: 'treat',
            test: runTreatTest,
            impression: trackImpression('politics-weekly-treat'),
            success: trackClick('politics-weekly-treat'),
        },
        {
            id: 'container',
            test: runContainerTest,
            impression: trackImpression('politics-weekly-container'),
            success: trackClick('politics-weekly-container'),
        },
    ],
};
