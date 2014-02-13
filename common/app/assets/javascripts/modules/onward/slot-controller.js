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

    // overview:
    // slot - div element in the article body (created serverside). has a slot type describing where it lies in the article (e.g. text, posth2,  etc)
    // container - div element created in response to a slot request and passed back to the requester for them to inject content
    // rules - defines the valid slot types for each content type
    // reorder - happens every time a slot is requested/released. reorders containers with a maximum of 1 per slot

    var prefix = "slot",
	rules = { // contentType: [validSlotType1,validSlotType2,...]
	    story: ['text'],
	    adRight: ['posth2','block','text'],
	    adBlock: ['preh2', 'block','text'],
	    commercialRight: ['posth2','block','text'],
	    commercialLeft: ['text']
	},
	priority = ['adRight','adBlock','commercialLeft','commercialRight','story'],
	containers = _.mapValues(rules, function() { return []; });

    function getSlotsOfType(type, empty) {
	return qwery('.' + prefix + '--' + type + (empty ? ":empty" : ""), '.article-body');
    }

    function detachAll() {
        _(containers).values().flatten().forEach(function(c){ bonzo(c).detach(); });
    }

    function insertContainer(container) {
	// inserts the container in the type bucket with most empty slots

	var buckets = _(rules[container.slotContainerType]).map(function(type){ return getSlotsOfType(type, true); });
	var selectedBucket = buckets.max('length').valueOf();

	if (selectedBucket.length > 0) {
	    bonzo(selectedBucket[0]).append(container);
        }
    }

    function reorderContent() {
        detachAll();
	_(containers).pairs().sortBy(function(p){ return priority.indexOf(p[0]); })
	    .pluck(1).zip().flatten().compact().forEach(insertContainer);
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