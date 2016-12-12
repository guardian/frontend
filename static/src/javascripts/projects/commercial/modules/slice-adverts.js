define([
    'qwery',
    'Promise',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/fastdom-promise',
    'common/modules/commercial/dfp/create-slot',
    'common/modules/commercial/dfp/add-slot',
    'common/modules/user-prefs',
    'common/modules/commercial/commercial-features',
    'Promise'
], function (
    qwery,
    Promise,
    config,
    detect,
    mediator,
    fastdom,
    createSlot,
    addSlot,
    userPrefs,
    commercialFeatures,
    Promise
) {
    var containerSelector = '.fc-container:not(.fc-container--commercial)';
    var sliceSelector = '.js-fc-slice-mpu-candidate';
    var isNetworkFront;

    return {
        init: init
    };

    function init() {
        if (!commercialFeatures.sliceAdverts) {
            return Promise.resolve(false);
        }

        init.whenRendered = new Promise(function (resolve) {
            mediator.once('page:commercial:slice-adverts', resolve);
        });

        var prefs = userPrefs.get('container-states') || {};
        var isMobile = detect.isBreakpoint({ max : 'phablet' });

        isNetworkFront = ['uk', 'us', 'au'].indexOf(config.page.pageId) !== -1;

        // Get all containers
        var containers = qwery(containerSelector)
        // Filter out closed ones
        .filter(function (container) {
            return prefs[container.getAttribute('data-id')] !== 'closed';
        });

        if (containers.length === 0) {
            return Promise.resolve(false);
        } else if (isMobile) {
            insertOnMobile(containers, getSlotNameOnMobile)
            .then(addSlots)
            .then(done);
        } else {
            insertOnDesktop(containers, getSlotNameOnDesktop)
            .then(addSlots)
            .then(done);
        }

        return Promise.resolve(true);
    }

    // On mobile, a slot is inserted after each container
    function insertOnMobile(containers, getSlotName) {
        var hasThrasher = containers[0].classList.contains('fc-container--thrasher');
        var includeNext = false;
        var slots;

        // Remove first container if it is a thrasher
        containers = containers
        .slice(isNetworkFront && hasThrasher ? 1 : 0)
        // Filter every other container
        .filter(function (container) {
            if (container.nextElementSibling && container.nextElementSibling.classList.contains('fc-container--commercial')) {
                return false;
            }

            includeNext = !includeNext;
            return includeNext;
        })
        // Keep as much as 10 of them
        .slice(0, 10);

        slots = containers
        .map(function (container, index) {
            var adName = getSlotName(index);
            var classNames = ['container-inline', 'mobile'];
            var slot, section;
            if (config.page.isAdvertisementFeature) {
                classNames.push('adfeature');
            }

            slot = createSlot(adName, classNames);

            // Wrap each ad slot in a SECTION element
            section = document.createElement('section');
            section.appendChild(slot);

            return section;
        });

        return fastdom.write(function () {
            slots.forEach(function (slot, index) {
                containers[index].parentNode.insertBefore(slot, containers[index].nextSibling);
            });
            return slots.map(function (_) { return _.firstChild; });
        });
    }

    // On destkop, a slot is inserted when there is a slice available
    function insertOnDesktop(containers, getSlotName) {
        var slots;

        // Remove first container on network fronts
        containers = containers.slice(isNetworkFront ? 1 : 0);

        slots = containers
        // get all ad slices
        .reduce(function (result, container) {
            var slice = container.querySelector(sliceSelector);
            if (slice) {
                result.push(slice);
            }
            return result;
        }, [])
        // Keep a maximum of 10 containers
        .slice(0, 10)
        // create ad slots for the selected slices
        .map(function (slice, index) {
            var adName = getSlotName(index);
            var classNames = ['container-inline'];
            var slot;

            if (config.page.isAdvertisementFeature) {
                classNames.push('adfeature');
            }

            slot = createSlot(adName, classNames);

            return { slice: slice, slot: slot };
        });

        return fastdom.write(function () {
            slots.forEach(function(item) {
                // add a tablet+ ad to the slice
                item.slice.classList.remove('fc-slice__item--no-mpu');
                item.slice.appendChild(item.slot);
            });
            return slots.map(function (_) { return _.slot; });
        });
    }

    function getSlotNameOnMobile(index) {
        return index === 0 ? 'top-above-nav' : 'inline' + index;
    }

    function getSlotNameOnDesktop(index) {
        return 'inline' + (index + 1);
    }

    function addSlots(slots) {
        slots.forEach(addSlot);
    }

    function done() {
        mediator.emit('page:commercial:slice-adverts');
    }
});
