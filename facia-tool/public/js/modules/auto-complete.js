import Promise from 'Promise';
import {request} from 'modules/authed-ajax';
import * as cache from 'modules/cache';
import {CONST} from 'modules/vars';

var maxItems = 50;

export default function (opts) {
    // TODO Phantom Babel bug
    if (!opts) { opts = {}; }
    var query = opts.query || '';
    var path = opts.path || 'tags';
    var page = opts.page || 1;

    return new Promise((resolve, reject) => {
        if (!query) {
            return resolve();
        } else if (!query.match(/[a-z0-9]+/i)) {
            return reject(new Error('Invalid search term'));
        }

        var url  = '/' + path + '?' + [
            'q=' + query,
            'page-size=' + maxItems,
            'page=' + page
        ].join('&'),
            cached = cache.get('contentApi', url);

        if (cached) {
            resolve(cached);
        } else {
            request({
                url: CONST.apiSearchBase + url
            })
            .then(res => {
                // TODO Phantom Babel bug
                var response = (res || {}).response;
                if (!response || !response.results) {
                    reject(new Error('No results from CAPI'));
                } else {
                    cache.put('contentApi', url, response);
                    resolve(response);
                }
            }, () => {
                reject(new Error('Error getting results from CAPI'));
            });
        }
    });
}
