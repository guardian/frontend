/*jshint multistr: true */

define([
    'common',
    'modules/storage',
    'modules/userPrefs',
    'modules/pageconfig',
    'bean',
    'bonzo',
    'ajax'
], function(
    common,
    storage,
    userPrefs,
    pageConfig,
    bean,
    bonzo,
    ajax
    ){
    var initialUrl,
        linkContext,
        referrer,
        referrerPageName,
        sequencePos = -1,
        sequence = [],
        sequenceCache,
        sequenceLen = 0,
        storePrefix = 'gu.swipe.';

    function urlAbsPath(url) {
        var a = document.createElement('a');
        a.href = url;
        a = a.pathname + a.search + a.hash;
        a = a.indexOf('/') === 0 ? a : '/' + a; // because IE doesn't return a leading '/'
        return a;
    }

    function setSequencePos(url) {
        sequencePos = getSequencePos(url);
    }

    function getSequencePos(url) {
        return sequence.indexOf(url);
    }

    function getSequenceUrl(pos) {
        return pos > -1 && pos < sequenceLen ? sequence[pos] : sequence[0];
    }

    function loadSequence(config, callback) {
        var sequenceUrl = linkContext;

        if (sequenceUrl) {
            // data-link-context was from a click within this app
            linkContext = undefined;
        } else {
            sequenceUrl = storage.get(storePrefix + 'linkContext');
            if (sequenceUrl) {
                // data-link-context was set by a click on a previous page
                storage.remove(storePrefix + 'linkContext');
            } else {
                // No data-link-context, so infer the section/tag component from the url,
                if("page" in config) {
                    sequenceUrl = (config.page.section ? config.page.section : config.page.edition.toLowerCase());
                } else {
                    sequenceUrl = window.location.pathname.match(/^\/([^0-9]+)/);
                    sequenceUrl = (sequenceUrl ? sequenceUrl[1] : '');
                }
            }
        }

        // Strip trailing slash
        sequenceUrl = sequenceUrl.replace(/\/$/, "");

        ajax({
            url: '/' + sequenceUrl + '.json',
            crossOrigin: true
        }).then(function (json) {
                var trails = json.trails,
                    len = trails ? trails.length : 0,
                    url = window.location.pathname,
                    s,
                    i;

                if (len >= 3) {

                    trails.unshift(url);
                    len += 1;

                    sequence = [];
                    sequenceLen = 0;
                    sequenceCache = {};

                    for (i = 0; i < len; i += 1) {
                        s = trails[i];
                        // dedupe, while also creating a lookup obj
                        if(!sequenceCache[s]) {
                            sequenceCache[s] = {};
                            sequence.push(s);
                            sequenceLen += 1;
                        }
                    }

                    setSequencePos(window.location.pathname);
                    callback();
                } else {
                    loadSequenceRetry (sequenceUrl, callback);
                }
            }).fail(function () {
                loadSequenceRetry (sequenceUrl, callback);
            });
    }


    function getAdjacentUrl(dir) {
        // dir = 1   => the right pane
        // dir = -1  => the left pane

        return getSequenceUrl(1, sequenceLen);
    }

    function start() {

        common.mediator.on('module:clickstream:click', function(clickSpec){
            var url;

            if (clickSpec.sameHost && !clickSpec.samePage) {
                if (clickSpec.linkContext) {
                    storage.set(storePrefix + 'linkContext', clickSpec.linkContext, {
                        expires: 10000 + (new Date()).getTime()
                    });
                }
            }
        });

    }

    var init = function(config, contextHtml) {
        loadSequence(config, function(){
            var loc = window.location.href;

            initialUrl       = urlAbsPath(loc);
            referrer         = loc;
            referrerPageName = config.page.analyticsName;

            url = context.url;
            setSequencePos(url);

            referrer = window.location.href;
            referrerPageName = config.page.analyticsName;

            if (sequenceCache[initialUrl]) {
                sequenceCache[initialUrl].config = config;
                sequenceCache[initialUrl].html = contextHtml;
            }

            start();
        });

        return api;
    };

    return initialise;
});
