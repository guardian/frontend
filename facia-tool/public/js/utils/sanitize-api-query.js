import _ from 'underscore';
import parseQueryParams from 'utils/parse-query-params';

export default function(url) {
    var bits = (url + '').split('?');

    if (bits.length <= 1) {
        return url;
    }

    var params = _.map(
        parseQueryParams(url, {
            predicateKey: function(key) { return key !== 'api-key'; },
            predicateVal: function(val) { return val; }
        }),
        function(val, key) { return key + '=' + val; }
    ).join('&');

    return bits[0] + (params ? '?' + params : '');
}
