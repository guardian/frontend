define([
    'fastdom',
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/ajax',
    'common/modules/analytics/register',
    'common/utils/proximity-loader',
    'common/modules/onward/inject-container',
    'common/modules/commercial/third-party-tags/outbrain'
], function (
    fastdom,
    qwery,
    $,
    config,
    mediator,
    ajax,
    register,
    proximityLoader,
    injectContainer,
    outbrain
) {

    function FrontsContainers() {
        if(!config.page.hasStoryPackage && !(config.page.seriesId || config.page.blogIds) && config.page.showRelatedContent && outbrain.canRun() && !outbrain.hasHighRelevanceComponent()) {
            injectFirstInRelated();
        } else {
            injectFrontsContainers();
        }
    }

    function injectFirstInRelated() {
        injectContainer.injectContainer('/container/' + config.page.section + '/some/1/0/small.json', $('.js-related'), 'fronts-containers-first', function() {
            injectFrontsContainers(2);
        });
    }

    function injectFrontsContainers(numberOfContainers) {
        var numberToInject =  (numberOfContainers) ? numberOfContainers : 3,
            offset = 3 - numberToInject;

        console.log(numberToInject, offset);

        injectContainer.injectContainer('/container/' + config.page.section + '/some/' + numberToInject + '/' + offset + '/original.json', $('.js-fronts-containers'), 'fronts-containers', function() {
            proximityLoader.add(qwery('.js-network-fronts-containers')[0], 1500, function() {
                injectNetworkFrontsContainers();
            });
        });
    }

    function injectNetworkFrontsContainers() {
        injectContainer.injectContainer('/container/' + 'uk' + '/some/3/0/original.json', $('.js-network-fronts-containers'), 'network-fronts-containers', function() {});
    }

    return FrontsContainers;

});
