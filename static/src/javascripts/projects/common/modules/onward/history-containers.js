/*
 Module: history-containers.js
 Description: Inject personalised containers based on reading history
 */
define([
    'Promise',
    'common/utils/$',
    'common/utils/ajax',
    'common/modules/onward/history',
    'common/modules/ui/images',
    'lodash/arrays/first',
    'lodash/arrays/compact',
    'lodash/collections/map',
    'common/utils/chain'
], function (Promise, $, ajax, history, images, first, compact, map, chain) {
    // Maximum number of favourite containers to inject
    var maxContainers = 3,
        // Favourite containers will be injected /before/ this container
        refContainerId = '#most-popular',
        containerUrlTemplate = '/container/{containerId}.json',

    /* Currently this list has been derived from the section and
     * sub-sections in the global nav, minus some irrelevant fronts
     * (e.g. football tables) and mapped onto the first container for
     * each front
     */
    // TODO: automate (inject in page)?
        frontsTopContainers = {
            'football': '1a78-862a-834b-b1d3',
            'sport/horse-racing': 'b1ee6cda-0ea8-4dae-9c15-589a0276b34c',
            /* Note: some main fronts (e.g. culture, money) are
             * editionalised, but the history API flattens editions, so we
             * point any _/culture to uk/culture for now.
             * Yes, this is Wrong.
             */
            // 'uk/culture':'uk/culture/regular-stories',
            'culture': 'uk/culture/regular-stories',
            'film': '1ce8-6c50-425f-9d32',
            'tv-and-radio': '50315f6a-99a5-460c-b0ac-dab3f39b98da',
            'music': 'ee1e-171a-2d93-c8c4',
            'books': '27606c09-cd38-4d29-a1bc-fadeba8e9b40',
            'artanddesign': '21d1e666-a114-4ff2-a75c-c950e7e3f0b1',
            'stage': 'e5a33895-f85d-413e-a081-013620b155be',
            'music/classicalmusicandopera': '8dd9a671-1c4e-48d6-b43e-4db4eccc91f6',
            // 'uk/business':'uk/business/regular-stories',
            'business': 'uk/business/regular-stories',
            'business/companies': '5163-7ddd-126e-a0c6',
            'lifeandstyle': '5011-3940-8793-33a9',
            'lifeandstyle/food-and-drink': '76f26631-cd79-466e-b0c9-ea4fdd11ab17',
            'lifeandstyle/health-and-wellbeing': 'c2900255-731e-4c2a-bd68-4c3c7280d384',
            'lifeandstyle/love-and-sex': '6558-f6eb-d84c-4da4',
            'lifeandstyle/family': 'dcb5668f-9c8e-4dd3-acfc-2c77cc49b533',
            'lifeandstyle/women': '08a6df60-1795-492f-a1ed-db55cb9cab1d',
            'lifeandstyle/home-and-garden': '4023-17ee-2510-81bc',
            'fashion': 'eb83-f340-cc50-b311',
            'environment': '6a1f-f910-eca6-fa57',
            'cities': 'cf693b4c-7967-4247-8751-506e46b50058',
            'global-development': 'e4bafce3-1f98-4f65-89bd-c7e141e84320',
            'technology': '6bb3-9f76-43bd-4213',
            'technology/games': '9516b4f6-d603-411a-8008-62014b87e649',
            // 'uk/money':'uk/money/regular-stories',
            'money': 'uk/money/regular-stories',
            'money/property': '66f124b4-f3f0-4b84-b333-b059c6b554b4',
            'travel': '86c5-ca98-e61d-96f5',
            'science': 'e9c7-cf23-23b1-363b',
            'education': '12a5-b602-5785-0550',
            'education/students': '396b3c63-edbd-4d3d-b936-5dcdf4ab937a'
            // We don't want to compete with the 'pictures & video'
            // container, and also the media container seems broken
            // (return 503) for some reason
            // 'media':'14ce0f66-4596-4a9e-a327-db71d25b8d1a'
        };

    function getFavouriteContainerIds(opts) {
        opts = opts || {};

        var limitContainers = opts.maxContainers || maxContainers,

            favouriteTags = history.getPopular().map(function (pair) {
                return pair[0];
            });

        return chain(favouriteTags).and(map, function (tag) {
                return frontsTopContainers[tag];
            }).and(compact).and(first, limitContainers).value();
    }

    function fetchContainerHtml(containerId) {
        return ajax({
            url: containerUrlTemplate.replace('{containerId}', containerId),
            crossOrigin: true
        }).then(function (resp) {
            return resp.html;
        });
    }

    function hasContainers() {
        var containerIds = getFavouriteContainerIds();
        return containerIds.length > 0;
    }

    /* opts:
     *   maxContainers (int) - maximum number of containers to inject
     */
    function injectContainers(opts) {
        var favouriteContainers = getFavouriteContainerIds(opts);
        if (favouriteContainers.length > 0) {
            Promise.all(favouriteContainers.map(fetchContainerHtml)).then(function (containers) {
                var refContainer = $(refContainerId),
                    // Join containers to minimise DOM insertion
                    allContainers = containers.join('');
                refContainer.before(allContainers);
                images.upgradePictures();
            });
        }
    }

    return {
        hasContainers: hasContainers,
        injectContainers: injectContainers
    };
});
