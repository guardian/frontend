import {CONST} from 'modules/vars';
import urlHost from 'utils/url-host';

export default function (url) {
    return urlHost(url) === CONST.mainDomain;
}
