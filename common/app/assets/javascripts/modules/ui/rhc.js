define(['common/$', 'bonzo'], function($, bonzo) {
    var $rhc = $('.js-right-hand-component .js-components');

    /**
     * @param {Element|Bonzo} c
     * @param {number} importance number
     */
    function addComponent(c, importance) {
        var classname = 'component--rhc';
        $.create('<div class="'+ classname +'" data-importance="'+ importance +'"></div>')
            .append(c)
            .each(function(el) {
                var $cs = $('.'+ classname, $rhc[0]);
                if ($cs.length === 0) {
                    $rhc.append(el);
                } else {
                    $cs.each(function(existingComponent, i) {
                        if (parseInt(existingComponent.getAttribute('data-importance'), 10) > importance) {
                            bonzo(existingComponent).before(el);
                        } else if ($cs.length-1 === i) {
                            $rhc.append(el);
                        }
                    });
                }
            });

    }

    return {
        addComponent: addComponent
    };
});
