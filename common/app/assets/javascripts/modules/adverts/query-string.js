define([
    'common/modules/analytics/commercial/tags/common/audience-science'
], function (
    audienceScience
) {

    function generateQueryString(config, userSegments) {
        var query = '';

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

        var segments = audienceScience.getSegments().slice(0, 70);
        if (segments) {
            query += getSegments(segments);
        }

        if (userSegments) {
            query += getUserSegments(userSegments);
        }

        return query;
    }

    function getUserSegments(userSegments) {
        return userSegments.map(function(segment) {
            return '&gdncrm=' + encodeURIComponent(segment);
        }).join('');
    }

    function getSegments(segments) {
        return segments.map(function(segment) {
            return '&a=' + segment;
        }).join('');
    }

    function getPageType(config) {
        return encodeURIComponent(config.contentType.toLowerCase());
    }

    function formatKeyword(keyword) {
        return keyword.replace(/\s/g, '-').toLowerCase();
    }

    function getKeywords(config) {
        return config.keywords.split(',').map(function(keyword){
            return 'k=' + encodeURIComponent(formatKeyword(keyword));
        }).join('&');
    }

    return {
        generateQueryString: generateQueryString,
        getKeywords: getKeywords,
        formatKeyword: formatKeyword
    };

});
