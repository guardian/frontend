define([], function () {
    var ga = window.ga;

    function trackNonClickInteraction(actionName) {
        ga('guardianTestPropertyTracker.send', 'event', 'Interaction', actionName, {
            nonInteraction: true // to avoid affecting bounce rate
        });
    }

    function trackSamePageLinkClick(tag) {
        ga('guardianTestPropertyTracker.send', 'event', 'Click', 'In Page', tag, {
            nonInteraction: true // to avoid affecting bounce rate
        });
    }

    function trackExternalLinkClick(tag) {
        ga('guardianTestPropertyTracker.send', 'event', 'Click', 'External', tag);
    }

    return {
        trackNonClickInteraction: trackNonClickInteraction,
        trackSamePageLinkClick: trackSamePageLinkClick,
        trackExternalLinkClick: trackExternalLinkClick
    };
});
