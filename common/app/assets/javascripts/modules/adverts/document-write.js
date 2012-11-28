define([
    'common',
    'reqwest',
    'domwrite',

    'modules/detect',
    'modules/adverts/audience-science'
], function (
    common,
    reqwest,
    domwrite,

    detect,
    audienceScience
) {

    function getSegments(segments) {
       return segments.map(function(segment) {
          return "&a=" + segment;
        }).join('');
    }

    function getPageUrl(config) {
            return 'm.guardian.co.uk/' + config.pageId + '/oas.html';
    }

    function getKeywords(config) {
        return config.keywords.split(',').map(function(keyword){
            return 'k=' + encodeURIComponent(keyword.toLowerCase());
        }).join('&');
    }

    function getPageType(config) {
        return encodeURIComponent(config.contentType.toLowerCase());
    }

    function getSlots(slots) {
        return slots.map(function(slot) {
            return slot.name;
        }).join(',');
    }

    function generateUrl(config, slots) {
        var oasUrl = config.oasUrl + 'adstream_[REQUEST_TYPE].ads/' + getPageUrl(config)+ '/[RANDOM]@' + '[SLOTS]' + '[QUERY]';
        var type = (detect.getConnectionSpeed() === 'low') ? 'nx' : 'mjx';
        var query = '?';

        if (config.keywords) {
            query += getKeywords(config);
        }

        if (config.contentType) {
            query += '&pt=' + getPageType(config);
            query += '&ct=' + getPageType(config);
        }
        if (config.section) {
            query += '&cat=' + encodeURIComponent(config.section.toLowerCase());
        }

        var segments = audienceScience.getSegments();
        if (segments) {
            query += getSegments(segments);
        }

        var url = oasUrl;
        url = url.replace('[RANDOM]', Math.random().toString().substring(2,11));
        url = url.replace('[SLOTS]', getSlots(slots));
        url = url.replace('[REQUEST_TYPE]', type);
        url = url.replace('[QUERY]', query);

        return url;
    }

    function load(options) {
        if(!options.config) {
            return;
        }

        var oasUrl = options.url || generateUrl(options.config.page, options.slots);

        reqwest({
            url: oasUrl,
            type: 'jsonp',
            success: function (js) {
                common.mediator.emit('modules:adverts:docwrite:loaded');
            },
            error: function () {
                common.mediator.emit('module:error', 'Failed to load adverts', 'document-write.js');
            }
        });
    }

    return {
        load: load,
        generateUrl: generateUrl
    };

});