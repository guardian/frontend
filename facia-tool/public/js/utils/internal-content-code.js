import vars from 'modules/vars';

export default function(content) {
    if (content && content.fields && content.fields.internalContentCode) {
        return vars.CONST.internalContentPrefix + content.fields.internalContentCode;
    }
}
