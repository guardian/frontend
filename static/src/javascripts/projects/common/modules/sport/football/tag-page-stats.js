define([
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'bonzo',
    'qwery'
], function (
    $,
    ajax,
    config
) {
    return function () {
        var $firstContainer = $('.js-insert-team-stats-after');

        if ($firstContainer.length) {
            ajax({
                url: '/' + config.page.pageId + '/fixtures-and-results-container',
                type: 'json',
                method: 'get',
                crossOrigin: 'true',
                success: function (container) {
                    if (container.html) {
                        $firstContainer.after(container.html);
                    }
                }
            });
        }
    };
});
