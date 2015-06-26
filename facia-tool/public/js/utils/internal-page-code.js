import {CONST} from 'modules/vars';

export default function(content) {
    if (content && content.fields && content.fields.internalPageCode) {
        return CONST.internalPagePrefix + content.fields.internalPageCode;
    }
}
