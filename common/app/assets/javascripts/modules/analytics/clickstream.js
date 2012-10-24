define(['common', 'modules/detect', 'bean'], function (common, detect, bean) {

    var Clickstream = function (opts) {

            opts = opts || {};
            var filters = opts.filter || [];

        var filterSource = function (element) {
            return filters.filter(function (f) {
                return (f === element);
            });
        };

        var getTag = function (element, tag) {

            var elementName = element.tagName.toLowerCase(),
                dataLinkName = element.getAttribute("data-link-name");

            if (elementName === 'body') {
                return tag.reverse().join(' | ');
            }

            if (dataLinkName) {
                tag.push(dataLinkName);
            }

            return getTag(element.parentNode, tag);
        };

        // delegate, emit the derived tag
        bean.add(document.body, "click", function (event) {
            var target, dataIsXhr, href, isXhr, isInternalAnchor;

            if (filterSource(event.target.tagName.toLowerCase()).length > 0) {

                target = common.getTargetElement(event);
                dataIsXhr = target.getAttribute("data-is-ajax");
                href = target.getAttribute("href");

                isXhr = (dataIsXhr) ? true : false;
                isInternalAnchor = (href && (href.indexOf('#') === 0)) ? true : false;

                common.mediator.emit('module:clickstream:click', [target, getTag(target, []), isXhr, isInternalAnchor]);
            } else {
                return false;
            }
        });

    };

    return (Clickstream);

});

