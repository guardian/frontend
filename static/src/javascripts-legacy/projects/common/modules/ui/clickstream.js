define(['bean', 'lib/mediator', 'lodash/objects/merge'], function(
    bean,
    mediator,
    merge
) {
    var Clickstream = function(opts) {
        opts = opts || {};

        // Allow a fake window.location to be passed in for testing
        var location = opts.location || window.location;

        var filters = opts.filter || [],
            filterSource = function(element) {
                return filters.filter(function(f) {
                    return f === element;
                });
            },
            compareHosts = function(url) {
                var urlHost, host;

                url = url || '';
                urlHost = url.match(/:\/\/(.[^\/]+)/);

                if (urlHost) {
                    urlHost = urlHost[1];
                    host = location.hostname;
                }

                if (url.indexOf('mailto:') === 0) {
                    return false;
                }

                // Lack of a urlHost implies a relative url.
                // For absolute urls we are protocol-agnostic,
                // e.g. we should treat https://gu.com/foo -> http://gu.com/bar as a same-host link.
                return !urlHost || urlHost === host;
            },
            getClickSpec = function(spec, forceValid) {
                // element was removed from the DOM
                if (!spec.el) {
                    return false;
                }
                var el = spec.el,
                    elName = el.tagName.toLowerCase(),
                    dataLinkName = el.getAttribute('data-link-name'),
                    href;

                if (dataLinkName) {
                    spec.tag.unshift(dataLinkName);
                }

                if (elName === 'body') {
                    spec.tag = spec.tag.join(' | ');
                    delete spec.el;

                    if (spec.validTarget && el.getAttribute('data-link-test')) {
                        spec.tag =
                            el.getAttribute('data-link-test') +
                            ' | ' +
                            spec.tag;
                    }
                    return spec;
                }

                var customEventProperties = JSON.parse(
                    el.getAttribute('data-custom-event-properties') || '{}'
                );
                spec.customEventProperties = merge(
                    customEventProperties,
                    spec.customEventProperties
                );

                if (!spec.validTarget) {
                    spec.validTarget =
                        filterSource(elName).length > 0 || !!forceValid;
                    if (spec.validTarget) {
                        spec.target = el;
                        href = el.getAttribute('href');
                        spec.samePage =
                            (href && href.indexOf('#') === 0) ||
                            elName === 'button' ||
                            el.hasAttribute('data-is-ajax');

                        spec.sameHost = spec.samePage || compareHosts(href);
                    }
                }

                // Pick up the nearest data-link-context
                if (
                    !spec.linkContext &&
                    el.getAttribute('data-link-context-path')
                ) {
                    spec.linkContextPath = el.getAttribute(
                        'data-link-context-path'
                    );
                    spec.linkContextName = el.getAttribute(
                        'data-link-context-name'
                    );
                }

                // Recurse
                spec.el = el.parentNode;
                return getClickSpec(spec);
            };

        // delegate, emit the derived tag
        if (opts.addListener !== false) {
            bean.add(document.body, 'click', function(event) {
                var clickSpec = {
                    el: event.target,
                    tag: [],
                };

                clickSpec.target = event.target;
                clickSpec = getClickSpec(clickSpec);
                mediator.emit('module:clickstream:click', clickSpec);
            });
        }

        return {
            getClickSpec: getClickSpec,
        };
    };

    return Clickstream;
});
