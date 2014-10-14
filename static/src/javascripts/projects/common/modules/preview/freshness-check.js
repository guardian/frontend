define([
    'common/utils/ajax',
    'common/utils/$',
    'common/utils/mediator'
], function (
    ajax,
    $,
    mediator
) {
    return function (config, hash) {

        var rawLastModified = hash || document.location.hash,
            page = ((config || {}).page || {}),
            lastModifiedMatch;

        function call(lastModified, block) {
            ajax({
                url: '/last-modified/' + page.pageId + '.json?last-modified=' + lastModified,
                type: 'json',
                crossOrigin: true
            }).then(function (json) {
                block(json);
            });
        }

        function initialFreshnessCheck(lastModified) {
            call(lastModified, function (json) {
                if (json.status === 'stale') {
                    mediator.emit('modules:freshness-check:stale', lastModified);
                }
                if (json.status === 'fresh') {
                    mediator.emit('modules:freshness-check:fresh');
                }
            });
        }

        function pollForFreshContent(lastModified) {
            call(lastModified, function (json) {
                if (json && json.status === 'fresh') {
                    mediator.emit('modules:freshness-check:poll:fresh');
                }
            });
        }

        // clear the hash, people often copy & paste these urls off the preview server.
        function clearHash() {
            // reasonably well supported http://caniuse.com/#feat=history
            if (history && history.replaceState) {
                history.replaceState(history.state, document.title, location.href.split('#')[0]);
            }
        }

        mediator.on('modules:freshness-check:poll:fresh', function () { location.reload(); });

        mediator.on('modules:freshness-check:stale', function (lastModified) {
            $('body').prepend(
                '<div class="preview-refresh">Waiting for update...' +
                    '<p class="preview-refresh--explainer">' +
                        'We expect a new version of this content to be available soon. ' +
                        'The page will reload as soon as it is ready.' +
                    '</p>' +
                    '<div class="pamplemousse">' +
                    '<div class="pamplemousse__pip"><i></i></div>' +
                    '<div class="pamplemousse__pip"><i></i></div>' +
                    '<div class="pamplemousse__pip"><i></i></div>' +
                    '</div>' +
                '</div>'
            );
            var interval = setInterval(function () { pollForFreshContent(lastModified); }, 2000);

            //stop polling after a minute if it has not updated yet
            setTimeout(function () { clearInterval(interval); }, 60000);
        });

        return {
            check: function () {
                if (page.isContent  && config.switches.pollPreviewForFreshContent) {
                    lastModifiedMatch = /last-modified=([^&]+)/.exec(rawLastModified);
                    if (lastModifiedMatch) {
                        initialFreshnessCheck(lastModifiedMatch[1]);
                        clearHash();
                    }
                }
            }
        };
    };
});
