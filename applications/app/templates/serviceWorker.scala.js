@()(implicit context: model.ApplicationContext)
@import conf.Static
@import conf.Configuration
@import conf.switches.Switches._
@import play.api.Mode.Dev
/*eslint quotes: [2, "single"], curly: [2, "multi-line"], strict: 0*/
/*eslint-env browser*/
/*global self*/
/*global clients*/

"use strict";

// increment number to force a refresh
// version 1

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * CACHE HELPERS
 */

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * FETCH HELPERS
 */

var needCredentialsWorkaround = (function () {
    var whitelistRegexs = [
        'https://discussion.theguardian.com/discussion-api'
    ].map(function (entry) {
        return new RegExp('^' + entry);
    });
    return function (url) {
        return whitelistRegexs.some(function (re) {
            return re.test(url);
        });
    }
})();

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * FETCH HANDLERS
 */

var isRequestForAsset = (function () {
    var assetPathRegex = new RegExp('^@Configuration.assets.path');
    return function (request) {
        var url = new URL(request.url);
        @if(context.environment.mode == Dev) {
            return assetPathRegex.test(url.pathname);
        } else {
            return assetPathRegex.test(url.href);
        }
    }
})();

var handleAssetRequest = function (event) {
    // Default fetch behaviour
    // Cache first for all other requests

    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                // Workaround Firefox bug which drops cookies
                // https://github.com/guardian/frontend/issues/12012
                if (response) {
                    return response;
                } else {
                    return fetch(event.request, needCredentialsWorkaround(event.request.url) ? {
                        credentials: 'include'
                    } : {}).then(function(response) {
                        // Check if we received a valid response
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        var responseToCache = response.clone();
                       
                        caches.open('graun').then(function(cache) {
                            cache.put(event.request, responseToCache);
                        });

                        return response;
                    });
                }
            })
    );
};

var blockIAS = false;
var iasRX = /adsafeprotected\.com/;
var forbidden = new Response(null, { status: 403, statusText: 'IAS Blocked' });

function isIASRequest(request) {
    return iasRX.test(request.url)
}

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * EVENT LISTENERS
 */

this.addEventListener('message', function (event) {
    blockIAS = !!event.data.ias;
});

this.addEventListener('fetch', function (event) {
    if (isRequestForAsset(event.request)) {
        handleAssetRequest(event);
    } else if (blockIAS && isIASRequest(event.request)) {
        event.respondWith(forbidden);
    }
});

this.addEventListener('activate', function() {
    caches.delete('graun').then(function() { 
        console.log('graun cache successfully deleted'); 
    });
});