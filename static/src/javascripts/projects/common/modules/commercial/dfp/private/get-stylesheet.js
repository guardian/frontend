define([
    'common/modules/commercial/dfp/messenger'
], function (messenger) {
    var matches = 'matches' in Element.prototype ? 'matches' : 'msMatchesSelector';
    var aProto = Array.prototype;

    messenger.register('get-styles', getStyles);
    return getStyles;

    function getStyles(specs) {
        var i = 0;
        var ii = document.styleSheets.length;
        var ret = [];
        while (i < ii) {
            var sheet = document.styleSheets[i++];
            if (!sheet.ownerNode) {
                continue;
            }

            if (specs.selector && !sheet.ownerNode[matches](specs.selector)) {
                continue;
            }

            if (sheet.ownerNode.tagName === 'STYLE') {
                ret.push(sheet.ownerNode.textContent);
            } else {
                ret.push(aProto.reduce.call(sheet.cssRules, function (res, input) {
                    return res + input.cssText;
                }, ''));
            }
        }

        return ret;
    }
});
