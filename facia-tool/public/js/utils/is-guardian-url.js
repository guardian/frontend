import vars from 'modules/vars';
import urlHost from 'utils/url-host';

export default function (url) {
    return urlHost(url) === vars.CONST.mainDomain;
}
