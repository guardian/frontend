// @flow
import $ from 'lib/$';
import config from 'lib/config';
import { isBreakpoint } from 'lib/detect';
import mediator from 'lib/mediator';
import { catchErrorsWithContext } from 'lib/robust';
import { shouldHideFlashingElements } from 'common/modules/accessibility/helpers';
import stocks from 'common/modules/business/stocks';
import { GeoMostPopularFront } from 'facia/modules/onwards/geo-most-popular-front';
import { ContainerToggle } from 'facia/modules/ui/container-toggle';
import { init as initShowMore } from 'facia/modules/ui/container-show-more';
import { lazyLoadContainers } from 'facia/modules/ui/lazy-load-containers';
import { showUpdatesFromLiveBlog } from 'facia/modules/ui/live-blog-updates';
import snaps from 'facia/modules/ui/snaps';
import sponsorship from 'facia/modules/ui/sponsorship';
import { Weather } from 'facia/modules/onwards/weather';
import partial from 'lodash/functions/partial';

const modules = {
    showSnaps() {
        snaps.init();
        mediator.on('modules:container:rendered', snaps.init);
    },

    showContainerShowMore() {
        mediator.addListeners({
            'modules:container:rendered': initShowMore,
            'page:front:ready': initShowMore,
        });
    },

    showContainerToggle() {
        const containerToggleAdd = context => {
            $(
                '.js-container--toggle',
                $(context || document)[0]
            ).each(container => {
                const toggle = new ContainerToggle(container);
                toggle.addToggle();
            });
        };
        mediator.addListeners({
            'page:front:ready': containerToggleAdd,
            'modules:geomostpopular:ready': partial(
                containerToggleAdd,
                '.js-popular-trails'
            ),
        });
    },

    upgradeMostPopularToGeo() {
        if (config.get('switches.geoMostPopular')) {
            new GeoMostPopularFront().go();
        }
    },

    showWeather() {
        if (config.get('switches.weather')) {
            mediator.on('page:front:ready', () => {
                Weather.init();
            });
        }
    },

    showLiveblogUpdates() {
        if (
            isBreakpoint({
                min: 'desktop',
            })
        ) {
            mediator.on('page:front:ready', () => {
                showUpdatesFromLiveBlog();
            });
        }
    },

    finished() {
        mediator.emit('page:front:ready');
    },
};

const init = () => {
    catchErrorsWithContext([
        ['f-accessibility', shouldHideFlashingElements],
        ['f-snaps', modules.showSnaps],
        ['f-show-more', modules.showContainerShowMore],
        ['f-container-toggle', modules.showContainerToggle],
        ['f-geo-most-popular', modules.upgradeMostPopularToGeo],
        ['f-lazy-load-containers', lazyLoadContainers],
        ['f-stocks', stocks],
        ['f-sponsorship', sponsorship],
        ['f-weather', modules.showWeather],
        ['f-live-blog-updates', modules.showLiveblogUpdates],
        ['f-finished', modules.finished],
    ]);
};

export { init };
