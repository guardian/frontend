define([
    'common/common',
    'common/$',
    'qwery',
    'bonzo',
    'common/_'
], function (
    common,
    $,
    qwery,
    bonzo,
    _
    ) {



    // overview:
    // slot - div element in the article body (created serverside)
    //      has a slot type describing where it lies in the article (e.g. text, posth2,  etc)
    // container - div element created in response to a slot request and passed back to the
    //      requester for them to inject content
    // rules - defines the valid slot types for each content type

    var prefix = 'slot',
        rules = { // contentType: [validSlotType1,validSlotType2,...]
            story: ['text'],
            adRight: ['posth2','text'],
            adBlock: ['preh2', 'text']
        },
        insertionMethods = {
            story: 'largestBucket',
            adRight: 'firstAvailable',
            adBlock: 'firstAvailable'
        },
        priority = ['adRight','adBlock','commercialLeft','commercialRight','story'],
        containers = _.mapValues(rules, function() { return []; });

    function slotTypeToCssSelector(type, empty) {
        return '.' + prefix + '--' + type + (empty ? ':empty' : '');
    }

    function getSlotsOfTypes(types, empty) {
        var cssSelector = types.map(function(t){ return slotTypeToCssSelector(t, empty); }).join(', ');
        return qwery(cssSelector, '.article-body');
    }

    function getSlotsOfType(type, empty) {
        return getSlotsOfTypes([type], empty);
    }

    function detachAll() {
        _(containers).values().flatten().forEach(function(c){ bonzo(c).detach(); });
    }

    var insertFuncs = {
        largestBucket: function (container) {
            // inserts the container in the type bucket with most empty slots
            // this could be made more intelligent to space content out more

            var buckets = _(rules[container.slotContainerType]).map(function(type){ return getSlotsOfType(type, true); });
            var selectedBucket = buckets.max('length').valueOf();

            if (selectedBucket.length > 0) {
                bonzo(selectedBucket[0]).append(container);
            }
        },
        firstAvailable: function (container) {
            var possibleSlots = getSlotsOfTypes(rules[container.slotContainerType], true);
            if (possibleSlots.length > 0) {
                bonzo(possibleSlots[0]).append(container);
            }
        }
    };

    function insertContainer(container) {
        var funcName = insertionMethods[container.slotContainerType];
        insertFuncs[funcName](container);
    }

    // reorder happens every time a slot is requested/released
    // reorders created containers within empty slots with a maximum of 1 per slot
    function reorderContent() {
        detachAll();
        // containers object format is { containerType1: [container1,container2,..], ... }
        // sort the container types by priority then zip/flatten/compact does round-robin ordering
        _(containers).pairs().sortBy(function(p){ return priority.indexOf(p[0]); })
            .pluck(1).zip().flatten().compact().forEach(insertContainer);
    }

    return {
        getSlot: function(type){
            if (!rules.hasOwnProperty(type)) { return null; }

            var container = document.createElement('div');
            bonzo(container).addClass(prefix+'__container');
            container.slotContainerType = type;
            containers[type].push(container);
            reorderContent();
            return container;
        },
        swapSlot: function(oldContainer, newType){
            this.releaseSlot(oldContainer, true);
            return this.getSlot(newType);
        },
        releaseSlot: function(oldContainer, dontRefresh) {
            _(containers).values().forEach( function(c) {
                var index = c.indexOf(oldContainer);
                if (index !== -1) { c.splice(index, 1); }
            });
            bonzo(oldContainer).remove();

            if (!dontRefresh) { reorderContent(); }
        }
    };

});
