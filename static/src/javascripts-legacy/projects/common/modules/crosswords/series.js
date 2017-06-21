define(
    [
        'lib/config',
        'lib/proximity-loader',
        'common/modules/onward/onward-content',
    ],
    function(config, proximityLoader, Series) {
        return function() {
            var el = document.getElementsByClassName('js-onward');

            if (el.length > 0) {
                proximityLoader.add(el[0], 1500, function() {
                    if (
                        config.page.seriesId &&
                        config.page.showRelatedContent
                    ) {
                        new Series(
                            document.getElementsByClassName('js-onward')
                        );
                    }
                });
            }
        };
    }
);
