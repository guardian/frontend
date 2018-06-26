// @flow
import template from 'lodash/utilities/template';
import treatHtml from 'raw-loader!journalism/views/footballWeeklyTreat.html';
import containerHtml from 'raw-loader!journalism/views/footballWeeklyContainer.html';
import config from 'lib/config';
import { getBreakpoint } from 'lib/detect';
import { addClassesAndTitle } from 'common/views/svg';

import logo from 'svgs/journalism/football-weekly-treat/UK-Politics-420.svg';
import button from 'svgs/journalism/football-weekly-treat/a-play-btn-black.svg';
import wave from 'svgs/journalism/football-weekly-treat/wave.svg';
import waveSmall from 'svgs/journalism/football-weekly-treat/wave-small.svg';

import containerWave from 'svgs/journalism/football-weekly-container/waveform.svg';
import containerButton from 'svgs/journalism/football-weekly-container/play-btnbig.svg';

const getHeadlineText = (el): string => {
    return el.textContent.split(/[-–]/)[0]
};

const runTreatTest = (): void => {
    //Get the headline from podcast container and insert the test treat
    const podcastContainer = document.querySelector('.facia-page #world-cup-daily');
    const headlinesContainer = document.querySelector('.facia-page #headlines');

    if (headlinesContainer && podcastContainer) {
        const headline = podcastContainer.querySelector('a.js-headline-text');
        const headlineText = getHeadlineText(headline);
        const url = headline.getAttribute("href");

        const newTreat = template(treatHtml, {
            headline: headlineText,
            url: `${url}?CMP=football-weekly-treat`,
            logo: logo.markup,
            button: addClassesAndTitle(button.markup, [
                'football-weekly-treat__player-button',
            ]),
            wave: addClassesAndTitle(wave.markup, [
                'football-weekly-treat__player-wave',
                'football-weekly-treat__player-wave-large',
            ]),
            waveSmall: addClassesAndTitle(waveSmall.markup, [
                'football-weekly-treat__player-wave',
                'football-weekly-treat__player-wave-small',
            ]),
        });

        const breakpoint = getBreakpoint(true);
        if (breakpoint === 'leftCol' || breakpoint === 'wide') {
            // In the headlines container's treat spot
            const html = `<div>${newTreat}</div>`;

            const treats = headlinesContainer.querySelector(
                '.treats__container'
            );
            if (treats) {
                treats.innerHTML = html;
            }
        } else {
            // As a new section under headlines
            const html = `<section class='fc-container'><div class='fc-container__inner football-weekly-treat__container'>${newTreat}</div></section>`;
            headlinesContainer.insertAdjacentHTML('afterend', html);
        }
    }
};

const runContainerTest = (): void => {
    //Find existing container and replace its body with test design
    const podcastContainer = document.querySelector('.facia-page #world-cup-daily');
    const headlinesContainer = document.querySelector('.facia-page #headlines');

    if (headlinesContainer && podcastContainer) {
        const oldBody = podcastContainer.querySelector('.fc-container__body');
        const headline = oldBody.querySelector('a.js-headline-text');
        const url = headline.getAttribute("href");

        const newContainer = template(containerHtml, {
            headline: getHeadlineText(headline),
            url: `${url}?CMP=football-weekly-container`,
            logo: logo.markup,
            button: addClassesAndTitle(containerButton.markup, [
                'football-weekly-container__button',
            ]),
            wave: addClassesAndTitle(containerWave.markup, [
                'football-weekly-container__wave',
            ]),
        });
        oldBody.innerHTML = newContainer;
        podcastContainer.className += 'football-weekly-container__visible';
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

export const FootballWeeklyTreatVsContainer = {
    id: 'FootballWeeklyTreatVsContainer',
    // TODO - correct dates
    start: '2018-06-20',
    expiry: '2018-07-13',
    author: 'Tom Forbes',
    description:
        'Test linking to latest episode of Football Weekly podcast using a treat in the Headlines container',
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
            impression: trackImpression('football-weekly-treat'),
            success: trackClick('football-weekly-treat'),
        },
        {
            id: 'container',
            test: runContainerTest,
            impression: trackImpression('football-weekly-container'),
            success: trackClick('football-weekly-container'),
        },
    ],
};
