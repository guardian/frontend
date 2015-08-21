import {CONST} from 'modules/vars';

export default function(content) {
    if (content && content.fields && content.fields.internalContentCode) {
        return CONST.internalContentPrefix + content.fields.internalContentCode;
    }
}
