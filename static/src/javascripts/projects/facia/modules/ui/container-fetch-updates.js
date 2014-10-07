define([
    'common/utils/$',
    'common/utils/ajax',
    'bonzo',
    'lodash/collections/contains',
    'lodash/collections/filter',
    'lodash/objects/has',
    'lodash/collections/indexBy',
    'lodash/collections/map'
], function (
    $,
    ajax,
    bonzo,
    contains,
    filter,
    has,
    indexBy,
    map
) {
    var containers = $('.js-container--fetch-updates');

    function getItems(container) {
        return $('.js-fc-item', container);
    }

    function itemInfo(item) {
        var $item = bonzo(item);
        return {
            id: $item.attr('data-id'),
            lastUpdated: $item.attr('data-updated')
        };
    }

    function visibility(item) {
        return bonzo(item).attr('data-item-visibility');
    }

    function currentItems(container) {
        var items = getItems(container),
            visibleOnMobile = filter(items, function (item) {
                return visibility(item) === 'all';
            }),
            visibleOnDesktop = filter(items, function (item) {
                return contains(['desktop', 'all'], visibility(item));
            });

        return {
            mobile: map(visibleOnMobile, itemInfo),
            desktop: map(visibleOnDesktop, itemInfo)
        };
    }

    function newCountFor(oldItems, newItems) {
        var oldById = indexBy(oldItems, 'id');

        return filter(newItems, function (item) {
            return !has(oldById, item.id) || oldById[item.id].lastUpdated < item.lastUpdated;
        }).length;
    }

    function createUpdateCountElement(numberOfUpdates) {
        var currentPath = window.location.pathname;
        return $.create('<div class="fc-container__updates">' +
            '<a href="' + currentPath + '">' +
            '<span class="fc-container__updates__number">' + numberOfUpdates + '</span>' + ' updates ...' +
            '</a>' +
            '</div>');
    }

    function updateFromIndex(index) {
        containers.each(function (container) {
            var $container = bonzo(container),
                element = $('.js-container--insert-updates', container),
                containerId = $container.attr('data-id'),
                containerIndex = index.containers[containerId],
                currentItemsInfo = currentItems($container),
                newCountOnMobile,
                newCountOnDesktop,
                mobile,
                desktop;

            if (element && element.length > 0) {
                newCountOnMobile = newCountFor(currentItemsInfo.mobile, filter(containerIndex.items, function (item) {
                    return item.visibleOnMobile;
                }));
                newCountOnDesktop = newCountFor(currentItemsInfo.desktop, containerIndex.items);

                /** TODO add if statements here that only append the elements if there is at least 1 update */

                mobile = createUpdateCountElement(newCountOnMobile)
                    .addClass('fc-container__updates--mobile');
                desktop = createUpdateCountElement(newCountOnDesktop)
                    .addClass('fc-container__updates--desktop');

                element.html('').append(mobile).append(desktop);
            }
        });
    }

    function triggerUpdate() {
        ajax({
            url: window.location.pathname + '/front-index.json',
            type: 'json',
            method: 'get',
            crossOrigin: 'true',
            success: updateFromIndex
        });
    }

    return function () {
        /** THIS IS FOR TESTING, REMOVE BEFORE RELEASE */
        triggerUpdate();

        if (containers.length > 0) {
            /** Start AJAX cycle */
            setInterval(triggerUpdate, 30000);
        }
    };
});
