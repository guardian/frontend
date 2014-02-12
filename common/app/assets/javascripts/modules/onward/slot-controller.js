define([
    'common/common',
    'common/$',
    'qwery',
    'bonzo',
    'lodash/main'
], function (
    common,
    $,
    qwery,
    bonzo,
    _
    ) {

    var prefix = "slot";

    function slotTypeToCssSelector(type){
        return '.' + prefix + '--' + type;
    }

    var rules = { // contentType: [validSlotType1,validSlotType2,...]
        left: ['text'],
        right: ['posth2','block','text'],
        block: ['preh2', 'block','text']
    };

    var containers = _.mapValues(rules, function() { return []; });

    function detachAll() {
        _(containers).values().flatten().forEach(function(c){ bonzo(c).detach(); });
    }

    function insertContainer(container) {

        var buckets = _(rules[container.slotContainerType]).map(function(type){ return qwery(slotTypeToCssSelector(type)+":empty"); });
        var largestBucket = buckets.max(function(slotcount) { return slotcount.length; }).valueOf();

        if (largestBucket.length > 0) {
            bonzo(largestBucket[0]).append(container);
        }
    }
    function reorderContent(){
        detachAll();
        _(containers).values().zip().flatten().compact().forEach(insertContainer);
    }

    return {
        getSlot: function(type){
            if (!rules.hasOwnProperty(type)) { return null; }

            var container = document.createElement('div');
            container.classList.add(prefix+'__container');
            container.slotContainerType = type;
            containers[type].push(container);
            reorderContent();
            return container;
        },
        swapSlot: function(oldContainer, newType){
            this.releaseSlot(oldContainer, true);
            return this.getSlot(newType);
        },
        releaseSlot: function(oldContainer, noRefresh) {
            _(containers).values().forEach( function(c) {
                var index = c.indexOf(oldContainer);
                if (index !== -1) { c.splice(index, 1); }
            });
            bonzo(oldContainer).remove();

            if (!noRefresh) { reorderContent(); }
        }
    };

});