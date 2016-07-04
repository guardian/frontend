define([
    'lodash/functions/debounce',
    'common/utils/detect',
    'common/modules/commercial/dfp/private/dfp-env',
    'common/modules/commercial/dfp/private/breakpoint-name-to-attribute'
], function (debounce, detect, dfpEnv, breakpointNameToAttribute) {
    /* hasBreakpointChanged: ((string, string) -> undefined) -> undefined. Invokes the callback if a breakpoint has been crossed since last invocation */
    var hasBreakpointChanged = detect.hasCrossedBreakpoint(true);

    /* breakpointNames: array<string>. List of breakpoint names */
    var breakpointNames = detect.breakpoints.map(function (_) { return _.name; });

    /* resizeTimeout: integer. Number of milliseconds to debounce the resize event */
    var resizeTimeout = 2000;

    /* windowResize: () -> undefined. Resize handler */
    var windowResize = debounce(function () {
        // refresh on resize
        hasBreakpointChanged(refresh);
    }, resizeTimeout);

    return refreshOnResize;

    function refreshOnResize() {
        window.addEventListener('resize', windowResize);
    }

    // TODO: reset advert flags
    function refresh(currentBreakpoint, previousBreakpoint) {
        // only refresh if the slot needs to
        window.googletag.pubads().refresh(dfpEnv.advertsToRefresh.filter(shouldRefresh).map(function (_) { return _.slot; }));

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
