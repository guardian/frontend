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
        caches.match(event.request.url).then(function (cachedResponse) {
            if (cachedResponse) {
                console.log('*** cachedResponse ***', cachedResponse);
                return cachedResponse;
            } else {
                return fetch(event.request, needCredentialsWorkaround(event.request.url) ? {
                    credentials: 'include',
                    mode: 'no-cors'
                } : {
                    mode: 'no-cors'
                }).then(function(fetchedResponse) {
                    console.log('*** fetchedResponse ***', fetchedResponse);
                    var responseToCache = fetchedResponse.clone();
                    
                    // get filename of request we're going to cached
                    var responseUrl = responseToCache.url;
                    var responseFileName = responseUrl.substring(responseUrl.lastIndexOf("/") + 1, responseUrl.length);

                    caches.open('graun').then(function(cache) {
                        // check cache for matching filename, if match found then delete old cached item
                        cache.keys().then(function(keys) {
                            keys.forEach(function(request, index, array) {
                                var requestUrl = request.url;
                                var requestFileName = requestUrl.substring(requestUrl.lastIndexOf("/") + 1, requestUrl.length);

                                console.log('*** request to compare ***', requestUrl, responseUrl);
                                if (requestUrl === responseUrl) {
                                    console.log('*** delete old cache ***', request);
                                    cache.delete(request);
                                }
                            });
                        });

                        console.log('*** response saved ***', responseToCache);
                        cache.put(event.request, responseToCache);
                    });
        
                    return fetchedResponse;
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
    console.log('*** graun cache deleted ***');
    caches.delete('graun');
});