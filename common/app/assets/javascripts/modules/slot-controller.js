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

    var rules = { // contentType: [validSlotType1,validSlotType2,...]
        left: ['text'],
        right: ['posth2','block','text'],
        block: ['preh2', 'block','text']
    };

    var emptySelectors = _.mapValues(rules, function(classes) {
        return classes.map(function(c){ return '.'+prefix+'--'+c+":empty"; }).join(', ');
    });

    var containers = _.mapValues(rules, function() { return []; });

    var validSlots = _.mapValues(emptySelectors, function(selector) {
        return qwery(selector, ".article-body");
    });

    function detachAll() {
        _.forOwn(containers, function(cs){
            cs.forEach(function(c) {
                bonzo(c).detach();
            });
        });
    }

    function insertContainer(container) { // inserts a container in the first valid slot
        var validSlots = qwery(emptySelectors[container.slotContainerType], '.article-body');
        if (validSlots.length > 0) {
            bonzo(validSlots[0]).append(container);
        }
    }

    function reorderContent(){
        detachAll();
        _(_.zip(containers.left, containers.right)).flatten().compact().forEach(insertContainer);
    }

    return {
        getSlot: function(type){
            var container = document.createElement('div');
            container.classList.add(prefix+'__container');
            container.slotContainerType = type;
            containers[type].push(container);
            reorderContent();
            return container;
        },
        getLeftSlot: function() {
            return this.getSlot('left');
        },
        getRightSlot: function() {
            return this.getSlot('right');
        },
        getBlockSlot: function() {
            return this.getSlot('block');
        }
    };

});