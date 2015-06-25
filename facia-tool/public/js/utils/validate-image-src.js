import _ from 'underscore';
import Promise from 'Promise';
import {CONST} from 'modules/vars';
import absPath from 'utils/url-abs-path';
import params from 'utils/parse-query-params';

/**
 * Asserts if the given image URL is on The Guardian domain, is proper size and aspect ratio.
 * @param src image source
 * @param criteria. validation criteria object. defines: maxWidth, minWidth, widthAspectRatio, heightAspectRatio
 * @returns Promise object: rejects with (error) OR resolves with (width, height, src)
 */
function validateImageSrc(src, criteria) {
    return new Promise(function (resolve, reject) {
        var img,
            defaultCriteria = {
                maxWidth: undefined,
                minWidth: undefined,
                widthAspectRatio: undefined,
                heightAspectRatio: undefined
            };
        criteria = _.extend(defaultCriteria, criteria);

        if (!src) {
            reject(new Error('Missing image'));

        } else if (!src.match(new RegExp('^http://.*' + CONST.imageCdnDomain.replace('.', '\\.') + '/'))) {
            reject(new Error('Images must come from *' + CONST.imageCdnDomain));

        } else {
            src = stripImgIXDetails(src);

            img = new Image();
            img.onerror = function() {
                reject(new Error('That image could not be found'));
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
                    reject(new Error(err));
                } else {
                    // Get the src again from the img, this makes sure that the URL is encoded properly
                    resolve({
                        width: width,
                        height: height,
                        src: img.src
                    });
                }
            };
            img.src = src;
        }
    });
}

function stripImgIXDetails (src) {
    var pathname = '/' + absPath(src),
        base = src.substring(0, src.indexOf(pathname)),
        hash = params(src).s || '';

    if (pathname.indexOf(CONST.imgIXBasePath) === 0 && hash.match(/[0-9a-f]{32}/)) {
        return base + '/' + pathname.substring(CONST.imgIXBasePath.length);
    } else {
        return src;
    }
}

export default validateImageSrc;
