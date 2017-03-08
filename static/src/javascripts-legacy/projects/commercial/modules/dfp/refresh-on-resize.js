define([
    'lib/detect',
    'lib/mediator',
    'commercial/modules/dfp/dfp-env',
    'commercial/modules/dfp/breakpoint-name-to-attribute'
], function (detect, mediator, dfpEnv, breakpointNameToAttribute) {
    /* hasBreakpointChanged: ((string, string) -> undefined) -> undefined. Invokes the callback if a breakpoint has been crossed since last invocation */
    var hasBreakpointChanged = detect.hasCrossedBreakpoint(true);

    /* breakpointNames: array<string>. List of breakpoint names */
    var breakpointNames = detect.breakpoints.map(function (_) { return _.name; });

    return refreshOnResize;

    function refreshOnResize() {
        mediator.on('window:throttledResize', windowResize);
    }

    function windowResize() {
        // refresh on resize
        hasBreakpointChanged(refresh);
    }

    // TODO: reset advert flags
    function refresh(currentBreakpoint, previousBreakpoint) {
        // only refresh if the slot needs to
        var advertsToRefresh = dfpEnv.advertsToRefresh.filter(shouldRefresh);
        if (advertsToRefresh.length) {
            window.googletag.pubads().refresh(advertsToRefresh.map(function (_) { return _.slot; }));
        }

        function shouldRefresh(advert) {
            // get the slot breakpoints
            var slotBreakpoints = Object.keys(advert.sizes);
            // find the currently matching breakpoint
            var currentSlotBreakpoint = getBreakpointIndex(currentBreakpoint, slotBreakpoints);
            // find the previously matching breakpoint
            var previousSlotBreakpoint = getBreakpointIndex(previousBreakpoint, slotBreakpoints);
            return currentSlotBreakpoint !== -1 && currentSlotBreakpoint !== previousSlotBreakpoint;
        }

        function getBreakpointIndex(breakpoint, slotBreakpoints) {
            var validBreakpointNames = breakpointNames
                .slice(0, breakpointNames.indexOf(breakpoint) + 1)
                .map(breakpointNameToAttribute);
            return Math.max.apply(Math, slotBreakpoints.map(function (_) {
                return validBreakpointNames.lastIndexOf(_);
            }));
        }
    }
});
