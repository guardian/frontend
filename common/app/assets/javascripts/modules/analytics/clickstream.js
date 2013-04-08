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

        var getTag = function (element, tag, valid) {

            var elementName = element.tagName.toLowerCase(),
                dataLinkName = element.getAttribute('data-link-name');

            valid = valid || filterSource(element.tagName.toLowerCase()).length > 0;

            if (elementName === 'body') {
                return valid ? tag.reverse().join(' | ') : false;
            }

            if (dataLinkName) {
                tag.push(dataLinkName);
            }

            return getTag(element.parentNode, tag, valid);
        };

        // delegate, emit the derived tag
        bean.add(document.body, 'click', function (event) {
            var target = event.target,
                tag    = getTag(target, [], false),
                dataIsXhr,
                href,
                isSamePage,
                isSameHost;

            if (tag) {

                dataIsXhr = target.getAttribute('data-is-ajax');
                href = target.getAttribute('href');

                isSamePage = (
                    !!dataIsXhr ||                             // xhr
                    (href && (href.indexOf('#') === 0)) ||     // internal anchor
                    'button' === target.nodeName.toLowerCase() // UI button
                );
                isSameHost = hasSameHost(href);

                common.mediator.emit('module:clickstream:click', [target, tag, isSamePage, isSameHost]);

            } else {
                return false;
            }
        });

    };

    return (Clickstream);

});

