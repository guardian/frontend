define(function () {
    return addViewabilityTracker;

    function addViewabilityTracker(adSlot, creativeId, viewabilityTracker) {
        adSlot.insertAdjacentHTML('beforeend', viewabilityTracker.replace('INSERT_UNIQUE_ID', creativeId));
    }
})
