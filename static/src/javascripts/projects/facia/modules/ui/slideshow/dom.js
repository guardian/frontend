define([
    'Promise',
    'bonzo',
    'fastdom',
    'common/utils/mediator'
], function (
    Promise,
    bonzo,
    fastdom,
    mediator
) {
    function hideForInsertion(img) {
        img.attr({
            ariaHidden: true
        })
        .css({
            opacity: 0
        });
    }

    function onLoad(img, resolve, reject) {
        if (img.complete) {
            // The image was taken from cache
            'naturalWidth' in img && img.naturalWidth === 0 ? reject() : resolve();
        } else {
            img.onload = resolve;
            img.onerror = reject;
        }
    }

    function init(container) {
        return new Promise(function (resolve) {
            var listOfImages = [], i, len, node;
            for (i = 0, len = container.childNodes.length; i < len; i += 1) {
                node = container.childNodes[i];
                if (node.nodeType === Node.COMMENT_NODE) {
                    listOfImages.push(node);
                } else if (node.tagName && node.tagName.toLowerCase() === 'img') {
                    listOfImages.push(bonzo(node));
                }
            }
            resolve(listOfImages);
        });
    }

    function insert(newImage) {
        return new Promise(function (resolve, reject) {
            // This function assumes that images are wrapped inside comment tags
            if (newImage.nodeType === Node.COMMENT_NODE) {
                var img = bonzo(bonzo.create(newImage.nodeValue));
                fastdom.write(function () {
                    hideForInsertion(img);
                    onLoad(img[0], function () {
                        resolve(img);
                    }, function () {
                        img.remove();
                        reject();
                    });
                    img.appendTo(newImage.parentNode);
                });
                mediator.emit('ui:images:lazyLoaded', img[0]);
            } else {
                fastdom.write(function () {
                    hideForInsertion(newImage);
                    resolve(newImage);
                });
            }
        });
    }

    // This method expect the images to be bonzo wrappers
    function transition(oldImage, newImage) {
        var ms = domObject.duration;

        return new Promise(function (resolve) {
            fastdom.write(function () {
                oldImage.css({
                    transition: 'opacity ' + ms + 'ms linear',
                    opacity: 0
                });
                newImage.css({
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
                oldImage.attr({
                    ariaHidden: true
                });
                resolve();
            });
        });
    }

    var domObject = {
        init: init,
        insert: insert,
        transition: transition,
        remove: remove,
        duration: 500
    };
    return domObject;
});
