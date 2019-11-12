@()(implicit request: RequestHeader, context: model.ApplicationContext)

!function (n, e, o, r, i) {
    if (!e) {
        e = e || {}, window.permutive = e, e.q = [], e.config = i || {}, e.config.projectId = o, e.config.apiKey = r, e.config.environment = e.config.environment || "production";
        for (var t = ["addon", "identify", "track", "trigger", "query", "segment", "segments", "ready", "on", "once", "user", "consent"], c = 0; c < t.length; c++) {
            var f = t[c];
            e[f] = function (n) {
                return function () {
                    var o = Array.prototype.slice.call(arguments, 0);
                    e.q.push({functionName: n, arguments: o})
                }
            }(f)
        }
    }
}(document, window.permutive, "d6691a17-6fdb-4d26-85d6-b3dd27f55f08", "359ba275-5edd-4756-84f8-21a24369ce0b", {});
window.googletag = window.googletag || {}, window.googletag.cmd = window.googletag.cmd || [], window.googletag.cmd.push(function () {
    if (0 === window.googletag.pubads().getTargeting("permutive").length) {
        var g = window.localStorage.getItem("_pdfps");
        window.googletag.pubads().setTargeting("permutive", g ? JSON.parse(g) : [])
    }
});

var page = window.guardian.config.page;

permutive.addon('web', {
    page: {
        content: {
            premium: page.isPaidContent,
            id: page.pageId,
            title: page.headline,
            type: page.contentType,
            section: page.section,
            authors: [page.author],
            keywords: page.keywords.split(","),
            publishedAt: new Date(page.webPublicationDate).toISOString(), //ISO standard
        }
    }
});
