define([
    'common/utils/config'
], function (
    config
) {
    var ga = window.ga;
    var trackerName = config.googleAnalytics.trackers.editorial;
    var send = trackerName + '.send';

    function extractLinkText(el) {
        var text;
        if (el && typeof el.textContent === 'string') {
            text = el.textContent.trim();
        }
        return text;
    }

    function trackNonClickInteraction(actionName) {
        ga(send, 'event', 'Interaction', actionName, {
            nonInteraction: true // to avoid affecting bounce rate
        });
    }

    function trackSamePageLinkClick(target, tag) {
        ga(send, 'event', 'click', 'in page', tag, {
            nonInteraction: true, // to avoid affecting bounce rate
            dimension13: extractLinkText(target)
        });
    }

    function trackExternalLinkClick(target, tag) {
        ga(send, 'event', 'click', 'external', tag, {
            dimension13: extractLinkText(target)
        });
    }

    function trackSponsorLogoLinkClick(target) {
        var sponsorName = target.dataset.sponsor;
        ga(send, 'event', 'click', 'sponsor logo', sponsorName, {
            nonInteraction: true
        });
    }

    function trackNativeAdLinkClick(slotName, tag) {
        ga(send, 'event', 'click', 'native ad', tag, {
            nonInteraction: true,
            dimension25: slotName
        });
    }

    return {
        trackNonClickInteraction: trackNonClickInteraction,
        trackSamePageLinkClick: trackSamePageLinkClick,
        trackExternalLinkClick: trackExternalLinkClick,
        trackSponsorLogoLinkClick: trackSponsorLogoLinkClick,
        trackNativeAdLinkClick: trackNativeAdLinkClick
    };
});
