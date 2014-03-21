define(['common/$', 'bonzo'], function($, bonzo) {
    var $rhc = $('.js-right-hand-component .js-components');

    /**
     * @param {Element|Bonzo} c
     * @param {number} importance number (optional)
     */
    function addComponent(c, importance) {
        importance = importance || 1;
        var classname = 'component--rhc',
            $cs;

        return $.create('<div class="'+ classname +'" data-importance="'+ importance +'"></div>')
            .append(c)
            .each(function(el) {
                $cs = $('.'+ classname, $rhc[0]);
                var $inferior = bonzo($cs.map(function(el) {
                    return importance > parseInt(el.getAttribute('data-importance'), 10) ? el : false;
                })).first();

                if ($inferior.length === 0) {
                    $rhc.append(el);
                } else {
                    $inferior.before(el);
                }
            });
    }

    return {
        addComponent: addComponent
    };
});
