define(['common/utils/$', 'bonzo', 'lodash/collections/filter'], function($, bonzo, _filter) {
    var $rhc = $('.js-components-container');

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
                var inferior = _filter($cs, function(el) {
                    return !el.hasAttribute('data-importance') ||
                        importance > parseInt(el.getAttribute('data-importance'), 10);
                });
                if (inferior.length === 0) {
                    $rhc.append(el);
                } else {
                    bonzo(inferior[0]).before(el);
                }
            });
    }

    return {
        addComponent: addComponent
    };
});
