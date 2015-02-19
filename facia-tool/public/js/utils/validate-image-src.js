define([
    'underscore',
    'jquery',
    'modules/vars'
], function(
    _,
    $,
    vars
) {

    /**
     * Asserts if the given image URL is on The Guardian domain, is proper size and aspect ratio.
     * Expected libs in context: jQuery (as $), underscore (as _)
     * @param src image source
     * @param criteria. validation criteria object. defines: maxWidth, minWidth, widthAspectRatio, heightAspectRatio
     * @returns jQuery.Deferred object: rejects with (error) OR resolves with (width, height)
     */
    var validateImageSrc = function(src, criteria) {
        var defer = $.Deferred(),
            img,
            defaultCriteria = {
                maxWidth: undefined,
                minWidth: undefined,
                widthAspectRatio: undefined,
                heightAspectRatio: undefined
            };
        criteria = _.extend(defaultCriteria, criteria);

        if (!src) {
            defer.reject();

        } else if (!src.match(new RegExp('^http://.*\\.' + vars.CONST.imageCdnDomain + '/'))) {
            defer.reject('Images must come from *.' + vars.CONST.imageCdnDomain);

        } else {
            img = new Image();
            img.onerror = function() {
                defer.reject('That image could not be found');
            };
            img.onload = function() {
                var width = this.width || 1,
                    height = this.height || 1,
                    err = (criteria.maxWidth !== undefined && width > criteria.maxWidth) ?
                            'Images cannot be more than ' + criteria.maxWidth + ' pixels wide' :
                        (criteria.minWidth !== undefined && width < criteria.minWidth) ?
                            'Images cannot be less than ' + criteria.minWidth + ' pixels wide' :
                        (criteria.widthAspectRatio !== undefined && criteria.heightAspectRatio !== undefined
                          && Math.abs((height * criteria.widthAspectRatio) / (width * criteria.heightAspectRatio) - 1) > 0.01) ?
                            'Images must have a ' + criteria.widthAspectRatio + 'x' + criteria.heightAspectRatio + ' aspect ratio'
                            : false;

                if (err) {
                    defer.reject(err);
                } else {
                    defer.resolve(width, height);
                }
            };
            img.src = src;
        }

        return defer.promise();
    };

    return validateImageSrc;
});
