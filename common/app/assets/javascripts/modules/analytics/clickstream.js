define(['common', 'modules/detect', 'bean'], function (common, detect, bean) {

    var Clickstream = function (opts) {

        opts = opts || {};
        var filters = opts.filter || [];

        var filterSource = function (element) {
            return filters.filter(function (f) {
                return (f === element);
            });
        };

        var hasSameHost = function(url) {
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

        var getTag = function (element, tag) {

            var elementName = element.tagName.toLowerCase(),
                dataLinkName = element.getAttribute('data-link-name');

            if (elementName === 'body') {
                return tag.reverse().join(' | ');
            }

            if (dataLinkName) {
                tag.push(dataLinkName);
            }

            return getTag(element.parentNode, tag);
        };

        // delegate, emit the derived tag
        bean.add(document.body, 'click', function (event) {
            var target, dataIsXhr, href, isSamePage, isSameHost;

            if (filterSource(event.target.tagName.toLowerCase()).length > 0) {

                target = event.target;
                dataIsXhr = target.getAttribute('data-is-ajax');
                href = target.getAttribute('href');

                isSamePage = (
                    !!dataIsXhr ||                             // xhr
                    (href && (href.indexOf('#') === 0)) ||     // internal anchor
                    'button' === target.nodeName.toLowerCase() // UI button
                );
                isSameHost = hasSameHost(href);

                common.mediator.emit('module:clickstream:click', [target, getTag(target, []), isSamePage, isSameHost]);

            } else {
                return false;
            }
        });

    };

    return (Clickstream);

});

