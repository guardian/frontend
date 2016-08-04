define([], function () {
    var ga = window.ga;

    function extractLinkText(el) {
        var text;
        if (el && typeof el.innerText === 'string') {
            text = el.innerText.trim();
        }
        return text;
    }

    function trackNonClickInteraction(actionName) {
        ga('guardianTestPropertyTracker.send', 'event', 'Interaction', actionName, {
            nonInteraction: true // to avoid affecting bounce rate
        });
    }

    function trackSamePageLinkClick(target, tag) {
        ga('guardianTestPropertyTracker.send', 'event', 'Click', 'In Page', tag, {
            nonInteraction: true, // to avoid affecting bounce rate
            dimension13: extractLinkText(target)
        });
    }

    function trackExternalLinkClick(target, tag) {
        ga('guardianTestPropertyTracker.send', 'event', 'Click', 'External', tag, {
            dimension13: extractLinkText(target)
        });
    }

    return {
        trackNonClickInteraction: trackNonClickInteraction,
        trackSamePageLinkClick: trackSamePageLinkClick,
        trackExternalLinkClick: trackExternalLinkClick
    };
});
