define(function() {
    return function(content){
        if (content && content.fields && content.fields.internalContentCode) {
            return 'internal-code/content/' + content.fields.internalContentCode;
        }
    };
});
