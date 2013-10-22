define([
    'common',
    'ajax',
    'domwrite',

    'modules/detect',
    'modules/adverts/audience-science'
], function (
    common,
    ajax,
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
        var id = (config.pageId === '') ? '' : config.pageId + '/';
        return config.oasSiteIdHost + '/' + id + 'oas.html';
    }

    function getKeywords(config) {
        return config.keywords.split(',').map(function(keyword){
            return 'k=' + encodeURIComponent(keyword.replace(" ", "-").toLowerCase());
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

    function getUserSegments(userSegments) {
        return userSegments.map(function(segment) {
            return '&gdncrm=' + encodeURIComponent(segment);
        }).join('');
    }

    function generateUrl(config, slots, userSegments) {
        var oasUrl = config.oasUrl + 'adstream_[REQUEST_TYPE].ads/' + getPageUrl(config) + '/[RANDOM]@' + '[SLOTS]' + '[QUERY]';

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

        if (userSegments) {
            query += getUserSegments(userSegments);
        }

        var url = oasUrl;
        url = url.replace('[RANDOM]', Math.random().toString().substring(2,11));
        url = url.replace('[SLOTS]', getSlots(slots));
        url = url.replace('[REQUEST_TYPE]', type);
        url = url.replace('[QUERY]', query);

        return url;
    }

    function handleStateChange(script) {
        var loaded = false;
        return function() {
            if ((script.readyState && script.readyState !== 'complete' && script.readyState !== 'loaded') || loaded) {
                return false;
            }
            script.onload = script.onreadystatechange = null;
            loaded = true;
            common.mediator.emit('modules:adverts:docwrite:loaded');
        };
    }

    function load(options) {
        if(!options.config) {
            return;
        }

        var oasUrl = options.url || generateUrl(options.config.page, options.slots, options.userSegments);

        // using this, as request isn't actually jsonp, and borks with latest reqwest (0.8.1)
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = oasUrl;
        script.async = 'async';
        script.onload = script.onreadystatechange = handleStateChange(script);

        document.querySelector('head').appendChild(script);
    }

    return {
        load: load,
        generateUrl: generateUrl,
        getKeywords: getKeywords
    };

});