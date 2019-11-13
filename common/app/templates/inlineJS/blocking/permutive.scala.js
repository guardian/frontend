(function(n, e, o, r, i) {
    if (!e) {
        (e = e || {}),
            (window.permutive = e),
            (e.q = []),
            (e.config = i || {}),
            (e.config.projectId = o),
            (e.config.apiKey = r),
            (e.config.environment = e.config.environment || 'production');
        for (
            var t = [
                    'addon',
                    'identify',
                    'track',
                    'trigger',
                    'query',
                    'segment',
                    'segments',
                    'ready',
                    'on',
                    'once',
                    'user',
                    'consent',
                ],
                c = 0;
            c < t.length;
            c++
        ) {
            var f = t[c];
            e[f] = (function(n) {
                return function() {
                    var o = Array.prototype.slice.call(arguments, 0);
                    e.q.push({ functionName: n, arguments: o });
                };
            })(f);
        }
    }
})(
    document,
    window.permutive,
    'd6691a17-6fdb-4d26-85d6-b3dd27f55f08',
    '359ba275-5edd-4756-84f8-21a24369ce0b',
    {}
);
(window.googletag = window.googletag || {}),
    (window.googletag.cmd = window.googletag.cmd || []),
    window.googletag.cmd.push(function() {
        if (0 === window.googletag.pubads().getTargeting('permutive').length) {
            var g = window.localStorage.getItem('_pdfps');
            window.googletag
                .pubads()
                .setTargeting('permutive', g ? JSON.parse(g) : []);
        }
    });
(function() {
    try {
        const {
            isPaidContent,
            pageId,
            headline,
            contentType,
            section,
            author,
            keywords,
            webPublicationDate,
        } = window.guardian.config.page;
        const safeAuthors =
            author && typeof author === 'string' ? author.split(',') : [];
        const safeKeywords =
            keywords && typeof keywords === 'string' ? keywords.split(',') : [];
        const safePublishedAt =
            webPublicationDate && typeof webPublicationDate === 'number'
                ? new Date(webPublicationDate).toISOString()
                : null;
        permutive.addon('web', {
            page: {
                content: {
                    premium: isPaidContent || false,
                    id: pageId || '',
                    title: headline || '',
                    type: contentType || '',
                    section: section || '',
                    authors: safeAuthors,
                    keywords: safeKeywords,
                    publishedAt: safePublishedAt,
                },
            },
        });
    } catch (e) {
        console.error('page.config undefined');
    }
})();
