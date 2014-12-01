define(['modules/vars'], function(vars) {
    return function(content){
        if (content && content.fields && content.fields.internalContentCode) {
            return vars.CONST.internalContentPrefix + content.fields.internalContentCode;
        }
    };
});
