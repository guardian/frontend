define([
    'Promise',
    'bonzo',
    'qwery',
    'fastdom',
    'common/modules/ui/lazy-load-images',
    'common/utils/_'
], function (
    Promise,
    bonzo,
    qwery,
    fastdom,
    lazyLoadImages,
    _
) {
    function hideForInsertion(img) {
        img.attr({
            ariaHidden: true
        })
        .css({
            opacity: 0
        });
    }

    function init(container) {
        return new Promise(function (resolve) {
            resolve(_.map(qwery('img', container), function (image, index) {
                var node = bonzo(image);
                return {
                    node: node,
                    loaded: index === 0 ?
                        (!node.hasClass('js-lazy-loaded-image') || node.hasClass('js-lazy-loaded-image-loaded')) :
                        false
                };
            }));
        });
    }

    function insert(newImage) {
        return new Promise(function (resolve) {
            fastdom.write(function () {
                var node = newImage.node;

                hideForInsertion(node);
                if (newImage.loaded) {
                    resolve(newImage);
                } else {
                    lazyLoadImages.reveal(node);
                    // Using lazy-load + picturefill there's no way to control the load / error
                    // just give the browser some time
                    setTimeout(function () {
                        newImage.loaded = true;
                        resolve(newImage);
                    }, domObject.loadTime);
                }
            });
        });
    }

    // This method expect the images to be bonzo wrappers
    function transition(oldImage, newImage) {
        var ms = domObject.duration;

        return new Promise(function (resolve) {
            fastdom.write(function () {
                oldImage.node.css({
                    transition: 'opacity ' + ms + 'ms linear',
                    opacity: 0
                });
                newImage.node.css({
                    transition: 'opacity ' + ms + 'ms linear',
                    opacity: 1
                })
                .attr({
                    ariaHidden: false
                });
                setTimeout(function () {
                    resolve();
                }, ms);
            });
        });
    }

    function remove(oldImage) {
        return new Promise(function (resolve) {
            fastdom.write(function () {
                oldImage.node.attr({
                    ariaHidden: true
                });
                resolve(oldImage);
            });
        });
    }

    function equal(domImage, fromListImage) {
        return domImage === fromListImage.node[0];
    }

    var domObject = {
        init: init,
        insert: insert,
        transition: transition,
        remove: remove,
        equal: equal,
        duration: 1000,
        loadTime: 200
    };
    return domObject;
});
