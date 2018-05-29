// @flow
import template from 'lodash/utilities/template';
import treatHtml from 'raw-loader!journalism/views/politicsWeeklyTreat.html';
import bHtml from 'raw-loader!journalism/views/politicsWeeklyB.html';
import cHtml from 'raw-loader!journalism/views/politicsWeeklyC.html';
import config from 'lib/config';
import { getBreakpoint } from 'lib/detect';

const runTestA = function(variant: string): () => void {
    return () => {
        console.log("test A ran ");
        const headlinesContainer = document.querySelector(
            '.facia-page #headlines'
        );

        if (headlinesContainer) {
            const treats = headlinesContainer.querySelector(
                '.treats__container'
            );
            if (treats) {
                const newTreat = template(treatHtml, { variant });
                treats.innerHTML = newTreat;
            }
        }
    };
};

const runTestB = function(): () => void {
    return () => {
        console.log("test B ran ");
        const headlinesContainer = document.querySelector(
            '.facia-page #headlines'
        );
        let tempDiv = document.createElement('section');
        tempDiv.classList.add("b__container");

        if (headlinesContainer) {
            const componentB = headlinesContainer.insertAdjacentElement('afterend', tempDiv );
            if (componentB) {
                const advertB = template(bHtml, {});
                componentB.innerHTML = advertB;
            }
        }
    }
};

const runTestC = function(): () => void {
  return () => {
      console.log("test C ran ");
      const spotLightInnerContainer = document.querySelector(
          '.facia-page #spotlight .fc-container__body'
      );
      let tempDiv = document.createElement('div');
      tempDiv.classList.add("c__container");

      if (spotLightInnerContainer) {
          const componentC = spotLightInnerContainer.insertAdjacentElement('beforeend', tempDiv );
          if (componentC) {
              const advertC = template(cHtml, {});
              componentC.innerHTML = advertC;
          }
      }
  }
};

const trackClick = function(complete: () => void, variant: string) {
    const elClass = getElement(variant);
    console.log("elClass", elClass);
    const el = document.querySelector(`.${elClass}`);
    if (el) {
        el.onclick = () => {
            complete();
        };
    }
};

const getElement = (variant) => {
    switch (variant) {
        case 'a':
            return 'politics-weekly-treat';
        case 'b':
            return 'b__container';
        case 'c':
            return 'c__container';
        default: return '';
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

export const PoliticsWeeklyPlacement = {
    id: 'PoliticsWeeklyPlacement',
    // TODO - correct dates
    start: '2018-04-24',
    expiry: '2018-06-01',
    author: 'Tom Forbes',
    description:
        'Test the effect of linking to latest episode of Politics Weekly from different places in the fronts page',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'Measure clicks and click-through across the variants',
    audienceCriteria: '',
    showForSensitive: true,
    canRun() {
        return config.page.pageId === 'uk' && getBreakpoint() !== 'mobile';
    },

    variants: [
        {
            id: 'a',
            test: runTestA('a'),
            impression: trackImpression,
            success: trackClick(complete, 'a'),
        },
        {
            id: 'b',
            test: runTestB(),
            impression: trackImpression,
            success: trackClick(complete, 'b'),
        },
        {
            id: 'c',
            test: runTestC(),
            impression: trackImpression,
            success: trackClick(complete, 'c'),
        },
    ],
};
