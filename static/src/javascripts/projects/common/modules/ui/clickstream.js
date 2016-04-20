define([
    'bean',
    'common/utils/mediator',
    'common/modules/experiments/ab',
    'lodash/objects/merge',
    'lodash/collections/map'
], function (
    bean,
    mediator,
    ab,
    merge,
    map
) {

    var Clickstream = function (opts) {

        opts = opts || {};

        var filters = opts.filter || [],
            filterSource = function (element) {
                return filters.filter(function (f) {
                    return (f === element);
                });
            },
            compareHosts = function (url) {
                var urlHost,
                    urlProtocol,
                    host,
                    protocol;

                url = url || '';
                urlHost = url.match(/:\/\/(.[^\/]+)/);

                if (urlHost) {
                    urlHost = urlHost[1];
                    urlProtocol = url.match(/^(https?:)\/\//);
                    urlProtocol = urlProtocol ? urlProtocol[1] : undefined;
                    host = window.location.hostname;
                    protocol = window.location.protocol;
                }

                if (url.indexOf('mailto:') === 0) {
                    return false;
                }

                // Lack of a urlHost implies a relative url
                return !urlHost || (urlHost === host && urlProtocol === protocol);
            },
            getClickSpec = function (spec, forceValid) {
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
                        spec.tag = el.getAttribute('data-link-test') + ' | ' + spec.tag;
                    }
                    return spec;
                }

                var customEventProperties = JSON.parse(el.getAttribute('data-custom-event-properties') || '{}');
                spec.customEventProperties = merge(customEventProperties, spec.customEventProperties);

                if (!spec.validTarget) {
                    spec.validTarget = filterSource(elName).length > 0 || !!forceValid;
                    if (spec.validTarget) {
                        spec.target = el;
                        href = el.getAttribute('href');
                        spec.samePage = href && href.indexOf('#') === 0
                            || elName === 'button'
                            || el.hasAttribute('data-is-ajax');

                        spec.sameHost = spec.samePage || compareHosts(href);
                    }
                }

                // Pick up the nearest data-link-context
                if (!spec.linkContext && el.getAttribute('data-link-context-path')) {
                    spec.linkContextPath =  el.getAttribute('data-link-context-path');
                    spec.linkContextName =  el.getAttribute('data-link-context-name');
                }

                // Recurse
                spec.el = el.parentNode;
                return getClickSpec(spec);
            };

        // delegate, emit the derived tag
        if (opts.addListener !== false) {
            bean.add(document.body, 'click', function (event) {
                var applicableTests,
                    clickSpec = {
                        el: event.target,
                        tag: []
                    };

                clickSpec.target = event.target;

                clickSpec = getClickSpec(clickSpec);

                // prefix ab tests to the click spec
                applicableTests = ab.getActiveTestsEventIsApplicableTo(clickSpec);
                if (applicableTests !== undefined && applicableTests.length > 0) {
                    clickSpec.tag = map(applicableTests, function (test) {
                        var variant = ab.getTestVariantId(test);
                        return 'AB,' + test + ',' + variant + ',' + clickSpec.tag;
                    }).join(',');
                }

                mediator.emit('module:clickstream:click', clickSpec);
            });
        }

        return {
            getClickSpec: getClickSpec
        };
    };

    return Clickstream;

});
