define(['common', 'modules/detect', 'bean'], function (common, detect, bean) {

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

        var getClickSpec = function (spec) {
            var el = spec.el,
                elName = el.tagName.toLowerCase(),
                dataLinkName;

            if (elName === 'body') {
                if (spec.validTarget) {
                    spec.tag = [].concat(spec.tag).reverse().join(' | ');
                    delete spec.el;
                    delete spec.validTarget;
                    return spec;
                }
                else {
                    return false;
                }
            }

            if(!spec.validTarget) {
                spec.validTarget = filterSource(el.tagName.toLowerCase()).length > 0;
                if(spec.validTarget) {
                    spec.target = el;
                    spec.samePage = (elName === 'button') || (' ' + el.className + ' ').indexOf(' control ') > -1;
                    spec.sameHost = spec.samePage || compareHosts(el.getAttribute('href'));
                }
            }

            dataLinkName = el.getAttribute('data-link-name');
            if (dataLinkName) {
                spec.tag = spec.tag || [];
                spec.tag.push(dataLinkName);
            }

            // Recurse
            spec.el = el.parentNode;
            return getClickSpec(spec);
        };

        // delegate, emit the derived tag
        bean.add(document.body, 'click', function (event) {
            var clickSpec = getClickSpec({el: event.target});
            if (clickSpec) {
                common.mediator.emit('module:clickstream:click', clickSpec);
            }
        });

    };

    return (Clickstream);

});

