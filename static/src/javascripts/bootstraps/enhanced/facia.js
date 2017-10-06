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

const showSnaps = (): void => {
    snaps.init();
    mediator.on('modules:container:rendered', snaps.init);
};

const showContainerShowMore = (): void => {
    mediator.addListeners({
        'modules:container:rendered': initShowMore,
        'page:front:ready': initShowMore,
    });
};

const showContainerToggle = (): void => {
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
};

const upgradeMostPopularToGeo = (): void => {
    if (config.get('switches.geoMostPopular')) {
        new GeoMostPopularFront().go();
    }
};

const showWeather = (): void => {
    if (config.get('switches.weather')) {
        mediator.on('page:front:ready', () => {
            Weather.init();
        });
    }
};

const showLiveblogUpdates = (): void => {
    if (
        isBreakpoint({
            min: 'desktop',
        })
    ) {
        mediator.on('page:front:ready', () => {
            showUpdatesFromLiveBlog();
        });
    }
};

const finished = (): void => {
    mediator.emit('page:front:ready');
};

const init = (): void => {
    catchErrorsWithContext([
        ['f-accessibility', shouldHideFlashingElements],
        ['f-snaps', showSnaps],
        ['f-show-more', showContainerShowMore],
        ['f-container-toggle', showContainerToggle],
        ['f-geo-most-popular', upgradeMostPopularToGeo],
        ['f-lazy-load-containers', lazyLoadContainers],
        ['f-stocks', stocks],
        ['f-sponsorship', sponsorship],
        ['f-weather', showWeather],
        ['f-live-blog-updates', showLiveblogUpdates],
        ['f-finished', finished],
    ]);
};

export { init };
