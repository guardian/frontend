import config from 'lib/config';
import { mediator } from 'lib/mediator';
import { fetchJson } from 'lib/fetch-json';
import fastdom from 'lib/fastdom-promise';
import { begin, error, end } from 'common/modules/analytics/register';
import { Expandable } from 'common/modules/ui/expandable';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';

const buildExpandable = (el) => {
    new Expandable({
        dom: el,
        expanded: false,
        showCount: false,
    }).init();
};

const popularInTagOverride = () => {
    /* whitelist of tags to override related story component with a
       popular-in-tag component */
    if (!config.get('page.keywordIds')) {
        return false;
    }

    // This list also exists in DCR https://github.com/guardian/dotcom-rendering/blob/88a9693e7ee23e3e7e140ba680b12a19288e96f6/src/web/components/Onwards/Onwards.tsx
    // If you change this list then you should also update ^
    // order matters here (first match wins)
    const whitelistedTags = [
        // sport tags
        'sport/cricket',
        'sport/rugby-union',
        'sport/rugbyleague',
        'sport/formulaone',
        'sport/tennis',
        'sport/cycling',
        'sport/motorsports',
        'sport/golf',
        'sport/horse-racing',
        'sport/boxing',
        'sport/us-sport',
        'sport/australia-sport',

        // football tags
        'football/championsleague',
        'football/premierleague',
        'football/championship',
        'football/europeanfootball',
        'football/world-cup-2014',

        // football team tags
        'football/manchester-united',
        'football/chelsea',
        'football/arsenal',
        'football/manchestercity',
        'football/tottenham-hotspur',
        'football/liverpool',
    ];

    const intersect = (a, b) =>
        [...new Set(a)].filter(_ => new Set(b).has(_));
    const pageTags = config.get('page.keywordIds', '').split(',');
    // if this is an advertisement feature, use the page's keyword (there'll only be one)
    const popularInTags = config.get('page.isPaidContent')
        ? pageTags
        : intersect(whitelistedTags, pageTags);

    if (popularInTags.length) {
        return `/popular-in-tag/${popularInTags[0]}.json`;
    }
};

const related = (opts) => {
    let relatedUrl;
    let popularInTag;
    let componentName;

    const shouldHideForAdFree =
        commercialFeatures.adFree && config.get('page.isPaidContent');

    if (config.get('page.hasStoryPackage')) {
        const expandable =
            document.body && document.body.querySelector('.related-trails');

        if (expandable) {
            buildExpandable(expandable);
        }
    } else if (
        config.get('switches.relatedContent') &&
        config.get('page.showRelatedContent') &&
        !shouldHideForAdFree
    ) {
        const container =
            document.body && document.body.querySelector('.js-related');

        if (container && !container.classList.contains('lazyloaded')) {
            popularInTag = popularInTagOverride();
            componentName = popularInTag
                ? 'related-popular-in-tag'
                : 'related-content';

            begin(componentName);
            container.setAttribute('data-component', componentName);
            relatedUrl =
                popularInTag || `/related/${config.get('page.pageId')}.json`;
            const queryParams = opts.excludeTags.map(
                tag => `exclude-tag=${tag}`
            );

            if (opts.excludeTags && opts.excludeTags.length) {
                relatedUrl += `?${queryParams.join('&')}`;
            }

            fetchJson(relatedUrl, { mode: 'cors' })
                .then(resp =>
                    fastdom.mutate(() => {
                        container.innerHTML = resp.html;
                        container.classList.add('lazyloaded');
                    })
                )
                .then(() => {
                    const relatedContainer = container.querySelector(
                        '.related-content'
                    );

                    if (relatedContainer) {
                        buildExpandable(relatedContainer);
                    }

                    // upgrade images
                    mediator.emit('modules:related:loaded', container);
                    end(componentName);
                })
                .catch(() => {
                    container.remove();
                    error(componentName);
                });
        }
    } else {
        Array.from(document.querySelectorAll('.js-related')).forEach(el =>
            el.classList.add('u-h')
        );
    }
};

export { related };
