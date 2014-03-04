define([
    'common/$',
    'common/utils/mediator',
    'common/utils/ajax',
    'bonzo',
    'bean'
], function (
    $,
    mediator,
    ajax,
    bonzo,
    bean
) {

    return {
        nav: null,
        init: function (nav) {
            // if nav doesn't exist then this will change every <a> on the page...
            if (!nav) { return; }

            function clicked(_link) {
                var link = bonzo(_link);
                ajax({
                    url: link.attr('href') + '.json',
                    type: 'json',
                    crossOrigin: true
                }).then(
                    function(response) {
                        var $html = bonzo.create('<div>'+ response.html +'</div>'),
                            $days = $('.football-matches__day', $html);

                        $days.insertAfter($('.football-matches__day').last());

                        // update more link (if there is more)
                        if (response.more) {
                            link.attr('href', response.more);
                        } else {
                            link.remove();
                        }
                    },
                    function(req) {
                        mediator.emit('modules:error', 'Failed to load more matches: ' + req.statusText, 'common/modules/more-matches.js');
                    }
                );
            }

            mediator.on('ui:more-matches:clicked', clicked);
            bean.add(nav, 'a', 'click', function(e) {
                clicked(e.currentTarget);
                e.preventDefault();
            });
        }
    };
});
