define([
    'common/utils/config',
    'lodash/objects/defaults',
    'lodash/objects/pairs'
], function(
    defaultConfig,
    _defaults,
    _pairs
) {

    var mediaMathBaseUrl = '//pixel.mathtag.com/event/img?mt_id=328671&mt_adid=114751',
        extractSearchTerm = function (referrer) {
            return referrer
                .split('?')
                .pop()
                .split('&')
                .filter(function(query) {
                    return ['q','p','as_q','as_epq','as_oq','query','search','wd','ix'].indexOf(query.split('=').shift()) > -1;
                })
                .map(function(searchQuery) {
                    return decodeURIComponent(searchQuery.split('=').pop().replace(/\\+/g, ' '));
                })
                .shift();
        };

    return {
        load: function(config) {
            config = _defaults(
                config || {},
                defaultConfig,
                {
                    referrer: document.referrer,
                    switches: {},
                    page: {}
                }
            );

            if (!config.switches.mediaMath) {
                return false;
            }

            var page = config.page,
                tags = _pairs({
                    v1: (page.host ? page.host : '') + '/' + page.pageId,
                    v2: page.section,
                    v3: extractSearchTerm(config.referrer),
                    v4: config.referrer,
                    v5: page.keywords ? page.keywords.replace(/,/g, '|') : '',
                    v6: page.contentType ? page.contentType.toLowerCase() : ''
                })
                    // turn into a query string
                    .map(function (pair) { return pair.join('='); })
                    .join('&');

            var img = new Image();
            img.src = mediaMathBaseUrl + '&' + tags;
            return img;
        }
    };

});
