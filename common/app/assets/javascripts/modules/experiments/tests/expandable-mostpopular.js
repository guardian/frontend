define(['common', 'bean', 'modules/popular'], function (common, bean, popular) {

    var ExperimentExpandableMostPopular = function () {

        this.id = 'ExpandableMostPopular';
        this.expiry = '2013-09-30';
        this.audience = 1;
        this.description = 'Impact of expandable most popular trails on page views';
        this.canRun = function(config) {
            return true;
        };
        this.variants = [
            {
                id: 'control',
                test: function () {
                    popular(config, context);
                }
            },
            {
                id: 'expandable-most-popular',
                test: function (context) {
                    if((/^Video|Article|Gallery$/).test(guardian.config.page.contentType)) {
                        popular(guardian.config, context, true);
                        bean.on(document.body, 'change', '.trail__expander-trigger', function(e) {
                            var trail = e.target.parentNode;
                            if (e.target.checked) {
                                trail.querySelector('.main-image').setAttribute('data-force-upgrade', true);
                                common.mediator.emit('fragment:ready:images', trail);
                            }
                        });
                    } else {
                        popular(config, context);
                    }
                }
            }
        ];
    };

    return ExperimentExpandableMostPopular;

});
