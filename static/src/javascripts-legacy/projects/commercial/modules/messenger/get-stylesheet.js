define(['commercial/modules/messenger'], function(messenger) {
    var aProto = Array.prototype;

    messenger.register('get-styles', function(specs) {
        return getStyles(specs, document.styleSheets);
    });
    return getStyles;

    function getStyles(specs, styleSheets) {
        if (!specs || typeof specs.selector !== 'string') {
            return null;
        }

        var i = 0;
        var ii = styleSheets.length;
        var result = [];
        while (i < ii) {
            var sheet = styleSheets[i++];
            if (
                sheet.ownerNode &&
                sheet.ownerNode.matches &&
                sheet.ownerNode.matches(specs.selector)
            ) {
                if (sheet.ownerNode.tagName === 'STYLE') {
                    result.push(sheet.ownerNode.textContent);
                } else {
                    result.push(
                        aProto.reduce.call(
                            sheet.cssRules || [],
                            function(res, input) {
                                return res + input.cssText;
                            },
                            ''
                        )
                    );
                }
            }
        }

        return result;
    }
});
