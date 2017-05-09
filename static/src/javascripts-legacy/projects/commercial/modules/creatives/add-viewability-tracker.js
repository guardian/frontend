define(function () {
    return addViewabilityTracker;

    function addViewabilityTracker(adSlot, creativeId, viewabilityTracker) {

      /*
        we need to ensure that any scripts in the viewabilityTracker are parsed
        and executed; this can be done with a Range and ContextualFragment
      */
      var range = document.createRange();
      range.setStart(adSlot, 0);
      range.setEnd(adSlot, 0);
      adSlot.appendChild(range.createContextualFragment(viewabilityTracker.replace('INSERT_UNIQUE_ID', creativeId)));
    }
})
