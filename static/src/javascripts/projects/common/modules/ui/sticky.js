define([
    'common/utils/config',
    'common/utils/mediator',
    'fastdom',
    'lodash/objects/defaults'
], function (
    config,
    mediator,
    fastdom,
    defaults
) {
    var candidates = [], stickyHeaderHeight;

    /**
     * @todo: check if browser natively supports "position: sticky"
     */
    function stick(element, options) {
        var id = candidates.push({
            element: element,
            options: defaults(options || {}, {
                top: 0
            })
        });

        if (candidates.length === 1) {
            stickyHeaderHeight = (config.switches.viewability
                && !(config.page.isProd && config.page.contentType === 'Interactive')
                && !config.page.sponsorshipType === "sponsoredfeatures"
                && config.page.contentType !== 'Crossword'
                && config.page.pageId !== 'offline-page') ?
                document.querySelector('.js-navigation').offsetHeight :
                0;
            mediator.on('window:throttledScroll', update);
            fastdom.read(update);
        }

        return id;
    }

    function unstick(id) {
        candidates.splice(id, 1);

        if (candidates.length === 0) {
            mediator.off('window:throttledScroll', update);
        }
    }

    function update() {
        var writes = [];
        for (var i = 0; i < candidates.length; i++) {
            var element = candidates[i].element,
                options = candidates[i].options,
                prect   = element.parentNode.getBoundingClientRect();
            var fixedTop;
            // have we scrolled past the element
            if (prect.top <= options.top + stickyHeaderHeight) {
                // make sure the element stays within its parent
                fixedTop = Math.min(options.top, prect.bottom - element.offsetHeight) + 'px';

                if (element.style.position !== 'fixed' || element.style.top !== fixedTop) {
                    writes.push({
                        element: element,
                        css: {
                            position: 'fixed',
                            top:      fixedTop
                        }
                    });
                    writes.push({
                        element: element.parentNode,
                        css: {
                            paddingTop: element.offsetHeight + 'px'
                        }
                    });
                }
            } else {
                if (element.style.position === 'fixed') {
                    writes.push({
                        element: element,
                        css: {
                            position: null,
                            top:      null
                        }
                    });
                    writes.push({
                        element: element.parentNode,
                        css: {
                            paddingTop: null
                        }
                    })
                }
            }
        }

        fastdom.write(function () {
            while (writes.length) {
                var w = writes.shift();
                for (var attr in w.css) {
                    if (!w.css.hasOwnProperty(attr)) {
                        continue;
                    }
                    w.element.style[attr] = w.css[attr];
                }
            }
        });
    }

    return {
        stick: stick,
        unstick: unstick
    };
});
