define([
    'common',
    'utils/detect',
    'bean',
    'modules/experiments/ab'
], function (
    common,
    detect,
    bean,
    ab
) {

    var Clickstream = function (opts) {

        opts = opts || {};
        var filters = opts.filter || [];

        var filterSource = function (element) {
            return filters.filter(function (f) {
                return (f === element);
            });
        };

        var compareHosts = function(url) {
            var urlHost,
                urlProtocol,
                host,
                protocol;

            url = url || '';
            urlHost = url.match(/:\/\/(.[^\/]+)/);

            if(urlHost) {
                urlHost = urlHost[1];
                urlProtocol = url.match(/^(https?:)\/\//);
                urlProtocol = urlProtocol ? urlProtocol[1] : undefined;
                host = window.location.hostname;
                protocol = window.location.protocol;
            }

            // Lack of a urlHost implies a relative url
            return !urlHost || (urlHost === host && urlProtocol === protocol);
        };

        var getClickSpec = function (spec, forceValid) {
            if (!spec.el) { return false; }
            var el = spec.el,
                elName = el.tagName.toLowerCase(),
                dataLinkName = el.getAttribute('data-link-name'),
                href;

            if (dataLinkName) {
                spec.tag = spec.tag || [];
                spec.tag.push(dataLinkName);
            }

            if (elName === 'body') {
                if (spec.validTarget && spec.tag.length) {
                    spec.tag = [].concat(spec.tag).reverse().join(' | ');
                    if(el.getAttribute('data-link-test')) {
                        spec.tag = el.getAttribute('data-link-test') + ' | ' + spec.tag;
                    }
                    delete spec.el;
                    delete spec.validTarget;
                    return spec;
                }
                else {
                    return false;
                }
            }

            if(!spec.validTarget) {
                spec.validTarget = filterSource(el.tagName.toLowerCase()).length > 0 || forceValid;
                if(spec.validTarget) {
                    spec.target = el;
                    href = el.getAttribute('href');
                    spec.samePage = href && href.indexOf('#') === 0
                        || elName === 'button'
                        || el.hasAttribute('data-is-ajax');

                    spec.sameHost = spec.samePage || compareHosts(href);
                }
            }

            // Pick up the nearest data-link-context
            if(!spec.linkContext && el.getAttribute('data-link-context')) {
                spec.linkContext =  el.getAttribute('data-link-context');
            }

            // Recurse
            spec.el = el.parentNode;
            return getClickSpec(spec);
        };

        // delegate, emit the derived tag
        if (opts.addListener !== false) {
            bean.add(document.body, 'click', function (event) {
                var clickSpec = {el: event.target};

                if (opts.withEvent !== false) {
                    clickSpec.event = event;
                }

                clickSpec = getClickSpec(clickSpec);

                // prefix ab tests to the click spec
                var applicableTests = ab.getActiveTestsEventIsApplicableTo(clickSpec);
                if (applicableTests !== undefined && applicableTests.length > 0) {
                    clickSpec.tag = applicableTests.map(function (test) {
                        var variant = ab.getTestVariant(test);
                        return "AB," + test + "," + variant + "," + clickSpec.tag;
                    }).join(',');
                }

                if (clickSpec) {
                    common.mediator.emit('module:clickstream:click', clickSpec);
                }
            });
        }

        return {
            getClickSpec: getClickSpec
        };
    };

    return Clickstream;

});

